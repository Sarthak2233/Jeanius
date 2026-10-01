import { pgTable, text, timestamp, integer, jsonb, uuid, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const outboxStatusEnum = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] as const;

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    actorId: text('actor_id').notNull(),
    actorRole: text('actor_role').notNull(),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    payload: jsonb('payload').$type<Record<string, unknown>>(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_audit_logs_actor_id').on(table.actorId),
    index('idx_audit_logs_entity').on(table.entityType, table.entityId),
    index('idx_audit_logs_created_at').on(table.createdAt),
  ],
);

export const ledgerEntries = pgTable(
  'ledger_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    transactionReference: text('transaction_reference').notNull(),
    debitAccount: text('debit_account').notNull(),
    creditAccount: text('credit_account').notNull(),
    amount: integer('amount').notNull(),
    currency: text('currency').notNull().default('USD'),
    description: text('description').notNull(),
    postedAt: timestamp('posted_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_ledger_entries_reference').on(table.transactionReference),
    index('idx_ledger_entries_debit').on(table.debitAccount),
    index('idx_ledger_entries_credit').on(table.creditAccount),
    index('idx_ledger_entries_posted_at').on(table.postedAt),
    check('chk_ledger_entries_amount', sql`${table.amount} > 0`),
    check('chk_ledger_entries_accounts', sql`${table.debitAccount} <> ${table.creditAccount}`),
  ],
);

export const outboxEvents = pgTable(
  'outbox_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventName: text('event_name').notNull(),
    aggregateId: text('aggregate_id').notNull(),
    eventType: text('event_type').notNull(),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    status: text('status', { enum: outboxStatusEnum }).notNull().default('PENDING'),
    retryCount: integer('retry_count').notNull().default(0),
    lastError: text('last_error'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    processedAt: timestamp('processed_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_outbox_events_status_created').on(table.status, table.createdAt),
    index('idx_outbox_events_aggregate_id').on(table.aggregateId),
    check('chk_outbox_events_retry_count', sql`${table.retryCount} >= 0`),
  ],
);
