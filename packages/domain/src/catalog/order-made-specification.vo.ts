/**
 * OrderMadeSpecification Value Object (JN-053).
 * Defines validation, price rule calculations, and physical constraints
 * for Kathmandu Workshop Order-Made .925 sterling silver artisan pieces.
 */
import { DomainError } from '../errors/index.js';

export interface RingSizeSpecification {
  readonly minSizeUs: number; // e.g. 3.0
  readonly maxSizeUs: number; // e.g. 16.0
  readonly stepUs: number; // e.g. 0.25 (quarter sizes)
  readonly defaultSizeUs?: number; // e.g. 10.0
  readonly wideShankOffsetAllowed: boolean; // e.g. true (+0.5 offset)
}

export interface WristSizeSpecification {
  readonly minCircumferenceInches: number; // e.g. 5.5
  readonly maxCircumferenceInches: number; // e.g. 8.5
  readonly defaultCircumferenceInches?: number; // e.g. 6.75
  readonly gapMm: number; // e.g. 25mm comfort opening
}

export interface ChainLengthSpecification {
  readonly standardLengthsInches: readonly number[]; // e.g. [18, 20, 22, 24, 26, 28]
  readonly defaultLengthInches?: number; // e.g. 22
  readonly allowCustomInches?: boolean;
}

export interface EngravingSpecification {
  readonly allowed: boolean;
  readonly maxCharacters: number; // e.g. 20
  readonly allowedCharPattern?: string;
  readonly priceDeltaAmount: number; // in cents
}

export interface PatinaFinishOption {
  readonly code: string;
  readonly label: string;
  readonly description: string;
  readonly priceDeltaAmount: number; // in cents
  readonly isDefault?: boolean;
}

export interface PatinaSpecification {
  readonly allowedFinishes: readonly PatinaFinishOption[];
}

export interface OrderMadeInputSchema {
  readonly metalPurity: '.925 Sterling Silver';
  readonly ringSize?: RingSizeSpecification;
  readonly wristSize?: WristSizeSpecification;
  readonly chainLength?: ChainLengthSpecification;
  readonly engraving?: EngravingSpecification;
  readonly patina?: PatinaSpecification;
}

export interface OrderMadePriceRule {
  readonly inputKey: string;
  readonly condition: 'EQUALS' | 'GREATER_THAN';
  readonly threshold: number | string;
  readonly surchargeAmount: number; // cents
  readonly reason: string;
}

export interface CustomerOrderMadeInput {
  readonly ringSizeUs?: number;
  readonly applyWideShankCompensator?: boolean;
  readonly wristCircumferenceInches?: number;
  readonly chainLengthInches?: number;
  readonly engravingText?: string;
  readonly patinaFinish?: string;
  readonly [key: string]: unknown;
}

export class OrderMadeSpecification {
  readonly schema: OrderMadeInputSchema;
  readonly priceRules: readonly OrderMadePriceRule[];

  constructor(schema: OrderMadeInputSchema, priceRules: readonly OrderMadePriceRule[] = []) {
    if (schema.metalPurity !== '.925 Sterling Silver') {
      throw new DomainError('Order-Made pieces must declare .925 Sterling Silver metal purity');
    }
    this.schema = schema;
    this.priceRules = priceRules;
  }

  /**
   * Validates raw customer inputs against the atelier input schema.
   * Returns calculated mandrel mm and effective target specifications.
   */
  validateCustomerInput(input: CustomerOrderMadeInput): {
    readonly effectiveRingSizeUs?: number;
    readonly mandrelMm?: number;
    readonly wideShankApplied: boolean;
    readonly totalSurchargeAmount: number;
    readonly formattedEngraving?: string;
  } {
    let effectiveRingSizeUs: number | undefined;
    let mandrelMm: number | undefined;
    let wideShankApplied = false;

    // 1. Ring Size Validation
    if (this.schema.ringSize) {
      const rawSize = input.ringSizeUs;
      if (rawSize === undefined || isNaN(rawSize)) {
        throw new DomainError('Ring size is required for this Order-Made piece');
      }

      if (rawSize < this.schema.ringSize.minSizeUs || rawSize > this.schema.ringSize.maxSizeUs) {
        throw new DomainError(
          `Ring size ${rawSize} is outside workshop bounds (${this.schema.ringSize.minSizeUs}–${this.schema.ringSize.maxSizeUs})`,
        );
      }

      // Check step alignment (0.25 increment)
      const remainder = Math.round((rawSize % this.schema.ringSize.stepUs) * 100) / 100;
      if (remainder !== 0 && remainder !== this.schema.ringSize.stepUs) {
        throw new DomainError(
          `Ring size must be in ${this.schema.ringSize.stepUs} increments (quarter sizes)`,
        );
      }

      effectiveRingSizeUs = rawSize;

      // Apply wide-shank compensator offset (+0.5 size) if requested and allowed
      if (input.applyWideShankCompensator && this.schema.ringSize.wideShankOffsetAllowed) {
        effectiveRingSizeUs += 0.5;
        wideShankApplied = true;
      }

      // Convert US size to approximate Kathmandu steel mandrel diameter in mm:
      // Formula: Inner Diameter (mm) = 11.63 + (Size * 0.8128)
      mandrelMm = Math.round((11.63 + effectiveRingSizeUs * 0.8128) * 10) / 10;
    }

    // 2. Wrist Circumference Validation
    if (this.schema.wristSize && input.wristCircumferenceInches !== undefined) {
      const wrist = input.wristCircumferenceInches;
      if (
        wrist < this.schema.wristSize.minCircumferenceInches ||
        wrist > this.schema.wristSize.maxCircumferenceInches
      ) {
        throw new DomainError(
          `Wrist circumference ${wrist}" is outside workshop bounds (${this.schema.wristSize.minCircumferenceInches}"–${this.schema.wristSize.maxCircumferenceInches}")`,
        );
      }
    }

    // 3. Chain Length Validation
    if (this.schema.chainLength && input.chainLengthInches !== undefined) {
      const len = input.chainLengthInches;
      const isStandard = this.schema.chainLength.standardLengthsInches.includes(len);
      if (!isStandard && !this.schema.chainLength.allowCustomInches) {
        throw new DomainError(`Chain length ${len}" is not an accepted workshop standard length`);
      }
    }

    // 4. Inside-Band Engraving Validation
    let formattedEngraving: string | undefined;
    if (input.engravingText && input.engravingText.trim().length > 0) {
      if (!this.schema.engraving?.allowed) {
        throw new DomainError('Custom engraving is not available for this piece');
      }

      const trimmed = input.engravingText.trim().toUpperCase();
      if (trimmed.length > this.schema.engraving.maxCharacters) {
        throw new DomainError(
          `Engraving exceeds maximum limit of ${this.schema.engraving.maxCharacters} characters`,
        );
      }

      const pattern = new RegExp(this.schema.engraving.allowedCharPattern ?? '^[A-Z0-9 ·./-]+$');
      if (!pattern.test(trimmed)) {
        throw new DomainError(
          'Engraving contains invalid characters (allowed: A-Z, 0-9, ·, ., -, /)',
        );
      }

      formattedEngraving = trimmed;
    }

    // 5. Patina Finish Validation
    if (this.schema.patina) {
      if (!input.patinaFinish) {
        throw new DomainError('Artisan patina finish selection is required');
      }
      const match = this.schema.patina.allowedFinishes.find((f) => f.code === input.patinaFinish);
      if (!match) {
        throw new DomainError(`Unknown or disallowed patina finish: ${input.patinaFinish}`);
      }
    }

    // 6. Calculate Dynamic Surcharges from Price Rules
    let totalSurchargeAmount = 0;
    if (formattedEngraving && this.schema.engraving?.priceDeltaAmount) {
      totalSurchargeAmount += this.schema.engraving.priceDeltaAmount;
    }

    if (input.patinaFinish && this.schema.patina) {
      const finishOption = this.schema.patina.allowedFinishes.find(
        (f) => f.code === input.patinaFinish,
      );
      if (finishOption?.priceDeltaAmount) {
        totalSurchargeAmount += finishOption.priceDeltaAmount;
      }
    }

    for (const rule of this.priceRules) {
      const customerVal = input[rule.inputKey];
      if (customerVal === undefined) continue;

      if (rule.condition === 'EQUALS' && String(customerVal) === String(rule.threshold)) {
        totalSurchargeAmount += rule.surchargeAmount;
      } else if (
        rule.condition === 'GREATER_THAN' &&
        typeof customerVal === 'number' &&
        typeof rule.threshold === 'number' &&
        customerVal > rule.threshold
      ) {
        totalSurchargeAmount += rule.surchargeAmount;
      }
    }

    return {
      effectiveRingSizeUs,
      mandrelMm,
      wideShankApplied,
      totalSurchargeAmount,
      formattedEngraving,
    };
  }
}
