'use server';

import { db, atelierSettings, eq } from '@jeanius/database';
import { createLogger, generateTraceId } from '@jeanius/observability';
import { revalidatePath } from 'next/cache';

const logger = createLogger('admin:settings-actions');

export interface ActionResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: {
    readonly code: string;
    readonly message: string;
  };
}

export async function getAtelierSettingAction<T = unknown>(
  key: string,
): Promise<ActionResult<T | null>> {
  const traceId = generateTraceId();
  try {
    const [row] = await db
      .select()
      .from(atelierSettings)
      .where(eq(atelierSettings.key, key))
      .limit(1);

    return {
      success: true,
      data: (row?.value as T) ?? null,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch atelier setting';
    logger.error('Failed to get atelier setting', { traceId, key, error: errorMsg });
    return {
      success: false,
      error: { code: 'FETCH_FAILED', message: errorMsg },
    };
  }
}

export async function updateAtelierSettingAction(
  key: string,
  value: unknown,
  description?: string,
): Promise<ActionResult<{ updated: boolean }>> {
  const traceId = generateTraceId();
  logger.info('Updating atelier setting', { traceId, key, value });

  try {
    await db
      .insert(atelierSettings)
      .values({
        key,
        value,
        description,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: atelierSettings.key,
        set: {
          value,
          ...(description ? { description } : {}),
          updatedAt: new Date(),
        },
      });

    revalidatePath('/drop');
    revalidatePath('/shop');

    logger.info('Atelier setting updated successfully', { traceId, key });
    return {
      success: true,
      data: { updated: true },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update atelier setting';
    logger.error('Failed to update atelier setting', { traceId, key, error: errorMsg });
    return {
      success: false,
      error: { code: 'UPDATE_FAILED', message: errorMsg },
    };
  }
}
