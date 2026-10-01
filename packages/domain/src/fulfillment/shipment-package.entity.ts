/**
 * ShipmentPackage entity (JN-089).
 * Represents an individual physical parcel for split fulfillment (e.g. DROP ready-to-ship vs OM delayed).
 */
import type { ShipmentPackageId, ShipmentId, OrderLineId } from '../common/entity-id.js';
import type { ExportDeclaration } from './export-declaration.vo.js';
import { DomainError } from '../errors/index.js';

export type ShippingCarrier = 'DHL_EXPRESS' | 'ARAMEX' | 'NEPAL_POST' | string;

export type PackageStatus = 'PACKED' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED';

export interface ShipmentPackageProps {
  readonly id: ShipmentPackageId;
  readonly shipmentId: ShipmentId;
  readonly packageNumber: number;
  readonly carrier: ShippingCarrier;
  readonly trackingNumber?: string;
  readonly orderLineIds: readonly OrderLineId[];
  readonly exportDeclaration?: ExportDeclaration;
  readonly status?: PackageStatus;
  readonly packedAt?: Date;
  readonly dispatchedAt?: Date;
  readonly deliveredAt?: Date;
}

export class ShipmentPackage {
  readonly id: ShipmentPackageId;
  readonly shipmentId: ShipmentId;
  readonly packageNumber: number;
  readonly carrier: ShippingCarrier;
  private _trackingNumber?: string;
  readonly orderLineIds: readonly OrderLineId[];
  readonly exportDeclaration?: ExportDeclaration;
  private _status: PackageStatus;
  readonly packedAt: Date;
  private _dispatchedAt?: Date;
  private _deliveredAt?: Date;

  constructor(props: ShipmentPackageProps) {
    if (props.orderLineIds.length === 0) {
      throw new DomainError('Shipment package must contain at least one order line');
    }

    this.id = props.id;
    this.shipmentId = props.shipmentId;
    this.packageNumber = props.packageNumber;
    this.carrier = props.carrier;
    this._trackingNumber = props.trackingNumber;
    this.orderLineIds = [...props.orderLineIds];
    this.exportDeclaration = props.exportDeclaration;
    this._status = props.status ?? 'PACKED';
    this.packedAt = props.packedAt ?? new Date();
    this._dispatchedAt = props.dispatchedAt;
    this._deliveredAt = props.deliveredAt;
  }

  get trackingNumber(): string | undefined {
    return this._trackingNumber;
  }

  get status(): PackageStatus {
    return this._status;
  }

  get dispatchedAt(): Date | undefined {
    return this._dispatchedAt;
  }

  get deliveredAt(): Date | undefined {
    return this._deliveredAt;
  }

  dispatch(trackingNumber: string, dispatchedAt: Date = new Date()): void {
    if (!trackingNumber?.trim()) {
      throw new DomainError('Tracking number is required to dispatch package');
    }
    this._trackingNumber = trackingNumber.trim();
    this._status = 'DISPATCHED';
    this._dispatchedAt = dispatchedAt;
  }

  markDelivered(deliveredAt: Date = new Date()): void {
    this._status = 'DELIVERED';
    this._deliveredAt = deliveredAt;
  }
}
