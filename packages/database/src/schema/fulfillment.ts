import { pgTable, text, timestamp, integer, jsonb, uuid, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { orders } from './order';

export const shipmentStatusEnum = [
  'PENDING',
  'PACKED',
  'SHIPPED',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'ATTEMPTED_DELIVERY',
  'RETURNED_TO_SENDER',
  'RETURNED',
  'LOST',
] as const;

export const packageStatusEnum = ['PACKED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED'] as const;

export const shipments = pgTable(
  'shipments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    shippingAddress: jsonb('shipping_address').$type<Record<string, unknown>>().notNull(),
    status: text('status', { enum: shipmentStatusEnum }).notNull().default('PENDING'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_shipments_order_id').on(table.orderId),
    index('idx_shipments_status').on(table.status),
  ],
);

export const shipmentPackages = pgTable(
  'shipment_packages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    shipmentId: uuid('shipment_id')
      .notNull()
      .references(() => shipments.id, { onDelete: 'cascade' }),
    packageNumber: integer('package_number').notNull().default(1),
    carrier: text('carrier').notNull(),
    trackingNumber: text('tracking_number'),
    orderLineIds: jsonb('order_line_ids').$type<string[]>().notNull(),
    exportDeclaration: jsonb('export_declaration').$type<Record<string, unknown>>(),
    status: text('status', { enum: packageStatusEnum }).notNull().default('PACKED'),
    packedAt: timestamp('packed_at', { withTimezone: true }).notNull().defaultNow(),
    dispatchedAt: timestamp('dispatched_at', { withTimezone: true }),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_shipment_packages_shipment_id').on(table.shipmentId),
    index('idx_shipment_packages_tracking_number').on(table.trackingNumber),
    index('idx_shipment_packages_status').on(table.status),
    check('chk_shipment_packages_number', sql`${table.packageNumber} >= 1`),
  ],
);
