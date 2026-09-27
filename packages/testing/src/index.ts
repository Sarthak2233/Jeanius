/**
 * @jeanius/testing
 * Shared test helpers, mocks, and domain fixture factories.
 */
import type { Product, Order, ProductionJob } from '@jeanius/domain';

export function createTestProduct(overrides?: Partial<Product>): Product {
  return {
    id: 'prod-test-001',
    slug: 'lot-001-straight-selvedge',
    title: 'Lot 001 — Straight Selvedge Raw Denim',
    description: '14oz Japanese Kurabo raw selvedge denim, hand-cut and crafted.',
    basePrice: { amount: 28000, currency: 'USD' },
    commerceModel: 'OM',
    category: 'BOTTOMS',
    isPublished: true,
    status: 'PUBLISHED',
    variants: [
      {
        id: 'var-test-001',
        productId: 'prod-test-001',
        sku: 'LOT001-RAW-32-34',
        options: { fit: 'Straight', waist: '32', inseam: '34' },
        additionalPrice: { amount: 0, currency: 'USD' },
        inventoryCount: 0,
        isAvailable: true,
        status: 'AVAILABLE',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createTestOrder(overrides?: Partial<Order>): Order {
  return {
    id: 'ord-test-001',
    orderNumber: 'JN-2026-0001',
    customerEmail: 'denimhead@example.com',
    status: 'PAID',
    paymentStatus: 'PAID',
    shippingAddress: {
      fullName: 'Sarak B',
      addressLine1: 'Lazimpat, Ward 2',
      city: 'Kathmandu',
      postalCode: '44600',
      country: 'NP',
      phone: '+9779800000000',
    },
    lines: [
      {
        id: 'line-test-001',
        orderId: 'ord-test-001',
        productId: 'prod-test-001',
        variantId: 'var-test-001',
        productTitle: 'Lot 001 — Straight Selvedge Raw Denim',
        commerceModel: 'OM',
        selectedOptions: { fit: 'Straight', waist: '32', inseam: '34' },
        unitPrice: { amount: 28000, currency: 'USD' },
        quantity: 1,
        total: { amount: 28000, currency: 'USD' },
      },
    ],
    subtotal: { amount: 28000, currency: 'USD' },
    shippingCost: { amount: 2500, currency: 'USD' },
    total: { amount: 30500, currency: 'USD' },
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createTestProductionJob(overrides?: Partial<ProductionJob>): ProductionJob {
  return {
    id: 'job-test-001',
    orderId: 'ord-test-001',
    orderLineId: 'line-test-001',
    currentStage: 'QUEUED',
    targetCompletionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    notes: ['Initial queue intake'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}
