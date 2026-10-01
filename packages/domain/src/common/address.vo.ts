/**
 * Physical Shipping & Billing Address Value Object (JN-065).
 * Validates international postal requirements and courier contact requirements.
 */
import { DomainError } from '../errors/index.js';

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
