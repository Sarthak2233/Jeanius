import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Order } from './order.entity.js';
import { OrderLine } from './order-line.entity.js';
import { ProductionJob } from '../production/production-job.entity.js';
import { Address } from '../common/address.vo.js';
import { Money } from '../common/money.vo.js';
import { createEntityId } from '../common/entity-id.js';
import { DomainError } from '../errors/index.js';

describe('Order Aggregate Root', () => {
  const dummyAddress = new Address({
    fullName: 'Sarthak Sharma',
    addressLine1: 'Lazimpat Road 4',
    city: 'Kathmandu',
    postalCode: '44600',
    country: 'NP',
    phone: '+977-9801234567',
  });

  const createOmLine = () =>
    new OrderLine({
      id: createEntityId('line-om-01'),
      orderId: createEntityId('ord-001'),
      productId: createEntityId('prod-om-1955'),
      variantId: createEntityId('var-om-32'),
      productTitle: '1955 Kathmandu Raw Denim',
      sku: 'JNS-1955-32-34',
      commerceModel: 'OM',
      unitPrice: new Money(28000, 'USD'), // $280.00
      quantity: 1,
      lineTotal: new Money(28000, 'USD'),
      selectedOptions: { waist: '32', inseam: '34' },
    });

  const createDropLine = () =>
    new OrderLine({
      id: createEntityId('line-drop-01'),
      orderId: createEntityId('ord-001'),
      productId: createEntityId('prod-drop-bandana'),
      variantId: createEntityId('var-bandana-blue'),
      productTitle: 'Indigo Dyed Bandana',
      sku: 'JNS-ACC-BAND-IND',
      commerceModel: 'DROP',
      unitPrice: new Money(3500, 'USD'), // $35.00
      quantity: 1,
      lineTotal: new Money(3500, 'USD'),
      selectedOptions: { color: 'Indigo' },
    });

  it('marks paid and enters IN_PRODUCTION if containing OM items', () => {
    const order = new Order({
      id: createEntityId('ord-001'),
      orderNumber: 'JNS-2026-0001',
      customerEmail: 'sarthak@example.com',
      shippingAddress: dummyAddress,
      lines: [createOmLine()],
      subtotal: new Money(28000, 'USD'),
      shippingCost: new Money(2000, 'USD'),
      total: new Money(30000, 'USD'),
    });

    assert.equal(order.status, 'PENDING');
    assert.equal(order.paymentStatus, 'INITIATED');

    order.markPaid(createEntityId('pay-001'), 'ch_stripe_123');

    assert.equal(order.paymentStatus, 'PAID');
    assert.equal(order.status, 'IN_PRODUCTION');
  });

  it('permits cancellation when OM jobs are still QUEUED', () => {
    const order = new Order({
      id: createEntityId('ord-002'),
      orderNumber: 'JNS-2026-0002',
      customerEmail: 'customer@example.com',
      shippingAddress: dummyAddress,
      lines: [createOmLine()],
      subtotal: new Money(28000, 'USD'),
      shippingCost: new Money(2000, 'USD'),
      total: new Money(30000, 'USD'),
    });

    const queuedJob = new ProductionJob({
      id: createEntityId('job-001'),
      orderId: order.id,
      orderLineId: createEntityId('line-om-01'),
      currentStage: 'QUEUED',
      targetCompletionDate: new Date(Date.now() + 14 * 86400000),
    });

    assert.equal(order.canCancel([queuedJob]), true);
    order.cancel('Customer requested size change', [queuedJob]);
    assert.equal(order.status, 'CANCELLED');
  });

  it('strictly rejects cancellation once workshop cutting begins (Point of No Return)', () => {
    const order = new Order({
      id: createEntityId('ord-003'),
      orderNumber: 'JNS-2026-0003',
      customerEmail: 'customer@example.com',
      shippingAddress: dummyAddress,
      lines: [createOmLine()],
      subtotal: new Money(28000, 'USD'),
      shippingCost: new Money(2000, 'USD'),
      total: new Money(30000, 'USD'),
    });

    const cuttingJob = new ProductionJob({
      id: createEntityId('job-002'),
      orderId: order.id,
      orderLineId: createEntityId('line-om-01'),
      currentStage: 'CUTTING', // Fabric bolt has already been cut!
      targetCompletionDate: new Date(Date.now() + 10 * 86400000),
    });

    assert.equal(order.canCancel([cuttingJob]), false);
    assert.throws(() => order.cancel('Customer changed mind', [cuttingJob]), DomainError);
  });

  it('correctly identifies multi-package split fulfillment eligibility', () => {
    const singleDropOrder = new Order({
      id: createEntityId('ord-004'),
      orderNumber: 'JNS-2026-0004',
      customerEmail: 'customer@example.com',
      shippingAddress: dummyAddress,
      lines: [createDropLine()],
      subtotal: new Money(3500, 'USD'),
      shippingCost: new Money(1000, 'USD'),
      total: new Money(4500, 'USD'),
    });
    assert.equal(singleDropOrder.isMultiPackageEligible(), false);

    const mixedOrder = new Order({
      id: createEntityId('ord-005'),
      orderNumber: 'JNS-2026-0005',
      customerEmail: 'customer@example.com',
      shippingAddress: dummyAddress,
      lines: [createOmLine(), createDropLine()],
      subtotal: new Money(31500, 'USD'),
      shippingCost: new Money(2500, 'USD'),
      total: new Money(34000, 'USD'),
    });
    // Mixed order has ready-to-wear DROP item and 3-week OM item -> split fulfillment!
    assert.equal(mixedOrder.isMultiPackageEligible(), true);
  });
});
