import type { UserProfileId } from '../common/entity-id.js';
import type { ActorRole } from '../index.js';

// ================= Tailoring & Craft Focus =================

export type CraftFocus = 'GARMENT' | 'JEWELLERY' | 'DUAL_CRAFT';
export type GenderProfile = 'MEN' | 'WOMEN' | 'UNISEX';
export type MeasurementMethod = 'GARMENT_FLAT' | 'BODY_ANATOMICAL';
export type MeasurementUnit = 'INCHES' | 'CM';
export type StomachProfile = 'FLAT' | 'AVERAGE' | 'ROUNDED' | 'STOUT';
export type SeatProfile = 'FLAT' | 'AVERAGE' | 'ROUNDED' | 'STOUT';
export type RisePreference = 'HIGH_RISE' | 'MID_RISE' | 'LOW_RISE';
export type FitCutType = 'SLIM' | 'NORMAL' | 'LOOSE';

export type BottomsSilhouette =
  'STRAIGHT' | 'SLIM_TAPERED' | 'WIDE_LEG' | 'RELAXED_TAPERED' | 'BOOTCUT';

export type TopsFitPreference = 'SLIM' | 'REGULAR' | 'BOXY' | 'OVERSIZED';

export interface BottomsMeasurements {
  readonly gender?: GenderProfile;
  readonly measurementMethod?: MeasurementMethod;
  readonly waistInches?: number;
  readonly waistFlatInches?: number;
  readonly naturalWaistInches?: number;
  readonly hipsInches?: number;
  readonly hipsFlatInches?: number;
  readonly thighInches?: number;
  readonly thighFlatInches?: number;
  readonly kneeInches?: number;
  readonly kneeFlatInches?: number;
  readonly legOpeningInches?: number;
  readonly legOpeningFlatInches?: number;
  readonly inseamInches?: number;
  readonly outseamInches?: number;
  readonly riseInches?: number;
  readonly frontRiseInches?: number;
  readonly backRiseInches?: number;
  readonly crotchTotalInches?: number;
  readonly calfInches?: number;
  readonly ankleInches?: number;
  readonly silhouette?: BottomsSilhouette;
  readonly risePreference?: RisePreference;
  readonly fitCut?: FitCutType;
  readonly stomachProfile?: StomachProfile;
  readonly seatProfile?: SeatProfile;
  readonly hemAllowanceInches?: number;
}

export interface TopsMeasurements {
  readonly gender?: GenderProfile;
  readonly measurementMethod?: MeasurementMethod;
  readonly chestInches?: number;
  readonly chestFlatInches?: number;
  readonly bustInches?: number;
  readonly underBustInches?: number;
  readonly breastPointInches?: number;
  readonly waistPointInches?: number;
  readonly frontBustWidthInches?: number;
  readonly naturalWaistInches?: number;
  readonly stomachInches?: number;
  readonly shoulderWidthInches?: number;
  readonly shoulderSeamInches?: number;
  readonly sleeveLengthInches?: number;
  readonly shortSleeveLengthInches?: number;
  readonly bicepInches?: number;
  readonly wristInches?: number;
  readonly armholeInches?: number;
  readonly collarInches?: number;
  readonly neckInches?: number;
  readonly shirtLengthInches?: number;
  readonly jacketLengthInches?: number;
  readonly backLengthInches?: number;
  readonly yokeInches?: number;
  readonly cuffInches?: number;
  readonly waistInches?: number;
  readonly hipInches?: number;
  readonly fitPreference?: TopsFitPreference;
  readonly fitCut?: FitCutType;
  readonly stomachProfile?: StomachProfile;
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
  readonly craftFocus?: CraftFocus;
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
  private _craftFocus?: CraftFocus;
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
    this._craftFocus = props.craftFocus;
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

  get craftFocus(): CraftFocus {
    if (this._craftFocus) {
      return this._craftFocus;
    }
    const hasGarment = this.hasGarmentProfile();
    const hasJewellery = this.hasJewelleryProfile();
    if (hasGarment && !hasJewellery) return 'GARMENT';
    if (!hasGarment && hasJewellery) return 'JEWELLERY';
    return 'DUAL_CRAFT';
  }

  setCraftFocus(focus: CraftFocus): void {
    this._craftFocus = focus;
    this._updatedAt = new Date();
  }

  hasGarmentProfile(): boolean {
    if (!this._denimPreferences) return false;
    return (
      this._denimPreferences.bottoms !== undefined ||
      this._denimPreferences.waistInches !== undefined ||
      this._denimPreferences.inseamInches !== undefined ||
      this._denimPreferences.tops !== undefined
    );
  }

  hasJewelleryProfile(): boolean {
    if (!this._jewelleryPreferences) return false;
    return (
      this._jewelleryPreferences.rings !== undefined ||
      this._jewelleryPreferences.ringSizeUs !== undefined ||
      this._jewelleryPreferences.wrists !== undefined ||
      this._jewelleryPreferences.necklaces !== undefined ||
      this._jewelleryPreferences.metals !== undefined
    );
  }

  hasDualCraftProfile(): boolean {
    return this.hasGarmentProfile() && this.hasJewelleryProfile();
  }

  updateDenimPreferences(denim?: DenimMeasurements): void {
    this._denimPreferences = denim;
    this._updatedAt = new Date();
  }

  clearDenimPreferences(): void {
    this._denimPreferences = undefined;
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
      craftFocus: this.craftFocus,
      denimPreferences: this._denimPreferences,
      jewelleryPreferences: this._jewelleryPreferences,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
