/**
 * Payment entity (JN-075).
 * Encapsulates internal payment lifecycle, transaction reference, and refund ledger.
 */
import type { PaymentId, OrderId } from '../common/entity-id.js';
import { Money } from '../common/money.vo.js';
import type { PaymentStatus } from '../order/order.entity.js';
import { DomainError } from '../errors/index.js';

export type PaymentProvider = 'STRIPE' | 'ESEWA' | 'KHALTI' | 'FONEPAY';

export interface PaymentProps {
  readonly id: PaymentId;
  readonly orderId: OrderId;
  readonly amount: Money;
  readonly provider: PaymentProvider;
  readonly status?: PaymentStatus;
  readonly transactionId?: string;
  readonly idempotencyKey: string;
  readonly refundedAmount?: Money;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export class Payment {
  readonly id: PaymentId;
  readonly orderId: OrderId;
  readonly amount: Money;
  readonly provider: PaymentProvider;
  private _status: PaymentStatus;
  private _transactionId?: string;
  readonly idempotencyKey: string;
  private _refundedAmount: Money;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: PaymentProps) {
    if (!props.idempotencyKey?.trim()) {
      throw new DomainError('Idempotency key is required for payment processing');
    }

    this.id = props.id;
    this.orderId = props.orderId;
    this.amount = props.amount;
    this.provider = props.provider;
    this._status = props.status ?? 'INITIATED';
    this._transactionId = props.transactionId;
    this.idempotencyKey = props.idempotencyKey.trim();
    this._refundedAmount = props.refundedAmount ?? Money.zero(props.amount.currency);
    this.createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get status(): PaymentStatus {
    return this._status;
  }

  get transactionId(): string | undefined {
    return this._transactionId;
  }

  get refundedAmount(): Money {
    return this._refundedAmount;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  settle(transactionId: string): void {
    if (this._status === 'PAID') return;
    if (this._status === 'FAILED' || this._status === 'EXPIRED') {
      throw new DomainError(`Cannot settle payment with status ${this._status}`);
    }
    this._transactionId = transactionId;
    this._status = 'PAID';
    this._updatedAt = new Date();
  }

  fail(reason: string): void {
    if (this._status === 'PAID') {
      throw new DomainError('Cannot fail a payment that has already settled');
    }
    this._status = 'FAILED';
    this._updatedAt = new Date();
    void reason;
  }

  refund(amount: Money, reason: string): void {
    if (this._status !== 'PAID' && this._status !== 'PARTIALLY_REFUNDED') {
      throw new DomainError(`Cannot refund payment with status ${this._status}`);
    }
    const totalRefund = this._refundedAmount.add(amount);
    if (totalRefund.amount > this.amount.amount) {
      throw new DomainError(
        `Refund amount (${totalRefund.format()}) exceeds total settled payment (${this.amount.format()})`,
      );
    }
    this._refundedAmount = totalRefund;
    this._status = totalRefund.amount === this.amount.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
    this._updatedAt = new Date();
    void reason;
  }
}
