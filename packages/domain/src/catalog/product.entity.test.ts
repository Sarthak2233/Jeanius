import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Product } from './product.entity.js';
import { ProductVariant } from './variant.entity.js';
import { Money } from '../common/money.vo.js';
import type { ProductId, VariantId } from '../common/entity-id.js';

describe('Product Aggregate Root (Project 925)', () => {
  const dummyId = 'a0000000-0000-0000-0000-000000000001' as ProductId;
  const basePrice = Money.fromMajor(280, 'USD');

  it('initializes with category, commerce model, and images', () => {
    const product = new Product({
      id: dummyId,
      slug: 'lot-925-01-brutalist-signet-ring',
      title: 'Lot 925-01 — Brutalist Heavy Signet Ring',
      description: 'Hand-forged .925 sterling silver with oxidized shadow patina.',
      basePrice,
      commerceModel: 'OM',
      category: 'rings',
      images: [
        {
          id: 'img-1',
          url: 'http://localhost:54321/storage/v1/object/public/product-media/products/lot-925-01-brutalist-signet-ring/primary.webp',
          altText: 'Lot 925-01 primary angle',
          isPrimary: true,
          position: 0,
        },
        {
          id: 'img-2',
          url: 'http://localhost:54321/storage/v1/object/public/product-media/products/lot-925-01-brutalist-signet-ring/detail-patina.webp',
          altText: 'Lot 925-01 oxidized patina detail',
          isPrimary: false,
          position: 1,
        },
      ],
    });

    assert.equal(product.category, 'rings');
    assert.equal(product.commerceModel, 'OM');
    assert.equal(product.images.length, 2);
    assert.equal(product.primaryImage?.id, 'img-1');
    assert.ok(product.primaryImage?.url.includes('primary.webp'));
  });

  it('resolves primaryImage to first element if isPrimary is not set', () => {
    const product = new Product({
      id: dummyId,
      slug: 'lot-925-02-forged-torque-cuff',
      title: 'Lot 925-02 — Forged Torque Cuff',
      description: 'Solid .925 sterling silver cuff.',
      basePrice: Money.fromMajor(320, 'USD'),
      commerceModel: 'DROP',
      category: 'bracelets',
      images: [
        {
          url: 'http://localhost:54321/storage/v1/object/public/product-media/products/lot-925-02/cuff-front.webp',
          altText: 'Front angle',
        },
      ],
    });

    assert.equal(product.category, 'bracelets');
    assert.ok(product.primaryImage?.url.includes('cuff-front.webp'));
  });

  it('returns undefined primaryImage if images array is empty', () => {
    const product = new Product({
      id: dummyId,
      slug: 'lot-925-06-silver-bowl',
      title: 'Lot 925-06 Hand-Beaten Silver Bowl',
      description: 'Ceremonial vessel in .925 sterling silver.',
      basePrice: Money.fromMajor(650, 'USD'),
      commerceModel: 'OM',
      category: 'artefacts',
    });

    assert.equal(product.category, 'artefacts');
    assert.equal(product.images.length, 0);
    assert.equal(product.primaryImage, undefined);
  });

  it('transitions lifecycle statuses correctly', () => {
    const product = new Product({
      id: dummyId,
      slug: 'lot-925-04-anchor-chain',
      title: 'Lot 925-04 — Heavy Anchor Link Chain',
      description: 'Hand-assembled .925 silver link chain.',
      basePrice: Money.fromMajor(380, 'USD'),
      commerceModel: 'OM',
      category: 'chains',
      status: 'DRAFT',
    });

    assert.equal(product.status, 'DRAFT');
    assert.equal(product.isPublished, false);

    product.publish();
    assert.equal(product.status, 'PUBLISHED');
    assert.equal(product.isPublished, true);

    product.markSoldOut();
    assert.equal(product.status, 'SOLD_OUT');
  });

  it('resolves variants and calculates dynamic pricing based on selected options', () => {
    const product = new Product({
      id: dummyId,
      slug: 'lot-925-01-signet',
      title: 'Signet Ring',
      description: 'Silver signet ring',
      basePrice: Money.fromMajor(280, 'USD'),
      commerceModel: 'OM',
      category: 'rings',
    });

    const variant1 = new ProductVariant({
      id: 'v1' as VariantId,
      productId: dummyId,
      sku: 'P925-R01-US10-OX',
      options: { ring_size: 'us_10', finish: 'oxidized' },
      additionalPrice: Money.fromMajor(20, 'USD'),
      inventoryCount: 10,
      status: 'AVAILABLE',
    });

    const variant2 = new ProductVariant({
      id: 'v2' as VariantId,
      productId: dummyId,
      sku: 'P925-R01-US09-BR',
      options: { ring_size: 'us_9', finish: 'brushed' },
      additionalPrice: Money.zero(),
      inventoryCount: 0,
      status: 'SOLD_OUT',
    });

    product.addVariant(variant1);
    product.addVariant(variant2);

    const resolved = product.findVariantByOptions({ ring_size: 'us_10', finish: 'oxidized' });
    assert.ok(resolved);
    assert.equal(resolved?.sku, 'P925-R01-US10-OX');

    const price = product.calculateEffectivePrice({ ring_size: 'us_10', finish: 'oxidized' });
    assert.equal(price.amount, 30000); // 280 + 20 USD in cents

    const basePriceDefault = product.calculateEffectivePrice();
    assert.equal(basePriceDefault.amount, 28000);

    const nonExistent = product.findVariantByOptions({ ring_size: 'us_12', finish: 'oxidized' });
    assert.equal(nonExistent, undefined);
  });
});
