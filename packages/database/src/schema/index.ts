import { pgTable, text, timestamp, integer, boolean, jsonb, uuid } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  basePriceAmount: integer('base_price_amount').notNull(),
  basePriceCurrency: text('base_price_currency').notNull().default('USD'),
  commerceModel: text('commerce_model', { enum: ['OM', 'DROP'] }).notNull(),
  category: text('category', { enum: ['BOTTOMS', 'TOPS', 'ACCESSORIES'] }).notNull(),
  isPublished: boolean('is_published').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const productVariants = pgTable('product_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  sku: text('sku').notNull().unique(),
  options: jsonb('options').$type<Record<string, string>>().notNull(),
  additionalPriceAmount: integer('additional_price_amount').notNull().default(0),
  inventoryCount: integer('inventory_count').notNull().default(0),
  isAvailable: boolean('is_available').notNull().default(true),
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: text('order_number').notNull().unique(),
  customerId: text('customer_id'),
  customerEmail: text('customer_email').notNull(),
  status: text('status').notNull().default('PENDING'),
  paymentStatus: text('payment_status').notNull().default('INITIATED'),
  shippingAddress: jsonb('shipping_address').notNull(),
  subtotalAmount: integer('subtotal_amount').notNull(),
  shippingCostAmount: integer('shipping_cost_amount').notNull(),
  totalAmount: integer('total_amount').notNull(),
  currency: text('currency').notNull().default('USD'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const productionJobs = pgTable('production_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  orderLineId: text('order_line_id').notNull(),
  currentStage: text('current_stage', {
    enum: ['QUEUED', 'CUTTING', 'SEWING', 'WASHING', 'HARDWARE', 'QC', 'READY', 'SHIPPED'],
  })
    .notNull()
    .default('QUEUED'),
  targetCompletionDate: timestamp('target_completion_date').notNull(),
  notes: jsonb('notes').$type<string[]>(),
  delayReason: text('delay_reason'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
