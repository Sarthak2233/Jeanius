/**
 * Order aggregate root (JN-073).
 * Immutable commercial contract enforcing lifecycle state transitions and workshop cancellation rules.
 */
import type { OrderId, CustomerId, PaymentId } from '../common/entity-id.js';
import { type Money, type Currency } from '../common/money.vo.js';
import type { Address } from '../common/address.vo.js';
import type { OrderLine } from './order-line.entity.js';
import type { ProductionJob } from '../production/production-job.entity.js';
import { DomainError } from '../errors/index.js';

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'IN_PRODUCTION'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus =
  'INITIATED' | 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export interface OrderProps {
  readonly id: OrderId;
  readonly orderNumber: string;
  readonly customerId?: CustomerId;
  readonly customerEmail: string;
  readonly status?: OrderStatus;
  readonly paymentStatus?: PaymentStatus;
  readonly shippingAddress: Address;
  readonly billingAddress?: Address;
  readonly lines: readonly OrderLine[];
  readonly subtotal: Money;
  readonly shippingCost: Money;
  readonly total: Money;
  readonly currency?: Currency;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export class Order {
  readonly id: OrderId;
  readonly orderNumber: string;
  readonly customerId?: CustomerId;
  readonly customerEmail: string;
  private _status: OrderStatus;
  private _paymentStatus: PaymentStatus;
  readonly shippingAddress: Address;
  readonly billingAddress?: Address;
  readonly lines: readonly OrderLine[];
  readonly subtotal: Money;
  readonly shippingCost: Money;
  readonly total: Money;
  readonly currency: Currency;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: OrderProps) {
    if (!props.orderNumber?.trim()) {
      throw new DomainError('Order number is required');
    }
    if (!props.customerEmail?.trim()) {
      throw new DomainError('Customer email is required');
    }
    if (props.lines.length === 0) {
      throw new DomainError('Order must contain at least one line');
    }

    this.id = props.id;
    this.orderNumber = props.orderNumber.trim();
    this.customerId = props.customerId;
    this.customerEmail = props.customerEmail.trim();
    this._status = props.status ?? 'PENDING';
    this._paymentStatus = props.paymentStatus ?? 'INITIATED';
    this.shippingAddress = props.shippingAddress;
    this.billingAddress = props.billingAddress;
    this.lines = [...props.lines];
    this.subtotal = props.subtotal;
    this.shippingCost = props.shippingCost;
    this.total = props.total;
    this.currency = props.currency ?? props.total.currency;
    this.createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get status(): OrderStatus {
    return this._status;
  }

  get paymentStatus(): PaymentStatus {
    return this._paymentStatus;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  markPaid(_paymentId: PaymentId, _transactionId: string): void {
    if (this._paymentStatus === 'PAID') {
      return; // Idempotent
    }
    this._paymentStatus = 'PAID';
    this._status = this.requiresWorkshopProduction() ? 'IN_PRODUCTION' : 'PAID';
    this._updatedAt = new Date();
  }

  transitionStatus(next: OrderStatus): void {
    if (this._status === next) return;
    if (this._status === 'CANCELLED' || this._status === 'REFUNDED') {
      throw new DomainError(`Cannot transition order from terminal status ${this._status}`);
    }
    this._status = next;
    this._updatedAt = new Date();
  }

  canCancel(jobs?: readonly ProductionJob[]): boolean {
    if (
      this._status === 'CANCELLED' ||
      this._status === 'SHIPPED' ||
      this._status === 'DELIVERED' ||
      this._status === 'REFUNDED'
    ) {
      return false;
    }

    // Point of no return check: OM jobs cannot be cancelled once cutting has started
    if (jobs && jobs.length > 0) {
      const hasCuttingStarted = jobs.some((j) => j.currentStage !== 'QUEUED');
      if (hasCuttingStarted) {
        return false;
      }
    }

    return true;
  }

  cancel(reason: string, jobs?: readonly ProductionJob[]): void {
    if (!this.canCancel(jobs)) {
      throw new DomainError(
        `Order ${this.orderNumber} cannot be cancelled (cutting already commenced or order already in transit)`,
      );
    }
    this._status = 'CANCELLED';
    this._updatedAt = new Date();
    void reason;
  }

  requiresWorkshopProduction(): boolean {
    return this.lines.some((l) => l.commerceModel === 'OM');
  }

  isMultiPackageEligible(): boolean {
    const hasDrop = this.lines.some((l) => l.commerceModel === 'DROP');
    const hasOm = this.lines.some((l) => l.commerceModel === 'OM');
    return hasDrop && hasOm;
  }
}
