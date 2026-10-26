import { pgTable, text, timestamp, uuid, jsonb, index } from 'drizzle-orm/pg-core';

export const atelierSettings = pgTable(
  'atelier_settings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    key: text('key').notNull().unique(),
    value: jsonb('value').$type<unknown>().notNull(),
    description: text('description'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_atelier_settings_key').on(table.key)],
);
