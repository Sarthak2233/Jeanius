import type { Product, ProductCategory, CommerceModel, ProductStatus } from '@jeanius/domain';

export type ProductSortOption = 'FEATURED' | 'PRICE_ASC' | 'PRICE_DESC' | 'NEWEST' | 'TITLE_ASC';

export interface ProductFilterCriteria {
  readonly category?: ProductCategory | 'ALL';
  readonly commerceModel?: CommerceModel | 'ALL';
  readonly status?: ProductStatus | readonly ProductStatus[] | 'ALL';
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly searchQuery?: string;
  readonly sortBy?: ProductSortOption;
  readonly limit?: number;
  readonly offset?: number;
}

export interface CategoryCount {
  readonly category: ProductCategory;
  readonly count: number;
}

export interface CatalogQueryResult {
  readonly products: readonly Product[];
  readonly totalCount: number;
  readonly categoryCounts: readonly CategoryCount[];
}

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  listPublished(): Promise<readonly Product[]>;
  findFiltered(criteria: ProductFilterCriteria): Promise<CatalogQueryResult>;
  findRelated(productId: string, limit?: number): Promise<readonly Product[]>;
  getCategoriesWithCounts(commerceModel?: CommerceModel): Promise<readonly CategoryCount[]>;
  save?(product: Product): Promise<void>;
}
