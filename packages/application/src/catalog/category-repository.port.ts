import type { Category } from '@jeanius/domain';

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  listAll(): Promise<readonly Category[]>;
  listActive(): Promise<readonly Category[]>;
  save(category: Category): Promise<void>;
  delete(id: string): Promise<void>;
}
