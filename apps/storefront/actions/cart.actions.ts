'use server';

import { db, DrizzleCartRepository } from '@jeanius/database';
import { CartService } from '@jeanius/application';
import {
  type CartDto,
  type CartItemDto,
  SyncCartInputSchema,
  MergeCartInputSchema,
} from '@jeanius/contracts';
import { createLogger, generateTraceId } from '@jeanius/observability';
import { type Cart, computeCartLineFingerprint } from '@jeanius/domain';
import { createClient } from '../lib/supabase/server';

const logger = createLogger('storefront:cart-actions');

export interface ActionResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: {
    readonly code: string;
    readonly message: string;
  };
}

function getCartService(): CartService {
  const repo = new DrizzleCartRepository(db);
  return new CartService(repo);
}

function mapCartToDto(cart: Cart): CartDto {
  const items: CartItemDto[] = cart.lines.map((line) => ({
    id: line.id,
    productId: line.productId,
    variantId: line.variantId ?? undefined,
    sku: `SKU-${line.productId.slice(0, 8)}`,
    title: line.productTitle,
    slug: line.productTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    commerceModel: line.commerceModel,
    unitPriceAmount: line.unitPrice.amount,
    unitPriceCurrency: line.unitPrice.currency,
    selectedOptions: { ...line.selectedOptions },
    customSpecifications: line.customSpecifications
      ? (line.customSpecifications as Record<string, string | number | boolean>)
      : undefined,
    quantity: line.quantity,
  }));

  return {
    id: cart.id,
    customerId: cart.customerId ?? null,
    items,
    totalCount: cart.itemCount(),
    subtotalAmount: cart.calculateSubtotal().amount,
    currency: cart.currency,
    updatedAt: cart.updatedAt.toISOString(),
  };
}

/**
 * Computes a deterministic identity fingerprint for a cart line.
 * Time: O(m log m) where m is option count (typically <= 5)
 */
export function computeLineItemFingerprint(item: {
  readonly productId: string;
  readonly variantId?: string | null;
  readonly selectedOptions?: Record<string, string>;
  readonly customSpecifications?: Record<string, unknown>;
}): string {
  return computeCartLineFingerprint(item);
}

/**
 * Pure function: merges guest cart items with existing server cart lines.
 * Time: O(n + m) using hash indexing (DSA Rule 6.1 and 6.3)
 */
export function mergeCartLinesPure(
  serverLines: readonly CartItemDto[],
  guestLines: readonly CartItemDto[],
): CartItemDto[] {
  const mergedMap = new Map<string, CartItemDto>();

  // 1. Index server lines
  for (const sLine of serverLines) {
    const fp = computeLineItemFingerprint(sLine);
    mergedMap.set(fp, { ...sLine });
  }

  // 2. Merge guest lines
  for (const gLine of guestLines) {
    const fp = computeLineItemFingerprint(gLine);
    const existing = mergedMap.get(fp);

    if (existing) {
      const combinedQty = Math.min(10, existing.quantity + gLine.quantity);
      mergedMap.set(fp, {
        ...existing,
        quantity: combinedQty,
      });
    } else {
      mergedMap.set(fp, { ...gLine });
    }
  }

  return Array.from(mergedMap.values());
}

/**
 * Fetch authenticated customer's server-persisted cart.
 */
export async function fetchServerCartAction(): Promise<ActionResult<CartDto | null>> {
  const traceId = generateTraceId();
  const startTime = Date.now();

  try {
    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      userId = null;
    }

    if (!userId) {
      return { success: true, data: null };
    }

    const service = getCartService();
    const cart = await service.getCartByCustomerId(userId);

    if (!cart) {
      return { success: true, data: null };
    }

    const cartDto = mapCartToDto(cart);

    logger.info('Server cart retrieved successfully', {
      traceId,
      userId,
      itemCount: cartDto.items.length,
      durationMs: Date.now() - startTime,
    });

    return { success: true, data: cartDto };
  } catch (error) {
    logger.warn('Failed to fetch server cart (falling back to client state)', {
      traceId,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startTime,
    });

    return {
      success: false,
      error: {
        code: 'DATABASE_OFFLINE',
        message: 'Server cart unavailable. Using local bag.',
      },
    };
  }
}

/**
 * Synchronize full client cart state to server for an authenticated collector.
 */
export async function syncCartWithServerAction(
  rawInput: unknown,
): Promise<ActionResult<CartDto | null>> {
  const traceId = generateTraceId();
  const startTime = Date.now();

  const parseResult = SyncCartInputSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid cart payload' },
    };
  }

  const { items } = parseResult.data;

  try {
    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      userId = null;
    }

    if (!userId) {
      // Unauthenticated visitor: cart remains client-side only
      return { success: true, data: null };
    }

    const service = getCartService();
    const cart = await service.syncCart(userId, items);
    const updatedDto = mapCartToDto(cart);

    logger.info('Server cart synchronized', {
      traceId,
      userId,
      itemCount: items.length,
      durationMs: Date.now() - startTime,
    });

    return { success: true, data: updatedDto };
  } catch (error) {
    logger.error('Failed to synchronize cart with server', {
      traceId,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startTime,
    });

    return {
      success: false,
      error: {
        code: 'CART_SYNC_ERROR',
        message: 'Could not sync cart with server. Changes saved locally.',
      },
    };
  }
}

/**
 * Deterministic guest-to-member cart merge action (JN-206).
 */
export async function mergeGuestCartAction(rawInput: unknown): Promise<ActionResult<CartDto>> {
  const traceId = generateTraceId();
  const startTime = Date.now();

  const parseResult = MergeCartInputSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid guest cart merge payload' },
    };
  }

  const { guestItems } = parseResult.data;

  try {
    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      userId = null;
    }

    if (!userId) {
      return {
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'User must be signed in to merge cart',
        },
      };
    }

    const service = getCartService();
    const mergedCart = await service.mergeGuestCart(userId, guestItems);
    const mergedDto = mapCartToDto(mergedCart);

    logger.info('Guest cart merged successfully with server', {
      traceId,
      userId,
      guestItemCount: guestItems.length,
      finalItemCount: mergedDto.items.length,
      totalCount: mergedDto.totalCount,
      durationMs: Date.now() - startTime,
    });

    return { success: true, data: mergedDto };
  } catch (error) {
    logger.error('Failed to merge guest cart with server', {
      traceId,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startTime,
    });

    return {
      success: false,
      error: {
        code: 'MERGE_FAILED',
        message: 'Could not merge cart lines. Preserving local state.',
      },
    };
  }
}
