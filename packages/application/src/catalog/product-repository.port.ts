import type { Product } from '@jeanius/domain';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  listPublished(): Promise<readonly Product[]>;
  save?(product: Product): Promise<void>;
}
