import {
  pgTable,
  text,
  timestamp,
  integer,
  numeric,
  uuid,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { productVariants } from './catalog';
import { carts } from './cart';

export const reservationStatusEnum = ['HELD', 'COMMITTED', 'RELEASED', 'EXPIRED'] as const;
export const metalAlloyEnum = ['STERLING_SILVER_925', 'SOLID_BRASS', 'YELLOW_GOLD_18K'] as const;
export const metalStockStatusEnum = ['ACTIVE', 'DEPLETED', 'RECLAIMED'] as const;

export const metalStocks = pgTable('metal_stocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  metalAlloy: text('metal_alloy', { enum: metalAlloyEnum }).notNull(),
  purity: numeric('purity', { precision: 4, scale: 3 }).notNull(),
  lotNumber: text('lot_number').notNull().unique(),
  initialWeightGrams: numeric('initial_weight_grams', { precision: 8, scale: 2 }).notNull(),
  remainingWeightGrams: numeric('remaining_weight_grams', { precision: 8, scale: 2 }).notNull(),
  supplier: text('supplier').notNull(),
  status: text('status', { enum: metalStockStatusEnum }).notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const metalAllocations = pgTable('metal_allocations', {
  id: uuid('id').primaryKey().defaultRandom(),
  metalStockId: uuid('metal_stock_id')
    .notNull()
    .references(() => metalStocks.id, { onDelete: 'restrict' }),
  orderLineId: uuid('order_line_id').notNull(),
  gramsAllocated: numeric('grams_allocated', { precision: 6, scale: 2 }).notNull(),
  allocatedAt: timestamp('allocated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const inventoryReservations = pgTable(
  'inventory_reservations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    variantId: uuid('variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'cascade' }),
    cartId: uuid('cart_id').references(() => carts.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(1),
    status: text('status', { enum: reservationStatusEnum }).notNull().default('HELD'),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_inventory_reservations_variant_status').on(table.variantId, table.status),
    index('idx_inventory_reservations_expires_at').on(table.expiresAt),
    check('chk_inventory_reservations_qty', sql`${table.quantity} > 0`),
  ],
);
