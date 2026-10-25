import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Address } from './address.vo.js';
import { DomainError } from '../errors/index.js';

describe('Address Value Object (JN-065, JN-227, JN-228, JN-229)', () => {
  const validDomestic = {
    fullName: 'Sarthak Sharma',
    addressLine1: 'Lazimpat Road 4',
    city: 'Kathmandu',
    postalCode: '44600',
    country: 'NP',
    phone: '+977-9801234567',
  };

  const validInternational = {
    fullName: 'John Doe',
    addressLine1: '742 Evergreen Terrace',
    city: 'Springfield',
    stateOrProvince: 'OR',
    postalCode: '97477',
    country: 'US',
    phone: '+1-555-123-4567',
  };

  it('validates presence of mandatory fields', () => {
    assert.throws(
      () => new Address({ ...validDomestic, fullName: '' }),
      (err: unknown) => err instanceof DomainError && err.message.includes('recipient name'),
    );
    assert.throws(
      () => new Address({ ...validDomestic, addressLine1: '' }),
      (err: unknown) => err instanceof DomainError && err.message.includes('Address line 1'),
    );
    assert.throws(
      () => new Address({ ...validDomestic, city: '' }),
      (err: unknown) => err instanceof DomainError && err.message.includes('City'),
    );
    assert.throws(
      () => new Address({ ...validDomestic, postalCode: '' }),
      (err: unknown) => err instanceof DomainError && err.message.includes('Postal/ZIP'),
    );
    assert.throws(
      () => new Address({ ...validDomestic, phone: '' }),
      (err: unknown) => err instanceof DomainError && err.message.includes('Contact phone'),
    );
  });

  it('correctly identifies international destinations', () => {
    const domestic = new Address(validDomestic);
    const international = new Address(validInternational);
    assert.strictEqual(domestic.isInternational('NP'), false);
    assert.strictEqual(international.isInternational('NP'), true);
  });

  it('identifies APO/FPO/DPO military base addresses (JN-228)', () => {
    const apoAddress = new Address({
      fullName: 'Sgt. Miller',
      addressLine1: 'PSC 802 Box 1234',
      city: 'APO',
      stateOrProvince: 'AE',
      postalCode: '09494',
      country: 'US',
      phone: '+1-555-019-2834',
    });
    assert.strictEqual(apoAddress.isMilitaryAddress(), true);

    const check = apoAddress.checkDeliverability();
    assert.strictEqual(check.isDeliverable, false);
    assert.match(check.reason ?? '', /cannot deliver to APO\/FPO\/DPO/);

    const normalUs = new Address(validInternational);
    assert.strictEqual(normalUs.isMilitaryAddress(), false);
    assert.strictEqual(normalUs.checkDeliverability().isDeliverable, true);
  });

  it('rejects trade-restricted and embargoed destinations (JN-227)', () => {
    const embargoedAddress = new Address({
      fullName: 'Test Recipient',
      addressLine1: 'Street 1',
      city: 'Havana',
      postalCode: '10100',
      country: 'CU',
      phone: '+53-7-123456',
    });
    const check = embargoedAddress.checkDeliverability();
    assert.strictEqual(check.isDeliverable, false);
    assert.match(check.reason ?? '', /trade-restricted/);
  });

  it('rejects unsupported country codes (JN-227)', () => {
    const unsupported = new Address({
      fullName: 'Test Recipient',
      addressLine1: 'Street 1',
      city: 'Unknown City',
      postalCode: '99999',
      country: 'ZZ',
      phone: '+99-999-9999',
    });
    const check = unsupported.checkDeliverability();
    assert.strictEqual(check.isDeliverable, false);
    assert.match(check.reason ?? '', /not available to destination country code ZZ/);
  });

  it('calculates shipping tariffs correctly (JN-229)', () => {
    const domestic = new Address(validDomestic);
    const international = new Address(validInternational);

    // Domestic Nepal is always free ($0)
    assert.strictEqual(domestic.calculateShippingCost(10000).amount, 0);

    // International below $300 is $25.00 flat (2500 cents)
    const below300 = international.calculateShippingCost(29900);
    assert.strictEqual(below300.amount, 2500);

    // International at or above $300 is free ($0)
    const at300 = international.calculateShippingCost(30000);
    assert.strictEqual(at300.amount, 0);

    const above300 = international.calculateShippingCost(58000);
    assert.strictEqual(above300.amount, 0);
  });
});
