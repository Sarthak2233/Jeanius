import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  Payment,
  Order,
  OrderLine,
  Address,
  Money,
  createEntityId,
  DomainError,
  type PaymentProvider,
} from '@jeanius/domain';
import {
  PaymentOrchestrator,
  type IPaymentProvider,
  type IPaymentRepository,
  type PaymentInitiationResult,
  type PaymentConfirmationResult,
  type WebhookVerificationResult,
  type RefundResult,
} from './index.js';
import { ReconcilePaymentService } from './reconcile-payment.service.js';
import type { IOrderRepository } from '../order/order-repository.port.js';

class InMemoryPaymentRepository implements IPaymentRepository {
  private readonly store = new Map<string, Payment>();

  async findById(id: string): Promise<Payment | null> {
    return this.store.get(id) ?? null;
  }

  async findByOrderId(orderId: string): Promise<readonly Payment[]> {
    return Array.from(this.store.values()).filter((p) => p.orderId === orderId);
  }

  async findByIdempotencyKey(key: string): Promise<Payment | null> {
    return Array.from(this.store.values()).find((p) => p.idempotencyKey === key) ?? null;
  }

  async save(payment: Payment): Promise<void> {
    this.store.set(payment.id, payment);
  }
}

class InMemoryOrderRepository implements IOrderRepository {
  private readonly store = new Map<string, Order>();

  async findById(id: string): Promise<Order | null> {
    return this.store.get(id) ?? null;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return Array.from(this.store.values()).find((o) => o.orderNumber === orderNumber) ?? null;
  }

  async findByIdempotencyKey(_key: string): Promise<Order | null> {
    return null;
  }

  async save(order: Order): Promise<void> {
    this.store.set(order.id, order);
  }
}

class MockBankProvider implements IPaymentProvider {
  readonly providerId: PaymentProvider = 'BANK_TRANSFER';

  async initiatePayment(
    order: Order,
    _options?: { idempotencyKey?: string },
  ): Promise<PaymentInitiationResult> {
    return {
      paymentUrl: `/checkout/bank-sim?paymentId=sim-pay&orderNumber=${order.orderNumber}`,
      transactionId: `TXN-BNK-${order.orderNumber}`,
      voucherReference: `TXN-BNK-REF-${Date.now()}`,
      status: 'INITIATED',
    };
  }

  async confirmTransfer(
    _paymentId: string,
    reference: string,
    notes?: string,
  ): Promise<PaymentConfirmationResult> {
    return {
      success: true,
      status: 'PENDING',
      transactionId: reference,
      notes,
    };
  }

  async verifyWebhook(_payload: unknown, _signature: string): Promise<WebhookVerificationResult> {
    return { isValid: true };
  }

  async processRefund(_payment: Payment, amount: Money, _reason: string): Promise<RefundResult> {
    return {
      success: true,
      refundTransactionId: `REF-${Date.now()}`,
      amount,
    };
  }
}

function createTestOrder(currency: 'USD' | 'NPR' = 'USD'): Order {
  const orderId = createEntityId<'Order'>('ord-001');
  return new Order({
    id: orderId,
    orderNumber: 'ORD-925-TEST',
    customerId: createEntityId<'Customer'>('usr-001'),
    customerEmail: 'atelier@jeanius.com',
    shippingAddress: new Address({
      fullName: 'Aarav Sharma',
      addressLine1: 'Babar Mahal Revisited',
      city: 'Kathmandu',
      postalCode: '44600',
      country: 'NP',
      phone: '+977-9800000000',
    }),
    lines: [
      new OrderLine({
        id: createEntityId<'OrderLine'>('line-1'),
        orderId,
        productId: createEntityId<'Product'>('prod-1'),
        variantId: createEntityId<'Variant'>('var-1'),
        productTitle: 'Raw Selvedge 925 Denim',
        sku: 'RS925-01',
        commerceModel: 'OM',
        unitPrice: new Money(45000, currency),
        quantity: 1,
        lineTotal: new Money(45000, currency),
        selectedOptions: {},
      }),
    ],
    subtotal: new Money(45000, currency),
    shippingCost: new Money(0, currency),
    total: new Money(45000, currency),
    currency,
  });
}

describe('PaymentOrchestrator Application Service (JN-244 -> JN-249)', () => {
  it('initiates bank transfer payment and persists INITIATED state', async () => {
    const paymentRepo = new InMemoryPaymentRepository();
    const orderRepo = new InMemoryOrderRepository();
    const bankProvider = new MockBankProvider();
    const orchestrator = new PaymentOrchestrator({
      paymentRepository: paymentRepo,
      orderRepository: orderRepo,
      providers: [bankProvider],
    });

    const order = createTestOrder('USD');
    const result = await orchestrator.initiatePayment(order, {
      idempotencyKey: 'idemp-test-100',
    });

    assert.ok(result.paymentUrl.includes('/checkout/bank-sim'));
    assert.strictEqual(result.status, 'INITIATED');

    const saved = await paymentRepo.findByIdempotencyKey('idemp-test-100');
    assert.ok(saved);
    assert.strictEqual(saved.orderId, order.id);
    assert.strictEqual(saved.provider, 'BANK_TRANSFER');
    assert.strictEqual(saved.status, 'INITIATED');
  });

  it('guarantees payment idempotency on duplicate initiation (JN-249, JN-256)', async () => {
    const paymentRepo = new InMemoryPaymentRepository();
    const orchestrator = new PaymentOrchestrator({
      paymentRepository: paymentRepo,
      providers: [new MockBankProvider()],
    });

    const order = createTestOrder('USD');
    const firstCall = await orchestrator.initiatePayment(order, {
      idempotencyKey: 'idemp-duplicate-check',
    });
    const secondCall = await orchestrator.initiatePayment(order, {
      idempotencyKey: 'idemp-duplicate-check',
    });

    assert.strictEqual(firstCall.transactionId, secondCall.transactionId);
    assert.strictEqual(firstCall.paymentUrl, secondCall.paymentUrl);

    const allPayments = await paymentRepo.findByOrderId(order.id);
    assert.strictEqual(allPayments.length, 1);
  });

  it('confirms bank voucher submission and transitions payment to PENDING (JN-241)', async () => {
    const paymentRepo = new InMemoryPaymentRepository();
    const orderRepo = new InMemoryOrderRepository();
    const orchestrator = new PaymentOrchestrator({
      paymentRepository: paymentRepo,
      orderRepository: orderRepo,
      providers: [new MockBankProvider()],
    });

    const order = createTestOrder('USD');
    await orderRepo.save(order);

    await orchestrator.initiatePayment(order);
    const payments = await paymentRepo.findByOrderId(order.id);
    const paymentId = payments[0]!.id;

    const confirm = await orchestrator.confirmTransfer(
      paymentId,
      'TXN-BNK-MANUAL-777',
      'Wire transfer via Standard Chartered',
    );

    assert.strictEqual(confirm.success, true);
    assert.strictEqual(confirm.status, 'PENDING');

    const updatedPayment = await paymentRepo.findById(paymentId);
    assert.strictEqual(updatedPayment?.status, 'PENDING');
    assert.strictEqual(updatedPayment?.transactionId, 'TXN-BNK-MANUAL-777');
    assert.strictEqual(updatedPayment?.notes, 'Wire transfer via Standard Chartered');

    const updatedOrder = await orderRepo.findById(order.id);
    assert.strictEqual(updatedOrder?.paymentStatus, 'PENDING');
  });

  it('rejects confirmation when voucher reference code is empty', async () => {
    const paymentRepo = new InMemoryPaymentRepository();
    const orchestrator = new PaymentOrchestrator({
      paymentRepository: paymentRepo,
      providers: [new MockBankProvider()],
    });

    await assert.rejects(
      () => orchestrator.confirmTransfer('pay-123', '   '),
      (err: unknown) => err instanceof DomainError && err.message.includes('reference code'),
    );
  });
});

describe('ReconcilePaymentService (JN-250, JN-251, JN-255, JN-258)', () => {
  it('settles a PENDING payment to PAID and activates workshop queue for OM orders', async () => {
    const paymentRepo = new InMemoryPaymentRepository();
    const orderRepo = new InMemoryOrderRepository();
    const reconcile = new ReconcilePaymentService({
      paymentRepository: paymentRepo,
      orderRepository: orderRepo,
    });

    const order = createTestOrder('USD');
    await orderRepo.save(order);

    const payment = new Payment({
      id: createEntityId<'Payment'>('pay-settle-01'),
      orderId: order.id,
      amount: order.total,
      provider: 'BANK_TRANSFER',
      status: 'PENDING',
      idempotencyKey: 'idemp-settle-01',
    });
    await paymentRepo.save(payment);

    const settled = await reconcile.settlePayment(payment.id, 'BANK-SWIFT-SETTLED-999');

    assert.strictEqual(settled.status, 'PAID');
    assert.strictEqual(settled.transactionId, 'BANK-SWIFT-SETTLED-999');

    const updatedOrder = await orderRepo.findById(order.id);
    assert.strictEqual(updatedOrder?.paymentStatus, 'PAID');
    // OM orders transition to IN_PRODUCTION upon payment clearance
    assert.strictEqual(updatedOrder?.status, 'IN_PRODUCTION');
  });

  it('fails a payment with explicit failure reason (JN-255)', async () => {
    const paymentRepo = new InMemoryPaymentRepository();
    const orderRepo = new InMemoryOrderRepository();
    const reconcile = new ReconcilePaymentService({
      paymentRepository: paymentRepo,
      orderRepository: orderRepo,
    });

    const order = createTestOrder('USD');
    await orderRepo.save(order);

    const payment = new Payment({
      id: createEntityId<'Payment'>('pay-fail-01'),
      orderId: order.id,
      amount: order.total,
      provider: 'BANK_TRANSFER',
      status: 'PENDING',
      idempotencyKey: 'idemp-fail-01',
    });
    await paymentRepo.save(payment);

    const failed = await reconcile.failPayment(payment.id, 'Wire returned: invalid account number');

    assert.strictEqual(failed.status, 'FAILED');

    const updatedOrder = await orderRepo.findById(order.id);
    assert.strictEqual(updatedOrder?.paymentStatus, 'FAILED');
  });

  it('processes full and partial refunds (JN-258)', async () => {
    const paymentRepo = new InMemoryPaymentRepository();
    const reconcile = new ReconcilePaymentService({
      paymentRepository: paymentRepo,
    });

    const payment = new Payment({
      id: createEntityId<'Payment'>('pay-refund-01'),
      orderId: createEntityId<'Order'>('ord-001'),
      amount: new Money(45000, 'USD'),
      provider: 'BANK_TRANSFER',
      status: 'PAID',
      idempotencyKey: 'idemp-refund-01',
    });
    await paymentRepo.save(payment);

    // Partial refund of $150
    const partial = await reconcile.refundPayment(
      payment.id,
      new Money(15000, 'USD'),
      'Ring sizing credit',
    );
    assert.strictEqual(partial.status, 'PARTIALLY_REFUNDED');
    assert.strictEqual(partial.refundedAmount.amount, 15000);

    // Remaining refund of $300
    const full = await reconcile.refundPayment(
      payment.id,
      new Money(30000, 'USD'),
      'Customer return',
    );
    assert.strictEqual(full.status, 'REFUNDED');
    assert.strictEqual(full.refundedAmount.amount, 45000);
  });
});
