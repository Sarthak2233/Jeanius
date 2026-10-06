import { eq } from 'drizzle-orm';
import type { Database } from '../../client';
import { usersProfile } from '../../schema/auth-profile';
import type { IUserProfileRepository } from '@jeanius/application';
import {
  UserProfile,
  createEntityId,
  type UserProfileProps,
  type ActorRole,
} from '@jeanius/domain';

export class DrizzleUserProfileRepository implements IUserProfileRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<UserProfile | null> {
    const records = await this.db
      .select()
      .from(usersProfile)
      .where(eq(usersProfile.id, id))
      .limit(1);

    const record = records[0];
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    const records = await this.db
      .select()
      .from(usersProfile)
      .where(eq(usersProfile.email, email.toLowerCase().trim()))
      .limit(1);

    const record = records[0];
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async create(profile: UserProfileProps): Promise<UserProfile> {
    const [inserted] = await this.db
      .insert(usersProfile)
      .values({
        id: profile.id,
        email: profile.email.toLowerCase().trim(),
        fullName: profile.fullName,
        role: profile.role,
        phone: profile.phone ?? null,
        avatarUrl: profile.avatarUrl ?? null,
        denimPreferences: (profile.denimPreferences as Record<string, unknown>) ?? null,
        jewelleryPreferences: (profile.jewelleryPreferences as Record<string, unknown>) ?? null,
        createdAt: profile.createdAt ?? new Date(),
        updatedAt: profile.updatedAt ?? new Date(),
      })
      .returning();

    if (!inserted) {
      throw new Error(`Failed to create user profile for ${profile.id}`);
    }

    return this.mapToDomain(inserted);
  }

  async update(id: string, updates: Partial<UserProfileProps>): Promise<UserProfile> {
    const valuesToUpdate: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (updates.fullName !== undefined) valuesToUpdate.fullName = updates.fullName;
    if (updates.phone !== undefined) valuesToUpdate.phone = updates.phone;
    if (updates.avatarUrl !== undefined) valuesToUpdate.avatarUrl = updates.avatarUrl;
    if (updates.role !== undefined) valuesToUpdate.role = updates.role;
    if (updates.denimPreferences !== undefined) {
      valuesToUpdate.denimPreferences = updates.denimPreferences as Record<string, unknown>;
    }
    if (updates.jewelleryPreferences !== undefined) {
      valuesToUpdate.jewelleryPreferences = updates.jewelleryPreferences as Record<string, unknown>;
    }

    const [updated] = await this.db
      .update(usersProfile)
      .set(valuesToUpdate)
      .where(eq(usersProfile.id, id))
      .returning();

    if (!updated) {
      throw new Error(`User profile with id "${id}" not found to update.`);
    }

    return this.mapToDomain(updated);
  }

  private mapToDomain(row: typeof usersProfile.$inferSelect): UserProfile {
    return new UserProfile({
      id: createEntityId<'UserProfile'>(row.id),
      email: row.email,
      fullName: row.fullName,
      role: row.role as ActorRole,
      phone: row.phone ?? undefined,
      avatarUrl: row.avatarUrl ?? undefined,
      denimPreferences: (row.denimPreferences as UserProfileProps['denimPreferences']) ?? undefined,
      jewelleryPreferences:
        (row.jewelleryPreferences as UserProfileProps['jewelleryPreferences']) ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
