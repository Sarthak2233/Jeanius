import type { Product } from '@jeanius/domain';
import { createLogger } from '@jeanius/observability';
import type { IProductRepository } from './product-repository.port';

export class CatalogService {
  private readonly logger = createLogger('catalog-service');

  constructor(private readonly productRepo: IProductRepository) {}

  async getProductBySlug(slug: string): Promise<Product | null> {
    const product = await this.productRepo.findBySlug(slug);
    this.logger.debug('Product queried by slug', { slug, found: !!product });
    return product;
  }

  async listPublishedProducts(): Promise<readonly Product[]> {
    const products = await this.productRepo.listPublished();
    this.logger.debug('Listed published products', { count: products.length });
    return products;
  }
}
