/**
 * OptionValue entity (JN-068).
 * Represents an individual choice under a ProductOption (e.g. "32", "14oz Indigo Kuroki", "Copper Rivets").
 */
import type { OptionValueId, ProductOptionId } from '../common/entity-id.js';
import { Money } from '../common/money.vo.js';
import { DomainError } from '../errors/index.js';

export interface OptionValueProps {
  readonly id: OptionValueId;
  readonly optionId: ProductOptionId;
  readonly code: string;
  readonly label: string;
  readonly priceDelta?: Money;
  readonly isAvailable?: boolean;
  readonly position?: number;
}

export class OptionValue {
  readonly id: OptionValueId;
  readonly optionId: ProductOptionId;
  readonly code: string;
  readonly label: string;
  readonly priceDelta: Money;
  readonly isAvailable: boolean;
  readonly position: number;

  constructor(props: OptionValueProps) {
    if (!props.code?.trim()) {
      throw new DomainError('OptionValue code is required');
    }
    if (!props.label?.trim()) {
      throw new DomainError('OptionValue label is required');
    }

    this.id = props.id;
    this.optionId = props.optionId;
    this.code = props.code.trim();
    this.label = props.label.trim();
    this.priceDelta = props.priceDelta ?? Money.zero();
    this.isAvailable = props.isAvailable ?? true;
    this.position = props.position ?? 0;
  }
}
