'use server';

import { db, usersProfile, atelierSettings, orders, eq, and, count } from '@jeanius/database';
import { createLogger, generateTraceId } from '@jeanius/observability';
import { createClient } from '../lib/supabase/server';

const logger = createLogger('storefront:membership-actions');

export type DropAccessReason =
  | 'GUEST'
  | 'QUALIFICATION_REQUIRED'
  | 'PROMOTED_ZERO_THRESHOLD'
  | 'PROMOTED_MILESTONE'
  | 'ACTIVE_MEMBER';

export interface DropAccessResult {
  readonly allowed: boolean;
  readonly reason: DropAccessReason;
  readonly role?: string;
  readonly currentOrders?: number;
  readonly requiredOrders?: number;
  readonly message?: string;
}

export interface ActionResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: {
    readonly code: string;
    readonly message: string;
  };
}

/**
 * Server-side authorization check for /drop access.
 * Enforces State 21 member gating policy with admin-controllable thresholds and grandfathered persistence.
 */
export async function checkDropAccessAction(): Promise<DropAccessResult> {
  const traceId = generateTraceId();
  logger.info('Checking drop access authorization', { traceId });

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 1. Mandatory Account Prerequisite: Unauthenticated guests are strictly blocked
    if (!user) {
      logger.info('Drop access denied: unauthenticated guest', { traceId });
      return {
        allowed: false,
        reason: 'GUEST',
        message: 'An authenticated collector profile is required to unlock numbered vault drops.',
      };
    }

    // 2. Fetch authenticated customer profile
    const [profile] = await db
      .select()
      .from(usersProfile)
      .where(eq(usersProfile.id, user.id))
      .limit(1);

    const userRole = profile?.role ?? 'CUSTOMER';

    // 3. Grandfathered / Existing Member Check
    // If the collector already has MEMBER or ADMIN or workshop staff role, they are permanently unlocked.
    if (
      userRole === 'MEMBER' ||
      userRole === 'ADMIN' ||
      userRole === 'JEWELLER' ||
      userRole === 'FULFILLMENT'
    ) {
      logger.info('Drop access granted: verified member/staff role', {
        traceId,
        userId: user.id,
        role: userRole,
      });
      return {
        allowed: true,
        reason: 'ACTIVE_MEMBER',
        role: userRole,
      };
    }

    // 4. Fetch dynamic qualification threshold from workshop settings
    const [settingRow] = await db
      .select()
      .from(atelierSettings)
      .where(eq(atelierSettings.key, 'member_om_order_threshold'))
      .limit(1);

    const threshold = typeof settingRow?.value === 'number' ? settingRow.value : 2;

    // 5. If Admin set threshold to 0:
    // Any authenticated customer immediately qualifies and is permanently promoted to 'MEMBER'.
    // Even if admin later raises threshold, this customer remains 'MEMBER' and is grandfathered in.
    if (threshold === 0) {
      await db
        .update(usersProfile)
        .set({ role: 'MEMBER', updatedAt: new Date() })
        .where(eq(usersProfile.id, user.id));

      logger.info('Drop access granted: customer permanently elevated via zero threshold', {
        traceId,
        userId: user.id,
      });

      return {
        allowed: true,
        reason: 'PROMOTED_ZERO_THRESHOLD',
        role: 'MEMBER',
      };
    }

    // 6. Threshold N > 0: Check completed bespoke Order-Made orders
    const [orderCountResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(and(eq(orders.customerId, user.id), eq(orders.paymentStatus, 'PAID')));

    const paidOrdersCount = Number(orderCountResult?.count ?? 0);

    if (paidOrdersCount >= threshold) {
      // Completed qualification milestone: permanently elevate role to MEMBER
      await db
        .update(usersProfile)
        .set({ role: 'MEMBER', updatedAt: new Date() })
        .where(eq(usersProfile.id, user.id));

      logger.info('Drop access granted: customer permanently elevated via OM milestone', {
        traceId,
        userId: user.id,
        paidOrdersCount,
        threshold,
      });

      return {
        allowed: true,
        reason: 'PROMOTED_MILESTONE',
        role: 'MEMBER',
      };
    }

    // 7. Threshold not met: User sees VIP Member Privilege Gate with progress
    logger.info('Drop access gated: qualification required', {
      traceId,
      userId: user.id,
      paidOrdersCount,
      threshold,
    });

    return {
      allowed: false,
      reason: 'QUALIFICATION_REQUIRED',
      role: 'CUSTOMER',
      currentOrders: paidOrdersCount,
      requiredOrders: threshold,
      message: `VIP Member privilege required. Complete ${threshold - paidOrdersCount} more bespoke Order-Made commission(s) to unlock vault drops.`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown authorization error';
    logger.error('Error during drop access authorization', { traceId, error: errorMsg });
    return {
      allowed: false,
      reason: 'GUEST',
      message: 'Unable to verify membership authorization. Please sign in.',
    };
  }
}

/**
 * Redeem an atelier invitation token to immediately unlock VIP MEMBER status.
 */
export async function redeemInviteTokenAction(
  token: string,
): Promise<ActionResult<{ success: boolean; message: string }>> {
  const traceId = generateTraceId();
  logger.info('Redeeming atelier invite token', {
    traceId,
    tokenMasked: token.slice(0, 4) + '...',
  });

  try {
    const normalized = token.trim().toUpperCase();
    const VALID_TOKENS = ['VIP-ATELIER-925', 'KATHMANDU-MEMBER', 'GUILD-PATRON-2026'];

    if (!VALID_TOKENS.includes(normalized)) {
      return {
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'The atelier invitation token is invalid or has already expired.',
        },
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Please sign in or register an account before redeeming an invitation token.',
        },
      };
    }

    // Elevate user role to MEMBER permanently
    await db
      .update(usersProfile)
      .set({ role: 'MEMBER', updatedAt: new Date() })
      .where(eq(usersProfile.id, user.id));

    logger.info('Collector successfully elevated to MEMBER via token', {
      traceId,
      userId: user.id,
    });

    return {
      success: true,
      data: {
        success: true,
        message: 'VIP Collector membership activated. Vault access is now unlocked.',
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to redeem token';
    logger.error('Error redeeming token', { traceId, error: errorMsg });
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: errorMsg,
      },
    };
  }
}
