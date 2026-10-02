/**
 * OrderLine immutable snapshot entity (JN-074).
 * Captures final purchased specification, price, and allocated selvedge bolt ID.
 */
import type {
  OrderLineId,
  OrderId,
  ProductId,
  VariantId,
  BoltId,
  MetalStockId,
} from '../common/entity-id.js';
import { type Money } from '../common/money.vo.js';
import type { CommerceModel } from '../catalog/product-type.js';
import { DomainError } from '../errors/index.js';

export interface OrderLineProps {
  readonly id: OrderLineId;
  readonly orderId: OrderId;
  readonly productId: ProductId;
  readonly variantId: VariantId;
  readonly productTitle: string;
  readonly sku: string;
  readonly commerceModel: CommerceModel;
  readonly unitPrice: Money;
  readonly quantity: number;
  readonly lineTotal: Money;
  readonly selectedOptions: Readonly<Record<string, string>>;
  readonly customTailoring?: Readonly<Record<string, number | string>>;
  readonly customSpecifications?: Readonly<Record<string, number | string>>;
  readonly allocatedBoltId?: BoltId;
  readonly allocatedMetalStockId?: MetalStockId;
}

export class OrderLine {
  readonly id: OrderLineId;
  readonly orderId: OrderId;
  readonly productId: ProductId;
  readonly variantId: VariantId;
  readonly productTitle: string;
  readonly sku: string;
  readonly commerceModel: CommerceModel;
  readonly unitPrice: Money;
  readonly quantity: number;
  readonly lineTotal: Money;
  readonly selectedOptions: Readonly<Record<string, string>>;
  readonly customTailoring?: Readonly<Record<string, number | string>>;
  readonly customSpecifications?: Readonly<Record<string, number | string>>;
  private _allocatedBoltId?: BoltId;
  private _allocatedMetalStockId?: MetalStockId;

  constructor(props: OrderLineProps) {
    if (props.quantity <= 0) {
      throw new DomainError(`OrderLine quantity must be positive, received: ${props.quantity}`);
    }

    this.id = props.id;
    this.orderId = props.orderId;
    this.productId = props.productId;
    this.variantId = props.variantId;
    this.productTitle = props.productTitle;
    this.sku = props.sku;
    this.commerceModel = props.commerceModel;
    this.unitPrice = props.unitPrice;
    this.quantity = props.quantity;
    this.lineTotal = props.lineTotal;
    this.selectedOptions = { ...props.selectedOptions };
    this.customTailoring = props.customTailoring ? { ...props.customTailoring } : undefined;
    this.customSpecifications = props.customSpecifications
      ? { ...props.customSpecifications }
      : undefined;
    this._allocatedBoltId = props.allocatedBoltId;
    this._allocatedMetalStockId = props.allocatedMetalStockId;
  }

  get allocatedBoltId(): BoltId | undefined {
    return this._allocatedBoltId;
  }

  get allocatedMetalStockId(): MetalStockId | undefined {
    return this._allocatedMetalStockId;
  }

  assignBolt(boltId: BoltId): void {
    if (this._allocatedBoltId) {
      throw new DomainError(
        `OrderLine ${this.id} already has allocated bolt ${this._allocatedBoltId}`,
      );
    }
    this._allocatedBoltId = boltId;
  }

  assignMetalStock(metalStockId: MetalStockId): void {
    if (this._allocatedMetalStockId) {
      throw new DomainError(
        `OrderLine ${this.id} already has allocated metal stock ${this._allocatedMetalStockId}`,
      );
    }
    this._allocatedMetalStockId = metalStockId;
  }
}
