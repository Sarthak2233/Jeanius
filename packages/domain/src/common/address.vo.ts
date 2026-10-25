/**
 * Physical Shipping & Billing Address Value Object (JN-065).
 * Validates international postal requirements, country deliverability,
 * military APO/FPO courier restrictions, and calculates shipping tariffs.
 */
import { DomainError } from '../errors/index.js';
import { Money, type Currency } from './money.vo.js';

export const EMBARGOED_SHIPPING_COUNTRIES = ['CU', 'IR', 'KP', 'SY', 'RU', 'BY'] as const;

export const SUPPORTED_SHIPPING_COUNTRIES = [
  'NP', // Nepal (Domestic)
  'US', // United States
  'CA', // Canada
  'GB', // United Kingdom
  'AU', // Australia
  'NZ', // New Zealand
  'DE', // Germany
  'FR', // France
  'IT', // Italy
  'ES', // Spain
  'NL', // Netherlands
  'SE', // Sweden
  'CH', // Switzerland
  'NO', // Norway
  'DK', // Denmark
  'FI', // Finland
  'BE', // Belgium
  'AT', // Austria
  'IE', // Ireland
  'PT', // Portugal
  'JP', // Japan
  'SG', // Singapore
  'AE', // United Arab Emirates
  'KR', // South Korea
  'HK', // Hong Kong
] as const;

export type SupportedCountryCode = (typeof SUPPORTED_SHIPPING_COUNTRIES)[number];

export interface AddressProps {
  readonly fullName: string;
  readonly addressLine1: string;
  readonly addressLine2?: string;
  readonly city: string;
  readonly stateOrProvince?: string;
  readonly postalCode: string;
  readonly country: string;
  readonly phone: string;
}

export class Address {
  readonly fullName: string;
  readonly addressLine1: string;
  readonly addressLine2?: string;
  readonly city: string;
  readonly stateOrProvince?: string;
  readonly postalCode: string;
  readonly country: string;
  readonly phone: string;

  constructor(props: AddressProps) {
    if (!props.fullName?.trim()) {
      throw new DomainError('Full recipient name is required for shipping address');
    }
    if (!props.addressLine1?.trim()) {
      throw new DomainError('Address line 1 is required');
    }
    if (!props.city?.trim()) {
      throw new DomainError('City is required');
    }
    if (!props.postalCode?.trim()) {
      throw new DomainError('Postal/ZIP code is required');
    }
    if (!props.country?.trim()) {
      throw new DomainError('Country is required');
    }
    if (!props.phone?.trim()) {
      throw new DomainError('Contact phone number is required for courier dispatch');
    }

    this.fullName = props.fullName.trim();
    this.addressLine1 = props.addressLine1.trim();
    this.addressLine2 = props.addressLine2?.trim();
    this.city = props.city.trim();
    this.stateOrProvince = props.stateOrProvince?.trim();
    this.postalCode = props.postalCode.trim();
    this.country = props.country.trim().toUpperCase();
    this.phone = props.phone.trim();
  }

  isInternational(originCountry = 'NP'): boolean {
    return this.country !== originCountry.toUpperCase();
  }

  /**
   * JN-228: Validates whether destination is a military base address (APO / FPO / DPO).
   * International DHL Express originating from Kathmandu cannot deliver to military post offices.
   */
  isMilitaryAddress(): boolean {
    const textToCheck =
      `${this.addressLine1} ${this.addressLine2 ?? ''} ${this.city} ${this.stateOrProvince ?? ''}`.toUpperCase();
    const militaryPatterns = [
      /\bAPO\b/,
      /\bFPO\b/,
      /\bDPO\b/,
      /\bCMR\s+\d+/,
      /\bPSC\s+\d+/,
      /\bUNIT\s+\d+\s+BOX\b/,
    ];
    return militaryPatterns.some((pattern) => pattern.test(textToCheck));
  }

  /**
   * JN-227: Validates country deliverability and trade compliance restrictions.
   */
  checkDeliverability(): { isDeliverable: boolean; reason?: string } {
    if (this.isMilitaryAddress()) {
      return {
        isDeliverable: false,
        reason:
          'International express couriers departing Nepal cannot deliver to APO/FPO/DPO military addresses. Please provide a physical civilian delivery address.',
      };
    }

    if (
      EMBARGOED_SHIPPING_COUNTRIES.includes(
        this.country as (typeof EMBARGOED_SHIPPING_COUNTRIES)[number],
      )
    ) {
      return {
        isDeliverable: false,
        reason: 'Orders cannot be delivered to international trade-restricted destinations.',
      };
    }

    const isSupported = SUPPORTED_SHIPPING_COUNTRIES.includes(this.country as SupportedCountryCode);
    if (!isSupported) {
      return {
        isDeliverable: false,
        reason: `Shipping is currently not available to destination country code ${this.country}.`,
      };
    }

    return { isDeliverable: true };
  }

  /**
   * JN-229: Computes shipping tariff.
   * Domestic Nepal ('NP'): Free ($0).
   * International: Flat $25.00 (2500 cents), or free if subtotal >= $300.00 (30000 cents).
   */
  calculateShippingCost(subtotalAmountCents: number, currency: Currency = 'USD'): Money {
    if (this.country === 'NP') {
      return Money.zero(currency);
    }
    const FREE_SHIPPING_THRESHOLD_CENTS = 30000; // $300.00
    if (subtotalAmountCents >= FREE_SHIPPING_THRESHOLD_CENTS) {
      return Money.zero(currency);
    }
    const FLAT_INTERNATIONAL_SHIPPING_CENTS = 2500; // $25.00
    return new Money(FLAT_INTERNATIONAL_SHIPPING_CENTS, currency);
  }

  formatSingleLine(): string {
    return [
      this.addressLine1,
      this.addressLine2,
      this.city,
      this.stateOrProvince,
      this.postalCode,
      this.country,
    ]
      .filter(Boolean)
      .join(', ');
  }

  formatMultiLine(): string {
    const lines = [
      this.fullName,
      this.addressLine1,
      this.addressLine2,
      `${this.city}${this.stateOrProvince ? `, ${this.stateOrProvince}` : ''} ${this.postalCode}`,
      this.country,
      `Phone: ${this.phone}`,
    ];
    return lines.filter(Boolean).join('\n');
  }

  equals(other: Address): boolean {
    return (
      this.fullName === other.fullName &&
      this.addressLine1 === other.addressLine1 &&
      this.addressLine2 === other.addressLine2 &&
      this.city === other.city &&
      this.stateOrProvince === other.stateOrProvince &&
      this.postalCode === other.postalCode &&
      this.country === other.country &&
      this.phone === other.phone
    );
  }
}
