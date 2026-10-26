import {
  DomainError,
  Payment,
  createEntityId,
  type Order,
  type Money,
  type PaymentProvider,
} from '@jeanius/domain';
import type {
  IPaymentGateway,
  IPaymentProvider,
  IPaymentRepository,
  PaymentInitiateOptions,
  PaymentInitiationResult,
  PaymentConfirmationResult,
  WebhookVerificationResult,
  RefundResult,
} from './payment-gateway.port.js';
import type { IOrderRepository } from '../order/order-repository.port.js';

export interface PaymentOrchestratorDependencies {
  readonly paymentRepository: IPaymentRepository;
  readonly orderRepository?: IOrderRepository;
  readonly providers?: readonly IPaymentProvider[];
}

export class PaymentOrchestrator implements IPaymentGateway {
  private readonly paymentRepo: IPaymentRepository;
  private readonly orderRepo?: IOrderRepository;
  private readonly providers: Map<PaymentProvider, IPaymentProvider> = new Map();

  constructor(deps: PaymentOrchestratorDependencies) {
    this.paymentRepo = deps.paymentRepository;
    this.orderRepo = deps.orderRepository;

    if (deps.providers) {
      for (const provider of deps.providers) {
        this.registerProvider(provider);
      }
    }
  }

  registerProvider(provider: IPaymentProvider): void {
    this.providers.set(provider.providerId, provider);
  }

  getProvider(providerId: PaymentProvider): IPaymentProvider {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new DomainError(`Payment provider '${providerId}' is not registered`);
    }
    return provider;
  }

  /**
   * Resolves the appropriate payment rail based on explicit selection or currency.
   * JN-245: Multi-Rail Routing (USD international wire vs NPR domestic transfer)
   */
  resolveProvider(order: Order, preferredProvider?: PaymentProvider): IPaymentProvider {
    if (preferredProvider && this.providers.has(preferredProvider)) {
      return this.getProvider(preferredProvider);
    }

    // Default to BANK_TRANSFER if registered
    if (this.providers.has('BANK_TRANSFER')) {
      return this.getProvider('BANK_TRANSFER');
    }

    // Currency-based fallback
    const isDomesticNpr = order.currency === 'NPR';
    const fallbackProviderId: PaymentProvider = isDomesticNpr ? 'ESEWA' : 'STRIPE';

    if (this.providers.has(fallbackProviderId)) {
      return this.getProvider(fallbackProviderId);
    }

    const firstAvailable = this.providers.values().next().value;
    if (!firstAvailable) {
      throw new DomainError('No payment providers are registered in orchestrator');
    }

    return firstAvailable;
  }

  /**
   * Initiates payment for an order with idempotency guarantee (JN-244, JN-249).
   */
  async initiatePayment(
    order: Order,
    options?: PaymentInitiateOptions,
  ): Promise<PaymentInitiationResult> {
    const idempotencyKey =
      options?.idempotencyKey?.trim() || `pay-${order.id}-${order.orderNumber}`;

    // JN-249 / JN-256: Idempotency check
    const existing = await this.paymentRepo.findByIdempotencyKey(idempotencyKey);
    if (existing) {
      return {
        paymentUrl: `/checkout/bank-sim?paymentId=${existing.id}&orderNumber=${order.orderNumber}`,
        transactionId: existing.transactionId ?? existing.id,
        voucherReference: existing.notes ?? undefined,
        status: existing.status,
      };
    }

    const provider = this.resolveProvider(order, options?.provider);
    const initiation = await provider.initiatePayment(order, {
      ...options,
      idempotencyKey,
    });

    const payment = new Payment({
      id: createEntityId<'Payment'>(crypto.randomUUID()),
      orderId: order.id,
      amount: order.total,
      settlementAmount: order.total,
      provider: provider.providerId,
      status: initiation.status ?? 'INITIATED',
      transactionId: initiation.transactionId,
      idempotencyKey,
      notes: initiation.voucherReference,
    });

    await this.paymentRepo.save(payment);

    return {
      paymentUrl: initiation.paymentUrl,
      transactionId: initiation.transactionId,
      voucherReference: initiation.voucherReference,
      status: payment.status,
    };
  }

  /**
   * Confirms a bank transfer voucher submission and transitions payment to PENDING (JN-241).
   */
  async confirmTransfer(
    paymentId: string,
    reference: string,
    notes?: string,
  ): Promise<PaymentConfirmationResult> {
    if (!reference?.trim()) {
      throw new DomainError('Voucher reference code is required to confirm bank transfer');
    }

    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) {
      throw new DomainError(`Payment '${paymentId}' not found`);
    }

    const provider = this.getProvider(payment.provider);
    const confirmResult = await provider.confirmTransfer(paymentId, reference, notes);

    payment.markPending(confirmResult.transactionId || reference.trim(), notes?.trim());
    await this.paymentRepo.save(payment);

    if (this.orderRepo) {
      const order = await this.orderRepo.findById(payment.orderId);
      if (order) {
        order.markPaymentPending();
        await this.orderRepo.save(order);
      }
    }

    return {
      success: true,
      status: payment.status,
      transactionId: payment.transactionId ?? reference,
      notes: payment.notes,
    };
  }

  /**
   * Verifies incoming webhook authenticity and parses payload.
   */
  async verifyWebhook(
    providerId: PaymentProvider,
    payload: unknown,
    signature: string,
  ): Promise<WebhookVerificationResult> {
    const provider = this.getProvider(providerId);
    return provider.verifyWebhook(payload, signature);
  }

  /**
   * Processes a full or partial refund (JN-258).
   */
  async processRefund(paymentId: string, amount: Money, reason: string): Promise<RefundResult> {
    if (!reason?.trim()) {
      throw new DomainError('Refund reason is required');
    }

    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) {
      throw new DomainError(`Payment '${paymentId}' not found`);
    }

    const provider = this.getProvider(payment.provider);
    const refundResult = await provider.processRefund(payment, amount, reason);

    payment.refund(amount, reason);
    await this.paymentRepo.save(payment);

    return refundResult;
  }
}
