/**
 * @jeanius/domain
 * Pure framework-independent business domain entities, value objects, lifecycle state machines,
 * and outbox domain events.
 */

// ================= Actors & Roles (JN-003) =================
export type ActorRole =
  'GUEST' | 'CUSTOMER' | 'MEMBER' | 'TAILOR' | 'JEWELLER' | 'FULFILLMENT' | 'SUPPORT' | 'ADMIN';

export interface Actor {
  readonly id: string;
  readonly email?: string;
  readonly role: ActorRole;
}

// ================= Common & Identifiers (JN-063, JN-064, JN-065) =================
export * from './common/entity-id.js';
export * from './common/money.vo.js';
export * from './common/address.vo.js';

// ================= Catalog & Products (JN-066, JN-067, JN-068, JN-069, JN-070) =================
export * from './catalog/product-type.js';
export * from './catalog/option-value.entity.js';
export * from './catalog/product-option.entity.js';
export * from './catalog/variant.entity.js';
export * from './catalog/product.entity.js';

// Legacy compatibility aliases if needed
export type { ProductVariant as ProductVariantInterface } from './catalog/variant.entity.js';

// ================= Cart (JN-071, JN-072) =================
export * from './cart/cart-line.entity.js';
export * from './cart/cart.entity.js';

// ================= Orders (JN-073, JN-074) =================
export * from './order/order-line.entity.js';
export * from './order/order.entity.js';

/**
 * Functional helper for order cancellation validation (backwards compatibility).
 */
export function canCancelOrder(
  order: { status: string; canCancel?: (jobs?: unknown) => boolean },
  jobs?: readonly unknown[],
): boolean {
  if (typeof order.canCancel === 'function') {
    return order.canCancel(jobs);
  }
  return order.status !== 'CANCELLED' && order.status !== 'SHIPPED' && order.status !== 'DELIVERED';
}

// ================= Payments (JN-075) =================
export * from './payment/payment.entity.js';

/**
 * Validates payment lifecycle state transitions (JN-009).
 */
export function canTransitionPaymentStatus(current: string, next: string): boolean {
  if (current === next) return false;

  switch (current) {
    case 'INITIATED':
      return next === 'PENDING' || next === 'FAILED' || next === 'EXPIRED';
    case 'PENDING':
      return next === 'PAID' || next === 'FAILED' || next === 'EXPIRED';
    case 'PAID':
      return next === 'REFUNDED' || next === 'PARTIALLY_REFUNDED';
    case 'PARTIALLY_REFUNDED':
      return next === 'REFUNDED';
    case 'FAILED':
    case 'EXPIRED':
    case 'REFUNDED':
      return false; // Terminal states
    default:
      return false;
  }
}

// ================= Production & Workshop (JN-076) =================
export * from './production/production-stage.js';
export * from './production/production-job.entity.js';

// ================= Inventory & Selvedge Yardage (JN-085, JN-086) =================
export * from './inventory/fabric-bolt.aggregate.js';
export * from './inventory/metal-stock.aggregate.js';
export * from './inventory/inventory-reservation.entity.js';

// ================= Fulfillment & Logistics (JN-077, JN-088, JN-089) =================
export * from './fulfillment/export-declaration.vo.js';
export * from './fulfillment/shipment-package.entity.js';
export * from './fulfillment/shipment.aggregate.js';

export type DropFulfillmentStatus =
  | 'INVENTORY_STAGED'
  | 'RESERVED'
  | 'PACKING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'RETURN_REQUESTED'
  | 'RETURNED';

/**
 * Checks whether a delivered DROP garment is within its 5-day inspection return window (JN-006).
 */
export function isDropEligibleForReturn(deliveryDate: Date, returnWindowDays = 5): boolean {
  const now = new Date();
  const windowMs = returnWindowDays * 24 * 60 * 60 * 1000;
  return now.getTime() - deliveryDate.getTime() <= windowMs;
}

// ================= Returns & Refunds (JN-012) =================
export type ReturnStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'IN_TRANSIT'
  | 'QC_INSPECTION'
  | 'RESTOCKED'
  | 'SCRAPPED'
  | 'REFUND_PROCESSING'
  | 'COMPLETED';

export interface ReturnRequest {
  readonly id: string;
  readonly orderId: string;
  readonly orderLineId: string;
  readonly customerId: string;
  readonly reason: string;
  readonly status: ReturnStatus;
  readonly requestedAt: string;
  readonly resolution?: 'REFUND' | 'STORE_CREDIT' | 'REJECTED';
  readonly qcNotes?: string;
}

export function canTransitionReturnStatus(current: ReturnStatus, next: ReturnStatus): boolean {
  switch (current) {
    case 'REQUESTED':
      return next === 'APPROVED' || next === 'REJECTED';
    case 'APPROVED':
      return next === 'IN_TRANSIT' || next === 'REJECTED';
    case 'IN_TRANSIT':
      return next === 'QC_INSPECTION';
    case 'QC_INSPECTION':
      return next === 'RESTOCKED' || next === 'SCRAPPED';
    case 'RESTOCKED':
    case 'SCRAPPED':
      return next === 'REFUND_PROCESSING';
    case 'REFUND_PROCESSING':
      return next === 'COMPLETED';
    case 'REJECTED':
    case 'COMPLETED':
      return false; // Terminal states
    default:
      return false;
  }
}

// ================= Access Control & Support (JN-013, JN-014) =================
export type AccessLevel = 'PUBLIC' | 'AUTHENTICATED' | 'MEMBER' | 'ADMIN';

export function canActorAccessLevel(actorRole: ActorRole, requiredLevel: AccessLevel): boolean {
  if (requiredLevel === 'PUBLIC') return true;
  if (requiredLevel === 'AUTHENTICATED') return actorRole !== 'GUEST';
  if (requiredLevel === 'MEMBER') return actorRole === 'MEMBER' || actorRole === 'ADMIN';
  if (requiredLevel === 'ADMIN') return actorRole === 'ADMIN';
  return false;
}

export type SupportChannel = 'INSTAGRAM_DM' | 'EMAIL' | 'CUSTOM_ORDER_FORM';

// ================= Financial Ledger (JN-087) =================
export * from './finance/ledger-entry.entity.js';

// ================= Community (JN-078, JN-079, JN-080) =================
export * from './community/review.entity.js';
export * from './community/question.entity.js';
export * from './community/custom-order-request.entity.js';

// ================= Content & Memberships (JN-081, JN-082, JN-083) =================
export * from './content/announcement.entity.js';
export * from './content/content-page.entity.js';
export * from './content/membership.entity.js';

// ================= Domain Events (JN-084) =================
export * from './events/domain-event.js';

// ================= Standardized Errors (JN-053) =================
export * from './errors/index.js';
