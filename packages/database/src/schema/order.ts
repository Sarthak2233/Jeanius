import { pgTable, text, timestamp, integer, jsonb, uuid, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { usersProfile } from './auth-profile';
import { products, productVariants, commerceModelEnum } from './catalog';
import { fabricBolts } from './inventory';

export const orderStatusEnum = [
  'PENDING',
  'PAID',
  'IN_PRODUCTION',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
] as const;

export const paymentStatusEnum = [
  'INITIATED',
  'PENDING',
  'PAID',
  'FAILED',
  'EXPIRED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
] as const;

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderNumber: text('order_number').notNull().unique(),
    customerId: uuid('customer_id').references(() => usersProfile.id, { onDelete: 'set null' }),
    customerEmail: text('customer_email').notNull(),
    status: text('status', { enum: orderStatusEnum }).notNull().default('PENDING'),
    paymentStatus: text('payment_status', { enum: paymentStatusEnum })
      .notNull()
      .default('INITIATED'),
    shippingAddress: jsonb('shipping_address').$type<Record<string, unknown>>().notNull(),
    billingAddress: jsonb('billing_address').$type<Record<string, unknown>>(),
    subtotalAmount: integer('subtotal_amount').notNull(),
    shippingCostAmount: integer('shipping_cost_amount').notNull(),
    totalAmount: integer('total_amount').notNull(),
    currency: text('currency').notNull().default('USD'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_orders_order_number').on(table.orderNumber),
    index('idx_orders_customer_id').on(table.customerId),
    index('idx_orders_status').on(table.status),
    index('idx_orders_payment_status').on(table.paymentStatus),
    check('chk_orders_subtotal', sql`${table.subtotalAmount} >= 0`),
    check('chk_orders_shipping_cost', sql`${table.shippingCostAmount} >= 0`),
    check('chk_orders_total', sql`${table.totalAmount} >= 0`),
  ],
);

export const orderLines = pgTable(
  'order_lines',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'restrict' }),
    variantId: uuid('variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'restrict' }),
    productTitle: text('product_title').notNull(),
    sku: text('sku').notNull(),
    commerceModel: text('commerce_model', { enum: commerceModelEnum }).notNull(),
    unitPriceAmount: integer('unit_price_amount').notNull(),
    unitPriceCurrency: text('unit_price_currency').notNull().default('USD'),
    quantity: integer('quantity').notNull().default(1),
    lineTotalAmount: integer('line_total_amount').notNull(),
    lineTotalCurrency: text('line_total_currency').notNull().default('USD'),
    selectedOptions: jsonb('selected_options').$type<Record<string, string>>().notNull(),
    customTailoring: jsonb('custom_tailoring').$type<Record<string, number | string>>(),
    allocatedBoltId: uuid('allocated_bolt_id').references(() => fabricBolts.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_order_lines_order_id').on(table.orderId),
    index('idx_order_lines_product_id').on(table.productId),
    index('idx_order_lines_variant_id').on(table.variantId),
    index('idx_order_lines_bolt_id').on(table.allocatedBoltId),
    check('chk_order_lines_quantity', sql`${table.quantity} > 0`),
    check('chk_order_lines_unit_price', sql`${table.unitPriceAmount} >= 0`),
    check('chk_order_lines_line_total', sql`${table.lineTotalAmount} >= 0`),
  ],
);
