import type { Order, Payment, Money, PaymentProvider, PaymentStatus } from '@jeanius/domain';

export interface PaymentInitiationResult {
  readonly paymentUrl: string;
  readonly transactionId: string;
  readonly voucherReference?: string;
  readonly status: PaymentStatus;
}

export interface PaymentConfirmationResult {
  readonly success: boolean;
  readonly status: PaymentStatus;
  readonly transactionId: string;
  readonly notes?: string;
}

export interface WebhookVerificationResult {
  readonly isValid: boolean;
  readonly eventType?: string;
  readonly transactionId?: string;
  readonly payload?: unknown;
}

export interface RefundResult {
  readonly success: boolean;
  readonly refundTransactionId: string;
  readonly amount: Money;
  readonly remainingBalance?: Money;
}

export interface PaymentInitiateOptions {
  readonly idempotencyKey?: string;
  readonly provider?: PaymentProvider;
  readonly redirectUrl?: string;
  readonly cancelUrl?: string;
}

export interface IPaymentProvider {
  readonly providerId: PaymentProvider;
  initiatePayment(order: Order, options?: PaymentInitiateOptions): Promise<PaymentInitiationResult>;
  confirmTransfer(
    paymentId: string,
    reference: string,
    notes?: string,
  ): Promise<PaymentConfirmationResult>;
  verifyWebhook(payload: unknown, signature: string): Promise<WebhookVerificationResult>;
  processRefund(payment: Payment, amount: Money, reason: string): Promise<RefundResult>;
}

export interface IPaymentGateway {
  initiatePayment(order: Order, options?: PaymentInitiateOptions): Promise<PaymentInitiationResult>;
  confirmTransfer(
    paymentId: string,
    reference: string,
    notes?: string,
  ): Promise<PaymentConfirmationResult>;
  verifyWebhook(
    provider: PaymentProvider,
    payload: unknown,
    signature: string,
  ): Promise<WebhookVerificationResult>;
  processRefund(paymentId: string, amount: Money, reason: string): Promise<RefundResult>;
}

export interface IPaymentRepository {
  findById(id: string): Promise<Payment | null>;
  findByOrderId(orderId: string): Promise<readonly Payment[]>;
  findByIdempotencyKey(key: string): Promise<Payment | null>;
  save(payment: Payment): Promise<void>;
}
