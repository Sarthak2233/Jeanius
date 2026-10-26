import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CatalogService } from './catalog.service.js';
import type {
  IProductRepository,
  ProductFilterCriteria,
  CatalogQueryResult,
  CategoryCount,
} from './product-repository.port.js';
import { Product, Money, type ProductId, type CommerceModel } from '@jeanius/domain';

class MockProductRepository implements IProductRepository {
  private readonly products: Product[] = [];

  constructor(items: Product[]) {
    this.products = [...items];
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.find((p) => p.id === id) ?? null;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.products.find((p) => p.slug === slug) ?? null;
  }

  async listPublished(): Promise<readonly Product[]> {
    return this.products.filter((p) => p.status === 'PUBLISHED');
  }

  async findFiltered(criteria: ProductFilterCriteria): Promise<CatalogQueryResult> {
    let filtered = [...this.products];

    if (criteria.category && criteria.category !== 'ALL') {
      filtered = filtered.filter((p) => p.category === criteria.category);
    }
    if (criteria.commerceModel && criteria.commerceModel !== 'ALL') {
      filtered = filtered.filter((p) => p.commerceModel === criteria.commerceModel);
    }

    const categoryCounts: CategoryCount[] = [
      { category: 'rings', count: this.products.filter((p) => p.category === 'rings').length },
      {
        category: 'bracelets-cuffs',
        count: this.products.filter((p) => p.category === 'bracelets-cuffs').length,
      },
      {
        category: 'necklaces-pendants',
        count: this.products.filter((p) => p.category === 'necklaces-pendants').length,
      },
    ];

    return {
      products: filtered,
      totalCount: filtered.length,
      categoryCounts,
    };
  }

  async findRelated(productId: string, limit: number = 4): Promise<readonly Product[]> {
    const target = this.products.find((p) => p.id === productId);
    if (!target) return [];
    return this.products.filter((p) => p.id !== productId).slice(0, limit);
  }

  async getCategoriesWithCounts(commerceModel?: CommerceModel): Promise<readonly CategoryCount[]> {
    const list = commerceModel
      ? this.products.filter((p) => p.commerceModel === commerceModel)
      : this.products;
    return [
      { category: 'rings', count: list.filter((p) => p.category === 'rings').length },
      {
        category: 'bracelets-cuffs',
        count: list.filter((p) => p.category === 'bracelets-cuffs').length,
      },
      {
        category: 'necklaces-pendants',
        count: list.filter((p) => p.category === 'necklaces-pendants').length,
      },
    ];
  }
}

describe('CatalogService Application Service — Project 925', () => {
  const p1 = new Product({
    id: 'p-1' as ProductId,
    slug: 'vajra-signet-ring',
    title: 'Vajra Signet Ring',
    description: 'Hand-carved .925 sterling silver signet with ancient Vajra motif',
    basePrice: Money.fromMajor(280, 'USD'),
    commerceModel: 'OM',
    category: 'rings',
    status: 'PUBLISHED',
  });

  const p2 = new Product({
    id: 'p-2' as ProductId,
    slug: 'garuda-heavy-cuff',
    title: 'Garuda Heavy Cuff',
    description: 'Solid .925 sterling silver open cuff with hand-chiseled feathering',
    basePrice: Money.fromMajor(420, 'USD'),
    commerceModel: 'DROP',
    category: 'bracelets-cuffs',
    status: 'PUBLISHED',
  });

  const mockRepo = new MockProductRepository([p1, p2]);
  const service = new CatalogService(mockRepo);

  it('filters catalog by category accurately', async () => {
    const result = await service.getCatalog({ category: 'rings' });
    assert.equal(result.totalCount, 1);
    assert.equal(result.products[0]?.slug, 'vajra-signet-ring');
    assert.equal(result.categoryCounts.length, 3);
  });

  it('filters catalog by commerce model accurately', async () => {
    const result = await service.getCatalog({ commerceModel: 'DROP' });
    assert.equal(result.totalCount, 1);
    assert.equal(result.products[0]?.slug, 'garuda-heavy-cuff');
  });

  it('retrieves product by slug', async () => {
    const item = await service.getProductBySlug('vajra-signet-ring');
    assert.ok(item);
    assert.equal(item?.title, 'Vajra Signet Ring');
  });

  it('returns related products excluding the current product', async () => {
    const related = await service.getRelatedProducts('p-1', 2);
    assert.equal(related.length, 1);
    assert.equal(related[0]?.id, 'p-2');
  });

  it('calculates category counts filtered by commerce model', async () => {
    const omCounts = await service.getCategoryCounts('OM');
    const ringsOm = omCounts.find((c) => c.category === 'rings');
    const cuffsOm = omCounts.find((c) => c.category === 'bracelets-cuffs');
    assert.equal(ringsOm?.count, 1);
    assert.equal(cuffsOm?.count, 0);

    const dropCounts = await service.getCategoryCounts('DROP');
    const ringsDrop = dropCounts.find((c) => c.category === 'rings');
    const cuffsDrop = dropCounts.find((c) => c.category === 'bracelets-cuffs');
    assert.equal(ringsDrop?.count, 0);
    assert.equal(cuffsDrop?.count, 1);
  });
});
