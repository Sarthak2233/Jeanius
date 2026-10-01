import { pgTable, text, timestamp, integer, jsonb, uuid, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { orders, paymentStatusEnum } from './order';

export const paymentProviderEnum = ['STRIPE', 'ESEWA', 'KHALTI', 'FONEPAY'] as const;

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    amount: integer('amount').notNull(),
    currency: text('currency').notNull().default('USD'),
    provider: text('provider', { enum: paymentProviderEnum }).notNull(),
    status: text('status', { enum: paymentStatusEnum }).notNull().default('INITIATED'),
    transactionId: text('transaction_id'),
    idempotencyKey: text('idempotency_key').notNull().unique(),
    refundedAmount: integer('refunded_amount').notNull().default(0),
    refundedCurrency: text('refunded_currency').notNull().default('USD'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_payments_order_id').on(table.orderId),
    index('idx_payments_idempotency_key').on(table.idempotencyKey),
    index('idx_payments_transaction_id').on(table.transactionId),
    index('idx_payments_status').on(table.status),
    check('chk_payments_amount', sql`${table.amount} >= 0`),
    check('chk_payments_refunded_amount', sql`${table.refundedAmount} >= 0`),
    check('chk_payments_refund_lte_amount', sql`${table.refundedAmount} <= ${table.amount}`),
  ],
);

export const idempotencyKeys = pgTable(
  'idempotency_keys',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    key: text('key').notNull().unique(),
    scope: text('scope').notNull(),
    responseStatus: integer('response_status'),
    responseBody: jsonb('response_body'),
    lockedAt: timestamp('locked_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_idempotency_keys_key').on(table.key),
    index('idx_idempotency_keys_expires_at').on(table.expiresAt),
  ],
);
