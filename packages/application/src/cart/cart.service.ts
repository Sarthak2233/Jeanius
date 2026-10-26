import {
  Cart,
  CartLine,
  Money,
  type CartId,
  type CartLineId,
  type CustomerId,
  type ProductId,
  type VariantId,
  type Currency,
  type CommerceModel,
} from '@jeanius/domain';
import type {
  CartItemDto,
  AddToCartInputDto,
  ValidatedCartDto,
  CartItemWarningDto,
} from '@jeanius/contracts';
import { createLogger } from '@jeanius/observability';
import type { ICartRepository } from './cart-repository.port.js';
import type { IProductRepository } from '../catalog/product-repository.port.js';

export class CartService {
  private readonly logger = createLogger('application:cart-service');

  constructor(
    private readonly cartRepo: ICartRepository,
    private readonly productRepo?: IProductRepository,
  ) {}

  async getCartByCustomerId(customerId: string): Promise<Cart | null> {
    const startTime = Date.now();
    const cart = await this.cartRepo.findByCustomerId(customerId);
    this.logger.debug('Queried cart by customer ID', {
      customerId,
      found: !!cart,
      itemCount: cart?.lines.length ?? 0,
      durationMs: Date.now() - startTime,
    });
    return cart;
  }

  async getOrCreateCart(customerId: string, currency: Currency = 'USD'): Promise<Cart> {
    const existing = await this.cartRepo.findByCustomerId(customerId);
    if (existing) {
      return existing;
    }

    const newCart = new Cart({
      id: crypto.randomUUID() as CartId,
      customerId: customerId as CustomerId,
      currency,
      lines: [],
    });

    await this.cartRepo.save(newCart);
    this.logger.info('Created new customer cart', {
      cartId: newCart.id,
      customerId,
      currency,
    });
    return newCart;
  }

  async addItem(customerId: string, input: AddToCartInputDto): Promise<Cart> {
    const startTime = Date.now();
    const currency = (input.unitPriceCurrency ?? 'USD') as Currency;
    const cart = await this.getOrCreateCart(customerId, currency);

    const line = new CartLine({
      id: crypto.randomUUID() as CartLineId,
      cartId: cart.id,
      productId: input.productId as ProductId,
      variantId: input.variantId ? (input.variantId as VariantId) : undefined,
      productTitle: input.productTitle,
      commerceModel: input.commerceModel as CommerceModel,
      unitPrice: new Money(input.unitPriceAmount, currency),
      quantity: input.quantity,
      selectedOptions: input.selectedOptions ?? {},
      customSpecifications: input.customSpecifications,
    });

    cart.addLine(line);
    await this.cartRepo.save(cart);

    this.logger.info('Added item to customer cart', {
      cartId: cart.id,
      customerId,
      productId: input.productId,
      quantity: input.quantity,
      durationMs: Date.now() - startTime,
    });

    return cart;
  }

  async updateLineQuantity(customerId: string, lineId: string, quantity: number): Promise<Cart> {
    const cart = await this.getOrCreateCart(customerId);
    cart.updateLineQuantity(lineId as CartLineId, quantity);
    await this.cartRepo.save(cart);

    this.logger.info('Updated line quantity in cart', {
      cartId: cart.id,
      customerId,
      lineId,
      quantity,
    });

    return cart;
  }

  async removeLine(customerId: string, lineId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(customerId);
    cart.removeLine(lineId as CartLineId);
    await this.cartRepo.save(cart);

    this.logger.info('Removed line from cart', {
      cartId: cart.id,
      customerId,
      lineId,
    });

    return cart;
  }

  async syncCart(customerId: string, guestItems: readonly CartItemDto[]): Promise<Cart> {
    const startTime = Date.now();
    const currency = (guestItems[0]?.unitPriceCurrency ?? 'USD') as Currency;
    const cart = await this.getOrCreateCart(customerId, currency);

    const domainLines = guestItems.map((item) => this.mapDtoToDomainLine(cart.id, item));
    cart.replaceLines(domainLines);

    await this.cartRepo.save(cart);

    this.logger.info('Synchronized customer cart', {
      cartId: cart.id,
      customerId,
      itemCount: cart.lines.length,
      durationMs: Date.now() - startTime,
    });
    return cart;
  }

  async mergeGuestCart(customerId: string, guestItems: readonly CartItemDto[]): Promise<Cart> {
    const startTime = Date.now();
    const currency = (guestItems[0]?.unitPriceCurrency ?? 'USD') as Currency;
    const cart = await this.getOrCreateCart(customerId, currency);

    const incomingDomainLines = guestItems.map((item) => this.mapDtoToDomainLine(cart.id, item));
    cart.mergeLines(incomingDomainLines);

    await this.cartRepo.save(cart);

    this.logger.info('Merged guest cart with member cart', {
      cartId: cart.id,
      customerId,
      mergedLineCount: cart.lines.length,
      durationMs: Date.now() - startTime,
    });
    return cart;
  }

  async clearCart(customerId: string): Promise<void> {
    const cart = await this.cartRepo.findByCustomerId(customerId);
    if (!cart) return;

    cart.clear();
    await this.cartRepo.save(cart);
    this.logger.info('Cleared customer cart', { customerId, cartId: cart.id });
  }

  /**
   * Recalculates cart totals and validates stock and price against live catalog (JN-214, JN-215, JN-216, JN-217).
   * Time Complexity: O(n) where n is line count (DSA Rule 6.1 and 6.6)
   */
  async validateAndRecalculateCart(
    items: readonly CartItemDto[],
    customerId?: string | null,
  ): Promise<ValidatedCartDto> {
    const startTime = Date.now();
    const warnings: CartItemWarningDto[] = [];
    const validatedItems: CartItemDto[] = [];
    let hasUnavailableItems = false;
    let hasPriceChanges = false;
    let subtotalAmount = 0;
    const currency = items[0]?.unitPriceCurrency ?? 'USD';

    for (const item of items) {
      let currentItem = { ...item };

      if (this.productRepo) {
        const product = await this.productRepo.findById(item.productId);

        if (!product || product.status === 'ARCHIVED') {
          hasUnavailableItems = true;
          warnings.push({
            lineId: item.id,
            code: 'DISCONTINUED',
            message: `Piece "${item.title}" is archived or no longer available in the atelier collection.`,
          });
          continue; // Omit discontinued piece from purchasable subtotal
        }

        // 1. DROP Product & Variant Validation (JN-215, JN-222)
        if (item.commerceModel === 'DROP') {
          const variant = product.variants.find((v) => v.id === item.variantId);

          if (!variant || variant.status === 'SOLD_OUT' || variant.inventoryCount === 0) {
            hasUnavailableItems = true;
            warnings.push({
              lineId: item.id,
              code: 'OUT_OF_STOCK',
              message: `The selected edition for "${item.title}" is sold out.`,
            });
            continue;
          }

          if (variant.inventoryCount < item.quantity) {
            warnings.push({
              lineId: item.id,
              code: 'QUANTITY_CLAMPED',
              message: `Only ${variant.inventoryCount} allocation(s) remain in the Kathmandu vault. Quantity adjusted.`,
              previousValue: item.quantity,
              currentValue: variant.inventoryCount,
            });
            currentItem = {
              ...currentItem,
              quantity: variant.inventoryCount,
            };
          }

          // Price validation (JN-216)
          const liveVariantPrice = variant.calculateTotalPrice(product.basePrice);
          if (liveVariantPrice.amount !== item.unitPriceAmount) {
            hasPriceChanges = true;
            warnings.push({
              lineId: item.id,
              code: 'PRICE_CHANGED',
              message: `Price for "${item.title}" adjusted to current catalog listing ($${(liveVariantPrice.amount / 100).toFixed(2)}).`,
              previousValue: item.unitPriceAmount,
              currentValue: liveVariantPrice.amount,
            });
            currentItem = {
              ...currentItem,
              unitPriceAmount: liveVariantPrice.amount,
            };
          }
        } else if (item.commerceModel === 'OM') {
          // 2. Order-Made Price Validation (JN-216)
          const liveBasePrice = product.basePrice.amount;
          if (liveBasePrice !== item.unitPriceAmount) {
            hasPriceChanges = true;
            warnings.push({
              lineId: item.id,
              code: 'PRICE_CHANGED',
              message: `Base price for "${item.title}" adjusted to current atelier standard ($${(liveBasePrice / 100).toFixed(2)}).`,
              previousValue: item.unitPriceAmount,
              currentValue: liveBasePrice,
            });
            currentItem = {
              ...currentItem,
              unitPriceAmount: liveBasePrice,
            };
          }
        }
      }

      validatedItems.push(currentItem);
      subtotalAmount += currentItem.unitPriceAmount * currentItem.quantity;
    }

    // Complimentary courier shipping above $300 USD (30,000 cents), else $25 USD (2,500 cents)
    const estimatedShippingAmount = subtotalAmount === 0 ? 0 : subtotalAmount >= 30000 ? 0 : 2500;
    const grandTotalAmount = subtotalAmount + estimatedShippingAmount;
    const totalCount = validatedItems.reduce((acc, it) => acc + it.quantity, 0);

    // If customerId is provided, sync updated validated items to server
    if (customerId) {
      await this.syncCart(customerId, validatedItems);
    }

    this.logger.info('Cart validated and recalculated', {
      itemCount: validatedItems.length,
      subtotalAmount,
      grandTotalAmount,
      hasWarnings: warnings.length > 0,
      durationMs: Date.now() - startTime,
    });

    return {
      id: customerId ? `cart-${customerId}` : `guest-cart-${Date.now()}`,
      customerId: customerId ?? null,
      items: validatedItems,
      totalCount,
      subtotalAmount,
      estimatedShippingAmount,
      grandTotalAmount,
      currency,
      warnings,
      hasUnavailableItems,
      hasPriceChanges,
      updatedAt: new Date().toISOString(),
    };
  }

  async handleExpiredCarts(cutoffDate: Date): Promise<number> {
    const deletedCount = await this.cartRepo.deleteExpiredCarts(cutoffDate);
    this.logger.info('Handled expired carts cleanup', { cutoffDate, deletedCount });
    return deletedCount;
  }

  private mapDtoToDomainLine(cartId: CartId, item: CartItemDto): CartLine {
    return new CartLine({
      id: (item.id || crypto.randomUUID()) as CartLineId,
      cartId,
      productId: item.productId as ProductId,
      variantId: item.variantId ? (item.variantId as VariantId) : undefined,
      productTitle: item.title,
      commerceModel: item.commerceModel as CommerceModel,
      unitPrice: new Money(item.unitPriceAmount, item.unitPriceCurrency as Currency),
      quantity: item.quantity,
      selectedOptions: item.selectedOptions ?? {},
      customSpecifications: item.customSpecifications,
    });
  }
}
