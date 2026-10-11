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
      { category: 'BOTTOMS', count: this.products.filter((p) => p.category === 'BOTTOMS').length },
      { category: 'TOPS', count: this.products.filter((p) => p.category === 'TOPS').length },
      {
        category: 'JEWELLERY',
        count: this.products.filter((p) => p.category === 'JEWELLERY').length,
      },
      {
        category: 'ACCESSORIES',
        count: this.products.filter((p) => p.category === 'ACCESSORIES').length,
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
      { category: 'BOTTOMS', count: list.filter((p) => p.category === 'BOTTOMS').length },
      { category: 'TOPS', count: list.filter((p) => p.category === 'TOPS').length },
      { category: 'JEWELLERY', count: list.filter((p) => p.category === 'JEWELLERY').length },
      { category: 'ACCESSORIES', count: list.filter((p) => p.category === 'ACCESSORIES').length },
    ];
  }
}

describe('CatalogService Application Service (JN-168 → JN-177)', () => {
  const p1 = new Product({
    id: 'p-1' as ProductId,
    slug: 'lot-001',
    title: 'Lot 001 Jeans',
    description: 'Selvedge denim jeans',
    basePrice: Money.fromMajor(280, 'USD'),
    commerceModel: 'OM',
    category: 'BOTTOMS',
    status: 'PUBLISHED',
  });

  const p2 = new Product({
    id: 'p-2' as ProductId,
    slug: 'lot-j01',
    title: 'Lot J01 Signet Ring',
    description: 'Solid sterling silver ring',
    basePrice: Money.fromMajor(180, 'USD'),
    commerceModel: 'DROP',
    category: 'JEWELLERY',
    status: 'PUBLISHED',
  });

  const mockRepo = new MockProductRepository([p1, p2]);
  const service = new CatalogService(mockRepo);

  it('filters catalog by category accurately', async () => {
    const result = await service.getCatalog({ category: 'BOTTOMS' });
    assert.equal(result.totalCount, 1);
    assert.equal(result.products[0]?.slug, 'lot-001');
    assert.equal(result.categoryCounts.length, 4);
  });

  it('filters catalog by commerce model accurately', async () => {
    const result = await service.getCatalog({ commerceModel: 'DROP' });
    assert.equal(result.totalCount, 1);
    assert.equal(result.products[0]?.slug, 'lot-j01');
  });

  it('retrieves product by slug', async () => {
    const item = await service.getProductBySlug('lot-001');
    assert.ok(item);
    assert.equal(item?.title, 'Lot 001 Jeans');
  });

  it('returns related products excluding the current product', async () => {
    const related = await service.getRelatedProducts('p-1', 2);
    assert.equal(related.length, 1);
    assert.equal(related[0]?.id, 'p-2');
  });

  it('calculates category counts filtered by commerce model', async () => {
    const omCounts = await service.getCategoryCounts('OM');
    const bottomsOm = omCounts.find((c) => c.category === 'BOTTOMS');
    const jewelleryOm = omCounts.find((c) => c.category === 'JEWELLERY');
    assert.equal(bottomsOm?.count, 1);
    assert.equal(jewelleryOm?.count, 0);

    const dropCounts = await service.getCategoryCounts('DROP');
    const bottomsDrop = dropCounts.find((c) => c.category === 'BOTTOMS');
    const jewelleryDrop = dropCounts.find((c) => c.category === 'JEWELLERY');
    assert.equal(bottomsDrop?.count, 0);
    assert.equal(jewelleryDrop?.count, 1);
  });
});
