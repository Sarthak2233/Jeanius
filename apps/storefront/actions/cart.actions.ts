'use server';

import { db, DrizzleCartRepository, DrizzleProductRepository } from '@jeanius/database';
import { CartService } from '@jeanius/application';
import {
  type CartDto,
  type CartItemDto,
  type ValidatedCartDto,
  SyncCartInputSchema,
  MergeCartInputSchema,
  AddToCartInputSchema,
  UpdateCartItemQuantitySchema,
  RemoveCartItemSchema,
  ValidateCartInputSchema,
} from '@jeanius/contracts';
import { createLogger, generateTraceId } from '@jeanius/observability';
import { type Cart } from '@jeanius/domain';
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
  const productRepo = new DrizzleProductRepository(db);
  return new CartService(repo, productRepo);
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

/**
 * Server-authoritative cart recalculation & stock validation action (JN-214, JN-215, JN-216, JN-217).
 */
export async function validateAndRecalculateCartAction(
  rawInput?: unknown,
): Promise<ActionResult<ValidatedCartDto>> {
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

    let itemsToValidate: CartItemDto[] = [];

    if (rawInput) {
      const parseResult = ValidateCartInputSchema.safeParse(rawInput);
      if (parseResult.success) {
        itemsToValidate = parseResult.data.items;
      }
    }

    const service = getCartService();

    // If authenticated and no items supplied, fetch from server cart
    if (userId && itemsToValidate.length === 0) {
      const existing = await service.getCartByCustomerId(userId);
      if (existing) {
        itemsToValidate = mapCartToDto(existing).items;
      }
    }

    const validatedResult = await service.validateAndRecalculateCart(
      itemsToValidate,
      userId ?? undefined,
    );

    logger.info('Cart validated and recalculated via server action', {
      traceId,
      userId: userId ?? undefined,
      itemCount: validatedResult.items.length,
      warningsCount: validatedResult.warnings.length,
      durationMs: Date.now() - startTime,
    });

    return { success: true, data: validatedResult };
  } catch (error) {
    logger.error('Failed to validate and recalculate cart', {
      traceId,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startTime,
    });

    return {
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Could not validate cart totals against catalog.',
      },
    };
  }
}

/**
 * Add item to server-persisted cart for authenticated collectors (JN-211).
 */
export async function addItemToCartAction(rawInput: unknown): Promise<ActionResult<CartDto>> {
  const traceId = generateTraceId();
  const startTime = Date.now();

  const parseResult = AddToCartInputSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid item payload' },
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: { code: 'UNAUTHENTICATED', message: 'User must be signed in' },
      };
    }

    const service = getCartService();
    const cart = await service.addItem(user.id, parseResult.data);
    const cartDto = mapCartToDto(cart);

    logger.info('Item added to cart via server action', {
      traceId,
      userId: user.id,
      productId: parseResult.data.productId,
      durationMs: Date.now() - startTime,
    });

    return { success: true, data: cartDto };
  } catch (error) {
    logger.error('Failed to add item to cart', {
      traceId,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startTime,
    });

    return {
      success: false,
      error: { code: 'ADD_ITEM_FAILED', message: 'Could not add item to cart' },
    };
  }
}

/**
 * Update cart item quantity action (JN-212).
 */
export async function updateCartItemQuantityAction(
  rawInput: unknown,
): Promise<ActionResult<CartDto>> {
  const traceId = generateTraceId();
  const startTime = Date.now();

  const parseResult = UpdateCartItemQuantitySchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid quantity payload' },
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: { code: 'UNAUTHENTICATED', message: 'User must be signed in' },
      };
    }

    const service = getCartService();
    const cart = await service.updateLineQuantity(
      user.id,
      parseResult.data.lineId,
      parseResult.data.quantity,
    );
    const cartDto = mapCartToDto(cart);

    return { success: true, data: cartDto };
  } catch (error) {
    logger.error('Failed to update cart line quantity', {
      traceId,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startTime,
    });

    return {
      success: false,
      error: { code: 'UPDATE_QUANTITY_FAILED', message: 'Could not update line quantity' },
    };
  }
}

/**
 * Remove cart item action (JN-213).
 */
export async function removeCartItemAction(rawInput: unknown): Promise<ActionResult<CartDto>> {
  const traceId = generateTraceId();
  const startTime = Date.now();

  const parseResult = RemoveCartItemSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid removal payload' },
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: { code: 'UNAUTHENTICATED', message: 'User must be signed in' },
      };
    }

    const service = getCartService();
    const cart = await service.removeLine(user.id, parseResult.data.lineId);
    const cartDto = mapCartToDto(cart);

    return { success: true, data: cartDto };
  } catch (error) {
    logger.error('Failed to remove cart line', {
      traceId,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startTime,
    });

    return {
      success: false,
      error: { code: 'REMOVE_ITEM_FAILED', message: 'Could not remove line from cart' },
    };
  }
}

/**
 * Clear customer cart action.
 */
export async function clearCartAction(): Promise<ActionResult<void>> {
  const traceId = generateTraceId();
  const startTime = Date.now();

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const service = getCartService();
      await service.clearCart(user.id);
    }

    return { success: true };
  } catch (error) {
    logger.error('Failed to clear cart', {
      traceId,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startTime,
    });

    return {
      success: false,
      error: { code: 'CLEAR_FAILED', message: 'Could not clear cart' },
    };
  }
}
