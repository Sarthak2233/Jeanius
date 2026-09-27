/**
 * @jeanius/domain
 * Framework-independent business domain entities, value objects, and lifecycle state machines.
 */

// ================= Actors & Roles (JN-003) =================

export type ActorRole =
  | 'GUEST'
  | 'CUSTOMER'
  | 'MEMBER'
  | 'TAILOR'
  | 'FULFILLMENT'
  | 'SUPPORT'
  | 'ADMIN';

export interface Actor {
  readonly id: string;
  readonly email?: string;
  readonly role: ActorRole;
}

// ================= Commerce Models (JN-002) =================

export type CommerceModel = 'OM' | 'DROP' | 'CUSTOM_ORDER';

export interface Money {
  readonly amount: number; // Stored in minor units (e.g. cents, paisa)
  readonly currency: 'USD' | 'NPR' | string;
}

export interface Address {
  readonly fullName: string;
  readonly addressLine1: string;
  readonly addressLine2?: string;
  readonly city: string;
  readonly stateOrProvince?: string;
  readonly postalCode: string;
  readonly country: string;
  readonly phone: string;
}

// ================= OM Manufacturing Pipeline (JN-005) =================

export type ProductionStage =
  | 'QUEUED'
  | 'CUTTING'
  | 'SEWING'
  | 'WASHING'
  | 'HARDWARE'
  | 'QC'
  | 'READY'
  | 'SHIPPED';

export const ORDERED_PRODUCTION_STAGES: readonly ProductionStage[] = [
  'QUEUED',
  'CUTTING',
  'SEWING',
  'WASHING',
  'HARDWARE',
  'QC',
  'READY',
  'SHIPPED',
] as const;

export interface ProductionPolicy {
  readonly productType: CommerceModel;
  readonly minimumDays: number;
  readonly maximumDays: number;
  readonly excludedDates?: readonly string[];
  readonly excludedHolidays?: readonly string[];
  readonly effectiveFrom: string;
  readonly effectiveUntil?: string;
}

export interface ProductionJob {
  readonly id: string;
  readonly orderId: string;
  readonly orderLineId: string;
  readonly currentStage: ProductionStage;
  readonly targetCompletionDate: string;
  readonly notes?: readonly string[];
  readonly delayReason?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Validates whether a production job can transition from current to next stage.
 * Forward advancement along the pipeline is allowed.
 * QC -> SEWING is permitted specifically for rework.
 */
export function canAdvanceProductionStage(
  current: ProductionStage,
  next: ProductionStage
): boolean {
  if (current === next) return false;
  if (current === 'QC' && next === 'SEWING') return true; // Rework loop

  const currentIndex = ORDERED_PRODUCTION_STAGES.indexOf(current);
  const nextIndex = ORDERED_PRODUCTION_STAGES.indexOf(next);

  return nextIndex === currentIndex + 1;
}

/**
 * Calculates estimated completion date dynamically based on order date and ProductionPolicy.
 */
export function calculateEstimatedCompletion(
  orderDate: Date,
  policy: ProductionPolicy
): Date {
  const result = new Date(orderDate.getTime());
  let addedDays = 0;
  const targetDays = policy.maximumDays;

  while (addedDays < targetDays) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    // Exclude Saturday (standard rest day in Nepal) and Sunday if specified
    const isWeekend = dayOfWeek === 6; // Nepal rest day is Saturday
    const dateStr = result.toISOString().split('T')[0] ?? '';
    const isHoliday = policy.excludedHolidays?.includes(dateStr) ?? false;

    if (!isWeekend && !isHoliday) {
      addedDays++;
    }
  }

  return result;
}

// ================= Catalog & Products =================

export interface ProductVariant {
  readonly id: string;
  readonly productId: string;
  readonly sku: string;
  readonly options: Readonly<Record<string, string>>; // e.g. { fit: 'Slim', waist: '32', inseam: '34' }
  readonly additionalPrice: Money;
  readonly inventoryCount: number; // Relevant for DROP; OM is make-to-order
  readonly isAvailable: boolean;
}

export interface Product {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly basePrice: Money;
  readonly commerceModel: CommerceModel;
  readonly category: 'BOTTOMS' | 'TOPS' | 'ACCESSORIES';
  readonly isPublished: boolean;
  readonly variants: readonly ProductVariant[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ================= Cart =================

export interface CartLine {
  readonly id: string;
  readonly productId: string;
  readonly variantId: string;
  readonly quantity: number;
  readonly unitPrice: Money;
  readonly selectedOptions: Readonly<Record<string, string>>;
}

export interface Cart {
  readonly id: string;
  readonly customerId?: string;
  readonly lines: readonly CartLine[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ================= Orders (JN-004) =================

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'IN_PRODUCTION'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus =
  | 'INITIATED'
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'EXPIRED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export interface OrderLine {
  readonly id: string;
  readonly orderId: string;
  readonly productId: string;
  readonly variantId: string;
  readonly productTitle: string;
  readonly commerceModel: CommerceModel;
  readonly selectedOptions: Readonly<Record<string, string>>;
  readonly unitPrice: Money;
  readonly quantity: number;
  readonly total: Money;
}

export interface Order {
  readonly id: string;
  readonly orderNumber: string;
  readonly customerId?: string;
  readonly customerEmail: string;
  readonly status: OrderStatus;
  readonly paymentStatus: PaymentStatus;
  readonly shippingAddress: Address;
  readonly lines: readonly OrderLine[];
  readonly subtotal: Money;
  readonly shippingCost: Money;
  readonly total: Money;
  readonly createdAt: string;
}

/**
 * Validates whether an order can be cancelled.
 * Rule: OM orders cannot be cancelled once cutting has begun.
 */
export function canCancelOrder(
  order: Order,
  jobs?: readonly ProductionJob[]
): boolean {
  if (order.status === 'CANCELLED' || order.status === 'SHIPPED' || order.status === 'DELIVERED') {
    return false;
  }

  // If OM jobs exist, verify none have reached CUTTING or beyond
  if (jobs && jobs.length > 0) {
    const hasCuttingStarted = jobs.some(
      (job) => job.currentStage !== 'QUEUED'
    );
    if (hasCuttingStarted) {
      return false; // Point of no return
    }
  }

  return true;
}

// ================= Domain Events =================

export interface DomainEvent<T = unknown> {
  readonly eventId: string;
  readonly eventType: string;
  readonly occurredAt: string;
  readonly payload: T;
}

export type OrderCreatedEvent = DomainEvent<{ orderId: string; orderNumber: string }>;
export type OrderPaidEvent = DomainEvent<{ orderId: string; paymentTransactionId: string }>;
export type ProductionJobStartedEvent = DomainEvent<{ jobId: string; orderId: string; stage: ProductionStage }>;
export type ProductionStageAdvancedEvent = DomainEvent<{
  jobId: string;
  previousStage: ProductionStage;
  nextStage: ProductionStage;
}>;
export type OrderShippedEvent = DomainEvent<{ orderId: string; trackingNumber: string; carrier: string }>;
