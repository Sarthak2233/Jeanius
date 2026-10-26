'use server';

import { db, DrizzleOrderRepository, DrizzlePaymentRepository } from '@jeanius/database';
import { PaymentOrchestrator, ReconcilePaymentService } from '@jeanius/application';
import { SimulatedBankAdapter } from '@jeanius/integrations';
import { Money, type Currency } from '@jeanius/domain';
import {
  InitiatePaymentInputSchema,
  ConfirmBankTransferInputSchema,
  SimulateBankSettlementInputSchema,
  type InitiatePaymentResultDto,
  type ConfirmBankTransferResultDto,
  type SimulateBankSettlementResultDto,
} from '@jeanius/contracts';
import { createLogger, generateTraceId } from '@jeanius/observability';
import type { ActionResult } from './checkout.actions';

const logger = createLogger('storefront:payment-actions');

function getPaymentInfrastructure() {
  const orderRepo = new DrizzleOrderRepository(db);
  const paymentRepo = new DrizzlePaymentRepository(db);
  const bankAdapter = new SimulatedBankAdapter();

  const orchestrator = new PaymentOrchestrator({
    paymentRepository: paymentRepo,
    orderRepository: orderRepo,
    providers: [bankAdapter],
  });

  const reconcileService = new ReconcilePaymentService({
    paymentRepository: paymentRepo,
    orderRepository: orderRepo,
  });

  return { orderRepo, paymentRepo, bankAdapter, orchestrator, reconcileService };
}

/**
 * JN-244, JN-246: Initiates payment session with provider-independent orchestrator.
 */
export async function initiateOrderPaymentAction(
  rawInput: unknown,
): Promise<ActionResult<InitiatePaymentResultDto>> {
  const traceId = generateTraceId();
  try {
    const parsed = InitiatePaymentInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid payment payload',
        },
      };
    }

    const { orderRepo, orchestrator } = getPaymentInfrastructure();
    const order = await orderRepo.findById(parsed.data.orderId);

    if (!order) {
      return {
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: `Order '${parsed.data.orderId}' not found`,
        },
      };
    }

    const result = await orchestrator.initiatePayment(order, {
      provider: parsed.data.provider,
      idempotencyKey: parsed.data.idempotencyKey,
    });

    const paymentRepo = new DrizzlePaymentRepository(db);
    const payments = await paymentRepo.findByOrderId(order.id);
    const paymentId = payments[0]?.id ?? order.id;

    logger.info('Payment initiated successfully', {
      traceId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      provider: parsed.data.provider,
      status: result.status,
    });

    return {
      success: true,
      data: {
        success: true,
        paymentId,
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentUrl: result.paymentUrl,
        status: result.status,
        amount: order.total.amount,
        currency: order.currency,
        transactionId: result.transactionId,
        voucherReference: result.voucherReference,
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to initiate payment';
    logger.error('Payment initiation failed', { traceId, error: errorMsg });
    return {
      success: false,
      error: {
        code: 'PAYMENT_INIT_ERROR',
        message: errorMsg,
      },
    };
  }
}

/**
 * JN-241, JN-247: Confirms mock bank transfer voucher and sets payment to PENDING.
 */
export async function confirmBankTransferAction(
  rawInput: unknown,
): Promise<ActionResult<ConfirmBankTransferResultDto>> {
  const traceId = generateTraceId();
  try {
    const parsed = ConfirmBankTransferInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid bank transfer payload',
        },
      };
    }

    const { orchestrator, paymentRepo, orderRepo } = getPaymentInfrastructure();
    const result = await orchestrator.confirmTransfer(
      parsed.data.paymentId,
      parsed.data.voucherReference,
      parsed.data.notes,
    );

    const payment = await paymentRepo.findById(parsed.data.paymentId);
    if (!payment) {
      return {
        success: false,
        error: {
          code: 'PAYMENT_NOT_FOUND',
          message: 'Payment record not found',
        },
      };
    }

    const order = await orderRepo.findById(payment.orderId);
    const orderNumber = order?.orderNumber ?? 'JNS-CONFIRMED';
    const confirmationUrl = `/checkout/confirmation?orderId=${payment.orderId}&orderNumber=${orderNumber}`;

    logger.info('Bank transfer confirmed with PENDING status', {
      traceId,
      paymentId: payment.id,
      orderId: payment.orderId,
      voucherReference: parsed.data.voucherReference,
    });

    return {
      success: true,
      data: {
        success: true,
        paymentId: payment.id,
        orderId: payment.orderId,
        orderNumber,
        status: result.status,
        voucherReference: parsed.data.voucherReference,
        confirmationUrl,
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to confirm bank transfer';
    logger.error('Bank transfer confirmation failed', { traceId, error: errorMsg });
    return {
      success: false,
      error: {
        code: 'CONFIRM_ERROR',
        message: errorMsg,
      },
    };
  }
}

/**
 * JN-250, JN-255, JN-258: QA and verification settlement simulator.
 */
export async function simulateBankSettlementAction(
  rawInput: unknown,
): Promise<ActionResult<SimulateBankSettlementResultDto>> {
  const traceId = generateTraceId();
  try {
    const parsed = SimulateBankSettlementInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid settlement payload',
        },
      };
    }

    const { reconcileService, paymentRepo } = getPaymentInfrastructure();
    const payment = await paymentRepo.findById(parsed.data.paymentId);
    if (!payment) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Payment '${parsed.data.paymentId}' not found`,
        },
      };
    }

    let updatedPayment = payment;
    let message = '';

    if (parsed.data.action === 'SETTLE') {
      const txn = `SIM-SETTLE-${Date.now()}`;
      updatedPayment = await reconcileService.settlePayment(
        payment.id,
        txn,
        parsed.data.reason ?? 'QA Simulated Wire Clearance',
      );
      message = 'Simulated bank settlement completed: payment is now PAID.';
    } else if (parsed.data.action === 'FAIL') {
      updatedPayment = await reconcileService.failPayment(
        payment.id,
        parsed.data.reason ?? 'QA Simulated Wire Rejection',
      );
      message = 'Simulated wire rejection completed: payment is now FAILED.';
    } else if (parsed.data.action === 'REFUND') {
      const refundCents = parsed.data.amountCents ?? payment.amount.amount;
      const refundMoney = new Money(refundCents, payment.amount.currency as Currency);
      updatedPayment = await reconcileService.refundPayment(
        payment.id,
        refundMoney,
        parsed.data.reason ?? 'QA Simulated Wire Return',
      );
      message = `Simulated refund completed: payment is now ${updatedPayment.status}.`;
    }

    logger.info('Simulated payment action executed', {
      traceId,
      paymentId: payment.id,
      action: parsed.data.action,
      newStatus: updatedPayment.status,
    });

    return {
      success: true,
      data: {
        success: true,
        paymentId: updatedPayment.id,
        newStatus: updatedPayment.status,
        transactionId: updatedPayment.transactionId,
        message,
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Settlement simulation failed';
    logger.error('Settlement simulation error', { traceId, error: errorMsg });
    return {
      success: false,
      error: {
        code: 'SIMULATION_ERROR',
        message: errorMsg,
      },
    };
  }
}

export interface BankSessionDetailsDto {
  readonly paymentId: string;
  readonly orderId: string;
  readonly orderNumber: string;
  readonly amountUsd: number;
  readonly amountNpr: number;
  readonly currency: string;
  readonly voucherReference: string;
  readonly bankInstructions: {
    readonly bankName: string;
    readonly swiftCode?: string;
    readonly beneficiaryName: string;
    readonly accountNumber: string;
    readonly branch: string;
    readonly notes: string;
  };
}

/**
 * Loads order and simulated bank session details for /checkout/bank-sim page.
 */
export async function getBankSessionDetailsAction(
  orderIdOrPaymentId: string,
): Promise<ActionResult<BankSessionDetailsDto>> {
  try {
    const { orderRepo, paymentRepo, bankAdapter } = getPaymentInfrastructure();

    // Check if input is orderId or paymentId
    let payment = await paymentRepo.findById(orderIdOrPaymentId);
    let order = payment ? await orderRepo.findById(payment.orderId) : null;

    if (!order) {
      order = await orderRepo.findById(orderIdOrPaymentId);
      if (order) {
        const payments = await paymentRepo.findByOrderId(order.id);
        payment = payments[0] ?? null;
      }
    }

    if (!order) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found for bank session',
        },
      };
    }

    // Default exchange rate simulation (1 USD = 135 NPR) if dual currency display
    const amountUsd =
      order.currency === 'USD' ? order.total.amount : Math.round(order.total.amount / 1.35);
    const amountNpr =
      order.currency === 'NPR' ? order.total.amount : Math.round(order.total.amount * 1.35);

    const instructions = bankAdapter.getTransferInstructions(order.currency as 'USD' | 'NPR');
    const voucherReference =
      payment?.notes ||
      `TXN-BNK-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      success: true,
      data: {
        paymentId: payment?.id ?? order.id,
        orderId: order.id,
        orderNumber: order.orderNumber,
        amountUsd,
        amountNpr,
        currency: order.currency,
        voucherReference,
        bankInstructions: instructions,
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to retrieve bank session details';
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: errorMsg,
      },
    };
  }
}
