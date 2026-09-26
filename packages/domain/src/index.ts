/**
 * @jeanius/domain
 * Framework-independent business domain entities and value objects.
 */

export type CommerceModel = 'OM' | 'DROP';

export interface Money {
  readonly amount: number; // Stored in minor units (e.g. cents)
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

export type ProductionStage =
  | 'QUEUED'
  | 'CUTTING'
  | 'SEWING'
  | 'WASHING'
  | 'HARDWARE'
  | 'QC'
  | 'READY'
  | 'SHIPPED';

export interface ProductionPolicy {
  readonly productType: CommerceModel;
  readonly minimumDays: number;
  readonly maximumDays: number;
  readonly excludedDates?: readonly string[];
  readonly excludedHolidays?: readonly string[];
  readonly effectiveFrom: string;
  readonly effectiveUntil?: string;
}

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
