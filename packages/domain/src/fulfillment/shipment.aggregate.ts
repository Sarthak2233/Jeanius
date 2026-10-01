/**
 * Shipment aggregate root (JN-077, JN-089).
 * Orchestrates multi-package split fulfillment, tracking, and carrier status updates.
 */
import type { ShipmentId, OrderId } from '../common/entity-id.js';
import type { Address } from '../common/address.vo.js';
import type { ShipmentPackage } from './shipment-package.entity.js';
import { DomainError } from '../errors/index.js';

export type ShipmentStatus =
  | 'PENDING'
  | 'PACKED'
  | 'SHIPPED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'ATTEMPTED_DELIVERY'
  | 'RETURNED_TO_SENDER'
  | 'RETURNED'
  | 'LOST';

export function canTransitionShipmentStatus(
  current: ShipmentStatus,
  next: ShipmentStatus,
): boolean {
  switch (current) {
    case 'PENDING':
      return next === 'PACKED' || next === 'LOST';
    case 'PACKED':
      return next === 'SHIPPED' || next === 'PENDING';
    case 'SHIPPED':
      return next === 'IN_TRANSIT' || next === 'LOST';
    case 'IN_TRANSIT':
      return (
        next === 'OUT_FOR_DELIVERY' ||
        next === 'ATTEMPTED_DELIVERY' ||
        next === 'LOST' ||
        next === 'RETURNED_TO_SENDER'
      );
    case 'OUT_FOR_DELIVERY':
      return next === 'DELIVERED' || next === 'ATTEMPTED_DELIVERY' || next === 'RETURNED_TO_SENDER';
    case 'ATTEMPTED_DELIVERY':
      return next === 'OUT_FOR_DELIVERY' || next === 'RETURNED_TO_SENDER';
    case 'DELIVERED':
      return next === 'RETURNED';
    case 'RETURNED_TO_SENDER':
    case 'RETURNED':
    case 'LOST':
      return false; // Terminal states
    default:
      return false;
  }
}

export interface ShipmentProps {
  readonly id: ShipmentId;
  readonly orderId: OrderId;
  readonly shippingAddress: Address;
  readonly status?: ShipmentStatus;
  readonly packages?: readonly ShipmentPackage[];
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export class Shipment {
  readonly id: ShipmentId;
  readonly orderId: OrderId;
  readonly shippingAddress: Address;
  private _status: ShipmentStatus;
  private readonly _packages: ShipmentPackage[];
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: ShipmentProps) {
    this.id = props.id;
    this.orderId = props.orderId;
    this.shippingAddress = props.shippingAddress;
    this._status = props.status ?? 'PENDING';
    this._packages = props.packages ? [...props.packages] : [];
    this.createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get status(): ShipmentStatus {
    return this._status;
  }

  get packages(): readonly ShipmentPackage[] {
    return [...this._packages];
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  addPackage(pkg: ShipmentPackage): void {
    if (this._packages.some((p) => p.packageNumber === pkg.packageNumber)) {
      throw new DomainError(`Package number ${pkg.packageNumber} already exists in shipment`);
    }
    this._packages.push(pkg);
    this._updatedAt = new Date();
  }

  transitionStatus(next: ShipmentStatus): void {
    if (this._status === next) return;
    if (!canTransitionShipmentStatus(this._status, next)) {
      throw new DomainError(`Invalid shipment status transition from ${this._status} to ${next}`);
    }
    this._status = next;
    this._updatedAt = new Date();
  }

  allPackagesDelivered(): boolean {
    return this._packages.length > 0 && this._packages.every((p) => p.status === 'DELIVERED');
  }
}
