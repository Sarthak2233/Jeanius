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

export const commerceModelEnum = ['OM', 'DROP', 'CUSTOM_ORDER', 'PRE_ORDER'] as const;
export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_categories_slug').on(table.slug),
    index('idx_categories_is_active').on(table.isActive),
    index('idx_categories_sort_order').on(table.sortOrder),
  ],
);

export const productStatusEnum = [
  'DRAFT',
  'PUBLISHED',
  'SCHEDULED',
  'SOLD_OUT',
  'ARCHIVED',
] as const;
export const variantStatusEnum = [
  'AVAILABLE',
  'LOW_STOCK',
  'SOLD_OUT',
  'DISABLED',
  'ARCHIVED',
] as const;

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    basePriceAmount: integer('base_price_amount').notNull(),
    basePriceCurrency: text('base_price_currency').notNull().default('USD'),
    commerceModel: text('commerce_model', { enum: commerceModelEnum }).notNull(),
    category: text('category').notNull(),
    status: text('status', { enum: productStatusEnum }).notNull().default('DRAFT'),
    leadTimeDaysMin: integer('lead_time_days_min').notNull().default(7),
    leadTimeDaysMax: integer('lead_time_days_max').notNull().default(14),
    inputSpecifications: jsonb('input_specifications').$type<Record<string, unknown>>(),
    priceRules: jsonb('price_rules').$type<Array<Record<string, unknown>>>(),
    publishAt: timestamp('publish_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_products_slug').on(table.slug),
    index('idx_products_status').on(table.status),
    index('idx_products_category').on(table.category),
    index('idx_products_commerce_model').on(table.commerceModel),
    check('chk_products_base_price', sql`${table.basePriceAmount} >= 0`),
  ],
);

export const productImages = pgTable(
  'product_images',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    altText: text('alt_text').notNull(),
    position: integer('position').notNull().default(0),
    isPrimary: boolean('is_primary').notNull().default(false),
    width: integer('width'),
    height: integer('height'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_product_images_product_id').on(table.productId),
    index('idx_product_images_position').on(table.position),
  ],
);

export const productVariants = pgTable(
  'product_variants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    sku: text('sku').notNull().unique(),
    options: jsonb('options').$type<Record<string, string>>().notNull(),
    additionalPriceAmount: integer('additional_price_amount').notNull().default(0),
    additionalPriceCurrency: text('additional_price_currency').notNull().default('USD'),
    inventoryCount: integer('inventory_count').notNull().default(0),
    status: text('status', { enum: variantStatusEnum }).notNull().default('AVAILABLE'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_product_variants_product_id').on(table.productId),
    index('idx_product_variants_sku').on(table.sku),
    index('idx_product_variants_status').on(table.status),
    check('chk_variants_inventory_count', sql`${table.inventoryCount} >= 0`),
    check('chk_variants_additional_price', sql`${table.additionalPriceAmount} >= 0`),
  ],
);

// ================= Formalized Order-Made & DROP Models (JN-053) =================

export const orderMadeProducts = pgTable(
  'order_made_products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    basePriceAmount: integer('base_price_amount').notNull(),
    basePriceCurrency: text('base_price_currency').notNull().default('USD'),
    category: text('category').notNull(),
    leadTimeDaysMin: integer('lead_time_days_min').notNull().default(7),
    leadTimeDaysMax: integer('lead_time_days_max').notNull().default(14),
    inputSpecifications: jsonb('input_specifications').$type<Record<string, unknown>>().notNull(),
    priceRules: jsonb('price_rules').$type<Array<Record<string, unknown>>>(),
    status: text('status', { enum: productStatusEnum }).notNull().default('PUBLISHED'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_order_made_products_slug').on(table.slug),
    index('idx_order_made_products_product_id').on(table.productId),
    index('idx_order_made_products_category').on(table.category),
    check('chk_order_made_products_base_price', sql`${table.basePriceAmount} >= 0`),
  ],
);

export const dropProducts = pgTable(
  'drop_products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    basePriceAmount: integer('base_price_amount').notNull(),
    basePriceCurrency: text('base_price_currency').notNull().default('USD'),
    category: text('category').notNull(),
    dropBatchNumber: integer('drop_batch_number'),
    totalBatchQuantity: integer('total_batch_quantity').notNull().default(0),
    status: text('status', { enum: productStatusEnum }).notNull().default('PUBLISHED'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_drop_products_slug').on(table.slug),
    index('idx_drop_products_product_id').on(table.productId),
    index('idx_drop_products_category').on(table.category),
    check('chk_drop_products_base_price', sql`${table.basePriceAmount} >= 0`),
  ],
);

export const dropVariants = pgTable(
  'drop_variants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    dropProductId: uuid('drop_product_id')
      .notNull()
      .references(() => dropProducts.id, { onDelete: 'cascade' }),
    sku: text('sku').notNull().unique(),
    attributes: jsonb('attributes').$type<Record<string, string>>().notNull(),
    additionalPriceAmount: integer('additional_price_amount').notNull().default(0),
    additionalPriceCurrency: text('additional_price_currency').notNull().default('USD'),
    inventoryCount: integer('inventory_count').notNull().default(0),
    status: text('status', { enum: variantStatusEnum }).notNull().default('AVAILABLE'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_drop_variants_drop_product_id').on(table.dropProductId),
    index('idx_drop_variants_sku').on(table.sku),
    index('idx_drop_variants_status').on(table.status),
    check('chk_drop_variants_inventory_count', sql`${table.inventoryCount} >= 0`),
  ],
);
