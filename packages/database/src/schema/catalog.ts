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
export const productCategoryEnum = ['BOTTOMS', 'TOPS', 'JEWELLERY', 'ACCESSORIES'] as const;
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
    category: text('category', { enum: productCategoryEnum }).notNull(),
    status: text('status', { enum: productStatusEnum }).notNull().default('DRAFT'),
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

export const productOptions = pgTable(
  'product_options',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    code: text('code').notNull(),
    position: integer('position').notNull().default(0),
    isRequired: boolean('is_required').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_product_options_product_id').on(table.productId),
    index('idx_product_options_code').on(table.code),
  ],
);

export const optionValues = pgTable(
  'option_values',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    optionId: uuid('option_id')
      .notNull()
      .references(() => productOptions.id, { onDelete: 'cascade' }),
    code: text('code').notNull(),
    label: text('label').notNull(),
    priceDeltaAmount: integer('price_delta_amount').notNull().default(0),
    priceDeltaCurrency: text('price_delta_currency').notNull().default('USD'),
    isAvailable: boolean('is_available').notNull().default(true),
    position: integer('position').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_option_values_option_id').on(table.optionId),
    index('idx_option_values_code').on(table.code),
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
