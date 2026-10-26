import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CartService } from './cart.service.js';
import type { ICartRepository } from './cart-repository.port.js';
import type { Cart } from '@jeanius/domain';
import type { CartItemDto } from '@jeanius/contracts';

class MockCartRepository implements ICartRepository {
  private carts = new Map<string, Cart>();

  async findById(id: string): Promise<Cart | null> {
    return this.carts.get(id) ?? null;
  }

  async findByCustomerId(customerId: string): Promise<Cart | null> {
    for (const cart of this.carts.values()) {
      if (cart.customerId === customerId) {
        return cart;
      }
    }
    return null;
  }

  async save(cart: Cart): Promise<void> {
    this.carts.set(cart.id, cart);
  }

  async delete(id: string): Promise<void> {
    this.carts.delete(id);
  }
}

describe('CartService Application Service (Clean Architecture)', () => {
  const sampleDto: CartItemDto = {
    id: 'ci-1',
    productId: 'prod-001',
    variantId: 'var-001',
    sku: 'SKU-001',
    title: 'Vajra Signet Ring',
    slug: 'vajra-signet-ring',
    commerceModel: 'OM',
    unitPriceAmount: 32000,
    unitPriceCurrency: 'USD',
    selectedOptions: { ring_size: 'US 10' },
    customSpecifications: { custom_engraving: 'KTM-925' },
    quantity: 2,
  };

  it('creates and returns a new cart when customer has no existing cart', async () => {
    const repo = new MockCartRepository();
    const service = new CartService(repo);

    const cart = await service.getOrCreateCart('cust-101', 'USD');
    assert.strictEqual(cart.customerId, 'cust-101');
    assert.strictEqual(cart.currency, 'USD');
    assert.strictEqual(cart.lines.length, 0);

    const retrieved = await service.getCartByCustomerId('cust-101');
    assert.ok(retrieved);
    assert.strictEqual(retrieved.id, cart.id);
  });

  it('synchronizes cart lines atomically by replacing with guest state', async () => {
    const repo = new MockCartRepository();
    const service = new CartService(repo);

    const synced = await service.syncCart('cust-101', [sampleDto]);
    assert.strictEqual(synced.lines.length, 1);
    assert.strictEqual(synced.lines[0]?.productId, 'prod-001');
    assert.strictEqual(synced.lines[0]?.quantity, 2);
    assert.strictEqual(synced.calculateSubtotal().amount, 64000);
  });

  it('merges guest cart items with existing member cart deterministically', async () => {
    const repo = new MockCartRepository();
    const service = new CartService(repo);

    // Initial server cart has 3 of sample ring
    await service.syncCart('cust-101', [
      {
        ...sampleDto,
        quantity: 3,
      },
    ]);

    // Guest cart has 4 of sample ring + 1 pendant
    const guestItems: CartItemDto[] = [
      {
        ...sampleDto,
        id: 'guest-ci-1',
        quantity: 4,
      },
      {
        id: 'guest-ci-2',
        productId: 'prod-002',
        sku: 'SKU-002',
        title: 'Dorje Pendant',
        slug: 'dorje-pendant',
        commerceModel: 'DROP',
        unitPriceAmount: 45000,
        unitPriceCurrency: 'USD',
        selectedOptions: { metal: 'Sterling Silver' },
        quantity: 1,
      },
    ];

    const merged = await service.mergeGuestCart('cust-101', guestItems);

    assert.strictEqual(merged.lines.length, 2);
    const ringLine = merged.lines.find((l) => l.productId === 'prod-001');
    assert.strictEqual(ringLine?.quantity, 7); // 3 + 4 = 7

    const pendantLine = merged.lines.find((l) => l.productId === 'prod-002');
    assert.strictEqual(pendantLine?.quantity, 1);
  });

  it('clears customer cart lines cleanly', async () => {
    const repo = new MockCartRepository();
    const service = new CartService(repo);

    await service.syncCart('cust-101', [sampleDto]);
    let cart = await service.getCartByCustomerId('cust-101');
    assert.strictEqual(cart?.lines.length, 1);

    await service.clearCart('cust-101');
    cart = await service.getCartByCustomerId('cust-101');
    assert.strictEqual(cart?.lines.length, 0);
  });
});
