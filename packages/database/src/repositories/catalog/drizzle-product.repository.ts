import {
  eq,
  and,
  or,
  inArray,
  gte,
  lte,
  ilike,
  asc,
  desc,
  count,
  sql,
  type SQL,
} from 'drizzle-orm';
import {
  Product,
  Money,
  ProductVariant,
  type ProductOption,
  type ProductId,
  type VariantId,
  type VariantStatus,
  type Currency,
  type CommerceModel,
  type ProductCategory,
  type ProductStatus,
  type ProductImageVo,
  BUILT_IN_CATEGORIES,
} from '@jeanius/domain';
import type {
  IProductRepository,
  ProductFilterCriteria,
  CatalogQueryResult,
  CategoryCount,
} from '@jeanius/application';
import { createLogger } from '@jeanius/observability';
import { db, type Database } from '../../client.js';
import { products, productImages, productVariants, categories } from '../../schema/catalog.js';

export class DrizzleProductRepository implements IProductRepository {
  private readonly logger = createLogger('database:product-repository');

  constructor(private readonly database: Database = db) {}

  async findById(id: string): Promise<Product | null> {
    const result = await this.database.select().from(products).where(eq(products.id, id)).limit(1);

    const row = result[0];
    if (!row) {
      this.logger.debug('Product not found by ID', { id });
      return null;
    }

    const [imagesMap, optionsMap, variantsMap] = await Promise.all([
      this.fetchImagesForProducts([row.id]),
      this.fetchOptionsForProducts([row.id]),
      this.fetchVariantsForProducts([row.id]),
    ]);

    return this.mapToDomain(
      row,
      imagesMap.get(row.id) ?? [],
      optionsMap.get(row.id) ?? [],
      variantsMap.get(row.id) ?? [],
    );
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const normalizedSlug = slug.trim().toLowerCase();
    const result = await this.database
      .select()
      .from(products)
      .where(eq(products.slug, normalizedSlug))
      .limit(1);

    const row = result[0];
    if (!row) {
      this.logger.debug('Product not found by slug', { slug: normalizedSlug });
      return null;
    }

    const [imagesMap, optionsMap, variantsMap] = await Promise.all([
      this.fetchImagesForProducts([row.id]),
      this.fetchOptionsForProducts([row.id]),
      this.fetchVariantsForProducts([row.id]),
    ]);

    return this.mapToDomain(
      row,
      imagesMap.get(row.id) ?? [],
      optionsMap.get(row.id) ?? [],
      variantsMap.get(row.id) ?? [],
    );
  }

  async listPublished(): Promise<readonly Product[]> {
    const rows = await this.database
      .select()
      .from(products)
      .where(eq(products.status, 'PUBLISHED'))
      .orderBy(desc(products.createdAt));

    if (rows.length === 0) return [];

    const imagesMap = await this.fetchImagesForProducts(rows.map((r) => r.id));
    return rows.map((row) => this.mapToDomain(row, imagesMap.get(row.id) ?? []));
  }

  async findFiltered(criteria: ProductFilterCriteria): Promise<CatalogQueryResult> {
    const startTime = Date.now();
    const conditions: SQL[] = [];

    // 1. Category filter
    if (criteria.category && criteria.category !== 'ALL') {
      conditions.push(eq(products.category, criteria.category));
    }

    // 2. Commerce Model filter
    if (criteria.commerceModel && criteria.commerceModel !== 'ALL') {
      conditions.push(eq(products.commerceModel, criteria.commerceModel));
    }

    // 3. Status filter (by default, only public-facing statuses: PUBLISHED, SOLD_OUT, SCHEDULED)
    if (criteria.status && criteria.status !== 'ALL') {
      if (Array.isArray(criteria.status)) {
        conditions.push(inArray(products.status, criteria.status as ProductStatus[]));
      } else {
        conditions.push(eq(products.status, criteria.status as ProductStatus));
      }
    } else {
      conditions.push(inArray(products.status, ['PUBLISHED', 'SOLD_OUT', 'SCHEDULED']));
    }

    // 4. Price range
    if (criteria.minPrice !== undefined) {
      conditions.push(gte(products.basePriceAmount, criteria.minPrice));
    }
    if (criteria.maxPrice !== undefined) {
      conditions.push(lte(products.basePriceAmount, criteria.maxPrice));
    }

    // 5. Search query
    if (criteria.searchQuery?.trim()) {
      const queryPattern = `%${criteria.searchQuery.trim()}%`;
      conditions.push(
        or(ilike(products.title, queryPattern), ilike(products.description, queryPattern))!,
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Determine Sort Order
    const orderByClause = this.resolveOrderBy(criteria.sortBy);

    // Run parallel count & data queries (DSA Performance rule 6.6)
    const [countResult, rows, categoryCounts] = await Promise.all([
      this.database
        .select({ value: count(products.id) })
        .from(products)
        .where(whereClause),
      this.database
        .select()
        .from(products)
        .where(whereClause)
        .orderBy(...orderByClause)
        .limit(criteria.limit ?? 12)
        .offset(criteria.offset ?? 0),
      this.getCategoriesWithCounts(
        criteria.commerceModel && criteria.commerceModel !== 'ALL'
          ? criteria.commerceModel
          : undefined,
      ),
    ]);

    const totalCount = Number(countResult[0]?.value ?? 0);

    if (rows.length === 0) {
      return {
        products: [],
        totalCount,
        categoryCounts,
      };
    }

    // Batch fetch images to prevent N+1 queries
    const imagesMap = await this.fetchImagesForProducts(rows.map((r) => r.id));
    const domainProducts = rows.map((row) => this.mapToDomain(row, imagesMap.get(row.id) ?? []));

    this.logger.debug('findFiltered query completed', {
      totalCount,
      returnedCount: domainProducts.length,
      durationMs: Date.now() - startTime,
    });

    return {
      products: domainProducts,
      totalCount,
      categoryCounts,
    };
  }

  async findRelated(productId: string, limit: number = 4): Promise<readonly Product[]> {
    const target = await this.findById(productId);
    if (!target) return [];

    // Cross-craft curation heuristic:
    // If target is BOTTOMS, recommend complementary JEWELLERY or ACCESSORIES first.
    // If target is JEWELLERY, recommend BOTTOMS or other JEWELLERY pieces.
    const priorityCategory: ProductCategory =
      target.category === 'BOTTOMS'
        ? 'JEWELLERY'
        : target.category === 'JEWELLERY'
          ? 'BOTTOMS'
          : 'JEWELLERY';

    const relatedRows = await this.database
      .select()
      .from(products)
      .where(
        and(
          inArray(products.status, ['PUBLISHED', 'SCHEDULED']),
          sql`${products.id} != ${productId}`,
        ),
      )
      .orderBy(
        sql`CASE WHEN ${products.category} = ${priorityCategory} THEN 0 ELSE 1 END`,
        desc(products.createdAt),
      )
      .limit(limit);

    if (relatedRows.length === 0) return [];

    const imagesMap = await this.fetchImagesForProducts(relatedRows.map((r) => r.id));
    return relatedRows.map((row) => this.mapToDomain(row, imagesMap.get(row.id) ?? []));
  }

  async getCategoriesWithCounts(commerceModel?: CommerceModel): Promise<readonly CategoryCount[]> {
    const conditions: SQL[] = [inArray(products.status, ['PUBLISHED', 'SOLD_OUT', 'SCHEDULED'])];

    if (commerceModel) {
      conditions.push(eq(products.commerceModel, commerceModel));
    }

    const aggregateRows = await this.database
      .select({
        category: products.category,
        count: count(products.id),
      })
      .from(products)
      .where(and(...conditions))
      .groupBy(products.category);

    const countsMap = new Map<ProductCategory, number>(
      aggregateRows.map((r) => [r.category as ProductCategory, Number(r.count)]),
    );

    // Query active categories from database, with fallback to BUILT_IN_CATEGORIES
    const dbCategories = await this.database
      .select({ slug: categories.slug })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder));

    const categorySlugs =
      dbCategories.length > 0
        ? dbCategories.map((c) => c.slug)
        : BUILT_IN_CATEGORIES.map((c) => c.slug);

    const allSlugs = Array.from(new Set([...categorySlugs, ...countsMap.keys()]));

    return allSlugs.map((cat) => ({
      category: cat,
      count: countsMap.get(cat) ?? 0,
    }));
  }

  async save(product: Product): Promise<void> {
    await this.database
      .insert(products)
      .values({
        id: product.id,
        slug: product.slug,
        title: product.title,
        description: product.description,
        basePriceAmount: product.basePrice.amount,
        basePriceCurrency: product.basePrice.currency,
        commerceModel: product.commerceModel,
        category: product.category,
        status: product.status,
        publishAt: product.publishAt,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      })
      .onConflictDoUpdate({
        target: products.id,
        set: {
          slug: product.slug,
          title: product.title,
          description: product.description,
          basePriceAmount: product.basePrice.amount,
          basePriceCurrency: product.basePrice.currency,
          commerceModel: product.commerceModel,
          category: product.category,
          status: product.status,
          publishAt: product.publishAt,
          updatedAt: product.updatedAt,
        },
      });
  }

  private resolveOrderBy(sortBy?: ProductFilterCriteria['sortBy']): SQL[] {
    switch (sortBy) {
      case 'PRICE_ASC':
        return [asc(products.basePriceAmount)];
      case 'PRICE_DESC':
        return [desc(products.basePriceAmount)];
      case 'NEWEST':
        return [desc(products.createdAt)];
      case 'TITLE_ASC':
        return [asc(products.title)];
      case 'FEATURED':
      default:
        return [
          sql`CASE 
            WHEN ${products.status} = 'PUBLISHED' THEN 0 
            WHEN ${products.status} = 'SCHEDULED' THEN 1 
            ELSE 2 
          END`,
          desc(products.createdAt),
        ];
    }
  }

  private async fetchImagesForProducts(
    productIds: readonly string[],
  ): Promise<Map<string, ProductImageVo[]>> {
    if (productIds.length === 0) return new Map();

    const imageRows = await this.database
      .select()
      .from(productImages)
      .where(inArray(productImages.productId, [...productIds]))
      .orderBy(asc(productImages.position));

    const map = new Map<string, ProductImageVo[]>();

    for (const row of imageRows) {
      const list = map.get(row.productId) ?? [];
      list.push({
        id: row.id,
        url: row.url,
        altText: row.altText,
        position: row.position,
        isPrimary: row.isPrimary,
        width: row.width ?? undefined,
        height: row.height ?? undefined,
      });
      map.set(row.productId, list);
    }

    return map;
  }

  private async fetchOptionsForProducts(
    _productIds: readonly string[],
  ): Promise<Map<string, ProductOption[]>> {
    return new Map();
  }

  private async fetchVariantsForProducts(
    productIds: readonly string[],
  ): Promise<Map<string, ProductVariant[]>> {
    if (productIds.length === 0) return new Map();

    const variantRows = await this.database
      .select()
      .from(productVariants)
      .where(inArray(productVariants.productId, [...productIds]));

    const map = new Map<string, ProductVariant[]>();
    for (const row of variantRows) {
      const list = map.get(row.productId) ?? [];
      list.push(
        new ProductVariant({
          id: row.id as VariantId,
          productId: row.productId as ProductId,
          sku: row.sku,
          options: (row.options as Record<string, string>) ?? {},
          additionalPrice: new Money(
            row.additionalPriceAmount,
            row.additionalPriceCurrency as Currency,
          ),
          inventoryCount: row.inventoryCount,
          status: row.status as VariantStatus,
        }),
      );
      map.set(row.productId, list);
    }

    return map;
  }

  private mapToDomain(
    row: typeof products.$inferSelect,
    images: readonly ProductImageVo[] = [],
    options: readonly ProductOption[] = [],
    variants: readonly ProductVariant[] = [],
  ): Product {
    return new Product({
      id: row.id as ProductId,
      slug: row.slug,
      title: row.title,
      description: row.description,
      basePrice: new Money(row.basePriceAmount, row.basePriceCurrency as Currency),
      commerceModel: row.commerceModel as CommerceModel,
      category: row.category as ProductCategory,
      status: row.status as ProductStatus,
      leadTimeDaysMin: row.leadTimeDaysMin,
      leadTimeDaysMax: row.leadTimeDaysMax,
      inputSpecifications: row.inputSpecifications as Record<string, unknown> | undefined,
      priceRules: row.priceRules as Array<Record<string, unknown>> | undefined,
      publishAt: row.publishAt ? new Date(row.publishAt) : undefined,
      images,
      options,
      variants,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }
}
