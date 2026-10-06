import { eq, and } from 'drizzle-orm';
import type { Database } from '../../client';
import { addresses } from '../../schema/auth-profile';
import type { IAddressRepository, AddressRecord, CreateAddressParams } from '@jeanius/application';

export class DrizzleAddressRepository implements IAddressRepository {
  constructor(private readonly db: Database) {}

  async findByUserId(userId: string): Promise<AddressRecord[]> {
    const rows = await this.db.select().from(addresses).where(eq(addresses.userId, userId));

    return rows.map(this.mapToRecord);
  }

  async findById(id: string): Promise<AddressRecord | null> {
    const rows = await this.db.select().from(addresses).where(eq(addresses.id, id)).limit(1);

    const row = rows[0];
    if (!row) return null;
    return this.mapToRecord(row);
  }

  async create(params: CreateAddressParams): Promise<AddressRecord> {
    // If setting as default shipping, unset previous default shipping for user
    if (params.isDefaultShipping) {
      await this.db
        .update(addresses)
        .set({ isDefaultShipping: false })
        .where(eq(addresses.userId, params.userId));
    }

    // If setting as default billing, unset previous default billing for user
    if (params.isDefaultBilling) {
      await this.db
        .update(addresses)
        .set({ isDefaultBilling: false })
        .where(eq(addresses.userId, params.userId));
    }

    const [inserted] = await this.db
      .insert(addresses)
      .values({
        userId: params.userId,
        fullName: params.fullName,
        addressLine1: params.addressLine1,
        addressLine2: params.addressLine2 ?? null,
        city: params.city,
        stateOrProvince: params.stateOrProvince ?? null,
        postalCode: params.postalCode,
        country: params.country,
        phone: params.phone,
        isDefaultShipping: params.isDefaultShipping ?? false,
        isDefaultBilling: params.isDefaultBilling ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!inserted) {
      throw new Error('Failed to insert address record');
    }

    return this.mapToRecord(inserted);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, userId)));
  }

  async setDefaultShipping(id: string, userId: string): Promise<void> {
    // Unset all for user
    await this.db
      .update(addresses)
      .set({ isDefaultShipping: false })
      .where(eq(addresses.userId, userId));

    // Set target
    await this.db
      .update(addresses)
      .set({ isDefaultShipping: true, updatedAt: new Date() })
      .where(and(eq(addresses.id, id), eq(addresses.userId, userId)));
  }

  async setDefaultBilling(id: string, userId: string): Promise<void> {
    // Unset all for user
    await this.db
      .update(addresses)
      .set({ isDefaultBilling: false })
      .where(eq(addresses.userId, userId));

    // Set target
    await this.db
      .update(addresses)
      .set({ isDefaultBilling: true, updatedAt: new Date() })
      .where(and(eq(addresses.id, id), eq(addresses.userId, userId)));
  }

  private mapToRecord(row: typeof addresses.$inferSelect): AddressRecord {
    return {
      id: row.id,
      userId: row.userId ?? '',
      fullName: row.fullName,
      addressLine1: row.addressLine1,
      addressLine2: row.addressLine2 ?? undefined,
      city: row.city,
      stateOrProvince: row.stateOrProvince ?? undefined,
      postalCode: row.postalCode,
      country: row.country,
      phone: row.phone,
      isDefaultShipping: row.isDefaultShipping,
      isDefaultBilling: row.isDefaultBilling,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
