import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createEntityId } from '../common/entity-id.js';
import { UserProfile } from './user-profile.entity.js';
import { resolveAtelierCustomizationDefaults } from './customization-resolver.js';

describe('Customization Auto-Fill Resolver (Atelier Measurements Vault)', () => {
  const fullProfile = new UserProfile({
    id: createEntityId<'UserProfile'>('usr_artisan_001'),
    email: 'collector@jeanius.co',
    fullName: 'Master Collector',
    role: 'CUSTOMER',
    createdAt: new Date(),
    updatedAt: new Date(),
    denimPreferences: {
      bottoms: {
        waistInches: 32,
        inseamInches: 34,
        riseInches: 11.5,
        thighInches: 24,
        kneeInches: 17,
        legOpeningInches: 15.5,
        silhouette: 'SLIM_TAPERED',
        hemAllowanceInches: 1.5,
      },
      tops: {
        chestInches: 42,
        shoulderWidthInches: 18.5,
        sleeveLengthInches: 25.5,
        backLengthInches: 27,
        neckInches: 16,
        fitPreference: 'BOXY',
      },
    },
    jewelleryPreferences: {
      rings: {
        ringSizeUs: 'US 10',
        ringMandrelMm: 19.8,
        knuckleClearanceMm: 21.0,
        preferredFinger: 'MIDDLE',
      },
      wrists: {
        wristCircumferenceInches: 7.25,
        cuffGapMm: 28,
        braceletFit: 'COMFORT',
      },
      necklaces: {
        neckCircumferenceInches: 16.5,
        preferredChainLengthInches: 22,
        chainStyle: 'ROPE',
      },
      metals: {
        preferredAlloy: 'STERLING_SILVER_925',
        preferredFinish: 'OXIDIZED_PATINA',
      },
    },
  });

  it('resolves bottoms (jeans) customization defaults with complete measurements', () => {
    const resolved = resolveAtelierCustomizationDefaults(fullProfile, {
      category: 'BOTTOMS',
      subcategory: 'JEANS',
    });

    assert.equal(resolved.category, 'BOTTOMS');
    assert.equal(resolved.subcategory, 'JEANS');
    assert.equal(resolved.appliedFromVault, true);
    assert.equal(resolved.isComplete, true);
    assert.equal(resolved.measurements['waistInches'], 32);
    assert.equal(resolved.measurements['inseamInches'], 34);
    assert.equal(resolved.measurements['silhouette'], 'SLIM_TAPERED');
    assert.equal(resolved.measurements['riseInches'], 11.5);
    assert.equal(resolved.measurements['thighInches'], 24);
    assert.equal(resolved.measurements['hemAllowanceInches'], 1.5);
    assert.equal(resolved.missingFields.length, 0);
  });

  it('resolves tops (denim jacket) customization defaults', () => {
    const resolved = resolveAtelierCustomizationDefaults(fullProfile, {
      category: 'TOPS',
      subcategory: 'TYPE_II_JACKET',
    });

    assert.equal(resolved.category, 'TOPS');
    assert.equal(resolved.appliedFromVault, true);
    assert.equal(resolved.isComplete, true);
    assert.equal(resolved.measurements['chestInches'], 42);
    assert.equal(resolved.measurements['shoulderWidthInches'], 18.5);
    assert.equal(resolved.measurements['sleeveLengthInches'], 25.5);
    assert.equal(resolved.measurements['fitPreference'], 'BOXY');
    assert.equal(resolved.missingFields.length, 0);
  });

  it('resolves jewellery ring defaults (mandrel, US size, alloy, finish)', () => {
    const resolved = resolveAtelierCustomizationDefaults(fullProfile, {
      category: 'JEWELLERY',
      subcategory: 'SIGNET_RING',
    });

    assert.equal(resolved.category, 'JEWELLERY');
    assert.equal(resolved.appliedFromVault, true);
    assert.equal(resolved.isComplete, true);
    assert.equal(resolved.measurements['ringSizeUs'], 'US 10');
    assert.equal(resolved.measurements['ringMandrelMm'], 19.8);
    assert.equal(resolved.measurements['preferredFinger'], 'MIDDLE');
    assert.equal(resolved.materialPreferences['preferredAlloy'], 'STERLING_SILVER_925');
    assert.equal(resolved.materialPreferences['preferredFinish'], 'OXIDIZED_PATINA');
    // Wrist and necklace measurements should NOT leak into ring config
    assert.equal(resolved.measurements['wristCircumferenceInches'], undefined);
  });

  it('resolves jewellery bracelet/cuff defaults', () => {
    const resolved = resolveAtelierCustomizationDefaults(fullProfile, {
      category: 'JEWELLERY',
      subcategory: 'SILVER_CUFF',
    });

    assert.equal(resolved.category, 'JEWELLERY');
    assert.equal(resolved.appliedFromVault, true);
    assert.equal(resolved.isComplete, true);
    assert.equal(resolved.measurements['wristCircumferenceInches'], 7.25);
    assert.equal(resolved.measurements['cuffGapMm'], 28);
    assert.equal(resolved.measurements['braceletFit'], 'COMFORT');
    assert.equal(resolved.materialPreferences['preferredAlloy'], 'STERLING_SILVER_925');
    assert.equal(resolved.measurements['ringSizeUs'], undefined);
  });

  it('resolves jewellery necklace/chain defaults', () => {
    const resolved = resolveAtelierCustomizationDefaults(fullProfile, {
      category: 'JEWELLERY',
      subcategory: 'PENDANT_CHAIN',
    });

    assert.equal(resolved.category, 'JEWELLERY');
    assert.equal(resolved.appliedFromVault, true);
    assert.equal(resolved.isComplete, true);
    assert.equal(resolved.measurements['preferredChainLengthInches'], 22);
    assert.equal(resolved.measurements['chainStyle'], 'ROPE');
    assert.equal(resolved.materialPreferences['preferredAlloy'], 'STERLING_SILVER_925');
  });

  it('resolves accessories belt with waist and hardware metal', () => {
    const resolved = resolveAtelierCustomizationDefaults(fullProfile, {
      category: 'ACCESSORIES',
      subcategory: 'LEATHER_BELT',
    });

    assert.equal(resolved.measurements['waistInches'], 32);
    assert.equal(resolved.materialPreferences['preferredAlloy'], 'STERLING_SILVER_925');
  });

  it('seamlessly resolves legacy flat profile records (backward compatibility)', () => {
    const legacyProfile = new UserProfile({
      id: createEntityId<'UserProfile'>('usr_legacy_002'),
      email: 'legacy@jeanius.co',
      fullName: 'Legacy Customer',
      role: 'CUSTOMER',
      createdAt: new Date(),
      updatedAt: new Date(),
      denimPreferences: {
        waistInches: 33,
        inseamInches: 32,
        silhouette: 'STRAIGHT',
        hemAllowanceInches: 1,
      },
      jewelleryPreferences: {
        ringSizeUs: 'US 9',
        ringMandrelMm: 19.0,
        preferredAlloy: 'SOLID_BRASS',
        preferredFinish: 'SATIN_MATTE',
      },
    });

    const bottomsResolved = resolveAtelierCustomizationDefaults(legacyProfile, {
      category: 'BOTTOMS',
      subcategory: 'JEANS',
    });
    assert.equal(bottomsResolved.measurements['waistInches'], 33);
    assert.equal(bottomsResolved.measurements['silhouette'], 'STRAIGHT');

    const ringResolved = resolveAtelierCustomizationDefaults(legacyProfile, {
      category: 'JEWELLERY',
      subcategory: 'RING',
    });
    assert.equal(ringResolved.measurements['ringSizeUs'], 'US 9');
    assert.equal(ringResolved.materialPreferences['preferredAlloy'], 'SOLID_BRASS');
  });

  it('gracefully handles unauthenticated/guest profiles with empty defaults and missing fields', () => {
    const resolved = resolveAtelierCustomizationDefaults(null, {
      category: 'BOTTOMS',
      subcategory: 'JEANS',
    });

    assert.equal(resolved.appliedFromVault, false);
    assert.equal(resolved.isComplete, false);
    assert.deepEqual(resolved.missingFields, ['waistInches', 'inseamInches', 'silhouette']);
    assert.deepEqual(resolved.measurements, {});
  });
});
