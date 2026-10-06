import type { UserProfile, UserProfileProps } from '@jeanius/domain';

export interface IUserProfileRepository {
  findById(id: string): Promise<UserProfile | null>;
  findByEmail(email: string): Promise<UserProfile | null>;
  create(profile: UserProfileProps): Promise<UserProfile>;
  update(id: string, updates: Partial<UserProfileProps>): Promise<UserProfile>;
}
