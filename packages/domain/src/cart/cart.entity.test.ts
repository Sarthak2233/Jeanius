import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  Cart,
  CartLine,
  computeCartLineFingerprint,
  Money,
  type CartId,
  type CartLineId,
  type CustomerId,
  type ProductId,
  type VariantId,
} from '../index.js';

describe('Cart & CartLine Aggregate Domain Invariants (Clean Architecture)', () => {
  const sampleLineProps = {
    id: 'line-1' as CartLineId,
    cartId: 'cart-1' as CartId,
    productId: 'prod-ring-1' as ProductId,
    variantId: 'var-1' as VariantId,
    productTitle: 'Vajra Signet Ring',
    commerceModel: 'OM' as const,
    unitPrice: new Money(32000, 'USD'),
    quantity: 2,
    selectedOptions: { ring_size: 'US 10', finish: 'Oxidized' },
    customSpecifications: { custom_engraving: 'KTM-925' },
  };

  it('initializes a CartLine and calculates line total using Money minor units', () => {
    const line = new CartLine(sampleLineProps);
    assert.strictEqual(line.quantity, 2);
    assert.strictEqual(line.calculateLineTotal().amount, 64000);
    assert.strictEqual(line.calculateLineTotal().currency, 'USD');
  });

  it('clamps CartLine quantity to maximum 10 on instantiation and updates', () => {
    const clampedLine = new CartLine({
      ...sampleLineProps,
      quantity: 15,
    });
    assert.strictEqual(clampedLine.quantity, 10);

    clampedLine.updateQuantity(12);
    assert.strictEqual(clampedLine.quantity, 10);
  });

  it('generates consistent identity fingerprints regardless of option key insertion order', () => {
    const fp1 = computeCartLineFingerprint({
      productId: 'prod-1',
      variantId: 'var-1',
      selectedOptions: { b: '2', a: '1' },
      customSpecifications: { y: '2', x: '1' },
    });

    const fp2 = computeCartLineFingerprint({
      productId: 'prod-1',
      variantId: 'var-1',
      selectedOptions: { a: '1', b: '2' },
      customSpecifications: { x: '1', y: '2' },
    });

    assert.strictEqual(fp1, fp2);
  });

  it('deduplicates identical lines and increments quantity up to max 10', () => {
    const cart = new Cart({
      id: 'cart-1' as CartId,
      customerId: 'cust-1' as CustomerId,
      currency: 'USD',
    });

    const line1 = new CartLine(sampleLineProps);
    const line2 = new CartLine({
      ...sampleLineProps,
      id: 'line-2' as CartLineId,
      quantity: 5,
    });

    cart.addLine(line1);
    cart.addLine(line2);

    assert.strictEqual(cart.lines.length, 1);
    assert.strictEqual(cart.lines[0]?.quantity, 7);
    assert.strictEqual(cart.itemCount(), 7);
    assert.strictEqual(cart.calculateSubtotal().amount, 32000 * 7);

    // Add 5 more -> should clamp to 10
    const line3 = new CartLine({
      ...sampleLineProps,
      id: 'line-3' as CartLineId,
      quantity: 5,
    });
    cart.addLine(line3);
    assert.strictEqual(cart.lines[0]?.quantity, 10);
  });

  it('treats lines with distinct options or specifications as separate items', () => {
    const cart = new Cart({
      id: 'cart-1' as CartId,
      currency: 'USD',
    });

    const line1 = new CartLine(sampleLineProps);
    const lineDifferentSize = new CartLine({
      ...sampleLineProps,
      id: 'line-diff-size' as CartLineId,
      selectedOptions: { ring_size: 'US 11', finish: 'Oxidized' },
    });
    const lineDifferentEngraving = new CartLine({
      ...sampleLineProps,
      id: 'line-diff-engraving' as CartLineId,
      customSpecifications: { custom_engraving: 'NEPAL-925' },
    });

    cart.addLine(line1);
    cart.addLine(lineDifferentSize);
    cart.addLine(lineDifferentEngraving);

    assert.strictEqual(cart.lines.length, 3);
    assert.strictEqual(cart.itemCount(), 6);
  });

  it('merges guest lines into existing cart deterministically', () => {
    const cart = new Cart({
      id: 'cart-1' as CartId,
      currency: 'USD',
    });

    const existingLine = new CartLine({
      ...sampleLineProps,
      quantity: 3,
    });
    cart.addLine(existingLine);

    const guestLineIdentical = new CartLine({
      ...sampleLineProps,
      id: 'guest-line-1' as CartLineId,
      quantity: 4,
    });
    const guestLineNew = new CartLine({
      ...sampleLineProps,
      id: 'guest-line-2' as CartLineId,
      productId: 'prod-pendant-2' as ProductId,
      quantity: 1,
    });

    cart.mergeLines([guestLineIdentical, guestLineNew]);

    assert.strictEqual(cart.lines.length, 2);
    const mergedSample = cart.lines.find((l) => l.productId === sampleLineProps.productId);
    assert.strictEqual(mergedSample?.quantity, 7);
    const newGuest = cart.lines.find((l) => l.productId === 'prod-pendant-2');
    assert.strictEqual(newGuest?.quantity, 1);
  });

  it('replaces lines atomically via replaceLines', () => {
    const cart = new Cart({
      id: 'cart-1' as CartId,
      currency: 'USD',
    });
    cart.addLine(new CartLine(sampleLineProps));
    assert.strictEqual(cart.lines.length, 1);

    const newLine = new CartLine({
      ...sampleLineProps,
      id: 'line-fresh' as CartLineId,
      productId: 'prod-fresh' as ProductId,
      quantity: 3,
    });

    cart.replaceLines([newLine]);
    assert.strictEqual(cart.lines.length, 1);
    assert.strictEqual(cart.lines[0]?.productId, 'prod-fresh');
    assert.strictEqual(cart.lines[0]?.quantity, 3);
  });

  it('rejects adding or replacing lines with currency mismatch', () => {
    const cart = new Cart({
      id: 'cart-1' as CartId,
      currency: 'USD',
    });

    const eurLine = new CartLine({
      ...sampleLineProps,
      unitPrice: new Money(32000, 'EUR'),
    });

    assert.throws(
      () => cart.addLine(eurLine),
      /Cannot add line with currency EUR to cart with USD/,
    );
    assert.throws(
      () => cart.replaceLines([eurLine]),
      /Cannot replace lines with currency EUR in cart with USD/,
    );
  });
});
