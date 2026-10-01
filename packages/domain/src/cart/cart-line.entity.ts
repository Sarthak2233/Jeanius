/**
 * CartLine snapshot entity (JN-072).
 * Captures selected variant options and custom tailor measurements.
 */
import type { CartLineId, CartId, ProductId, VariantId } from '../common/entity-id.js';
import { type Money } from '../common/money.vo.js';
import type { CommerceModel } from '../catalog/product-type.js';
import { DomainError } from '../errors/index.js';

export interface CartLineProps {
  readonly id: CartLineId;
  readonly cartId: CartId;
  readonly productId: ProductId;
  readonly variantId: VariantId;
  readonly productTitle: string;
  readonly commerceModel: CommerceModel;
  readonly unitPrice: Money;
  readonly quantity: number;
  readonly selectedOptions: Readonly<Record<string, string>>;
  readonly customTailoringMeasurements?: Readonly<Record<string, number | string>>;
}

export class CartLine {
  readonly id: CartLineId;
  readonly cartId: CartId;
  readonly productId: ProductId;
  readonly variantId: VariantId;
  readonly productTitle: string;
  readonly commerceModel: CommerceModel;
  readonly unitPrice: Money;
  private _quantity: number;
  readonly selectedOptions: Readonly<Record<string, string>>;
  readonly customTailoringMeasurements?: Readonly<Record<string, number | string>>;

  constructor(props: CartLineProps) {
    if (props.quantity <= 0) {
      throw new DomainError(
        `CartLine quantity must be greater than 0, received: ${props.quantity}`,
      );
    }

    this.id = props.id;
    this.cartId = props.cartId;
    this.productId = props.productId;
    this.variantId = props.variantId;
    this.productTitle = props.productTitle;
    this.commerceModel = props.commerceModel;
    this.unitPrice = props.unitPrice;
    this._quantity = props.quantity;
    this.selectedOptions = { ...props.selectedOptions };
    this.customTailoringMeasurements = props.customTailoringMeasurements
      ? { ...props.customTailoringMeasurements }
      : undefined;
  }

  get quantity(): number {
    return this._quantity;
  }

  calculateLineTotal(): Money {
    return this.unitPrice.multiply(this._quantity);
  }

  updateQuantity(qty: number): void {
    if (qty <= 0) {
      throw new DomainError(`Updated cart line quantity must be greater than 0, received: ${qty}`);
    }
    this._quantity = qty;
  }
}
