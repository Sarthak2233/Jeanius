'use server';

import { db, DrizzleProductRepository } from '@jeanius/database';
import { CatalogService, type ProductFilterCriteria } from '@jeanius/application';
import {
  CatalogFilterCriteriaSchema,
  type CatalogPageDto,
  type ProductCardDto,
} from '@jeanius/contracts';
import { createLogger, generateTraceId } from '@jeanius/observability';
import type { Product } from '@jeanius/domain';
import { createClient } from '../lib/supabase/server';

const logger = createLogger('storefront:catalog-actions');

export interface ActionResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: {
    readonly code: string;
    readonly message: string;
  };
}

function getCatalogService(): CatalogService {
  const repo = new DrizzleProductRepository(db);
  return new CatalogService(repo);
}

function mapProductToCardDto(p: Product): ProductCardDto {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    basePriceAmount: p.basePrice.amount,
    basePriceCurrency: p.basePrice.currency,
    commerceModel: p.commerceModel,
    category: p.category,
    status: p.status,
    publishAt: p.publishAt ? p.publishAt.toISOString() : undefined,
    primaryImage: p.primaryImage
      ? {
          id: p.primaryImage.id,
          url: p.primaryImage.url,
          altText: p.primaryImage.altText,
          position: p.primaryImage.position ?? 0,
          isPrimary: p.primaryImage.isPrimary ?? false,
          width: p.primaryImage.width,
          height: p.primaryImage.height,
        }
      : undefined,
    images: p.images.map((img) => ({
      id: img.id,
      url: img.url,
      altText: img.altText,
      position: img.position ?? 0,
      isPrimary: img.isPrimary ?? false,
      width: img.width,
      height: img.height,
    })),
  };
}

export async function getCatalogAction(
  rawParams: unknown = {},
): Promise<ActionResult<CatalogPageDto>> {
  const traceId = generateTraceId();
  const startTime = Date.now();

  const parseResult = CatalogFilterCriteriaSchema.safeParse(rawParams);
  if (!parseResult.success) {
    logger.warn('Invalid catalog query parameters', {
      traceId,
      errors: parseResult.error.format(),
    });
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid catalog filter parameters',
      },
    };
  }

  const criteria = parseResult.data;
  logger.info('Fetching catalog page', {
    traceId,
    category: criteria.category,
    commerceModel: criteria.commerceModel,
    sortBy: criteria.sortBy,
    page: criteria.page,
  });

  try {
    // Member access control: DROP products require authentication (JN-173, Spec Section 23 & 42)
    let isAuthenticated = false;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      isAuthenticated = Boolean(user);
    } catch {
      // In non-request/test environments, fallback to unauthenticated
      isAuthenticated = false;
    }

    if (criteria.commerceModel === 'DROP' && !isAuthenticated) {
      logger.warn('Unauthenticated request for member-only DROP catalog rejected', { traceId });
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Limited Drop products are accessible to registered members only.',
        },
      };
    }

    // Force OM for unauthenticated callers requesting 'ALL' to avoid data leakage
    const effectiveCommerceModel =
      !isAuthenticated && criteria.commerceModel === 'ALL' ? 'OM' : criteria.commerceModel;

    const service = getCatalogService();
    const limit = criteria.pageSize;
    const offset = (criteria.page - 1) * limit;

    const domainCriteria: ProductFilterCriteria = {
      category: criteria.category,
      commerceModel: effectiveCommerceModel,
      status: criteria.status,
      minPrice: criteria.minPrice,
      maxPrice: criteria.maxPrice,
      searchQuery: criteria.searchQuery,
      sortBy: criteria.sortBy,
      limit,
      offset,
    };

    const queryResult = await service.getCatalog(domainCriteria);
    const totalPages = Math.ceil(queryResult.totalCount / limit);

    const dto: CatalogPageDto = {
      products: queryResult.products.map(mapProductToCardDto),
      totalCount: queryResult.totalCount,
      page: criteria.page,
      pageSize: criteria.pageSize,
      totalPages,
      categoryCounts: queryResult.categoryCounts.map((c) => ({
        category: c.category,
        count: c.count,
      })),
      selectedCategory: criteria.category,
      selectedCommerceModel: criteria.commerceModel,
      selectedSort: criteria.sortBy,
    };

    const durationMs = Date.now() - startTime;
    logger.info('Catalog page resolved successfully', {
      traceId,
      returnedCount: dto.products.length,
      totalCount: dto.totalCount,
      durationMs,
    });

    return {
      success: true,
      data: dto,
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logger.error('Failed to resolve catalog page', {
      traceId,
      error: error instanceof Error ? error.message : String(error),
      durationMs,
    });

    return {
      success: false,
      error: {
        code: 'CATALOG_ERROR',
        message: 'Unable to retrieve catalog products. Please try again.',
      },
    };
  }
}

export async function getProductBySlugAction(slug: string): Promise<ActionResult<ProductCardDto>> {
  const traceId = generateTraceId();
  const startTime = Date.now();

  try {
    const service = getCatalogService();
    const product = await service.getProductBySlug(slug);

    if (!product) {
      logger.warn('Product not found by slug', { traceId, slug });
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: `Product "${slug}" was not found.` },
      };
    }

    if (product.commerceModel === 'DROP') {
      let isAuthenticated = false;
      try {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        isAuthenticated = Boolean(user);
      } catch {
        isAuthenticated = false;
      }

      if (!isAuthenticated) {
        logger.warn('Unauthenticated access blocked for member-only DROP product slug', {
          traceId,
          slug,
        });
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Limited Drop pieces are reserved for registered collectors. Please sign in.',
          },
        };
      }
    }

    return {
      success: true,
      data: mapProductToCardDto(product),
    };
  } catch (error) {
    logger.error('Failed to resolve product by slug', {
      traceId,
      slug,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startTime,
    });

    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Unable to fetch product details.' },
    };
  }
}

export async function getRelatedProductsAction(
  productId: string,
  limit: number = 4,
): Promise<ActionResult<readonly ProductCardDto[]>> {
  const traceId = generateTraceId();
  try {
    const service = getCatalogService();
    const related = await service.getRelatedProducts(productId, limit);

    let isAuthenticated = false;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      isAuthenticated = Boolean(user);
    } catch {
      isAuthenticated = false;
    }

    // Filter out DROP products if the visitor is not authenticated
    const safeRelated = isAuthenticated
      ? related
      : related.filter((p) => p.commerceModel !== 'DROP');

    return {
      success: true,
      data: safeRelated.map(mapProductToCardDto),
    };
  } catch (error) {
    logger.warn('Failed to retrieve related products', {
      traceId,
      productId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: true,
      data: [],
    };
  }
}

export async function getDropCatalogAction(
  rawParams: unknown = {},
): Promise<ActionResult<CatalogPageDto>> {
  const params =
    typeof rawParams === 'object' && rawParams !== null
      ? { ...rawParams, commerceModel: 'DROP' }
      : { commerceModel: 'DROP' };
  return getCatalogAction(params);
}
