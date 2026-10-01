/**
 * @jeanius/testing
 * Shared test helpers, mocks, and domain fixture factories.
 */
import {
  Product,
  ProductVariant,
  Order,
  OrderLine,
  ProductionJob,
  Address,
  Money,
  createEntityId,
} from '@jeanius/domain';

export function createTestProduct(overrides?: Partial<Product>): Product {
  const defaultProduct = new Product({
    id: createEntityId('prod-test-001'),
    slug: 'lot-001-straight-selvedge',
    title: 'Lot 001 — Straight Selvedge Raw Denim',
    description: '14oz Japanese Kurabo raw selvedge denim, hand-cut and crafted.',
    basePrice: new Money(28000, 'USD'),
    commerceModel: 'OM',
    category: 'BOTTOMS',
    status: 'PUBLISHED',
    variants: [
      new ProductVariant({
        id: createEntityId('var-test-001'),
        productId: createEntityId('prod-test-001'),
        sku: 'LOT001-RAW-32-34',
        options: { fit: 'Straight', waist: '32', inseam: '34' },
        additionalPrice: Money.zero('USD'),
        inventoryCount: 0,
        status: 'AVAILABLE',
      }),
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  if (overrides) {
    Object.assign(defaultProduct, overrides);
  }
  return defaultProduct;
}

export function createTestOrder(overrides?: Partial<Order>): Order {
  const defaultOrder = new Order({
    id: createEntityId('ord-test-001'),
    orderNumber: 'JN-2026-0001',
    customerEmail: 'denimhead@example.com',
    status: 'PAID',
    paymentStatus: 'PAID',
    shippingAddress: new Address({
      fullName: 'Sarak B',
      addressLine1: 'Lazimpat, Ward 2',
      city: 'Kathmandu',
      postalCode: '44600',
      country: 'NP',
      phone: '+9779800000000',
    }),
    lines: [
      new OrderLine({
        id: createEntityId('line-test-001'),
        orderId: createEntityId('ord-test-001'),
        productId: createEntityId('prod-test-001'),
        variantId: createEntityId('var-test-001'),
        productTitle: 'Lot 001 — Straight Selvedge Raw Denim',
        sku: 'LOT001-RAW-32-34',
        commerceModel: 'OM',
        unitPrice: new Money(28000, 'USD'),
        quantity: 1,
        lineTotal: new Money(28000, 'USD'),
        selectedOptions: { fit: 'Straight', waist: '32', inseam: '34' },
      }),
    ],
    subtotal: new Money(28000, 'USD'),
    shippingCost: new Money(2500, 'USD'),
    total: new Money(30500, 'USD'),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  if (overrides) {
    Object.assign(defaultOrder, overrides);
  }
  return defaultOrder;
}

export function createTestProductionJob(overrides?: Partial<ProductionJob>): ProductionJob {
  const defaultJob = new ProductionJob({
    id: createEntityId('job-test-001'),
    orderId: createEntityId('ord-test-001'),
    orderLineId: createEntityId('line-test-001'),
    currentStage: 'QUEUED',
    targetCompletionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    notes: ['Initial queue intake'],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  if (overrides) {
    Object.assign(defaultJob, overrides);
  }
  return defaultJob;
}
