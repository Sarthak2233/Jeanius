/**
 * ExportDeclaration Value Object (JN-088).
 * Encapsulates Nepal customs export compliance, HS Code 6203.42 (cotton denim trousers),
 * and international commercial invoice declarations.
 */
import { type Money } from '../common/money.vo.js';
import { DomainError } from '../errors/index.js';

export const NEPAL_DENIM_HS_CODE = '6203.42.0000'; // Men's or boys' cotton denim trousers

export interface ExportDeclarationProps {
  readonly hsCode?: string;
  readonly description: string;
  readonly countryOfOrigin?: string;
  readonly netWeightKg: number;
  readonly grossWeightKg: number;
  readonly invoiceValue: Money;
  readonly customsOfficeCode?: string; // e.g. TIA-KTM (Tribhuvan International Airport)
  readonly exporterPan?: string;
}

export class ExportDeclaration {
  readonly hsCode: string;
  readonly description: string;
  readonly countryOfOrigin: string;
  readonly netWeightKg: number;
  readonly grossWeightKg: number;
  readonly invoiceValue: Money;
  readonly customsOfficeCode: string;
  readonly exporterPan?: string;

  constructor(props: ExportDeclarationProps) {
    if (props.netWeightKg <= 0 || props.grossWeightKg <= 0) {
      throw new DomainError('Customs declared weight must be positive in kg');
    }
    if (props.grossWeightKg < props.netWeightKg) {
      throw new DomainError('Gross weight cannot be less than net weight');
    }

    this.hsCode = props.hsCode ?? NEPAL_DENIM_HS_CODE;
    this.description = props.description.trim();
    this.countryOfOrigin = props.countryOfOrigin ?? 'NP';
    this.netWeightKg = props.netWeightKg;
    this.grossWeightKg = props.grossWeightKg;
    this.invoiceValue = props.invoiceValue;
    this.customsOfficeCode = props.customsOfficeCode ?? 'TIA-KTM';
    this.exporterPan = props.exporterPan;
  }

  formatCustomsSummary(): string {
    return `HS ${this.hsCode} | Origin: ${this.countryOfOrigin} | Net: ${this.netWeightKg}kg / Gross: ${this.grossWeightKg}kg | Value: ${this.invoiceValue.format()}`;
  }
}
