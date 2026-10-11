import type { Product, CommerceModel } from '@jeanius/domain';
import { createLogger } from '@jeanius/observability';
import type {
  IProductRepository,
  ProductFilterCriteria,
  CatalogQueryResult,
  CategoryCount,
} from './product-repository.port.js';

export class CatalogService {
  private readonly logger = createLogger('application:catalog-service');

  constructor(private readonly productRepo: IProductRepository) {}

  async getCatalog(criteria: ProductFilterCriteria = {}): Promise<CatalogQueryResult> {
    const startTime = Date.now();
    this.logger.info('Executing catalog search query', {
      category: criteria.category ?? 'ALL',
      commerceModel: criteria.commerceModel ?? 'ALL',
      sortBy: criteria.sortBy ?? 'FEATURED',
      limit: criteria.limit,
      offset: criteria.offset,
    });

    try {
      const result = await this.productRepo.findFiltered(criteria);
      const durationMs = Date.now() - startTime;
      this.logger.info('Catalog search query completed', {
        returnedCount: result.products.length,
        totalCount: result.totalCount,
        durationMs,
      });
      return result;
    } catch (error) {
      this.logger.error('Catalog search query failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const startTime = Date.now();
    const product = await this.productRepo.findBySlug(slug);
    this.logger.debug('Product queried by slug', {
      slug,
      found: !!product,
      durationMs: Date.now() - startTime,
    });
    return product;
  }

  async getProductById(id: string): Promise<Product | null> {
    const startTime = Date.now();
    const product = await this.productRepo.findById(id);
    this.logger.debug('Product queried by id', {
      id,
      found: !!product,
      durationMs: Date.now() - startTime,
    });
    return product;
  }

  async getRelatedProducts(productId: string, limit: number = 4): Promise<readonly Product[]> {
    const startTime = Date.now();
    this.logger.debug('Fetching related products', { productId, limit });
    try {
      const related = await this.productRepo.findRelated(productId, limit);
      this.logger.debug('Related products fetched', {
        productId,
        count: related.length,
        durationMs: Date.now() - startTime,
      });
      return related;
    } catch (error) {
      this.logger.warn('Failed to fetch related products, falling back to empty list', {
        productId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  async getCategoryCounts(commerceModel?: CommerceModel): Promise<readonly CategoryCount[]> {
    return this.productRepo.getCategoriesWithCounts(commerceModel);
  }

  async listPublishedProducts(): Promise<readonly Product[]> {
    const startTime = Date.now();
    const products = await this.productRepo.listPublished();
    this.logger.debug('Listed published products', {
      count: products.length,
      durationMs: Date.now() - startTime,
    });
    return products;
  }
}
