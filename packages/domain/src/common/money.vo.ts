/**
 * Minor-unit immutable Money Value Object (JN-064).
 * Enforces integer precision (cents/paisa) and prevents currency mismatches.
 */
import { DomainError } from '../errors/index.js';

export type Currency = 'USD' | 'NPR' | 'EUR' | 'GBP';

export class Money {
  readonly amount: number; // In minor units (e.g. cents, paisa)
  readonly currency: Currency;

  constructor(amount: number, currency: Currency = 'USD') {
    if (!Number.isInteger(amount)) {
      throw new DomainError(`Money amount must be an integer in minor units, received: ${amount}`);
    }
    this.amount = amount;
    this.currency = currency;
  }

  static zero(currency: Currency = 'USD'): Money {
    return new Money(0, currency);
  }

  static fromMajor(majorAmount: number, currency: Currency = 'USD'): Money {
    const minor = Math.round(majorAmount * 100);
    return new Money(minor, currency);
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    if (this.amount - other.amount < 0) {
      throw new DomainError(
        `Resulting Money amount cannot be negative: ${this.amount} - ${other.amount}`,
      );
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new DomainError(`Multiplication factor cannot be negative: ${factor}`);
    }
    return new Money(Math.round(this.amount * factor), this.currency);
  }

  /**
   * Distributes money into N parts according to ratios without losing fractional pennies.
   */
  allocate(ratios: readonly number[]): Money[] {
    if (ratios.length === 0) {
      throw new DomainError('Cannot allocate money across an empty ratio list');
    }
    const totalRatio = ratios.reduce((sum, r) => sum + r, 0);
    if (totalRatio <= 0) {
      throw new DomainError('Sum of ratios must be greater than zero');
    }

    let remainder = this.amount;
    const results = ratios.map((ratio) => {
      const share = Math.floor((this.amount * ratio) / totalRatio);
      remainder -= share;
      return new Money(share, this.currency);
    });

    // Distribute remaining minor units one by one
    for (let i = 0; remainder > 0; i = (i + 1) % results.length) {
      results[i] = new Money(results[i]!.amount + 1, this.currency);
      remainder--;
    }

    return results;
  }

  equals(other: Money): boolean {
    return this.currency === other.currency && this.amount === other.amount;
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  isPositive(): boolean {
    return this.amount > 0;
  }

  format(): string {
    const major = (this.amount / 100).toFixed(2);
    return `${this.currency} ${major}`;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new DomainError(
        `Currency mismatch: cannot perform operation between ${this.currency} and ${other.currency}`,
      );
    }
  }
}
