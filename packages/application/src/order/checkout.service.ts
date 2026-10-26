/**
 * Checkout application orchestrator (JN-223 -> JN-239).
 * Enforces atomic order creation, address deliverability, APO/FPO rejection,
 * price drift verification, DROP stock validation, and checkout idempotency.
 */
import {
  type CreateCheckoutInputDto,
  type CheckoutResultDto,
  type ValidateAddressInputDto,
  type AddressValidationResultDto,
  type CartItemWarningDto,
} from '@jeanius/contracts';
import {
  Order,
  OrderLine,
  Address,
  type Currency,
  type VariantId,
  createEntityId,
  DomainError,
} from '@jeanius/domain';
import { createLogger } from '@jeanius/observability';
import type { IOrderRepository } from './order-repository.port.js';
import type { ICartRepository } from '../cart/cart-repository.port.js';
import type { IProductRepository } from '../catalog/product-repository.port.js';
import type { IPaymentGateway } from '../payment/payment-gateway.port.js';

export class CheckoutService {
  private readonly logger = createLogger('checkout-service');

  constructor(
    private readonly orderRepo: IOrderRepository,
    private readonly cartRepo: ICartRepository,
    private readonly productRepo: IProductRepository,
    private readonly paymentGateway?: IPaymentGateway,
  ) {}

  /**
   * JN-227, JN-228, JN-229: Validate address deliverability, military APO/FPO restriction,
   * and calculate shipping tariffs and lead times.
   */
  validateShippingAddress(input: ValidateAddressInputDto): AddressValidationResultDto {
    const address = new Address({
      fullName: input.address.fullName,
      addressLine1: input.address.addressLine1,
      addressLine2: input.address.addressLine2,
      city: input.address.city,
      stateOrProvince: input.address.stateOrProvince,
      postalCode: input.address.postalCode,
      country: input.address.country,
      phone: input.address.phone,
    });

    const isMilitary = address.isMilitaryAddress();
    const deliverability = address.checkDeliverability();
    const shippingCost = address.calculateShippingCost(
      input.cartSubtotalCents,
      (input.currency as Currency) ?? 'USD',
    );
    const isDomestic = !address.isInternational('NP');

    return {
      isDeliverable: deliverability.isDeliverable,
      isMilitary,
      reason: deliverability.reason,
      shippingCostAmount: shippingCost.amount,
      currency: shippingCost.currency,
      isFreeShipping: shippingCost.amount === 0,
      courier: isDomestic ? 'Kathmandu Local Courier' : 'DHL Worldwide Express',
      leadTime: {
        productionMinDays: 7,
        productionMaxDays: 14,
        shippingMinDays: isDomestic ? 1 : 2,
        shippingMaxDays: isDomestic ? 2 : 4,
      },
    };
  }

  /**
   * JN-233, JN-234, JN-237: Initiates checkout and creates pending order inside atomic boundary.
   */
  async initiateCheckout(
    input: CreateCheckoutInputDto,
    customerId?: string,
  ): Promise<CheckoutResultDto> {
    this.logger.info('Initiating checkout', {
      cartId: input.cartId,
      customerEmail: input.customerEmail,
      country: input.shippingAddress.country,
      idempotencyKey: input.idempotencyKey,
    });

    // 1. Idempotency Check (JN-234)
    if (input.idempotencyKey) {
      const existing = await this.orderRepo.findByIdempotencyKey(input.idempotencyKey);
      if (existing) {
        this.logger.info('Returning existing idempotent order', {
          orderId: existing.id,
          orderNumber: existing.orderNumber,
        });
        return {
          success: true,
          orderId: existing.id,
          orderNumber: existing.orderNumber,
          paymentUrl: `/checkout/confirmation?orderId=${existing.id}&orderNumber=${existing.orderNumber}`,
          totalAmount: existing.total.amount,
          currency: existing.currency,
          status: existing.status === 'PAID' ? 'PAID' : 'PENDING',
        };
      }
    }

    // 2. Validate Address (JN-226, JN-227, JN-228)
    const shippingAddress = new Address({
      fullName: input.shippingAddress.fullName,
      addressLine1: input.shippingAddress.addressLine1,
      addressLine2: input.shippingAddress.addressLine2,
      city: input.shippingAddress.city,
      stateOrProvince: input.shippingAddress.stateOrProvince,
      postalCode: input.shippingAddress.postalCode,
      country: input.shippingAddress.country,
      phone: input.shippingAddress.phone,
    });

    const deliverability = shippingAddress.checkDeliverability();
    if (!deliverability.isDeliverable) {
      throw new DomainError(deliverability.reason ?? 'Address is not deliverable');
    }

    const billingAddress = input.billingAddress
      ? new Address({
          fullName: input.billingAddress.fullName,
          addressLine1: input.billingAddress.addressLine1,
          addressLine2: input.billingAddress.addressLine2,
          city: input.billingAddress.city,
          stateOrProvince: input.billingAddress.stateOrProvince,
          postalCode: input.billingAddress.postalCode,
          country: input.billingAddress.country,
          phone: input.billingAddress.phone,
        })
      : undefined;

    // 3. Load Cart (JN-233)
    const cart = await this.cartRepo.findById(input.cartId);
    if (!cart || cart.lines.length === 0) {
      throw new DomainError('Cart is empty or not found');
    }

    // 4. Validate items against catalog, check stock & price drift (JN-235, JN-236)
    const warnings: CartItemWarningDto[] = [];
    for (const line of cart.lines) {
      const product = await this.productRepo.findById(line.productId);
      if (!product) {
        throw new DomainError(`Product ${line.productTitle} is no longer available in catalog.`);
      }

      if (product.status !== 'PUBLISHED') {
        throw new DomainError(
          `Product ${line.productTitle} is not currently available for purchase.`,
        );
      }

      if (line.commerceModel === 'DROP') {
        const variant = product.variants.find((v) => v.id === line.variantId);
        if (!variant) {
          throw new DomainError(
            `Selected variant for ${line.productTitle} is no longer available.`,
          );
        }
        if (variant.inventoryCount <= 0) {
          throw new DomainError(`Item "${line.productTitle}" is sold out.`);
        }
        if (line.quantity > variant.inventoryCount) {
          throw new DomainError(
            `Requested quantity (${line.quantity}) for "${line.productTitle}" exceeds remaining stock (${variant.inventoryCount}).`,
          );
        }
      }

      let currentUnitPriceAmount = product.basePrice.amount;
      if (line.commerceModel === 'DROP') {
        const variant = product.variants.find((v) => v.id === line.variantId);
        if (variant) {
          currentUnitPriceAmount = variant.calculateTotalPrice(product.basePrice).amount;
        }
      }

      if (line.unitPrice.amount !== currentUnitPriceAmount && !input.confirmedPriceChanges) {
        throw new DomainError(
          `Price changed for "${line.productTitle}" from $${(line.unitPrice.amount / 100).toFixed(2)} to $${(currentUnitPriceAmount / 100).toFixed(2)}. Please confirm to proceed.`,
        );
      }
    }

    // 5. Calculate Order Financial Totals (JN-229)
    const subtotal = cart.calculateSubtotal();
    const shippingCost = shippingAddress.calculateShippingCost(
      subtotal.amount,
      subtotal.currency as Currency,
    );
    const total = subtotal.add(shippingCost);

    // 6. Generate Human-Readable Order Number (JN-260)
    const timestampPart = Date.now().toString(36).toUpperCase();
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `JNS-${timestampPart}-${randomPart}`;
    const orderId = createEntityId<'Order'>(crypto.randomUUID());

    // 7. Map Cart Lines to Order Lines Snapshot (JN-261, JN-262)
    const orderLines = cart.lines.map((line) => {
      const lineTotal = line.calculateLineTotal();
      const variantId = (line.variantId ?? line.productId) as VariantId;
      const sku = `SKU-${line.productId.slice(0, 8)}-${line.commerceModel}`;

      const customSpecs: Record<string, string | number> = {};
      if (line.customSpecifications) {
        for (const [k, v] of Object.entries(line.customSpecifications)) {
          if (typeof v === 'string' || typeof v === 'number') {
            customSpecs[k] = v;
          }
        }
      }

      return new OrderLine({
        id: createEntityId<'OrderLine'>(crypto.randomUUID()),
        orderId,
        productId: line.productId,
        variantId,
        productTitle: line.productTitle,
        sku,
        commerceModel: line.commerceModel,
        unitPrice: line.unitPrice,
        quantity: line.quantity,
        lineTotal,
        selectedOptions: line.selectedOptions,
        customTailoring: line.customTailoringMeasurements,
        customSpecifications: Object.keys(customSpecs).length > 0 ? customSpecs : undefined,
      });
    });

    // 8. Construct Order Aggregate Root (JN-237)
    const order = new Order({
      id: orderId,
      orderNumber,
      customerId: customerId ? createEntityId<'Customer'>(customerId) : undefined,
      customerEmail: input.customerEmail,
      status: 'PENDING',
      paymentStatus: 'INITIATED',
      shippingAddress,
      billingAddress,
      lines: orderLines,
      subtotal,
      shippingCost,
      total,
      currency: total.currency,
    });

    // 9. Atomic Transaction Save (JN-237)
    await this.orderRepo.save(order, input.idempotencyKey);

    // 10. Clean Cart Lines
    await this.cartRepo.delete(cart.id);

    // 11. Payment Gateway Initiation (JN-238)
    let paymentUrl = `/checkout/confirmation?orderId=${order.id}&orderNumber=${order.orderNumber}`;
    if (this.paymentGateway) {
      try {
        const session = await this.paymentGateway.initiatePayment(order);
        if (session.paymentUrl) {
          paymentUrl = session.paymentUrl;
        }
      } catch (err: unknown) {
        this.logger.warn(
          'Payment gateway initiatePayment failed; falling back to confirmation route',
          {
            error: err instanceof Error ? err.message : String(err),
          },
        );
      }
    }

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentUrl,
      totalAmount: total.amount,
      currency: total.currency,
      status: 'PENDING',
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }
}
