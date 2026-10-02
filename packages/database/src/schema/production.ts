import { pgTable, text, timestamp, integer, jsonb, uuid, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { orders, orderLines } from './order';
import { usersProfile } from './auth-profile';

export const productionStageEnum = [
  'QUEUED',
  'CUTTING',
  'SEWING',
  'WASHING',
  'HARDWARE',
  'CASTING',
  'SETTING',
  'PATINA',
  'POLISHING',
  'QC',
  'READY',
  'SHIPPED',
] as const;

export const productionJobs = pgTable(
  'production_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    orderLineId: uuid('order_line_id')
      .notNull()
      .references(() => orderLines.id, { onDelete: 'cascade' }),
    currentStage: text('current_stage', { enum: productionStageEnum }).notNull().default('QUEUED'),
    targetCompletionDate: timestamp('target_completion_date', { withTimezone: true }).notNull(),
    cutTicket: jsonb('cut_ticket').$type<Record<string, unknown>>(),
    craftTicket: jsonb('craft_ticket').$type<Record<string, unknown>>(),
    assignedArtisanId: uuid('assigned_artisan_id').references(() => usersProfile.id, {
      onDelete: 'set null',
    }),
    reworkCount: integer('rework_count').notNull().default(0),
    delayDays: integer('delay_days').notNull().default(0),
    delayReason: text('delay_reason'),
    notes: jsonb('notes').$type<string[]>().notNull().default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_production_jobs_order_id').on(table.orderId),
    index('idx_production_jobs_order_line_id').on(table.orderLineId),
    index('idx_production_jobs_stage').on(table.currentStage),
    index('idx_production_jobs_artisan').on(table.assignedArtisanId),
    index('idx_production_jobs_target_date').on(table.targetCompletionDate),
    check('chk_production_jobs_rework', sql`${table.reworkCount} >= 0`),
    check('chk_production_jobs_delay', sql`${table.delayDays} >= 0`),
  ],
);
