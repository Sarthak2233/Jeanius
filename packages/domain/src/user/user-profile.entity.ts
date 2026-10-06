import type { UserProfileId } from '../common/entity-id.js';
import type { ActorRole } from '../index.js';

// ================= Tailoring (Denim / Garments) =================

export type BottomsSilhouette =
  'STRAIGHT' | 'SLIM_TAPERED' | 'WIDE_LEG' | 'RELAXED_TAPERED' | 'BOOTCUT';

export type TopsFitPreference = 'SLIM' | 'REGULAR' | 'BOXY' | 'OVERSIZED';

export interface BottomsMeasurements {
  readonly waistInches?: number;
  readonly inseamInches?: number;
  readonly riseInches?: number;
  readonly thighInches?: number;
  readonly kneeInches?: number;
  readonly legOpeningInches?: number;
  readonly silhouette?: BottomsSilhouette;
  readonly hemAllowanceInches?: number;
}

export interface TopsMeasurements {
  readonly chestInches?: number;
  readonly shoulderWidthInches?: number;
  readonly sleeveLengthInches?: number;
  readonly backLengthInches?: number;
  readonly neckInches?: number;
  readonly fitPreference?: TopsFitPreference;
}

export interface DenimMeasurements {
  readonly bottoms?: BottomsMeasurements;
  readonly tops?: TopsMeasurements;
  // Legacy / Flat Accessors (backward compatibility)
  readonly waistInches?: number;
  readonly inseamInches?: number;
  readonly silhouette?: BottomsSilhouette;
  readonly hemAllowanceInches?: number;
}

// ================= Metalsmithing (Jewellery) =================

export type FingerType = 'INDEX' | 'MIDDLE' | 'RING' | 'PINKY' | 'THUMB';
export type BraceletFitType = 'SNUG' | 'COMFORT' | 'LOOSE';
export type ChainStyleType = 'CABLE' | 'CURB' | 'ROPE' | 'BOX' | 'FIGARO';
export type PreciousAlloy = 'STERLING_SILVER_925' | 'SOLID_BRASS' | 'GOLD_18K' | 'WHITE_GOLD_14K';
export type JewelleryFinish = 'HIGH_POLISH' | 'SATIN_MATTE' | 'OXIDIZED_PATINA' | 'HAMMERED_RAW';

export interface RingMeasurements {
  readonly ringSizeUs?: string;
  readonly ringMandrelMm?: number;
  readonly knuckleClearanceMm?: number;
  readonly preferredFinger?: FingerType;
}

export interface WristMeasurements {
  readonly wristCircumferenceInches?: number;
  readonly cuffGapMm?: number;
  readonly braceletFit?: BraceletFitType;
}

export interface NecklaceMeasurements {
  readonly neckCircumferenceInches?: number;
  readonly preferredChainLengthInches?: number;
  readonly chainStyle?: ChainStyleType;
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
  // Legacy / Flat Accessors (backward compatibility)
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
  readonly denimPreferences?: DenimMeasurements;
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
  private _denimPreferences?: DenimMeasurements;
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
    this._denimPreferences = props.denimPreferences;
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

  get denimPreferences(): DenimMeasurements | undefined {
    return this._denimPreferences;
  }

  get jewelleryPreferences(): JewelleryMeasurements | undefined {
    return this._jewelleryPreferences;
  }

  get bottomsPreferences(): BottomsMeasurements | undefined {
    if (this._denimPreferences?.bottoms) {
      return this._denimPreferences.bottoms;
    }
    if (
      this._denimPreferences?.waistInches !== undefined ||
      this._denimPreferences?.inseamInches !== undefined ||
      this._denimPreferences?.silhouette !== undefined ||
      this._denimPreferences?.hemAllowanceInches !== undefined
    ) {
      return {
        waistInches: this._denimPreferences.waistInches,
        inseamInches: this._denimPreferences.inseamInches,
        silhouette: this._denimPreferences.silhouette,
        hemAllowanceInches: this._denimPreferences.hemAllowanceInches,
      };
    }
    return undefined;
  }

  get topsPreferences(): TopsMeasurements | undefined {
    return this._denimPreferences?.tops;
  }

  get ringPreferences(): RingMeasurements | undefined {
    if (this._jewelleryPreferences?.rings) {
      return this._jewelleryPreferences.rings;
    }
    if (
      this._jewelleryPreferences?.ringSizeUs !== undefined ||
      this._jewelleryPreferences?.ringMandrelMm !== undefined
    ) {
      return {
        ringSizeUs: this._jewelleryPreferences.ringSizeUs,
        ringMandrelMm: this._jewelleryPreferences.ringMandrelMm,
      };
    }
    return undefined;
  }

  get wristPreferences(): WristMeasurements | undefined {
    if (this._jewelleryPreferences?.wrists) {
      return this._jewelleryPreferences.wrists;
    }
    if (this._jewelleryPreferences?.wristCircumferenceInches !== undefined) {
      return {
        wristCircumferenceInches: this._jewelleryPreferences.wristCircumferenceInches,
      };
    }
    return undefined;
  }

  get necklacePreferences(): NecklaceMeasurements | undefined {
    return this._jewelleryPreferences?.necklaces;
  }

  get metalPreferences(): MetalPreferences | undefined {
    if (this._jewelleryPreferences?.metals) {
      return this._jewelleryPreferences.metals;
    }
    if (
      this._jewelleryPreferences?.preferredAlloy !== undefined ||
      this._jewelleryPreferences?.preferredFinish !== undefined
    ) {
      return {
        preferredAlloy: this._jewelleryPreferences.preferredAlloy,
        preferredFinish: this._jewelleryPreferences.preferredFinish,
      };
    }
    return undefined;
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  hasRole(role: ActorRole): boolean {
    return this.role === role;
  }

  isStaff(): boolean {
    switch (this.role) {
      case 'TAILOR':
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
    return this.role === 'TAILOR' || this.role === 'JEWELLER';
  }

  toJSON(): UserProfileProps {
    return {
      id: this.id,
      email: this.email,
      fullName: this.fullName,
      role: this.role,
      phone: this._phone,
      avatarUrl: this._avatarUrl,
      denimPreferences: this._denimPreferences,
      jewelleryPreferences: this._jewelleryPreferences,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
