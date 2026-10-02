import { relations } from 'drizzle-orm';

// Export all domain schema slices
export * from './auth-profile';
export * from './catalog';
export * from './cart';
export * from './order';
export * from './payment';
export * from './production';
export * from './inventory';
export * from './fulfillment';
export * from './community';
export * from './content';
export * from './audit';

import { usersProfile, addresses } from './auth-profile';
import { products, productImages, productOptions, optionValues, productVariants } from './catalog';
import { carts, cartLines } from './cart';
import { orders, orderLines } from './order';
import { payments } from './payment';
import { productionJobs } from './production';
import {
  fabricBolts,
  boltAllocations,
  inventoryReservations,
  metalStocks,
  metalAllocations,
} from './inventory';
import { shipments, shipmentPackages } from './fulfillment';
import { reviews, questions, customOrderRequests } from './community';
import { memberships } from './content';

// ================= Relations Definitions =================

export const usersProfileRelations = relations(usersProfile, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
  memberships: many(memberships),
  reviews: many(reviews),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(usersProfile, {
    fields: [addresses.userId],
    references: [usersProfile.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  images: many(productImages),
  options: many(productOptions),
  variants: many(productVariants),
  reviews: many(reviews),
  questions: many(questions),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productOptionsRelations = relations(productOptions, ({ one, many }) => ({
  product: one(products, {
    fields: [productOptions.productId],
    references: [products.id],
  }),
  values: many(optionValues),
}));

export const optionValuesRelations = relations(optionValues, ({ one }) => ({
  option: one(productOptions, {
    fields: [optionValues.optionId],
    references: [productOptions.id],
  }),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  reservations: many(inventoryReservations),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  customer: one(usersProfile, {
    fields: [carts.customerId],
    references: [usersProfile.id],
  }),
  lines: many(cartLines),
}));

export const cartLinesRelations = relations(cartLines, ({ one }) => ({
  cart: one(carts, {
    fields: [cartLines.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartLines.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [cartLines.variantId],
    references: [productVariants.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(usersProfile, {
    fields: [orders.customerId],
    references: [usersProfile.id],
  }),
  lines: many(orderLines),
  payments: many(payments),
  productionJobs: many(productionJobs),
  shipments: many(shipments),
}));

export const orderLinesRelations = relations(orderLines, ({ one }) => ({
  order: one(orders, {
    fields: [orderLines.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderLines.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderLines.variantId],
    references: [productVariants.id],
  }),
  allocatedBolt: one(fabricBolts, {
    fields: [orderLines.allocatedBoltId],
    references: [fabricBolts.id],
  }),
  allocatedMetalStock: one(metalStocks, {
    fields: [orderLines.allocatedMetalStockId],
    references: [metalStocks.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export const productionJobsRelations = relations(productionJobs, ({ one }) => ({
  order: one(orders, {
    fields: [productionJobs.orderId],
    references: [orders.id],
  }),
  orderLine: one(orderLines, {
    fields: [productionJobs.orderLineId],
    references: [orderLines.id],
  }),
  assignedArtisan: one(usersProfile, {
    fields: [productionJobs.assignedArtisanId],
    references: [usersProfile.id],
  }),
}));

export const fabricBoltsRelations = relations(fabricBolts, ({ many }) => ({
  allocations: many(boltAllocations),
}));

export const boltAllocationsRelations = relations(boltAllocations, ({ one }) => ({
  bolt: one(fabricBolts, {
    fields: [boltAllocations.boltId],
    references: [fabricBolts.id],
  }),
}));

export const metalStocksRelations = relations(metalStocks, ({ many }) => ({
  allocations: many(metalAllocations),
}));

export const metalAllocationsRelations = relations(metalAllocations, ({ one }) => ({
  stock: one(metalStocks, {
    fields: [metalAllocations.metalStockId],
    references: [metalStocks.id],
  }),
}));

export const inventoryReservationsRelations = relations(inventoryReservations, ({ one }) => ({
  variant: one(productVariants, {
    fields: [inventoryReservations.variantId],
    references: [productVariants.id],
  }),
  cart: one(carts, {
    fields: [inventoryReservations.cartId],
    references: [carts.id],
  }),
}));

export const shipmentsRelations = relations(shipments, ({ one, many }) => ({
  order: one(orders, {
    fields: [shipments.orderId],
    references: [orders.id],
  }),
  packages: many(shipmentPackages),
}));

export const shipmentPackagesRelations = relations(shipmentPackages, ({ one }) => ({
  shipment: one(shipments, {
    fields: [shipmentPackages.shipmentId],
    references: [shipments.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  customer: one(usersProfile, {
    fields: [reviews.customerId],
    references: [usersProfile.id],
  }),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  product: one(products, {
    fields: [questions.productId],
    references: [products.id],
  }),
}));

export const customOrderRequestsRelations = relations(customOrderRequests, ({ one }) => ({
  convertedOrder: one(orders, {
    fields: [customOrderRequests.convertedOrderId],
    references: [orders.id],
  }),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  customer: one(usersProfile, {
    fields: [memberships.customerId],
    references: [usersProfile.id],
  }),
}));
