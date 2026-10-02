import { pgTable, text, timestamp, integer, jsonb, uuid, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { usersProfile } from './auth-profile';
import { products, productVariants, commerceModelEnum } from './catalog';

export const carts = pgTable(
  'carts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    customerId: uuid('customer_id').references(() => usersProfile.id, { onDelete: 'set null' }),
    currency: text('currency').notNull().default('USD'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_carts_customer_id').on(table.customerId)],
);

export const cartLines = pgTable(
  'cart_lines',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cartId: uuid('cart_id')
      .notNull()
      .references(() => carts.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    variantId: uuid('variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'cascade' }),
    productTitle: text('product_title').notNull(),
    commerceModel: text('commerce_model', { enum: commerceModelEnum }).notNull(),
    unitPriceAmount: integer('unit_price_amount').notNull(),
    unitPriceCurrency: text('unit_price_currency').notNull().default('USD'),
    quantity: integer('quantity').notNull().default(1),
    selectedOptions: jsonb('selected_options').$type<Record<string, string>>().notNull(),
    customTailoringMeasurements: jsonb('custom_tailoring_measurements').$type<
      Record<string, number | string>
    >(),
    customSpecifications: jsonb('custom_specifications').$type<Record<string, number | string>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_cart_lines_cart_id').on(table.cartId),
    index('idx_cart_lines_variant_id').on(table.variantId),
    check('chk_cart_lines_quantity', sql`${table.quantity} > 0`),
    check('chk_cart_lines_unit_price', sql`${table.unitPriceAmount} >= 0`),
  ],
);
