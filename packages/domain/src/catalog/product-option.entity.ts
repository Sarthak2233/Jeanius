/**
 * ProductOption entity (JN-067).
 * Configurable option dimension (e.g. Waist, Inseam, Denim Weight, Thread Color).
 */
import type { ProductOptionId, ProductId } from '../common/entity-id.js';
import type { OptionValue } from './option-value.entity.js';
import { DomainError } from '../errors/index.js';

export interface ProductOptionProps {
  readonly id: ProductOptionId;
  readonly productId: ProductId;
  readonly name: string;
  readonly code: string;
  readonly position?: number;
  readonly isRequired?: boolean;
  readonly values?: readonly OptionValue[];
}

export class ProductOption {
  readonly id: ProductOptionId;
  readonly productId: ProductId;
  readonly name: string;
  readonly code: string;
  readonly position: number;
  readonly isRequired: boolean;
  private readonly _values: OptionValue[];

  constructor(props: ProductOptionProps) {
    if (!props.name?.trim()) {
      throw new DomainError('ProductOption name is required');
    }
    if (!props.code?.trim()) {
      throw new DomainError('ProductOption code is required');
    }

    this.id = props.id;
    this.productId = props.productId;
    this.name = props.name.trim();
    this.code = props.code.trim().toLowerCase();
    this.position = props.position ?? 0;
    this.isRequired = props.isRequired ?? true;
    this._values = props.values ? [...props.values] : [];
  }

  get values(): readonly OptionValue[] {
    return [...this._values];
  }

  addValue(val: OptionValue): void {
    if (this._values.some((v) => v.code === val.code)) {
      throw new DomainError(
        `OptionValue with code "${val.code}" already exists in option "${this.code}"`,
      );
    }
    this._values.push(val);
  }

  findValueByCode(code: string): OptionValue | undefined {
    return this._values.find((v) => v.code === code);
  }
}
