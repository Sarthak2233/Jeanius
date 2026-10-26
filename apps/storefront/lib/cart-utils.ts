import type { CartItemDto } from '@jeanius/contracts';
import { computeCartLineFingerprint } from '@jeanius/domain';

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
