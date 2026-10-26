import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Payment } from './payment.entity.js';
import { Money } from '../common/money.vo.js';
import { createEntityId } from '../common/entity-id.js';
import { DomainError } from '../errors/index.js';
import { canTransitionPaymentStatus } from '../index.js';

describe('Payment Entity & State Machine (JN-075, JN-240, JN-241)', () => {
  const createPayment = (status: 'INITIATED' | 'PENDING' | 'PAID' = 'INITIATED') =>
    new Payment({
      id: createEntityId<'Payment'>('pay-101'),
      orderId: createEntityId<'Order'>('ord-500'),
      amount: new Money(35000, 'USD'),
      settlementAmount: new Money(35000, 'USD'),
      provider: 'BANK_TRANSFER',
      status,
      idempotencyKey: 'idemp-bank-001',
    });

  it('initializes in INITIATED state with dual currency and required idempotency key', () => {
    const payment = createPayment();

    assert.strictEqual(payment.status, 'INITIATED');
    assert.strictEqual(payment.provider, 'BANK_TRANSFER');
    assert.strictEqual(payment.amount.amount, 35000);
    assert.strictEqual(payment.amount.currency, 'USD');
    assert.strictEqual(payment.settlementAmount.amount, 35000);
    assert.strictEqual(payment.idempotencyKey, 'idemp-bank-001');
    assert.strictEqual(payment.transactionId, undefined);
    assert.strictEqual(payment.notes, undefined);
  });

  it('rejects initialization when idempotency key is empty', () => {
    assert.throws(
      () =>
        new Payment({
          id: createEntityId<'Payment'>('pay-102'),
          orderId: createEntityId<'Order'>('ord-500'),
          amount: new Money(10000, 'USD'),
          provider: 'BANK_TRANSFER',
          idempotencyKey: '   ',
        }),
      (err: unknown) => err instanceof DomainError && err.message.includes('Idempotency key'),
    );
  });

  it('transitions from INITIATED to PENDING when bank voucher is recorded (JN-241)', () => {
    const payment = createPayment('INITIATED');

    payment.markPending('TXN-BNK-99210', 'Transfer via Himalayan Bank SWIFT');

    assert.strictEqual(payment.status, 'PENDING');
    assert.strictEqual(payment.transactionId, 'TXN-BNK-99210');
    assert.strictEqual(payment.notes, 'Transfer via Himalayan Bank SWIFT');
  });

  it('transitions from PENDING to PAID when settled by bank reconciliation (JN-250)', () => {
    const payment = createPayment('PENDING');
    payment.markPending('TXN-BNK-99210');

    payment.settle('TXN-BNK-99210-SETTLED');

    assert.strictEqual(payment.status, 'PAID');
    assert.strictEqual(payment.transactionId, 'TXN-BNK-99210-SETTLED');
  });

  it('prevents marking an already settled payment as PENDING', () => {
    const payment = createPayment('PAID');

    assert.throws(
      () => payment.markPending('TXN-AGAIN'),
      (err: unknown) =>
        err instanceof DomainError && err.message.includes('Cannot mark an already paid payment'),
    );
  });

  it('prevents settling a failed or expired payment', () => {
    const payment = createPayment('INITIATED');
    payment.fail('Bank rejected wire reference');

    assert.throws(
      () => payment.settle('TXN-SETTLE-FAIL'),
      (err: unknown) => err instanceof DomainError && err.message.includes('Cannot settle payment'),
    );
  });

  it('handles partial and full refunds on settled payment (JN-251)', () => {
    const payment = createPayment('PAID');

    // Partial refund of $100 (10,000 cents)
    payment.refund(new Money(10000, 'USD'), 'Customer requested partial ring adjustment');
    assert.strictEqual(payment.status, 'PARTIALLY_REFUNDED');
    assert.strictEqual(payment.refundedAmount.amount, 10000);

    // Remaining refund of $250 (25,000 cents)
    payment.refund(new Money(25000, 'USD'), 'Complete cancellation');
    assert.strictEqual(payment.status, 'REFUNDED');
    assert.strictEqual(payment.refundedAmount.amount, 35000);
  });

  it('prevents refunding an unsettled payment or exceeding total amount', () => {
    const payment = createPayment('PENDING');

    assert.throws(
      () => payment.refund(new Money(5000, 'USD'), 'Early refund attempt'),
      (err: unknown) => err instanceof DomainError && err.message.includes('Cannot refund payment'),
    );
  });

  it('validates lifecycle state transitions via canTransitionPaymentStatus helper', () => {
    assert.strictEqual(canTransitionPaymentStatus('INITIATED', 'PENDING'), true);
    assert.strictEqual(canTransitionPaymentStatus('PENDING', 'PAID'), true);
    assert.strictEqual(canTransitionPaymentStatus('PENDING', 'FAILED'), true);
    assert.strictEqual(canTransitionPaymentStatus('PAID', 'REFUNDED'), true);
    assert.strictEqual(canTransitionPaymentStatus('PAID', 'PENDING'), false);
    assert.strictEqual(canTransitionPaymentStatus('REFUNDED', 'PAID'), false);
  });
});
