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
        if (bottoms.gender !== undefined) measurements['gender'] = bottoms.gender;
        if (bottoms.measurementMethod !== undefined)
          measurements['measurementMethod'] = bottoms.measurementMethod;
        if (bottoms.waistInches !== undefined) {
          measurements['waistInches'] = bottoms.waistInches;
          appliedFromVault = true;
        }
        if (bottoms.waistFlatInches !== undefined)
          measurements['waistFlatInches'] = bottoms.waistFlatInches;
        if (bottoms.naturalWaistInches !== undefined)
          measurements['naturalWaistInches'] = bottoms.naturalWaistInches;
        if (bottoms.hipsInches !== undefined) measurements['hipsInches'] = bottoms.hipsInches;
        if (bottoms.hipsFlatInches !== undefined)
          measurements['hipsFlatInches'] = bottoms.hipsFlatInches;
        if (bottoms.inseamInches !== undefined) {
          measurements['inseamInches'] = bottoms.inseamInches;
          // Unsanforized raw selvedge shrinks 3% on initial wash; calculate master tailor cutting target
          measurements['rawCutInseamInches'] = Number((bottoms.inseamInches * 1.03).toFixed(2));
          appliedFromVault = true;
        }
        if (bottoms.outseamInches !== undefined)
          measurements['outseamInches'] = bottoms.outseamInches;
        if (bottoms.silhouette !== undefined) {
          measurements['silhouette'] = bottoms.silhouette;
          appliedFromVault = true;
        }
        if (bottoms.riseInches !== undefined) {
          measurements['riseInches'] = bottoms.riseInches;
          appliedFromVault = true;
        }
        if (bottoms.frontRiseInches !== undefined)
          measurements['frontRiseInches'] = bottoms.frontRiseInches;
        if (bottoms.backRiseInches !== undefined)
          measurements['backRiseInches'] = bottoms.backRiseInches;
        if (bottoms.crotchTotalInches !== undefined)
          measurements['crotchTotalInches'] = bottoms.crotchTotalInches;
        if (bottoms.risePreference !== undefined)
          measurements['risePreference'] = bottoms.risePreference;
        if (bottoms.thighInches !== undefined) {
          measurements['thighInches'] = bottoms.thighInches;
          appliedFromVault = true;
        }
        if (bottoms.thighFlatInches !== undefined)
          measurements['thighFlatInches'] = bottoms.thighFlatInches;
        if (bottoms.kneeInches !== undefined) {
          measurements['kneeInches'] = bottoms.kneeInches;
          appliedFromVault = true;
        }
        if (bottoms.kneeFlatInches !== undefined)
          measurements['kneeFlatInches'] = bottoms.kneeFlatInches;
        if (bottoms.legOpeningInches !== undefined) {
          measurements['legOpeningInches'] = bottoms.legOpeningInches;
          appliedFromVault = true;
        }
        if (bottoms.legOpeningFlatInches !== undefined)
          measurements['legOpeningFlatInches'] = bottoms.legOpeningFlatInches;
        if (bottoms.fitCut !== undefined) measurements['fitCut'] = bottoms.fitCut;
        if (bottoms.stomachProfile !== undefined)
          measurements['stomachProfile'] = bottoms.stomachProfile;
        if (bottoms.seatProfile !== undefined) measurements['seatProfile'] = bottoms.seatProfile;
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
        if (tops.gender !== undefined) measurements['gender'] = tops.gender;
        if (tops.measurementMethod !== undefined)
          measurements['measurementMethod'] = tops.measurementMethod;
        if (tops.chestInches !== undefined) {
          measurements['chestInches'] = tops.chestInches;
          appliedFromVault = true;
        }
        if (tops.chestFlatInches !== undefined)
          measurements['chestFlatInches'] = tops.chestFlatInches;
        if (tops.bustInches !== undefined) measurements['bustInches'] = tops.bustInches;
        if (tops.underBustInches !== undefined)
          measurements['underBustInches'] = tops.underBustInches;
        if (tops.breastPointInches !== undefined)
          measurements['breastPointInches'] = tops.breastPointInches;
        if (tops.waistPointInches !== undefined)
          measurements['waistPointInches'] = tops.waistPointInches;
        if (tops.frontBustWidthInches !== undefined)
          measurements['frontBustWidthInches'] = tops.frontBustWidthInches;
        if (tops.naturalWaistInches !== undefined)
          measurements['naturalWaistInches'] = tops.naturalWaistInches;
        if (tops.stomachInches !== undefined) measurements['stomachInches'] = tops.stomachInches;
        if (tops.shoulderWidthInches !== undefined) {
          measurements['shoulderWidthInches'] = tops.shoulderWidthInches;
          appliedFromVault = true;
        }
        if (tops.shoulderSeamInches !== undefined)
          measurements['shoulderSeamInches'] = tops.shoulderSeamInches;
        if (tops.sleeveLengthInches !== undefined) {
          measurements['sleeveLengthInches'] = tops.sleeveLengthInches;
          appliedFromVault = true;
        }
        if (tops.shortSleeveLengthInches !== undefined)
          measurements['shortSleeveLengthInches'] = tops.shortSleeveLengthInches;
        if (tops.bicepInches !== undefined) measurements['bicepInches'] = tops.bicepInches;
        if (tops.wristInches !== undefined) measurements['wristInches'] = tops.wristInches;
        if (tops.armholeInches !== undefined) measurements['armholeInches'] = tops.armholeInches;
        if (tops.collarInches !== undefined) measurements['collarInches'] = tops.collarInches;
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
          if (ring.insideDiameterMm !== undefined)
            measurements['insideDiameterMm'] = ring.insideDiameterMm;
          if (ring.insideCircumferenceMm !== undefined)
            measurements['insideCircumferenceMm'] = ring.insideCircumferenceMm;
          if (ring.ringMandrelMm !== undefined) {
            measurements['ringMandrelMm'] = ring.ringMandrelMm;
            appliedFromVault = true;
          }
          if (ring.knuckleClearanceMm !== undefined) {
            measurements['knuckleClearanceMm'] = ring.knuckleClearanceMm;
            appliedFromVault = true;
          }
          if (ring.bandWidthMm !== undefined) {
            measurements['bandWidthMm'] = ring.bandWidthMm;
            // Cigar bands >= 8mm require +0.5 US size compensation
            if (ring.bandWidthMm >= 8) {
              measurements['wideBandCompensationApplied'] = true;
            }
          }
          if (ring.comfortFit !== undefined) measurements['comfortFit'] = ring.comfortFit;
          if (ring.dominantHand !== undefined) measurements['dominantHand'] = ring.dominantHand;
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
          if (wrist.wristBreadthMm !== undefined)
            measurements['wristBreadthMm'] = wrist.wristBreadthMm;
          if (wrist.wristThicknessMm !== undefined)
            measurements['wristThicknessMm'] = wrist.wristThicknessMm;
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
