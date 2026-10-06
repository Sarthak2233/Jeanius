import type { ProductCategory } from '../catalog/product-type.js';
import type { UserProfile } from './user-profile.entity.js';

export interface AutoFillContext {
  readonly category: ProductCategory;
  readonly subcategory?: string;
}

export interface ResolvedCustomizationDefaults {
  readonly category: ProductCategory;
  readonly subcategory?: string;
  readonly measurements: Record<string, string | number | boolean>;
  readonly materialPreferences: Record<string, string>;
  readonly isComplete: boolean;
  readonly missingFields: readonly string[];
  readonly appliedFromVault: boolean;
}

/**
 * Resolves pre-populated customization defaults from a customer's Atelier Vault
 * based on the target product category and subcategory.
 */
export function resolveAtelierCustomizationDefaults(
  profile: UserProfile | null | undefined,
  context: AutoFillContext,
): ResolvedCustomizationDefaults {
  const { category, subcategory } = context;
  const normalizedSub = subcategory?.trim().toUpperCase();

  const measurements: Record<string, string | number | boolean> = {};
  const materialPreferences: Record<string, string> = {};
  const requiredFields: string[] = [];

  let appliedFromVault = false;

  switch (category) {
    case 'BOTTOMS': {
      requiredFields.push('waistInches', 'inseamInches', 'silhouette');
      const bottoms = profile?.bottomsPreferences;

      if (bottoms) {
        if (bottoms.waistInches !== undefined) {
          measurements['waistInches'] = bottoms.waistInches;
          appliedFromVault = true;
        }
        if (bottoms.inseamInches !== undefined) {
          measurements['inseamInches'] = bottoms.inseamInches;
          appliedFromVault = true;
        }
        if (bottoms.silhouette !== undefined) {
          measurements['silhouette'] = bottoms.silhouette;
          appliedFromVault = true;
        }
        if (bottoms.riseInches !== undefined) {
          measurements['riseInches'] = bottoms.riseInches;
          appliedFromVault = true;
        }
        if (bottoms.thighInches !== undefined) {
          measurements['thighInches'] = bottoms.thighInches;
          appliedFromVault = true;
        }
        if (bottoms.kneeInches !== undefined) {
          measurements['kneeInches'] = bottoms.kneeInches;
          appliedFromVault = true;
        }
        if (bottoms.legOpeningInches !== undefined) {
          measurements['legOpeningInches'] = bottoms.legOpeningInches;
          appliedFromVault = true;
        }
        if (bottoms.hemAllowanceInches !== undefined) {
          measurements['hemAllowanceInches'] = bottoms.hemAllowanceInches;
          appliedFromVault = true;
        }
      }
      break;
    }

    case 'TOPS': {
      requiredFields.push('chestInches', 'sleeveLengthInches', 'fitPreference');
      const tops = profile?.topsPreferences;

      if (tops) {
        if (tops.chestInches !== undefined) {
          measurements['chestInches'] = tops.chestInches;
          appliedFromVault = true;
        }
        if (tops.shoulderWidthInches !== undefined) {
          measurements['shoulderWidthInches'] = tops.shoulderWidthInches;
          appliedFromVault = true;
        }
        if (tops.sleeveLengthInches !== undefined) {
          measurements['sleeveLengthInches'] = tops.sleeveLengthInches;
          appliedFromVault = true;
        }
        if (tops.backLengthInches !== undefined) {
          measurements['backLengthInches'] = tops.backLengthInches;
          appliedFromVault = true;
        }
        if (tops.neckInches !== undefined) {
          measurements['neckInches'] = tops.neckInches;
          appliedFromVault = true;
        }
        if (tops.fitPreference !== undefined) {
          measurements['fitPreference'] = tops.fitPreference;
          appliedFromVault = true;
        }
      }
      break;
    }

    case 'JEWELLERY': {
      // Common metallurgy preferences across all jewellery
      requiredFields.push('preferredAlloy');
      const metals = profile?.metalPreferences;
      if (metals) {
        if (metals.preferredAlloy !== undefined) {
          materialPreferences['preferredAlloy'] = metals.preferredAlloy;
          appliedFromVault = true;
        }
        if (metals.preferredFinish !== undefined) {
          materialPreferences['preferredFinish'] = metals.preferredFinish;
          appliedFromVault = true;
        }
      }

      // Zone-specific resolution based on subcategory
      const isRing = !normalizedSub || normalizedSub.includes('RING');
      const isBracelet =
        normalizedSub?.includes('BRACELET') ||
        normalizedSub?.includes('CUFF') ||
        normalizedSub?.includes('BANGLE');
      const isNecklace =
        normalizedSub?.includes('NECKLACE') ||
        normalizedSub?.includes('CHAIN') ||
        normalizedSub?.includes('PENDANT');

      if (isRing) {
        requiredFields.push('ringSizeUs');
        const ring = profile?.ringPreferences;
        if (ring) {
          if (ring.ringSizeUs !== undefined) {
            measurements['ringSizeUs'] = ring.ringSizeUs;
            appliedFromVault = true;
          }
          if (ring.ringMandrelMm !== undefined) {
            measurements['ringMandrelMm'] = ring.ringMandrelMm;
            appliedFromVault = true;
          }
          if (ring.knuckleClearanceMm !== undefined) {
            measurements['knuckleClearanceMm'] = ring.knuckleClearanceMm;
            appliedFromVault = true;
          }
          if (ring.preferredFinger !== undefined) {
            measurements['preferredFinger'] = ring.preferredFinger;
            appliedFromVault = true;
          }
        }
      }

      if (isBracelet) {
        requiredFields.push('wristCircumferenceInches');
        const wrist = profile?.wristPreferences;
        if (wrist) {
          if (wrist.wristCircumferenceInches !== undefined) {
            measurements['wristCircumferenceInches'] = wrist.wristCircumferenceInches;
            appliedFromVault = true;
          }
          if (wrist.cuffGapMm !== undefined) {
            measurements['cuffGapMm'] = wrist.cuffGapMm;
            appliedFromVault = true;
          }
          if (wrist.braceletFit !== undefined) {
            measurements['braceletFit'] = wrist.braceletFit;
            appliedFromVault = true;
          }
        }
      }

      if (isNecklace) {
        requiredFields.push('preferredChainLengthInches');
        const necklace = profile?.necklacePreferences;
        if (necklace) {
          if (necklace.neckCircumferenceInches !== undefined) {
            measurements['neckCircumferenceInches'] = necklace.neckCircumferenceInches;
            appliedFromVault = true;
          }
          if (necklace.preferredChainLengthInches !== undefined) {
            measurements['preferredChainLengthInches'] = necklace.preferredChainLengthInches;
            appliedFromVault = true;
          }
          if (necklace.chainStyle !== undefined) {
            measurements['chainStyle'] = necklace.chainStyle;
            appliedFromVault = true;
          }
        }
      }
      break;
    }

    case 'ACCESSORIES': {
      // Belts resolve to waist; Silver hardware resolves to metals
      if (normalizedSub?.includes('BELT')) {
        requiredFields.push('waistInches');
        const waist = profile?.bottomsPreferences?.waistInches;
        if (waist !== undefined) {
          measurements['waistInches'] = waist;
          appliedFromVault = true;
        }
      }
      const metals = profile?.metalPreferences;
      if (metals?.preferredAlloy) {
        materialPreferences['preferredAlloy'] = metals.preferredAlloy;
        appliedFromVault = true;
      }
      break;
    }
  }

  // Calculate missing fields
  const missingFields = requiredFields.filter((field) => {
    return measurements[field] === undefined && materialPreferences[field] === undefined;
  });

  return {
    category,
    subcategory,
    measurements,
    materialPreferences,
    isComplete: missingFields.length === 0,
    missingFields,
    appliedFromVault,
  };
}
