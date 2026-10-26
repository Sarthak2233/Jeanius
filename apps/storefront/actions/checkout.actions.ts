'use server';

import {
  db,
  DrizzleOrderRepository,
  DrizzleCartRepository,
  DrizzleProductRepository,
  DrizzlePaymentRepository,
} from '@jeanius/database';
import { CheckoutService, PaymentOrchestrator } from '@jeanius/application';
import { SimulatedBankAdapter } from '@jeanius/integrations';
import {
  type CheckoutResultDto,
  type AddressValidationResultDto,
  CreateCheckoutInputSchema,
  ValidateAddressInputSchema,
} from '@jeanius/contracts';
import { createLogger, generateTraceId } from '@jeanius/observability';
import { createClient } from '../lib/supabase/server';

const logger = createLogger('storefront:checkout-actions');

export interface ActionResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: {
    readonly code: string;
    readonly message: string;
  };
}

function getCheckoutService(): CheckoutService {
  const orderRepo = new DrizzleOrderRepository(db);
  const cartRepo = new DrizzleCartRepository(db);
  const productRepo = new DrizzleProductRepository(db);
  const paymentRepo = new DrizzlePaymentRepository(db);
  const bankAdapter = new SimulatedBankAdapter();
  const paymentGateway = new PaymentOrchestrator({
    paymentRepository: paymentRepo,
    orderRepository: orderRepo,
    providers: [bankAdapter],
  });
  return new CheckoutService(orderRepo, cartRepo, productRepo, paymentGateway);
}

/**
 * JN-227, JN-228, JN-229: Validate address deliverability, APO/FPO rejection, and shipping tariffs.
 */
export async function validateShippingAddressAction(
  rawInput: unknown,
): Promise<ActionResult<AddressValidationResultDto>> {
  const traceId = generateTraceId();
  try {
    const parsed = ValidateAddressInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid address payload',
        },
      };
    }

    const service = getCheckoutService();
    const result = service.validateShippingAddress(parsed.data);

    logger.info('Address validated successfully', {
      traceId,
      country: parsed.data.address.country,
      isDeliverable: result.isDeliverable,
    });

    return {
      success: true,
      data: result,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to validate shipping address';
    logger.error('Failed to validate address in action', {
      traceId,
      error: errorMsg,
    });
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: errorMsg,
      },
    };
  }
}

/**
 * JN-233, JN-234, JN-237: Initiate checkout and create pending order in atomic boundary.
 */
export async function initiateCheckoutAction(
  rawInput: unknown,
): Promise<ActionResult<CheckoutResultDto>> {
  const traceId = generateTraceId();
  try {
    const parsed = CreateCheckoutInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid checkout payload',
        },
      };
    }

    // Resolve authenticated user profile if logged in
    let customerId: string | undefined;
    try {
      const supabase = await createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        customerId = session.user.id;
      }
    } catch (authErr: unknown) {
      logger.debug('No active session resolved during checkout initiation', {
        traceId,
        error: authErr instanceof Error ? authErr.message : String(authErr),
      });
    }

    const service = getCheckoutService();
    const result = await service.initiateCheckout(parsed.data, customerId);

    logger.info('Checkout initiated successfully', {
      traceId,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      totalAmount: result.totalAmount,
    });

    return {
      success: true,
      data: result,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Checkout failed';
    const isPriceDrift = errorMsg.includes('Price changed');
    const isSoldOut = errorMsg.includes('sold out') || errorMsg.includes('stock');

    let code = 'CHECKOUT_ERROR';
    if (isPriceDrift) code = 'PRICE_DRIFT';
    if (isSoldOut) code = 'STOCK_DEPLETED';

    logger.warn('Checkout failed in action', {
      traceId,
      code,
      error: errorMsg,
    });

    return {
      success: false,
      error: {
        code,
        message: errorMsg,
      },
    };
  }
}

export interface OrderConfirmationDto {
  readonly id: string;
  readonly orderNumber: string;
  readonly customerEmail: string;
  readonly status: string;
  readonly paymentStatus: string;
  readonly voucherReference?: string;
  readonly totalAmount: number;
  readonly currency: string;
  readonly shippingAddress: {
    readonly fullName: string;
    readonly addressLine1: string;
    readonly city: string;
    readonly country: string;
  };
  readonly itemsCount: number;
}

/**
 * Loads order confirmation details for receipt view.
 */
export async function getOrderConfirmationAction(
  orderId: string,
): Promise<ActionResult<OrderConfirmationDto>> {
  const traceId = generateTraceId();
  try {
    const orderRepo = new DrizzleOrderRepository(db);
    const order = await orderRepo.findById(orderId);

    if (!order) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found',
        },
      };
    }

    const paymentRepo = new DrizzlePaymentRepository(db);
    const payments = await paymentRepo.findByOrderId(order.id);
    const latestPayment = payments[payments.length - 1];

    return {
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerEmail: order.customerEmail,
        status: order.status,
        paymentStatus: latestPayment?.status ?? order.paymentStatus,
        voucherReference: latestPayment?.notes ?? latestPayment?.voucherReference,
        totalAmount: order.total.amount,
        currency: order.currency,
        shippingAddress: {
          fullName: order.shippingAddress.fullName,
          addressLine1: order.shippingAddress.addressLine1,
          city: order.shippingAddress.city,
          country: order.shippingAddress.country,
        },
        itemsCount: order.lines.reduce((acc, l) => acc + l.quantity, 0),
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to retrieve order';
    logger.error('Failed to get order confirmation', {
      traceId,
      orderId,
      error: errorMsg,
    });
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: errorMsg,
      },
    };
  }
}
