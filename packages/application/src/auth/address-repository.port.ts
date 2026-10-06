export interface AddressRecord {
  readonly id: string;
  readonly userId: string;
  readonly fullName: string;
  readonly addressLine1: string;
  readonly addressLine2?: string;
  readonly city: string;
  readonly stateOrProvince?: string;
  readonly postalCode: string;
  readonly country: string;
  readonly phone: string;
  readonly isDefaultShipping: boolean;
  readonly isDefaultBilling: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateAddressParams {
  readonly userId: string;
  readonly fullName: string;
  readonly addressLine1: string;
  readonly addressLine2?: string;
  readonly city: string;
  readonly stateOrProvince?: string;
  readonly postalCode: string;
  readonly country: string;
  readonly phone: string;
  readonly isDefaultShipping?: boolean;
  readonly isDefaultBilling?: boolean;
}

export interface IAddressRepository {
  findByUserId(userId: string): Promise<AddressRecord[]>;
  findById(id: string): Promise<AddressRecord | null>;
  create(params: CreateAddressParams): Promise<AddressRecord>;
  delete(id: string, userId: string): Promise<void>;
  setDefaultShipping(id: string, userId: string): Promise<void>;
  setDefaultBilling(id: string, userId: string): Promise<void>;
}
