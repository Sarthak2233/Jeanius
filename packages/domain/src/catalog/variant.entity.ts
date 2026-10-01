/**
 * ProductVariant entity (JN-069).
 * Concrete purchasable garment configuration with SKU, selected options, and inventory.
 */
import type { VariantId, ProductId } from '../common/entity-id.js';
import { Money } from '../common/money.vo.js';
import { type VariantStatus, canTransitionVariantStatus } from './product-type.js';
import { DomainError } from '../errors/index.js';

export interface ProductVariantProps {
  readonly id: VariantId;
  readonly productId: ProductId;
  readonly sku: string;
  readonly options: Readonly<Record<string, string>>; // e.g. { waist: '32', inseam: '34' }
  readonly additionalPrice?: Money;
  readonly inventoryCount?: number;
  readonly status?: VariantStatus;
}

export class ProductVariant {
  readonly id: VariantId;
  readonly productId: ProductId;
  readonly sku: string;
  readonly options: Readonly<Record<string, string>>;
  readonly additionalPrice: Money;
  private _inventoryCount: number;
  private _status: VariantStatus;

  constructor(props: ProductVariantProps) {
    if (!props.sku?.trim()) {
      throw new DomainError('SKU is required for a product variant');
    }

    this.id = props.id;
    this.productId = props.productId;
    this.sku = props.sku.trim().toUpperCase();
    this.options = { ...props.options };
    this.additionalPrice = props.additionalPrice ?? Money.zero();
    this._inventoryCount = props.inventoryCount ?? 0;
    this._status = props.status ?? 'AVAILABLE';
  }

  get inventoryCount(): number {
    return this._inventoryCount;
  }

  get status(): VariantStatus {
    return this._status;
  }

  get isAvailable(): boolean {
    return this._status === 'AVAILABLE' || this._status === 'LOW_STOCK';
  }

  calculateTotalPrice(basePrice: Money): Money {
    return basePrice.add(this.additionalPrice);
  }

  adjustInventory(delta: number): void {
    const updated = this._inventoryCount + delta;
    if (updated < 0) {
      throw new DomainError(
        `Cannot reduce inventory below 0. Current: ${this._inventoryCount}, Delta: ${delta}`,
      );
    }
    this._inventoryCount = updated;

    if (this._inventoryCount === 0 && this._status !== 'ARCHIVED') {
      this._status = 'SOLD_OUT';
    } else if (
      this._inventoryCount > 0 &&
      this._inventoryCount <= 5 &&
      this._status === 'AVAILABLE'
    ) {
      this._status = 'LOW_STOCK';
    } else if (this._inventoryCount > 5 && this._status === 'LOW_STOCK') {
      this._status = 'AVAILABLE';
    }
  }

  transitionStatus(next: VariantStatus): void {
    if (!canTransitionVariantStatus(this._status, next)) {
      throw new DomainError(`Invalid variant status transition from ${this._status} to ${next}`);
    }
    this._status = next;
  }
}
