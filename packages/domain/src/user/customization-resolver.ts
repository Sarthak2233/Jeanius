/**
 * Customization Auto-Fill Resolver (Project 925).
 * Pre-populates bespoke jewellery specifications from the customer's Sizing Vault
 * based on the target jewellery category (Rings, Bracelets/Cuffs, Necklaces, etc.).
 */
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
 * Resolves pre-populated customization defaults from a customer's Sizing Vault
 * for Kathmandu handcrafted .925 sterling silver commissions.
 */
export function resolveAtelierCustomizationDefaults(
  profile: UserProfile | null | undefined,
  context: AutoFillContext,
): ResolvedCustomizationDefaults {
  const { category, subcategory } = context;
  const normalizedCategory = category.toLowerCase().trim();

  const measurements: Record<string, string | number | boolean> = {};
  const materialPreferences: Record<string, string> = {};
  const requiredFields: string[] = [];

  let appliedFromVault = false;

  // Global alloy & finish defaults (.925 Sterling Silver)
  const alloy = profile?.preferredAlloy ?? 'STERLING_SILVER_925';
  materialPreferences['metalAlloy'] = alloy;
  materialPreferences['purity'] = '0.925';

  const finish = profile?.preferredFinish;
  if (finish) {
    materialPreferences['metalFinish'] = finish;
    appliedFromVault = true;
  }

  switch (normalizedCategory) {
    case 'rings':
    case 'ring': {
      requiredFields.push('ringSizeUs');
      const rings = profile?.rings;
      const ringSize = rings?.ringSizeUs ?? profile?.ringSizeUs;
      if (ringSize !== undefined) {
        measurements['ringSizeUs'] = ringSize;
        appliedFromVault = true;
      }
      const ringMandrel = rings?.ringMandrelMm ?? profile?.ringMandrelMm;
      if (ringMandrel !== undefined) {
        measurements['ringMandrelMm'] = ringMandrel;
      }
      if (rings?.insideDiameterMm !== undefined) {
        measurements['insideDiameterMm'] = rings.insideDiameterMm;
      }
      if (rings?.insideCircumferenceMm !== undefined) {
        measurements['insideCircumferenceMm'] = rings.insideCircumferenceMm;
      }
      if (rings?.knuckleClearanceMm !== undefined) {
        measurements['knuckleClearanceMm'] = rings.knuckleClearanceMm;
      }
      if (rings?.bandWidthMm !== undefined) {
        measurements['bandWidthMm'] = rings.bandWidthMm;
      }
      if (rings?.comfortFit !== undefined) {
        measurements['comfortFit'] = rings.comfortFit;
      }
      if (rings?.dominantHand !== undefined) {
        measurements['dominantHand'] = rings.dominantHand;
      }
      if (rings?.preferredFinger !== undefined) {
        measurements['preferredFinger'] = rings.preferredFinger;
      }
      break;
    }

    case 'bracelets-cuffs':
    case 'bracelets':
    case 'cuffs':
    case 'bracelet':
    case 'cuff': {
      requiredFields.push('wristCircumferenceInches');
      const wrists = profile?.wrists;
      const wristCirc = wrists?.wristCircumferenceInches ?? profile?.wristCircumferenceInches;
      if (wristCirc !== undefined) {
        measurements['wristCircumferenceInches'] = wristCirc;
        appliedFromVault = true;
      }
      if (wrists?.wristBreadthMm !== undefined) {
        measurements['wristBreadthMm'] = wrists.wristBreadthMm;
      }
      if (wrists?.wristThicknessMm !== undefined) {
        measurements['wristThicknessMm'] = wrists.wristThicknessMm;
      }
      if (wrists?.cuffGapMm !== undefined) {
        measurements['cuffGapMm'] = wrists.cuffGapMm;
      }
      if (wrists?.braceletFit !== undefined) {
        measurements['braceletFit'] = wrists.braceletFit;
      }
      break;
    }

    case 'necklaces-pendants':
    case 'necklaces':
    case 'necklace':
    case 'chains-links':
    case 'chains':
    case 'chain': {
      requiredFields.push('preferredChainLengthInches');
      const necklaces = profile?.necklaces;

      if (necklaces?.neckCircumferenceInches !== undefined) {
        measurements['neckCircumferenceInches'] = necklaces.neckCircumferenceInches;
        appliedFromVault = true;
      }
      if (necklaces?.preferredChainLengthInches !== undefined) {
        measurements['preferredChainLengthInches'] = necklaces.preferredChainLengthInches;
        appliedFromVault = true;
      }
      if (necklaces?.chainStyle !== undefined) {
        measurements['chainStyle'] = necklaces.chainStyle;
      }
      if (necklaces?.pendantDropMm !== undefined) {
        measurements['pendantDropMm'] = necklaces.pendantDropMm;
      }
      break;
    }

    default: {
      // Custom / generic categories (Earrings, Artefacts, etc.)
      // Always apply sterling silver material preferences
      break;
    }
  }

  const missingFields = requiredFields.filter((field) => measurements[field] === undefined);
  const isComplete = missingFields.length === 0;

  return {
    category,
    subcategory,
    measurements,
    materialPreferences,
    isComplete,
    missingFields,
    appliedFromVault,
  };
}
