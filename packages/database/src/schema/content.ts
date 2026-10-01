import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  uuid,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { usersProfile } from './auth-profile';

export const announcementTypeEnum = ['INFO', 'WARNING', 'ALERT', 'PROMO'] as const;
export const membershipTierEnum = ['STANDARD', 'SELVEDGE_SOCIETY', 'FOUNDER'] as const;

export const announcements = pgTable(
  'announcements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    type: text('type', { enum: announcementTypeEnum }).notNull().default('INFO'),
    startDate: timestamp('start_date', { withTimezone: true }).notNull(),
    endDate: timestamp('end_date', { withTimezone: true }),
    priority: integer('priority').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_announcements_priority').on(table.priority),
    index('idx_announcements_dates').on(table.startDate, table.endDate),
    check(
      'chk_announcements_dates',
      sql`${table.endDate} IS NULL OR ${table.endDate} > ${table.startDate}`,
    ),
  ],
);

export const contentPages = pgTable(
  'content_pages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    contentMarkdown: text('content_markdown').notNull(),
    metaDescription: text('meta_description'),
    isPublished: boolean('is_published').notNull().default(false),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_content_pages_slug').on(table.slug),
    index('idx_content_pages_is_published').on(table.isPublished),
  ],
);

export const memberships = pgTable(
  'memberships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => usersProfile.id, { onDelete: 'cascade' }),
    tier: text('tier', { enum: membershipTierEnum }).notNull(),
    startDate: timestamp('start_date', { withTimezone: true }).notNull(),
    endDate: timestamp('end_date', { withTimezone: true }),
    benefits: jsonb('benefits').$type<string[]>().notNull().default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_memberships_customer_id').on(table.customerId),
    index('idx_memberships_tier').on(table.tier),
    check(
      'chk_memberships_dates',
      sql`${table.endDate} IS NULL OR ${table.endDate} > ${table.startDate}`,
    ),
  ],
);
