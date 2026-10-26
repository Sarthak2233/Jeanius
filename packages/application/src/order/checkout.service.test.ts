import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { CheckoutService } from './checkout.service.js';
import type { IOrderRepository } from './order-repository.port.js';
import type { ICartRepository } from '../cart/cart-repository.port.js';
import type { IProductRepository } from '../catalog/product-repository.port.js';
import {
  Cart,
  CartLine,
  Order,
  OrderLine,
  Product,
  ProductVariant,
  Money,
  Address,
  DomainError,
  createEntityId,
} from '@jeanius/domain';

describe('CheckoutService (JN-223 -> JN-239)', () => {
  let mockOrders: Map<string, Order>;
  let mockIdempotencyKeys: Map<string, Order>;
  let mockCarts: Map<string, Cart>;
  let mockProducts: Map<string, Product>;

  let orderRepo: IOrderRepository;
  let cartRepo: ICartRepository;
  let productRepo: IProductRepository;
  let checkoutService: CheckoutService;

  const validAddressDto = {
    fullName: 'Jane Doe',
    addressLine1: '123 Atelier Street',
    city: 'Seattle',
    stateOrProvince: 'WA',
    postalCode: '98101',
    country: 'US',
    phone: '+1-206-555-0100',
  };

  beforeEach(() => {
    mockOrders = new Map();
    mockIdempotencyKeys = new Map();
    mockCarts = new Map();
    mockProducts = new Map();

    orderRepo = {
      findById: async (id: string) => mockOrders.get(id) ?? null,
      findByOrderNumber: async (num: string) =>
        Array.from(mockOrders.values()).find((o) => o.orderNumber === num) ?? null,
      findByIdempotencyKey: async (key: string) => mockIdempotencyKeys.get(key) ?? null,
      save: async (order: Order, idempotencyKey?: string) => {
        mockOrders.set(order.id, order);
        if (idempotencyKey) {
          mockIdempotencyKeys.set(idempotencyKey, order);
        }
      },
    };

    cartRepo = {
      findById: async (id: string) => mockCarts.get(id) ?? null,
      findByCustomerId: async () => null,
      save: async (cart: Cart) => {
        mockCarts.set(cart.id, cart);
      },
      delete: async (id: string) => {
        mockCarts.delete(id);
      },
      deleteExpiredCarts: async () => 0,
    };

    productRepo = {
      findById: async (id: string) => mockProducts.get(id) ?? null,
      findBySlug: async () => null,
      listPublished: async () => [],
      findFiltered: async () => ({ products: [], totalCount: 0, categoryCounts: [] }),
      findRelated: async () => [],
      getCategoriesWithCounts: async () => [],
    };

    checkoutService = new CheckoutService(orderRepo, cartRepo, productRepo);
  });

  it('validates shipping address, rejects military APO/FPO and calculates courier tariffs (JN-227, JN-228, JN-229)', () => {
    // Normal international address
    const result = checkoutService.validateShippingAddress({
      address: validAddressDto,
      cartSubtotalCents: 15000, // $150.00
      currency: 'USD',
    });
    assert.strictEqual(result.isDeliverable, true);
    assert.strictEqual(result.isMilitary, false);
    assert.strictEqual(result.shippingCostAmount, 2500); // $25 flat
    assert.strictEqual(result.isFreeShipping, false);
    assert.strictEqual(result.courier, 'DHL Worldwide Express');

    // Free shipping over $300
    const freeResult = checkoutService.validateShippingAddress({
      address: validAddressDto,
      cartSubtotalCents: 35000, // $350.00
      currency: 'USD',
    });
    assert.strictEqual(freeResult.isDeliverable, true);
    assert.strictEqual(freeResult.shippingCostAmount, 0);
    assert.strictEqual(freeResult.isFreeShipping, true);

    // Domestic Nepal
    const domesticResult = checkoutService.validateShippingAddress({
      address: {
        fullName: 'Bishal Shrestha',
        addressLine1: 'Patan Dhoka',
        city: 'Lalitpur',
        postalCode: '44700',
        country: 'NP',
        phone: '+977-9841234567',
      },
      cartSubtotalCents: 5000,
      currency: 'USD',
    });
    assert.strictEqual(domesticResult.isDeliverable, true);
    assert.strictEqual(domesticResult.shippingCostAmount, 0);
    assert.strictEqual(domesticResult.courier, 'Kathmandu Local Courier');

    // Military APO rejection
    const militaryResult = checkoutService.validateShippingAddress({
      address: {
        fullName: 'Captain Miller',
        addressLine1: 'PSC 802 Box 99',
        city: 'APO',
        stateOrProvince: 'AE',
        postalCode: '09494',
        country: 'US',
        phone: '+1-555-019-2834',
      },
      cartSubtotalCents: 20000,
      currency: 'USD',
    });
    assert.strictEqual(militaryResult.isDeliverable, false);
    assert.strictEqual(militaryResult.isMilitary, true);
    assert.match(militaryResult.reason ?? '', /cannot deliver to APO\/FPO\/DPO/);
  });

  it('rejects checkout on empty cart (JN-233)', async () => {
    const emptyCart = new Cart({
      id: createEntityId<'Cart'>('cart-empty'),
      currency: 'USD',
      lines: [],
    });
    await cartRepo.save(emptyCart);

    await assert.rejects(
      () =>
        checkoutService.initiateCheckout({
          cartId: 'cart-empty',
          customerEmail: 'jane@example.com',
          shippingAddress: validAddressDto,
        }),
      (err: unknown) => err instanceof DomainError && err.message.includes('Cart is empty'),
    );
  });

  it('returns existing order on duplicate checkout idempotency key (JN-234)', async () => {
    const dummyLine = new OrderLine({
      id: createEntityId<'OrderLine'>('line-existing-01'),
      orderId: createEntityId<'Order'>('ord-existing-123'),
      productId: createEntityId<'Product'>('prod-existing'),
      variantId: createEntityId<'Variant'>('var-existing'),
      productTitle: 'Signet Ring',
      sku: 'JNS-RING-01',
      commerceModel: 'DROP',
      unitPrice: new Money(30000, 'USD'),
      quantity: 1,
      lineTotal: new Money(30000, 'USD'),
      selectedOptions: {},
    });

    const existingOrder = new Order({
      id: createEntityId<'Order'>('ord-existing-123'),
      orderNumber: 'JNS-EXISTING-999',
      customerEmail: 'jane@example.com',
      shippingAddress: new Address(validAddressDto),
      lines: [dummyLine],
      subtotal: new Money(30000, 'USD'),
      shippingCost: new Money(0, 'USD'),
      total: new Money(30000, 'USD'),
    });
    await orderRepo.save(existingOrder, 'idempotency-key-duplicate');

    const result = await checkoutService.initiateCheckout({
      cartId: 'cart-any',
      customerEmail: 'jane@example.com',
      shippingAddress: validAddressDto,
      idempotencyKey: 'idempotency-key-duplicate',
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.orderId, 'ord-existing-123');
    assert.strictEqual(result.orderNumber, 'JNS-EXISTING-999');
  });

  it('blocks checkout if DROP item is sold out or out of stock (JN-236)', async () => {
    const prodId = createEntityId<'Product'>('prod-drop-ring');
    const varId = createEntityId<'Variant'>('var-drop-ring-size-10');
    const cartId = createEntityId<'Cart'>('cart-drop-oom');

    const dropVariant = new ProductVariant({
      id: varId,
      productId: prodId,
      sku: 'JNS-RING-10',
      options: { size: '10' },
      inventoryCount: 0, // Out of stock!
      status: 'SOLD_OUT',
    });

    const dropProduct = new Product({
      id: prodId,
      title: 'Signet Ring',
      slug: 'signet-ring',
      description: 'Atelier Kathmandu piece',
      category: 'JEWELLERY',
      commerceModel: 'DROP',
      basePrice: new Money(18000, 'USD'),
      status: 'PUBLISHED',
      variants: [dropVariant],
    });
    mockProducts.set(prodId, dropProduct);

    const line = new CartLine({
      id: createEntityId<'CartLine'>('line-1'),
      cartId,
      productId: prodId,
      variantId: varId,
      productTitle: 'Signet Ring',
      commerceModel: 'DROP',
      unitPrice: new Money(18000, 'USD'),
      quantity: 1,
      selectedOptions: { size: '10' },
    });

    const cart = new Cart({
      id: cartId,
      currency: 'USD',
      lines: [line],
    });
    await cartRepo.save(cart);

    await assert.rejects(
      () =>
        checkoutService.initiateCheckout({
          cartId: 'cart-drop-oom',
          customerEmail: 'jane@example.com',
          shippingAddress: validAddressDto,
        }),
      (err: unknown) => err instanceof DomainError && err.message.includes('sold out'),
    );
  });

  it('detects price drift and requires customer confirmation (JN-235)', async () => {
    const prodId = createEntityId<'Product'>('prod-om-jeans');
    const varId = createEntityId<'Variant'>('var-om-jeans-32');
    const cartId = createEntityId<'Cart'>('cart-drift');

    const omProduct = new Product({
      id: prodId,
      title: '1955 Kathmandu Denim',
      slug: '1955-kathmandu-denim',
      description: 'Atelier Kathmandu piece',
      category: 'DENIM',
      commerceModel: 'OM',
      basePrice: new Money(32000, 'USD'), // Price went up to $320.00
      status: 'PUBLISHED',
    });
    mockProducts.set(prodId, omProduct);

    // Cart had it at $280.00
    const line = new CartLine({
      id: createEntityId<'CartLine'>('line-om-drift'),
      cartId,
      productId: prodId,
      variantId: varId,
      productTitle: '1955 Kathmandu Denim',
      commerceModel: 'OM',
      unitPrice: new Money(28000, 'USD'), // Old price
      quantity: 1,
      selectedOptions: { waist: '32' },
    });

    const cart = new Cart({
      id: cartId,
      currency: 'USD',
      lines: [line],
    });
    await cartRepo.save(cart);

    // Fails without confirmation
    await assert.rejects(
      () =>
        checkoutService.initiateCheckout({
          cartId: 'cart-drift',
          customerEmail: 'jane@example.com',
          shippingAddress: validAddressDto,
          confirmedPriceChanges: false,
        }),
      (err: unknown) => err instanceof DomainError && err.message.includes('Price changed'),
    );

    // Succeeds when customer confirms price change
    const result = await checkoutService.initiateCheckout({
      cartId: 'cart-drift',
      customerEmail: 'jane@example.com',
      shippingAddress: validAddressDto,
      confirmedPriceChanges: true,
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.status, 'PENDING');
  });

  it('completes checkout, saves order with line snapshots, and clears cart (JN-237)', async () => {
    const prodId = createEntityId<'Product'>('prod-om-ring');
    const varId = createEntityId<'Variant'>('var-om-ring-925');
    const cartId = createEntityId<'Cart'>('cart-success');

    const product = new Product({
      id: prodId,
      title: 'Dragon Signet Silver Ring',
      slug: 'dragon-signet-silver-ring',
      description: 'Atelier Kathmandu piece',
      category: 'JEWELLERY',
      commerceModel: 'OM',
      basePrice: new Money(35000, 'USD'), // $350.00 (qualifies for free shipping)
      status: 'PUBLISHED',
    });
    mockProducts.set(prodId, product);

    const line = new CartLine({
      id: createEntityId<'CartLine'>('line-om-ring'),
      cartId,
      productId: prodId,
      variantId: varId,
      productTitle: 'Dragon Signet Silver Ring',
      commerceModel: 'OM',
      unitPrice: new Money(35000, 'USD'),
      quantity: 1,
      selectedOptions: { 'Ring Size': '10.5', Alloy: '925 Sterling Silver' },
      customSpecifications: { mandrelSize: 10.5, patinaFinish: 'LIVER_OF_SULFUR' },
    });

    const cart = new Cart({
      id: cartId,
      currency: 'USD',
      lines: [line],
    });
    await cartRepo.save(cart);

    const result = await checkoutService.initiateCheckout(
      {
        cartId: 'cart-success',
        customerEmail: 'sarthak@jeanius.co',
        shippingAddress: validAddressDto,
        idempotencyKey: 'idemp-session-42',
      },
      'cust-sarthak-01',
    );

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.status, 'PENDING');
    assert.strictEqual(result.totalAmount, 35000); // Free shipping threshold met
    assert.strictEqual(result.currency, 'USD');

    // Verify order was persisted
    const savedOrder = mockOrders.get(result.orderId);
    assert.ok(savedOrder);
    assert.strictEqual(savedOrder.customerEmail, 'sarthak@jeanius.co');
    assert.strictEqual(savedOrder.customerId, 'cust-sarthak-01');
    assert.strictEqual(savedOrder.lines.length, 1);
    assert.strictEqual(savedOrder.lines[0]?.customSpecifications?.mandrelSize, 10.5);

    // Verify cart was deleted/cleaned
    const remainingCart = await cartRepo.findById('cart-success');
    assert.strictEqual(remainingCart, null);
  });
});
