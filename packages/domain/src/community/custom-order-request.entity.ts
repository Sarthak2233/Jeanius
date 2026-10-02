/**
 * CustomOrderRequest entity (JN-080).
 * Controlled custom order workflow for bespoke artisan consultations.
 */
import type { CustomOrderId, OrderId } from '../common/entity-id.js';
import { type Money } from '../common/money.vo.js';
import type { ProductCategory } from '../catalog/product-type.js';
import { DomainError } from '../errors/index.js';

export type CustomOrderInquiryStatus =
  'INQUIRY_RECEIVED' | 'QUOTED' | 'APPROVED' | 'REJECTED' | 'CONVERTED_TO_ORDER';

export interface CustomOrderRequestProps {
  readonly id: CustomOrderId;
  readonly customerName: string;
  readonly customerEmail: string;
  readonly category: ProductCategory;
  readonly description: string;
  readonly desiredFabricWeight?: string;
  readonly desiredMetalAlloy?: string;
  readonly customSpecifications?: Readonly<Record<string, number | string>>;
  readonly referenceImageUrls?: readonly string[];
  readonly status?: CustomOrderInquiryStatus;
  readonly quotedPrice?: Money;
  readonly quotedLeadDays?: number;
  readonly convertedOrderId?: OrderId;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export class CustomOrderRequest {
  readonly id: CustomOrderId;
  readonly customerName: string;
  readonly customerEmail: string;
  readonly category: ProductCategory;
  readonly description: string;
  readonly desiredFabricWeight?: string;
  readonly desiredMetalAlloy?: string;
  readonly customSpecifications?: Readonly<Record<string, number | string>>;
  readonly referenceImageUrls: readonly string[];
  private _status: CustomOrderInquiryStatus;
  private _quotedPrice?: Money;
  private _quotedLeadDays?: number;
  private _convertedOrderId?: OrderId;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: CustomOrderRequestProps) {
    if (!props.customerEmail?.trim()) {
      throw new DomainError('Customer email is required for custom order request');
    }
    if (!props.description?.trim()) {
      throw new DomainError('Garment description is required');
    }

    this.id = props.id;
    this.customerName = props.customerName.trim();
    this.customerEmail = props.customerEmail.trim();
    this.category = props.category;
    this.description = props.description.trim();
    this.desiredFabricWeight = props.desiredFabricWeight;
    this.desiredMetalAlloy = props.desiredMetalAlloy;
    this.customSpecifications = props.customSpecifications
      ? { ...props.customSpecifications }
      : undefined;
    this.referenceImageUrls = props.referenceImageUrls ? [...props.referenceImageUrls] : [];
    this._status = props.status ?? 'INQUIRY_RECEIVED';
    this._quotedPrice = props.quotedPrice;
    this._quotedLeadDays = props.quotedLeadDays;
    this._convertedOrderId = props.convertedOrderId;
    this.createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get status(): CustomOrderInquiryStatus {
    return this._status;
  }

  get quotedPrice(): Money | undefined {
    return this._quotedPrice;
  }

  get quotedLeadDays(): number | undefined {
    return this._quotedLeadDays;
  }

  get convertedOrderId(): OrderId | undefined {
    return this._convertedOrderId;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  quote(price: Money, leadDays: number): void {
    if (leadDays <= 0) {
      throw new DomainError('Quoted lead days must be positive');
    }
    this._quotedPrice = price;
    this._quotedLeadDays = leadDays;
    this._status = 'QUOTED';
    this._updatedAt = new Date();
  }

  approve(): void {
    if (this._status !== 'QUOTED') {
      throw new DomainError(`Cannot approve inquiry in status ${this._status}`);
    }
    this._status = 'APPROVED';
    this._updatedAt = new Date();
  }

  reject(reason: string): void {
    this._status = 'REJECTED';
    this._updatedAt = new Date();
    void reason;
  }

  convertToOrder(orderId: OrderId): void {
    if (this._status !== 'APPROVED') {
      throw new DomainError(`Cannot convert inquiry to order from status ${this._status}`);
    }
    this._convertedOrderId = orderId;
    this._status = 'CONVERTED_TO_ORDER';
    this._updatedAt = new Date();
  }
}
