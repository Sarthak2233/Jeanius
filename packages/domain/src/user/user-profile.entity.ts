/**
 * User Profile aggregate root (Project 925).
 * Encapsulates Kathmandu .925 sterling silver artisan sizing preferences,
 * personal sizing vaults (ring mandrel, cuff gap, chain drape, patina), and RBAC capabilities.
 */
import type { UserProfileId } from '../common/entity-id.js';
import type { ActorRole } from '../index.js';

// ================= Metalsmithing & Jewellery Sizing (Project 925) =================

export type FingerType = 'INDEX' | 'MIDDLE' | 'RING' | 'PINKY' | 'THUMB';
export type BraceletFitType = 'SNUG' | 'COMFORT' | 'LOOSE';
export type ChainStyleType = 'CABLE' | 'CURB' | 'ROPE' | 'BOX' | 'FIGARO';
export type PreciousAlloy = 'STERLING_SILVER_925' | 'SOLID_BRASS' | 'GOLD_18K' | 'WHITE_GOLD_14K';
export type JewelleryFinish = 'HIGH_POLISH' | 'SATIN_MATTE' | 'OXIDIZED_PATINA' | 'HAMMERED_RAW';

export interface RingMeasurements {
  readonly ringSizeUs?: string;
  readonly insideDiameterMm?: number;
  readonly insideCircumferenceMm?: number;
  readonly ringMandrelMm?: number;
  readonly knuckleClearanceMm?: number;
  readonly bandWidthMm?: number;
  readonly comfortFit?: boolean;
  readonly dominantHand?: 'LEFT' | 'RIGHT';
  readonly preferredFinger?: FingerType;
}

export interface WristMeasurements {
  readonly wristCircumferenceInches?: number;
  readonly wristBreadthMm?: number;
  readonly wristThicknessMm?: number;
  readonly cuffGapMm?: number;
  readonly braceletFit?: BraceletFitType;
}

export interface NecklaceMeasurements {
  readonly neckCircumferenceInches?: number;
  readonly preferredChainLengthInches?: number;
  readonly chainStyle?: ChainStyleType;
  readonly pendantDropMm?: number;
}

export interface MetalPreferences {
  readonly preferredAlloy?: PreciousAlloy;
  readonly preferredFinish?: JewelleryFinish;
}

export interface JewelleryMeasurements {
  readonly rings?: RingMeasurements;
  readonly wrists?: WristMeasurements;
  readonly necklaces?: NecklaceMeasurements;
  readonly metals?: MetalPreferences;
  // Direct accessors
  readonly ringSizeUs?: string;
  readonly ringMandrelMm?: number;
  readonly wristCircumferenceInches?: number;
  readonly preferredAlloy?: PreciousAlloy;
  readonly preferredFinish?: JewelleryFinish;
}

// ================= User Profile Entity =================

export interface UserProfileProps {
  readonly id: UserProfileId;
  readonly email: string;
  readonly fullName: string;
  readonly role: ActorRole;
  readonly phone?: string;
  readonly avatarUrl?: string;
  readonly jewelleryPreferences?: JewelleryMeasurements;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class UserProfile {
  readonly id: UserProfileId;
  readonly email: string;
  readonly fullName: string;
  readonly role: ActorRole;

  private _phone?: string;
  private _avatarUrl?: string;
  private _jewelleryPreferences?: JewelleryMeasurements;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: UserProfileProps) {
    this.id = props.id;
    this.email = props.email;
    this.fullName = props.fullName;
    this.role = props.role;
    this._phone = props.phone;
    this._avatarUrl = props.avatarUrl;
    this._jewelleryPreferences = props.jewelleryPreferences;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get phone(): string | undefined {
    return this._phone;
  }

  get avatarUrl(): string | undefined {
    return this._avatarUrl;
  }

  get jewelleryPreferences(): JewelleryMeasurements | undefined {
    return this._jewelleryPreferences;
  }

  get rings(): RingMeasurements | undefined {
    return this._jewelleryPreferences?.rings;
  }

  get wrists(): WristMeasurements | undefined {
    return this._jewelleryPreferences?.wrists;
  }

  get necklaces(): NecklaceMeasurements | undefined {
    return this._jewelleryPreferences?.necklaces;
  }

  get metals(): MetalPreferences | undefined {
    return this._jewelleryPreferences?.metals;
  }

  get ringSizeUs(): string | undefined {
    return this._jewelleryPreferences?.rings?.ringSizeUs ?? this._jewelleryPreferences?.ringSizeUs;
  }

  get ringMandrelMm(): number | undefined {
    return (
      this._jewelleryPreferences?.rings?.ringMandrelMm ?? this._jewelleryPreferences?.ringMandrelMm
    );
  }

  get wristCircumferenceInches(): number | undefined {
    return (
      this._jewelleryPreferences?.wrists?.wristCircumferenceInches ??
      this._jewelleryPreferences?.wristCircumferenceInches
    );
  }

  get preferredAlloy(): PreciousAlloy | undefined {
    return (
      this._jewelleryPreferences?.metals?.preferredAlloy ??
      this._jewelleryPreferences?.preferredAlloy ??
      'STERLING_SILVER_925'
    );
  }

  get preferredFinish(): JewelleryFinish | undefined {
    return (
      this._jewelleryPreferences?.metals?.preferredFinish ??
      this._jewelleryPreferences?.preferredFinish
    );
  }

  updateContactDetails(phone?: string, avatarUrl?: string): void {
    if (phone !== undefined) this._phone = phone;
    if (avatarUrl !== undefined) this._avatarUrl = avatarUrl;
    this._updatedAt = new Date();
  }

  updateJewelleryPreferences(jewellery?: JewelleryMeasurements): void {
    this._jewelleryPreferences = jewellery;
    this._updatedAt = new Date();
  }

  clearJewelleryPreferences(): void {
    this._jewelleryPreferences = undefined;
    this._updatedAt = new Date();
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  hasRole(role: ActorRole): boolean {
    return this.role === role;
  }

  isStaff(): boolean {
    switch (this.role) {
      case 'JEWELLER':
      case 'FULFILLMENT':
      case 'SUPPORT':
      case 'ADMIN':
        return true;
      default:
        return false;
    }
  }

  isArtisan(): boolean {
    return this.role === 'JEWELLER';
  }

  toJSON(): UserProfileProps {
    return {
      id: this.id,
      email: this.email,
      fullName: this.fullName,
      role: this.role,
      phone: this._phone,
      avatarUrl: this._avatarUrl,
      jewelleryPreferences: this._jewelleryPreferences,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
