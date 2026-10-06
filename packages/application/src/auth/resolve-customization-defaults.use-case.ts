import type { AutoFillContext, ResolvedCustomizationDefaults } from '@jeanius/domain';
import { resolveAtelierCustomizationDefaults } from '@jeanius/domain';
import type { IUserProfileRepository } from './user-profile-repository.port';

/**
 * Resolves bespoke tailoring and metalsmithing defaults for a product configurator
 * based on the authenticated customer's Atelier Vault.
 */
export class ResolveCustomizationDefaultsUseCase {
  constructor(private readonly userProfileRepository: IUserProfileRepository) {}

  async execute(
    userId: string | null | undefined,
    context: AutoFillContext,
  ): Promise<ResolvedCustomizationDefaults> {
    if (!userId) {
      return resolveAtelierCustomizationDefaults(null, context);
    }

    const profile = await this.userProfileRepository.findById(userId);
    return resolveAtelierCustomizationDefaults(profile, context);
  }
}
