import type { Product } from '@jeanius/domain';
import type { IProductRepository } from './product-repository.port';

export class CatalogService {
  constructor(private readonly productRepo: IProductRepository) {}

  async getProductBySlug(slug: string): Promise<Product | null> {
    return this.productRepo.findBySlug(slug);
  }

  async listPublishedProducts(): Promise<readonly Product[]> {
    return this.productRepo.listPublished();
  }
}
