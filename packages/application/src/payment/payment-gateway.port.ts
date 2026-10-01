import type { Order, Payment } from '@jeanius/domain';

export interface IPaymentGateway {
  initiatePayment(order: Order): Promise<{ paymentUrl: string; transactionId: string }>;
  verifyWebhook(payload: unknown, signature: string): Promise<boolean>;
}

export interface IPaymentRepository {
  findById(id: string): Promise<Payment | null>;
  findByOrderId(orderId: string): Promise<readonly Payment[]>;
  findByIdempotencyKey(key: string): Promise<Payment | null>;
  save(payment: Payment): Promise<void>;
}
