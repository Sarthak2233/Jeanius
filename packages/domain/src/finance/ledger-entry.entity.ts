/**
 * LedgerEntry entity (JN-087).
 * Double-entry financial accounting and audit record for payments, revenue recognition, and refunds.
 */
import type { LedgerEntryId } from '../common/entity-id.js';
import { type Money } from '../common/money.vo.js';
import { DomainError } from '../errors/index.js';

export type AccountCode =
  | 'ACCOUNTS_RECEIVABLE'
  | 'CASH_GATEWAY_STRIPE'
  | 'CASH_GATEWAY_ESEWA'
  | 'DEFERRED_REVENUE_OM'
  | 'DENIM_SALES_REVENUE'
  | 'SHIPPING_REVENUE'
  | 'VAT_LIABILITY_NEPAL'
  | 'GATEWAY_FEES_EXPENSE'
  | 'REFUND_EXPENSE';

export interface LedgerEntryProps {
  readonly id: LedgerEntryId;
  readonly transactionReference: string; // e.g. orderId, paymentId
  readonly debitAccount: AccountCode;
  readonly creditAccount: AccountCode;
  readonly amount: Money;
  readonly description: string;
  readonly postedAt?: Date;
}

export class LedgerEntry {
  readonly id: LedgerEntryId;
  readonly transactionReference: string;
  readonly debitAccount: AccountCode;
  readonly creditAccount: AccountCode;
  readonly amount: Money;
  readonly description: string;
  readonly postedAt: Date;

  constructor(props: LedgerEntryProps) {
    if (!props.transactionReference?.trim()) {
      throw new DomainError('Transaction reference is required for ledger entry');
    }
    if (props.debitAccount === props.creditAccount) {
      throw new DomainError('Debit and credit accounts cannot be identical');
    }
    if (props.amount.isZero() || !props.amount.isPositive()) {
      throw new DomainError('Ledger entry amount must be positive');
    }

    this.id = props.id;
    this.transactionReference = props.transactionReference.trim();
    this.debitAccount = props.debitAccount;
    this.creditAccount = props.creditAccount;
    this.amount = props.amount;
    this.description = props.description.trim();
    this.postedAt = props.postedAt ?? new Date();
  }

  isBalanced(): boolean {
    return this.amount.isPositive() && this.debitAccount !== this.creditAccount;
  }
}
