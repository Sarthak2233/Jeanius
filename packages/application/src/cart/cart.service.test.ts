import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CartService } from './cart.service.js';
import type { ICartRepository } from './cart-repository.port.js';
import type { IProductRepository } from '../catalog/product-repository.port.js';
import {
  Cart,
  Product,
  ProductVariant,
  Money,
  type ProductId,
  type VariantId,
  type CartId,
  type CustomerId,
} from '@jeanius/domain';
import type { CartItemDto, AddToCartInputDto } from '@jeanius/contracts';

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

  async deleteExpiredCarts(olderThan: Date): Promise<number> {
    let count = 0;
    for (const [id, cart] of this.carts.entries()) {
      if (cart.updatedAt.getTime() < olderThan.getTime()) {
        this.carts.delete(id);
        count++;
      }
    }
    return count;
  }
}

class MockProductRepository implements Partial<IProductRepository> {
  private products = new Map<string, Product>();

  addProduct(product: Product): void {
    this.products.set(product.id, product);
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) ?? null;
  }
}

describe('CartService Application Service (State 12: JN-209 - JN-222)', () => {
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

  it('creates and returns a new cart when customer has no existing cart (JN-209, JN-210)', async () => {
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

  it('adds an item to an existing or new customer cart (JN-211)', async () => {
    const repo = new MockCartRepository();
    const service = new CartService(repo);

    const addInput: AddToCartInputDto = {
      productId: 'prod-001',
      variantId: 'var-001',
      sku: 'SKU-001',
      productTitle: 'Vajra Signet Ring',
      productSlug: 'vajra-signet-ring',
      commerceModel: 'OM',
      unitPriceAmount: 32000,
      unitPriceCurrency: 'USD',
      selectedOptions: { ring_size: 'US 10' },
      customSpecifications: { custom_engraving: 'KTM-925' },
      quantity: 1,
    };

    const cart = await service.addItem('cust-101', addInput);
    assert.strictEqual(cart.lines.length, 1);
    assert.strictEqual(cart.lines[0]?.quantity, 1);

    // Adding same item should increment quantity up to 10
    const updated = await service.addItem('cust-101', addInput);
    assert.strictEqual(updated.lines.length, 1);
    assert.strictEqual(updated.lines[0]?.quantity, 2);
  });

  it('updates line quantity with validation and clamping (JN-212)', async () => {
    const repo = new MockCartRepository();
    const service = new CartService(repo);

    await service.syncCart('cust-101', [sampleDto]);
    const cart = await service.getCartByCustomerId('cust-101');
    assert.ok(cart);
    const lineId = cart.lines[0]?.id;
    assert.ok(lineId);

    const updated = await service.updateLineQuantity('cust-101', lineId, 5);
    assert.strictEqual(updated.lines[0]?.quantity, 5);

    // Clamping to 10
    const clamped = await service.updateLineQuantity('cust-101', lineId, 15);
    assert.strictEqual(clamped.lines[0]?.quantity, 10);
  });

  it('removes a line item from customer cart (JN-213)', async () => {
    const repo = new MockCartRepository();
    const service = new CartService(repo);

    await service.syncCart('cust-101', [sampleDto]);
    const cart = await service.getCartByCustomerId('cust-101');
    assert.ok(cart);
    const lineId = cart.lines[0]?.id;
    assert.ok(lineId);

    const updated = await service.removeLine('cust-101', lineId);
    assert.strictEqual(updated.lines.length, 0);
  });

  it('validates stock and clamps quantity for limited DROP pieces (JN-215, JN-222)', async () => {
    const cartRepo = new MockCartRepository();
    const productRepo = new MockProductRepository();

    // Create a limited DROP product with only 2 available in inventory
    const dropVariant = new ProductVariant({
      id: 'drop-var-1' as VariantId,
      productId: 'drop-prod-1' as ProductId,
      sku: 'P925-DROP-01',
      options: { size: 'M' },
      inventoryCount: 2,
      status: 'AVAILABLE',
    });

    const dropProduct = new Product({
      id: 'drop-prod-1' as ProductId,
      slug: 'limited-talisman-drop',
      title: 'Limited Talisman Drop',
      description: 'Exclusive 15-piece run',
      basePrice: new Money(40000, 'USD'),
      commerceModel: 'DROP',
      category: 'Pendants',
      status: 'PUBLISHED',
      variants: [dropVariant],
    });

    productRepo.addProduct(dropProduct);
    const service = new CartService(cartRepo, productRepo as unknown as IProductRepository);

    // Customer requests 5 pieces of drop item
    const requestedItems: CartItemDto[] = [
      {
        id: 'cart-line-1',
        productId: 'drop-prod-1',
        variantId: 'drop-var-1',
        sku: 'P925-DROP-01',
        title: 'Limited Talisman Drop',
        slug: 'limited-talisman-drop',
        commerceModel: 'DROP',
        unitPriceAmount: 40000,
        unitPriceCurrency: 'USD',
        quantity: 5,
        selectedOptions: { size: 'M' },
      },
    ];

    const result = await service.validateAndRecalculateCart(requestedItems, 'cust-101');

    // Should clamp quantity from 5 to 2
    assert.strictEqual(result.items.length, 1);
    assert.strictEqual(result.items[0]?.quantity, 2);
    assert.strictEqual(result.warnings.length, 1);
    assert.strictEqual(result.warnings[0]?.code, 'QUANTITY_CLAMPED');
    assert.strictEqual(result.warnings[0]?.currentValue, 2);
  });

  it('detects catalog price drift and applies server-authoritative totals (JN-214, JN-216)', async () => {
    const cartRepo = new MockCartRepository();
    const productRepo = new MockProductRepository();

    // OM piece has updated base price: $350.00 instead of stale cart price $320.00
    const omProduct = new Product({
      id: 'prod-001' as ProductId,
      slug: 'vajra-signet-ring',
      title: 'Vajra Signet Ring',
      description: 'Handcrafted Kathmandu silver signet',
      basePrice: new Money(35000, 'USD'),
      commerceModel: 'OM',
      category: 'Rings',
      status: 'PUBLISHED',
    });

    productRepo.addProduct(omProduct);
    const service = new CartService(cartRepo, productRepo as unknown as IProductRepository);

    const staleItems: CartItemDto[] = [
      {
        ...sampleDto,
        unitPriceAmount: 32000, // Stale $320
        quantity: 1,
      },
    ];

    const result = await service.validateAndRecalculateCart(staleItems, 'cust-101');

    assert.strictEqual(result.hasPriceChanges, true);
    assert.strictEqual(result.items[0]?.unitPriceAmount, 35000);
    assert.strictEqual(result.subtotalAmount, 35000);
    // Over $300 -> complimentary shipping
    assert.strictEqual(result.estimatedShippingAmount, 0);
    assert.strictEqual(result.grandTotalAmount, 35000);
    assert.ok(result.warnings.some((w) => w.code === 'PRICE_CHANGED'));
  });

  it('handles sold-out / archived discontinued variants gracefully (JN-217)', async () => {
    const cartRepo = new MockCartRepository();
    const productRepo = new MockProductRepository();

    const archivedProduct = new Product({
      id: 'prod-archived' as ProductId,
      slug: 'retired-necklace',
      title: 'Retired Dragon Torc',
      description: 'Archived piece',
      basePrice: new Money(50000, 'USD'),
      commerceModel: 'OM',
      category: 'Necklaces',
      status: 'ARCHIVED',
    });

    productRepo.addProduct(archivedProduct);
    const service = new CartService(cartRepo, productRepo as unknown as IProductRepository);

    const items: CartItemDto[] = [
      {
        id: 'archived-item-1',
        productId: 'prod-archived',
        sku: 'SKU-OLD',
        title: 'Retired Dragon Torc',
        slug: 'retired-necklace',
        commerceModel: 'OM',
        unitPriceAmount: 50000,
        unitPriceCurrency: 'USD',
        quantity: 1,
        selectedOptions: {},
      },
    ];

    const result = await service.validateAndRecalculateCart(items, 'cust-101');
    assert.strictEqual(result.hasUnavailableItems, true);
    assert.strictEqual(result.items.length, 0); // Omitted from purchase total
    assert.ok(result.warnings.some((w) => w.code === 'DISCONTINUED'));
  });

  it('purges expired stale carts (JN-221)', async () => {
    const repo = new MockCartRepository();
    const service = new CartService(repo);

    // Create active cart
    await service.getOrCreateCart('active-cust', 'USD');

    // Create old expired cart
    const oldCart = new Cart({
      id: 'old-cart-id' as CartId,
      customerId: 'expired-cust' as CustomerId,
      currency: 'USD',
      updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    });
    await repo.save(oldCart);

    const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const purgedCount = await service.handleExpiredCarts(cutoff);

    assert.strictEqual(purgedCount, 1);
    assert.strictEqual(await service.getCartByCustomerId('expired-cust'), null);
    assert.ok(await service.getCartByCustomerId('active-cust'));
  });
});
