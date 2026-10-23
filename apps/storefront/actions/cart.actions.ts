'use server';

import { db, carts, cartLines, eq } from '@jeanius/database';
import {
  type CartDto,
  type CartItemDto,
  SyncCartInputSchema,
  MergeCartInputSchema,
} from '@jeanius/contracts';
import { createLogger, generateTraceId } from '@jeanius/observability';
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
  const optKey = Object.entries(item.selectedOptions ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('|');

  const specKey = Object.entries(item.customSpecifications ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${String(v)}`)
    .join('|');

  return `${item.productId}:${item.variantId ?? 'none'}:${optKey}:${specKey}`;
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

    const cartRecords = await db.select().from(carts).where(eq(carts.customerId, userId)).limit(1);

    if (cartRecords.length === 0) {
      return { success: true, data: null };
    }

    const currentCart = cartRecords[0]!;
    const rawLines = await db.select().from(cartLines).where(eq(cartLines.cartId, currentCart.id));

    const items: CartItemDto[] = rawLines.map((line) => ({
      id: line.id,
      productId: line.productId,
      variantId: line.variantId ?? undefined,
      sku: `SKU-${line.productId.slice(0, 8)}`,
      title: line.productTitle,
      slug: line.productTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      commerceModel: line.commerceModel as 'OM' | 'DROP' | 'CUSTOM_ORDER' | 'PRE_ORDER',
      unitPriceAmount: line.unitPriceAmount,
      unitPriceCurrency: line.unitPriceCurrency,
      selectedOptions: (line.selectedOptions as Record<string, string>) ?? {},
      customSpecifications: line.customSpecifications as
        Record<string, string | number | boolean> | undefined,
      quantity: line.quantity,
    }));

    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotalAmount = items.reduce(
      (sum, item) => sum + item.unitPriceAmount * item.quantity,
      0,
    );

    const cartDto: CartDto = {
      id: currentCart.id,
      customerId: userId,
      items,
      totalCount,
      subtotalAmount,
      currency: currentCart.currency,
      updatedAt: currentCart.updatedAt.toISOString(),
    };

    logger.info('Server cart retrieved successfully', {
      traceId,
      userId,
      itemCount: items.length,
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

    // Find or create cart for user
    const existingCarts = await db
      .select()
      .from(carts)
      .where(eq(carts.customerId, userId))
      .limit(1);

    let cartId: string;
    if (existingCarts.length === 0) {
      const [newCart] = await db
        .insert(carts)
        .values({
          customerId: userId,
          currency: items[0]?.unitPriceCurrency ?? 'USD',
        })
        .returning();
      cartId = newCart!.id;
    } else {
      cartId = existingCarts[0]!.id;
    }

    // Replace lines in transaction
    await db.delete(cartLines).where(eq(cartLines.cartId, cartId));

    if (items.length > 0) {
      await db.insert(cartLines).values(
        items.map((item) => ({
          cartId,
          productId: item.productId,
          variantId: item.variantId ?? null,
          productTitle: item.title,
          commerceModel: item.commerceModel,
          unitPriceAmount: item.unitPriceAmount,
          unitPriceCurrency: item.unitPriceCurrency,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions,
          customSpecifications: item.customSpecifications,
        })),
      );
    }

    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotalAmount = items.reduce(
      (sum, item) => sum + item.unitPriceAmount * item.quantity,
      0,
    );

    const updatedDto: CartDto = {
      id: cartId,
      customerId: userId,
      items,
      totalCount,
      subtotalAmount,
      currency: items[0]?.unitPriceCurrency ?? 'USD',
      updatedAt: new Date().toISOString(),
    };

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
        error: { code: 'UNAUTHORIZED', message: 'Authentication required to merge cart' },
      };
    }

    // 1. Retrieve or create server cart
    const existingCarts = await db
      .select()
      .from(carts)
      .where(eq(carts.customerId, userId))
      .limit(1);

    let cartId: string;
    if (existingCarts.length === 0) {
      const [newCart] = await db
        .insert(carts)
        .values({
          customerId: userId,
          currency: guestItems[0]?.unitPriceCurrency ?? 'USD',
        })
        .returning();
      cartId = newCart!.id;
    } else {
      cartId = existingCarts[0]!.id;
    }

    // 2. Fetch existing server lines
    const rawServerLines = await db.select().from(cartLines).where(eq(cartLines.cartId, cartId));

    const serverItems: CartItemDto[] = rawServerLines.map((line) => ({
      id: line.id,
      productId: line.productId,
      variantId: line.variantId ?? undefined,
      sku: `SKU-${line.productId.slice(0, 8)}`,
      title: line.productTitle,
      slug: line.productTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      commerceModel: line.commerceModel as 'OM' | 'DROP' | 'CUSTOM_ORDER' | 'PRE_ORDER',
      unitPriceAmount: line.unitPriceAmount,
      unitPriceCurrency: line.unitPriceCurrency,
      selectedOptions: (line.selectedOptions as Record<string, string>) ?? {},
      customSpecifications: line.customSpecifications as
        Record<string, string | number | boolean> | undefined,
      quantity: line.quantity,
    }));

    // 3. Execute pure deterministic merge algorithm
    const mergedItems = mergeCartLinesPure(serverItems, guestItems);

    // 4. Overwrite cart_lines with canonical merged set
    await db.delete(cartLines).where(eq(cartLines.cartId, cartId));

    if (mergedItems.length > 0) {
      await db.insert(cartLines).values(
        mergedItems.map((item) => ({
          cartId,
          productId: item.productId,
          variantId: item.variantId ?? null,
          productTitle: item.title,
          commerceModel: item.commerceModel,
          unitPriceAmount: item.unitPriceAmount,
          unitPriceCurrency: item.unitPriceCurrency,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions,
          customSpecifications: item.customSpecifications,
        })),
      );
    }

    const totalCount = mergedItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotalAmount = mergedItems.reduce(
      (sum, item) => sum + item.unitPriceAmount * item.quantity,
      0,
    );

    const mergedDto: CartDto = {
      id: cartId,
      customerId: userId,
      items: mergedItems,
      totalCount,
      subtotalAmount,
      currency: mergedItems[0]?.unitPriceCurrency ?? 'USD',
      updatedAt: new Date().toISOString(),
    };

    logger.info('Guest cart successfully merged with member cart', {
      traceId,
      userId,
      guestLineCount: guestItems.length,
      serverLineCount: serverItems.length,
      mergedLineCount: mergedItems.length,
      durationMs: Date.now() - startTime,
    });

    return { success: true, data: mergedDto };
  } catch (error) {
    logger.error('Failed to merge guest cart with server cart', {
      traceId,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startTime,
    });

    // In case of error (e.g. database offline), perform client-side pure merge fallback
    const fallbackMerged = mergeCartLinesPure([], guestItems);
    const totalCount = fallbackMerged.reduce((sum, item) => sum + item.quantity, 0);
    const subtotalAmount = fallbackMerged.reduce(
      (sum, item) => sum + item.unitPriceAmount * item.quantity,
      0,
    );

    return {
      success: true,
      data: {
        id: 'fallback-cart',
        customerId: null,
        items: fallbackMerged,
        totalCount,
        subtotalAmount,
        currency: fallbackMerged[0]?.unitPriceCurrency ?? 'USD',
        updatedAt: new Date().toISOString(),
      },
    };
  }
}
