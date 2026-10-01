/**
 * Cart aggregate root (JN-071).
 * Manages active shopper basket lines and calculates pricing totals.
 */
import type { CartId, CustomerId, CartLineId } from '../common/entity-id.js';
import { Money, type Currency } from '../common/money.vo.js';
import type { CartLine } from './cart-line.entity.js';
import { DomainError } from '../errors/index.js';

export interface CartProps {
  readonly id: CartId;
  readonly customerId?: CustomerId;
  readonly lines?: readonly CartLine[];
  readonly currency?: Currency;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export class Cart {
  readonly id: CartId;
  readonly customerId?: CustomerId;
  private readonly _lines: CartLine[];
  readonly currency: Currency;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: CartProps) {
    this.id = props.id;
    this.customerId = props.customerId;
    this._lines = props.lines ? [...props.lines] : [];
    this.currency = props.currency ?? 'USD';
    this.createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get lines(): readonly CartLine[] {
    return [...this._lines];
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  addLine(line: CartLine): void {
    if (line.unitPrice.currency !== this.currency) {
      throw new DomainError(
        `Cannot add line with currency ${line.unitPrice.currency} to cart with ${this.currency}`,
      );
    }
    const existing = this._lines.find(
      (l) =>
        l.variantId === line.variantId &&
        JSON.stringify(l.selectedOptions) === JSON.stringify(line.selectedOptions),
    );

    if (existing) {
      existing.updateQuantity(existing.quantity + line.quantity);
    } else {
      this._lines.push(line);
    }
    this._updatedAt = new Date();
  }

  updateLineQuantity(lineId: CartLineId, qty: number): void {
    const line = this._lines.find((l) => l.id === lineId);
    if (!line) {
      throw new DomainError(`Cart line with ID "${lineId}" not found in cart`);
    }
    line.updateQuantity(qty);
    this._updatedAt = new Date();
  }

  removeLine(lineId: CartLineId): void {
    const index = this._lines.findIndex((l) => l.id === lineId);
    if (index === -1) {
      throw new DomainError(`Cart line with ID "${lineId}" not found in cart`);
    }
    this._lines.splice(index, 1);
    this._updatedAt = new Date();
  }

  clear(): void {
    this._lines.length = 0;
    this._updatedAt = new Date();
  }

  calculateSubtotal(): Money {
    if (this._lines.length === 0) {
      return Money.zero(this.currency);
    }
    return this._lines.reduce(
      (total, line) => total.add(line.calculateLineTotal()),
      Money.zero(this.currency),
    );
  }

  itemCount(): number {
    return this._lines.reduce((count, line) => count + line.quantity, 0);
  }

  hasOrderMadeItems(): boolean {
    return this._lines.some((l) => l.commerceModel === 'OM');
  }

  hasDropItems(): boolean {
    return this._lines.some((l) => l.commerceModel === 'DROP');
  }
}
