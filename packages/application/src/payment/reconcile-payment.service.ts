import { DomainError, type Money, type Payment } from '@jeanius/domain';
import type { IPaymentRepository } from './payment-gateway.port.js';
import type { IOrderRepository } from '../order/order-repository.port.js';

export interface ReconcilePaymentDependencies {
  readonly paymentRepository: IPaymentRepository;
  readonly orderRepository?: IOrderRepository;
}

/**
 * ReconcilePaymentService (JN-250, JN-251)
 * Handles offline / bank clearing settlement, rejection handling, and manual refunds.
 */
export class ReconcilePaymentService {
  private readonly paymentRepo: IPaymentRepository;
  private readonly orderRepo?: IOrderRepository;

  constructor(deps: ReconcilePaymentDependencies) {
    this.paymentRepo = deps.paymentRepository;
    this.orderRepo = deps.orderRepository;
  }

  /**
   * Settles a PENDING bank transfer or authorized payment to PAID status (JN-250).
   */
  async settlePayment(
    paymentId: string,
    settlementTransactionId: string,
    memo?: string,
  ): Promise<Payment> {
    if (!settlementTransactionId?.trim()) {
      throw new DomainError('Settlement transaction reference is required');
    }

    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) {
      throw new DomainError(`Payment '${paymentId}' not found for settlement`);
    }

    payment.settle(settlementTransactionId.trim());
    await this.paymentRepo.save(payment);

    if (this.orderRepo) {
      const order = await this.orderRepo.findById(payment.orderId);
      if (order) {
        order.markPaid(payment.id, settlementTransactionId.trim());
        await this.orderRepo.save(order);
      }
    }

    void memo;
    return payment;
  }

  /**
   * Marks a payment as FAILED with an explicit failure reason (JN-255).
   */
  async failPayment(paymentId: string, reason: string): Promise<Payment> {
    if (!reason?.trim()) {
      throw new DomainError('Failure reason must be specified');
    }

    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) {
      throw new DomainError(`Payment '${paymentId}' not found`);
    }

    payment.fail(reason.trim());
    await this.paymentRepo.save(payment);

    if (this.orderRepo) {
      const order = await this.orderRepo.findById(payment.orderId);
      if (order) {
        order.markPaymentFailed();
        await this.orderRepo.save(order);
      }
    }

    return payment;
  }

  /**
   * Issues a partial or full refund on a settled payment (JN-251, JN-258).
   */
  async refundPayment(paymentId: string, amount: Money, reason: string): Promise<Payment> {
    if (!reason?.trim()) {
      throw new DomainError('Refund reason is required');
    }

    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) {
      throw new DomainError(`Payment '${paymentId}' not found`);
    }

    payment.refund(amount, reason.trim());
    await this.paymentRepo.save(payment);

    return payment;
  }
}
