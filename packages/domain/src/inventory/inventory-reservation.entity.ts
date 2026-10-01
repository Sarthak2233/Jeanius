/**
 * InventoryReservation entity (JN-086).
 * Two-phase inventory hold during checkout with strict 10-minute TTL auto-expiration.
 */
import type { ReservationId, VariantId, CartId } from '../common/entity-id.js';
import { DomainError } from '../errors/index.js';

export type ReservationStatus = 'HELD' | 'COMMITTED' | 'RELEASED' | 'EXPIRED';

export const DEFAULT_RESERVATION_TTL_MINUTES = 10;

export interface InventoryReservationProps {
  readonly id: ReservationId;
  readonly variantId: VariantId;
  readonly quantity: number;
  readonly cartId?: CartId;
  readonly status?: ReservationStatus;
  readonly expiresAt?: Date;
  readonly createdAt?: Date;
}

export class InventoryReservation {
  readonly id: ReservationId;
  readonly variantId: VariantId;
  readonly quantity: number;
  readonly cartId?: CartId;
  private _status: ReservationStatus;
  readonly expiresAt: Date;
  readonly createdAt: Date;

  constructor(props: InventoryReservationProps) {
    if (props.quantity <= 0) {
      throw new DomainError(`Reservation quantity must be positive, received: ${props.quantity}`);
    }

    this.id = props.id;
    this.variantId = props.variantId;
    this.quantity = props.quantity;
    this.cartId = props.cartId;
    this._status = props.status ?? 'HELD';
    this.createdAt = props.createdAt ?? new Date();
    this.expiresAt =
      props.expiresAt ??
      new Date(this.createdAt.getTime() + DEFAULT_RESERVATION_TTL_MINUTES * 60 * 1000);
  }

  get status(): ReservationStatus {
    return this._status;
  }

  isExpired(now: Date = new Date()): boolean {
    return this._status === 'HELD' && now.getTime() > this.expiresAt.getTime();
  }

  commit(): void {
    if (this._status === 'COMMITTED') return;
    if (this.isExpired()) {
      this._status = 'EXPIRED';
      throw new DomainError('Cannot commit an expired inventory reservation');
    }
    if (this._status !== 'HELD') {
      throw new DomainError(`Cannot commit reservation with status ${this._status}`);
    }
    this._status = 'COMMITTED';
  }

  release(): void {
    if (this._status === 'COMMITTED') {
      throw new DomainError('Cannot release a committed inventory reservation');
    }
    this._status = 'RELEASED';
  }

  expire(): void {
    if (this._status === 'COMMITTED') {
      throw new DomainError('Cannot expire a committed inventory reservation');
    }
    this._status = 'EXPIRED';
  }
}
