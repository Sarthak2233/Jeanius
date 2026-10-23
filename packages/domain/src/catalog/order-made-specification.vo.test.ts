import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  OrderMadeSpecification,
  type OrderMadeInputSchema,
} from './order-made-specification.vo.js';
import { DomainError } from '../errors/index.js';

describe('OrderMadeSpecification Value Object', () => {
  const sampleRingSchema: OrderMadeInputSchema = {
    metalPurity: '.925 Sterling Silver',
    ringSize: {
      minSizeUs: 4,
      maxSizeUs: 15,
      stepUs: 0.25,
      defaultSizeUs: 10,
      wideShankOffsetAllowed: true,
    },
    engraving: {
      allowed: true,
      maxCharacters: 20,
      priceDeltaAmount: 0,
    },
    patina: {
      allowedFinishes: [
        {
          code: 'OXIDIZED_CHARCOAL',
          label: 'Oxidized Charcoal Patina',
          description: 'Dark antique finish',
          priceDeltaAmount: 0,
          isDefault: true,
        },
        {
          code: 'MIRROR_POLISH',
          label: 'Mirror High Polish',
          description: 'Brilliant lustre',
          priceDeltaAmount: 1500,
        },
      ],
    },
  };

  it('validates quarter-increment ring size and calculates mandrel mm', () => {
    const spec = new OrderMadeSpecification(sampleRingSchema);
    const result = spec.validateCustomerInput({
      ringSizeUs: 10.25,
      patinaFinish: 'OXIDIZED_CHARCOAL',
    });

    assert.equal(result.effectiveRingSizeUs, 10.25);
    assert.equal(result.wideShankApplied, false);
    // Mandrel formula: 11.63 + (10.25 * 0.8128) = 19.96 -> round to 20.0
    assert.equal(result.mandrelMm, 20.0);
    assert.equal(result.totalSurchargeAmount, 0);
  });

  it('applies +0.5 wide shank compensator offset when requested', () => {
    const spec = new OrderMadeSpecification(sampleRingSchema);
    const result = spec.validateCustomerInput({
      ringSizeUs: 9.5,
      applyWideShankCompensator: true,
      patinaFinish: 'OXIDIZED_CHARCOAL',
    });

    assert.equal(result.effectiveRingSizeUs, 10.0);
    assert.equal(result.wideShankApplied, true);
    // Mandrel formula: 11.63 + (10.0 * 0.8128) = 19.76 -> 19.8
    assert.equal(result.mandrelMm, 19.8);
  });

  it('throws DomainError when ring size is out of bounds', () => {
    const spec = new OrderMadeSpecification(sampleRingSchema);
    assert.throws(
      () =>
        spec.validateCustomerInput({
          ringSizeUs: 18,
          patinaFinish: 'OXIDIZED_CHARCOAL',
        }),
      (err: unknown) =>
        err instanceof DomainError && err.message.includes('outside workshop bounds'),
    );
  });

  it('validates engraving text and enforces character limit', () => {
    const spec = new OrderMadeSpecification(sampleRingSchema);
    const result = spec.validateCustomerInput({
      ringSizeUs: 10,
      engravingText: 'ktm · 1984',
      patinaFinish: 'OXIDIZED_CHARCOAL',
    });

    assert.equal(result.formattedEngraving, 'KTM · 1984');
  });

  it('calculates dynamic surcharges for premium patina finishes and price rules', () => {
    const spec = new OrderMadeSpecification(sampleRingSchema, [
      {
        inputKey: 'chainLengthInches',
        condition: 'GREATER_THAN',
        threshold: 22,
        surchargeAmount: 3000,
        reason: 'Heavy silver bullion surcharge',
      },
    ]);

    const result = spec.validateCustomerInput({
      ringSizeUs: 10,
      patinaFinish: 'MIRROR_POLISH',
      chainLengthInches: 24,
    });

    // 1500 (mirror polish) + 3000 (chain > 22") = 4500 cents
    assert.equal(result.totalSurchargeAmount, 4500);
  });
});
