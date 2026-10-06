import type { Actor } from '@jeanius/domain';
import type { IUserProfileRepository } from './user-profile-repository.port';

export class GetSessionActorUseCase {
  constructor(private readonly userProfileRepository: IUserProfileRepository) {}

  async execute(userId: string, emailFallback?: string): Promise<Actor> {
    const profile = await this.userProfileRepository.findById(userId);

    if (!profile) {
      // Fallback for newly authenticated auth user prior to profile creation
      return {
        id: userId,
        email: emailFallback,
        role: 'CUSTOMER',
      };
    }

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role,
    };
  }
}
