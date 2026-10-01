/**
 * Product commerce models, categories, and lifecycle statuses (JN-070).
 */

export type CommerceModel = 'OM' | 'DROP' | 'CUSTOM_ORDER' | 'PRE_ORDER';

export type ProductCategory = 'BOTTOMS' | 'TOPS' | 'ACCESSORIES';

export type ProductStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'SOLD_OUT' | 'ARCHIVED';

export type VariantStatus = 'AVAILABLE' | 'LOW_STOCK' | 'SOLD_OUT' | 'DISABLED' | 'ARCHIVED';

/**
 * Validates product lifecycle state transitions (JN-007).
 */
export function canTransitionProductStatus(current: ProductStatus, next: ProductStatus): boolean {
  if (current === next) return false;
  if (current === 'ARCHIVED') return false; // Archived products cannot transition

  switch (current) {
    case 'DRAFT':
      return next === 'SCHEDULED' || next === 'PUBLISHED' || next === 'ARCHIVED';
    case 'SCHEDULED':
      return next === 'PUBLISHED' || next === 'DRAFT' || next === 'ARCHIVED';
    case 'PUBLISHED':
      return next === 'SOLD_OUT' || next === 'ARCHIVED';
    case 'SOLD_OUT':
      return next === 'PUBLISHED' || next === 'ARCHIVED';
    default:
      return false;
  }
}

/**
 * Validates variant lifecycle state transitions (JN-008).
 */
export function canTransitionVariantStatus(current: VariantStatus, next: VariantStatus): boolean {
  if (current === next) return false;
  if (current === 'ARCHIVED') return false;

  switch (current) {
    case 'AVAILABLE':
      return (
        next === 'LOW_STOCK' || next === 'SOLD_OUT' || next === 'DISABLED' || next === 'ARCHIVED'
      );
    case 'LOW_STOCK':
      return (
        next === 'AVAILABLE' || next === 'SOLD_OUT' || next === 'DISABLED' || next === 'ARCHIVED'
      );
    case 'SOLD_OUT':
      return next === 'AVAILABLE' || next === 'ARCHIVED';
    case 'DISABLED':
      return next === 'AVAILABLE' || next === 'ARCHIVED';
    default:
      return false;
  }
}
