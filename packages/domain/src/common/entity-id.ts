/**
 * Strongly typed branded nominal entity IDs (JN-063).
 * Prevents accidental assignment of an OrderId to a CustomerId slot at compile time.
 */
import { DomainError } from '../errors/index.js';

declare const __brand: unique symbol;

export type EntityId<TBrand extends string> = string & { readonly [__brand]: TBrand };

// Domain Entity ID Types
export type ProductId = EntityId<'Product'>;
export type VariantId = EntityId<'Variant'>;
export type ProductOptionId = EntityId<'ProductOption'>;
export type OptionValueId = EntityId<'OptionValue'>;
export type CartId = EntityId<'Cart'>;
export type CartLineId = EntityId<'CartLine'>;
export type OrderId = EntityId<'Order'>;
export type OrderLineId = EntityId<'OrderLine'>;
export type PaymentId = EntityId<'Payment'>;
export type ProductionJobId = EntityId<'ProductionJob'>;
export type ShipmentId = EntityId<'Shipment'>;
export type ShipmentPackageId = EntityId<'ShipmentPackage'>;
export type BoltId = EntityId<'FabricBolt'>;
export type ReservationId = EntityId<'InventoryReservation'>;
export type LedgerEntryId = EntityId<'LedgerEntry'>;
export type ReviewId = EntityId<'Review'>;
export type QuestionId = EntityId<'Question'>;
export type CustomOrderId = EntityId<'CustomOrder'>;
export type AnnouncementId = EntityId<'Announcement'>;
export type ContentPageId = EntityId<'ContentPage'>;
export type MembershipId = EntityId<'Membership'>;
export type CustomerId = EntityId<'Customer'>;
export type ActorId = EntityId<'Actor'>;

/**
 * Creates and validates a strongly typed entity ID.
 */
export function createEntityId<TBrand extends string>(raw: string): EntityId<TBrand> {
  if (!raw || raw.trim().length === 0) {
    throw new DomainError('Entity ID cannot be empty or whitespace');
  }
  return raw.trim() as EntityId<TBrand>;
}
