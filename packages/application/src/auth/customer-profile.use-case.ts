import type { UpdateProfileDto, CreateAddressInputDto } from '@jeanius/contracts';
import type { UserProfile } from '@jeanius/domain';
import { NotFoundError } from '@jeanius/domain';
import type { IUserProfileRepository } from './user-profile-repository.port';
import type { IAddressRepository, AddressRecord } from './address-repository.port';

export interface CustomerProfileData {
  readonly profile: UserProfile;
  readonly addresses: AddressRecord[];
}

export class CustomerProfileUseCase {
  constructor(
    private readonly userProfileRepository: IUserProfileRepository,
    private readonly addressRepository: IAddressRepository,
  ) {}

  async getProfile(userId: string): Promise<CustomerProfileData> {
    const profile = await this.userProfileRepository.findById(userId);
    if (!profile) {
      throw new NotFoundError('UserProfile', userId);
    }

    const addresses = await this.addressRepository.findByUserId(userId);

    return {
      profile,
      addresses,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfile> {
    const existing = await this.userProfileRepository.findById(userId);
    if (!existing) {
      throw new NotFoundError('UserProfile', userId);
    }

    return this.userProfileRepository.update(userId, {
      fullName: dto.fullName ?? existing.fullName,
      phone: dto.phone ?? existing.phone,
      avatarUrl: dto.avatarUrl ?? existing.avatarUrl,
      denimPreferences: dto.denimPreferences ?? existing.denimPreferences,
      jewelleryPreferences: dto.jewelleryPreferences ?? existing.jewelleryPreferences,
      updatedAt: new Date(),
    });
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
