import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createEntityId } from '../common/entity-id.js';
import { UserProfile } from './user-profile.entity.js';
import { resolveAtelierCustomizationDefaults } from './customization-resolver.js';

describe('Customization Auto-Fill Resolver (Project 925 Sizing Vault)', () => {
  const fullProfile = new UserProfile({
    id: createEntityId<'UserProfile'>('usr_artisan_001'),
    email: 'collector@project925.co',
    fullName: 'Master Collector',
    role: 'CUSTOMER',
    createdAt: new Date(),
    updatedAt: new Date(),
    jewelleryPreferences: {
      rings: {
        ringSizeUs: 'US 10',
        ringMandrelMm: 19.8,
        knuckleClearanceMm: 21.0,
        preferredFinger: 'MIDDLE',
        comfortFit: true,
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

  it('resolves rings customization defaults with complete measurements', () => {
    const resolved = resolveAtelierCustomizationDefaults(fullProfile, {
      category: 'rings',
    });

    assert.equal(resolved.category, 'rings');
    assert.equal(resolved.isComplete, true);
    assert.equal(resolved.appliedFromVault, true);
    assert.equal(resolved.measurements['ringSizeUs'], 'US 10');
    assert.equal(resolved.measurements['ringMandrelMm'], 19.8);
    assert.equal(resolved.measurements['knuckleClearanceMm'], 21.0);
    assert.equal(resolved.measurements['comfortFit'], true);
    assert.equal(resolved.materialPreferences['metalAlloy'], 'STERLING_SILVER_925');
    assert.equal(resolved.materialPreferences['metalFinish'], 'OXIDIZED_PATINA');
    assert.equal(resolved.missingFields.length, 0);
  });

  it('resolves bracelets & cuffs customization defaults', () => {
    const resolved = resolveAtelierCustomizationDefaults(fullProfile, {
      category: 'bracelets-cuffs',
    });

    assert.equal(resolved.category, 'bracelets-cuffs');
    assert.equal(resolved.isComplete, true);
    assert.equal(resolved.appliedFromVault, true);
    assert.equal(resolved.measurements['wristCircumferenceInches'], 7.25);
    assert.equal(resolved.measurements['cuffGapMm'], 28);
    assert.equal(resolved.measurements['braceletFit'], 'COMFORT');
  });

  it('resolves necklaces and chains customization defaults', () => {
    const resolved = resolveAtelierCustomizationDefaults(fullProfile, {
      category: 'chains-links',
    });

    assert.equal(resolved.category, 'chains-links');
    assert.equal(resolved.isComplete, true);
    assert.equal(resolved.appliedFromVault, true);
    assert.equal(resolved.measurements['preferredChainLengthInches'], 22);
    assert.equal(resolved.measurements['chainStyle'], 'ROPE');
  });

  it('marks incomplete when user has empty profile for rings', () => {
    const emptyProfile = new UserProfile({
      id: createEntityId<'UserProfile'>('usr_empty_002'),
      email: 'empty@project925.co',
      fullName: 'New Visitor',
      role: 'CUSTOMER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const resolved = resolveAtelierCustomizationDefaults(emptyProfile, {
      category: 'rings',
    });

    assert.equal(resolved.isComplete, false);
    assert.ok(resolved.missingFields.includes('ringSizeUs'));
    assert.equal(resolved.appliedFromVault, false);
    // Default alloy is always STERLING_SILVER_925
    assert.equal(resolved.materialPreferences['metalAlloy'], 'STERLING_SILVER_925');
  });

  it('handles null profile gracefully for guest shoppers', () => {
    const resolved = resolveAtelierCustomizationDefaults(null, {
      category: 'rings',
    });

    assert.equal(resolved.appliedFromVault, false);
    assert.equal(resolved.isComplete, false);
    assert.ok(resolved.missingFields.includes('ringSizeUs'));
  });
});
