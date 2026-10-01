import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Money } from './money.vo.js';
import { DomainError } from '../errors/index.js';

describe('Money Value Object', () => {
  it('correctly handles minor-unit integer arithmetic', () => {
    const m1 = new Money(25000, 'USD'); // $250.00
    const m2 = new Money(5000, 'USD'); // $50.00

    const sum = m1.add(m2);
    assert.equal(sum.amount, 30000);
    assert.equal(sum.format(), 'USD 300.00');

    const diff = m1.subtract(m2);
    assert.equal(diff.amount, 20000);
    assert.equal(diff.format(), 'USD 200.00');
  });

  it('rejects non-integer amounts', () => {
    assert.throws(() => new Money(199.99, 'USD'), DomainError);
  });

  it('rejects currency mismatches during addition or subtraction', () => {
    const usd = new Money(10000, 'USD');
    const npr = new Money(1300000, 'NPR');

    assert.throws(() => usd.add(npr), DomainError);
    assert.throws(() => usd.subtract(npr), DomainError);
  });

  it('rejects subtractions resulting in negative money', () => {
    const m1 = new Money(1000, 'USD');
    const m2 = new Money(2000, 'USD');

    assert.throws(() => m1.subtract(m2), DomainError);
  });

  it('allocates money proportionally without penny loss', () => {
    // $100.00 split 1:1:1 -> 33.34, 33.33, 33.33
    const money = new Money(10000, 'USD');
    const parts = money.allocate([1, 1, 1]);

    assert.equal(parts.length, 3);
    assert.equal(parts[0]!.amount, 3334);
    assert.equal(parts[1]!.amount, 3333);
    assert.equal(parts[2]!.amount, 3333);

    const totalAllocated = parts.reduce((sum, p) => sum + p.amount, 0);
    assert.equal(totalAllocated, 10000);
  });

  it('creates Money from major currency units', () => {
    const money = Money.fromMajor(285.5, 'USD');
    assert.equal(money.amount, 28550);
    assert.equal(money.format(), 'USD 285.50');
  });
});
