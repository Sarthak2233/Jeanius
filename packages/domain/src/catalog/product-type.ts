/**
 * Product commerce models, categories, and lifecycle statuses (JN-070).
 */

export type CommerceModel = 'OM' | 'DROP' | 'CUSTOM_ORDER' | 'PRE_ORDER';

export interface BuiltInCategory {
  readonly slug: string;
  readonly name: string;
  readonly description: string;
}

export const BUILT_IN_CATEGORIES: readonly BuiltInCategory[] = [
  { slug: 'rings', name: 'Rings', description: 'Signet, Solitaire, and Chiseled Mandrel Rings' },
  {
    slug: 'bracelets',
    name: 'Bracelets & Cuffs',
    description: 'Hand-Forged Torques and Solid Silver Cuffs',
  },
  {
    slug: 'necklaces',
    name: 'Necklaces & Pendants',
    description: 'Cast Amulets, Reliquaries, and Chokers',
  },
  {
    slug: 'earrings',
    name: 'Earrings & Studs',
    description: 'Brutalist Hoops, Cast Studs, and Ear Cuffs',
  },
  {
    slug: 'chains',
    name: 'Chains & Links',
    description: 'Heavy Curb, Anchor, and Figaro Silver Links',
  },
  {
    slug: 'artefacts',
    name: 'Artefacts & Silverware',
    description: 'Hand-Beaten Ceremonial Silverware and Vessels',
  },
] as const;

export type BuiltInCategorySlug =
  'rings' | 'bracelets' | 'necklaces' | 'earrings' | 'chains' | 'artefacts';

export type ProductCategory = BuiltInCategorySlug | (string & {});

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
