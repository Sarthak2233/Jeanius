/**
 * Strongly typed domain events (JN-084).
 * Staged into the transactional outbox during state changes and consumed asynchronously.
 */
import type {
  OrderId,
  PaymentId,
  ProductionJobId,
  BoltId,
  ReservationId,
  ShipmentId,
  ShipmentPackageId,
  LedgerEntryId,
  ProductId,
  VariantId,
} from '../common/entity-id.js';
import type { Money } from '../common/money.vo.js';
import type { ProductionStage } from '../production/production-stage.js';

export interface DomainEvent<TPayload = unknown> {
  readonly eventId: string;
  readonly eventType: string;
  readonly occurredAt: string; // ISO 8601 string
  readonly payload: TPayload;
}

export function createDomainEvent<TPayload>(
  eventType: string,
  payload: TPayload,
): DomainEvent<TPayload> {
  return {
    eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    eventType,
    occurredAt: new Date().toISOString(),
    payload,
  };
}

// ================= Commerce & Order Events =================

export type OrderCreatedEvent = DomainEvent<{
  readonly orderId: OrderId;
  readonly orderNumber: string;
  readonly total: Money;
  readonly customerEmail: string;
}>;

export type OrderPaidEvent = DomainEvent<{
  readonly orderId: OrderId;
  readonly paymentId: PaymentId;
  readonly transactionId: string;
}>;

export type OrderCancelledEvent = DomainEvent<{
  readonly orderId: OrderId;
  readonly reason: string;
}>;

// ================= Manufacturing Workshop Events =================

export type ProductionJobStartedEvent = DomainEvent<{
  readonly jobId: ProductionJobId;
  readonly orderId: OrderId;
  readonly currentStage: ProductionStage;
}>;

export type ProductionStageAdvancedEvent = DomainEvent<{
  readonly jobId: ProductionJobId;
  readonly previousStage: ProductionStage;
  readonly nextStage: ProductionStage;
  readonly artisanId?: string;
}>;

// ================= Inventory & Selvedge Yardage Events =================

export type FabricBoltYardageAllocatedEvent = DomainEvent<{
  readonly boltId: BoltId;
  readonly allocationId: string;
  readonly yardsAllocated: number;
  readonly remainingYards: number;
}>;

export type FabricBoltExhaustedEvent = DomainEvent<{
  readonly boltId: BoltId;
  readonly remainingYards: number;
}>;

export type InventoryReservedEvent = DomainEvent<{
  readonly reservationId: ReservationId;
  readonly variantId: VariantId;
  readonly quantity: number;
  readonly expiresAt: string;
}>;

export type InventoryReservationCommittedEvent = DomainEvent<{
  readonly reservationId: ReservationId;
  readonly variantId: VariantId;
}>;

export type InventoryReservationExpiredEvent = DomainEvent<{
  readonly reservationId: ReservationId;
  readonly variantId: VariantId;
}>;

// ================= Payment Events =================

export type PaymentSettledEvent = DomainEvent<{
  readonly paymentId: PaymentId;
  readonly orderId: OrderId;
  readonly amount: Money;
  readonly transactionId: string;
}>;

export type PaymentRefundedEvent = DomainEvent<{
  readonly paymentId: PaymentId;
  readonly amount: Money;
  readonly reason: string;
}>;

export type PaymentFailedEvent = DomainEvent<{
  readonly paymentId: PaymentId;
  readonly reason: string;
}>;

// ================= Fulfillment & Logistics Events =================

export type ShipmentDispatchedEvent = DomainEvent<{
  readonly shipmentId: ShipmentId;
  readonly packageId: ShipmentPackageId;
  readonly trackingNumber: string;
  readonly carrier: string;
}>;

export type ShipmentDeliveredEvent = DomainEvent<{
  readonly shipmentId: ShipmentId;
  readonly packageId: ShipmentPackageId;
  readonly deliveredAt: string;
}>;

// ================= Financial Audit Events =================

export type LedgerEntryPostedEvent = DomainEvent<{
  readonly ledgerEntryId: LedgerEntryId;
  readonly debitAccount: string;
  readonly creditAccount: string;
  readonly amount: Money;
}>;

// ================= Catalog Events =================

export type ProductPublishedEvent = DomainEvent<{
  readonly productId: ProductId;
  readonly slug: string;
}>;

export type VariantSoldOutEvent = DomainEvent<{
  readonly variantId: VariantId;
  readonly sku: string;
}>;
