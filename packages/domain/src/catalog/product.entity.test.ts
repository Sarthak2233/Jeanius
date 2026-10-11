import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Product } from './product.entity.js';
import { Money } from '../common/money.vo.js';
import type { ProductId } from '../common/entity-id.js';

describe('Product Aggregate Root (JN-066, JN-168, JN-170)', () => {
  const dummyId = 'a0000000-0000-0000-0000-000000000001' as ProductId;
  const basePrice = Money.fromMajor(280, 'USD');

  it('initializes with category, commerce model, and images', () => {
    const product = new Product({
      id: dummyId,
      slug: 'lot-001-straight-selvedge',
      title: 'Lot 001 — Straight Selvedge Raw Denim',
      description: '14oz Japanese Kurabo raw selvedge denim.',
      basePrice,
      commerceModel: 'OM',
      category: 'BOTTOMS',
      images: [
        {
          id: 'img-1',
          url: 'http://localhost:54321/storage/v1/object/public/product-media/products/lot-001-straight-selvedge/primary.webp',
          altText: 'Lot 001 primary angle',
          isPrimary: true,
          position: 0,
        },
        {
          id: 'img-2',
          url: 'http://localhost:54321/storage/v1/object/public/product-media/products/lot-001-straight-selvedge/detail-selvedge.webp',
          altText: 'Lot 001 selvedge id detail',
          isPrimary: false,
          position: 1,
        },
      ],
    });

    assert.equal(product.category, 'BOTTOMS');
    assert.equal(product.commerceModel, 'OM');
    assert.equal(product.images.length, 2);
    assert.equal(product.primaryImage?.id, 'img-1');
    assert.ok(product.primaryImage?.url.includes('primary.webp'));
  });

  it('resolves primaryImage to first element if isPrimary is not set', () => {
    const product = new Product({
      id: dummyId,
      slug: 'lot-j01-sterling-signet-ring',
      title: 'Lot J01 — .925 Sterling Silver Signet Ring',
      description: 'Solid sterling silver.',
      basePrice: Money.fromMajor(180, 'USD'),
      commerceModel: 'DROP',
      category: 'JEWELLERY',
      images: [
        {
          url: 'http://localhost:54321/storage/v1/object/public/product-media/products/lot-j01/ring-front.webp',
          altText: 'Front angle',
        },
      ],
    });

    assert.equal(product.category, 'JEWELLERY');
    assert.ok(product.primaryImage?.url.includes('ring-front.webp'));
  });

  it('returns undefined primaryImage if images array is empty', () => {
    const product = new Product({
      id: dummyId,
      slug: 'lot-a01-belt',
      title: 'Lot A01 Bridle Leather Belt',
      description: 'Heavy bridle leather.',
      basePrice: Money.fromMajor(120, 'USD'),
      commerceModel: 'OM',
      category: 'ACCESSORIES',
    });

    assert.equal(product.category, 'ACCESSORIES');
    assert.equal(product.images.length, 0);
    assert.equal(product.primaryImage, undefined);
  });

  it('transitions lifecycle statuses correctly', () => {
    const product = new Product({
      id: dummyId,
      slug: 'lot-t01-type2-jacket',
      title: 'Lot T01 — Type II Selvedge Jacket',
      description: '14.5oz raw denim jacket.',
      basePrice: Money.fromMajor(380, 'USD'),
      commerceModel: 'OM',
      category: 'TOPS',
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
});
