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
import { products, productCategoryEnum } from './catalog';
import { usersProfile } from './auth-profile';
import { orders } from './order';

export const reviewStatusEnum = ['PENDING', 'APPROVED', 'REJECTED'] as const;
export const customOrderInquiryStatusEnum = [
  'INQUIRY_RECEIVED',
  'QUOTED',
  'APPROVED',
  'REJECTED',
  'CONVERTED_TO_ORDER',
] as const;

export const reviews = pgTable(
  'reviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => usersProfile.id, { onDelete: 'cascade' }),
    authorName: text('author_name').notNull(),
    rating: integer('rating').notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    isVerifiedPurchase: boolean('is_verified_purchase').notNull().default(false),
    artisanResponse: text('artisan_response'),
    status: text('status', { enum: reviewStatusEnum }).notNull().default('PENDING'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_reviews_product_id').on(table.productId),
    index('idx_reviews_customer_id').on(table.customerId),
    index('idx_reviews_status').on(table.status),
    check('chk_reviews_rating_bounds', sql`${table.rating} >= 1 AND ${table.rating} <= 5`),
  ],
);

export const questions = pgTable(
  'questions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    authorName: text('author_name').notNull(),
    questionText: text('question_text').notNull(),
    answers: jsonb('answers').$type<Record<string, unknown>[]>().notNull().default([]),
    isPublished: boolean('is_published').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_questions_product_id').on(table.productId),
    index('idx_questions_is_published').on(table.isPublished),
  ],
);

export const customOrderRequests = pgTable(
  'custom_order_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    customerName: text('customer_name').notNull(),
    customerEmail: text('customer_email').notNull(),
    category: text('category', { enum: productCategoryEnum }).notNull(),
    description: text('description').notNull(),
    desiredFabricWeight: text('desired_fabric_weight'),
    referenceImageUrls: jsonb('reference_image_urls').$type<string[]>().notNull().default([]),
    status: text('status', { enum: customOrderInquiryStatusEnum })
      .notNull()
      .default('INQUIRY_RECEIVED'),
    quotedPriceAmount: integer('quoted_price_amount'),
    quotedPriceCurrency: text('quoted_price_currency').default('USD'),
    quotedLeadDays: integer('quoted_lead_days'),
    convertedOrderId: uuid('converted_order_id').references(() => orders.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_custom_orders_email').on(table.customerEmail),
    index('idx_custom_orders_status').on(table.status),
    index('idx_custom_orders_converted_order').on(table.convertedOrderId),
    check(
      'chk_custom_orders_quoted_price',
      sql`${table.quotedPriceAmount} IS NULL OR ${table.quotedPriceAmount} >= 0`,
    ),
    check(
      'chk_custom_orders_lead_days',
      sql`${table.quotedLeadDays} IS NULL OR ${table.quotedLeadDays} > 0`,
    ),
  ],
);
