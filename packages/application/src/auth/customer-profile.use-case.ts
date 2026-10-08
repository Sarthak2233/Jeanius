import type { UpdateProfileDto, CreateAddressInputDto } from '@jeanius/contracts';
import type { UserProfile, DenimMeasurements, JewelleryMeasurements } from '@jeanius/domain';
import { NotFoundError } from '@jeanius/domain';
import { createLogger } from '@jeanius/observability';
import type { IUserProfileRepository } from './user-profile-repository.port';
import type { IAddressRepository, AddressRecord } from './address-repository.port';

export interface CustomerProfileData {
  readonly profile: UserProfile;
  readonly addresses: AddressRecord[];
}

export class CustomerProfileUseCase {
  private readonly logger = createLogger('customer-profile-use-case');

  constructor(
    private readonly userProfileRepository: IUserProfileRepository,
    private readonly addressRepository: IAddressRepository,
  ) {}

  async getProfile(userId: string): Promise<CustomerProfileData> {
    const profile = await this.userProfileRepository.findById(userId);
    if (!profile) {
      this.logger.warn('Customer profile not found', { userId });
      throw new NotFoundError('UserProfile', userId);
    }

    const addresses = await this.addressRepository.findByUserId(userId);
    this.logger.debug('Customer profile retrieved', {
      userId,
      role: profile.role,
      addressCount: addresses.length,
    });

    return {
      profile,
      addresses,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfile> {
    const existing = await this.userProfileRepository.findById(userId);
    if (!existing) {
      this.logger.warn('Customer profile not found for update', { userId });
      throw new NotFoundError('UserProfile', userId);
    }

    const denimPreferences =
      dto.denimPreferences === null
        ? undefined
        : (dto.denimPreferences ?? existing.denimPreferences);

    const jewelleryPreferences =
      dto.jewelleryPreferences === null
        ? undefined
        : (dto.jewelleryPreferences ?? existing.jewelleryPreferences);

    const updated = await this.userProfileRepository.update(userId, {
      fullName: dto.fullName ?? existing.fullName,
      phone: dto.phone ?? existing.phone,
      avatarUrl: dto.avatarUrl ?? existing.avatarUrl,
      craftFocus: dto.craftFocus ?? existing.craftFocus,
      denimPreferences,
      jewelleryPreferences,
      updatedAt: new Date(),
    });

    this.logger.info('Customer profile updated', {
      userId,
      craftFocus: updated.craftFocus,
      hasGarmentVault: !!updated.denimPreferences,
      hasJewelleryVault: !!updated.jewelleryPreferences,
    });

    return updated;
  }

  async updateGarmentPreferences(
    userId: string,
    preferences: DenimMeasurements,
  ): Promise<UserProfile> {
    return this.updateProfile(userId, {
      denimPreferences: preferences,
      craftFocus: 'GARMENT',
    });
  }

  async updateJewelleryPreferences(
    userId: string,
    preferences: JewelleryMeasurements,
  ): Promise<UserProfile> {
    return this.updateProfile(userId, {
      jewelleryPreferences: preferences,
      craftFocus: 'JEWELLERY',
    });
  }

  async clearGarmentPreferences(userId: string): Promise<UserProfile> {
    return this.updateProfile(userId, { denimPreferences: null });
  }

  async clearJewelleryPreferences(userId: string): Promise<UserProfile> {
    return this.updateProfile(userId, { jewelleryPreferences: null });
  }

  async addAddress(userId: string, dto: CreateAddressInputDto): Promise<AddressRecord> {
    return this.addressRepository.create({
      userId,
      fullName: dto.fullName,
      addressLine1: dto.addressLine1,
      addressLine2: dto.addressLine2,
      city: dto.city,
      stateOrProvince: dto.stateOrProvince,
      postalCode: dto.postalCode,
      country: dto.country,
      phone: dto.phone,
      isDefaultShipping: dto.isDefaultShipping,
      isDefaultBilling: dto.isDefaultBilling,
    });
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    await this.addressRepository.delete(addressId, userId);
  }

  async setDefaultShipping(userId: string, addressId: string): Promise<void> {
    await this.addressRepository.setDefaultShipping(addressId, userId);
  }

  async setDefaultBilling(userId: string, addressId: string): Promise<void> {
    await this.addressRepository.setDefaultBilling(addressId, userId);
  }
}
