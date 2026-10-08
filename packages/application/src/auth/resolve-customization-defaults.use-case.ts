import type { AutoFillContext, ResolvedCustomizationDefaults } from '@jeanius/domain';
import { resolveAtelierCustomizationDefaults } from '@jeanius/domain';
import { createLogger } from '@jeanius/observability';
import type { IUserProfileRepository } from './user-profile-repository.port';

const logger = createLogger('application:auth:resolve-customization-defaults');

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
      logger.debug('Resolving default customization for guest customer', {
        category: context.category,
        subcategory: context.subcategory,
      });
      return resolveAtelierCustomizationDefaults(null, context);
    }

    const profile = await this.userProfileRepository.findById(userId);
    logger.debug('Resolving customization defaults from user profile vault', {
      userId,
      hasProfile: Boolean(profile),
      category: context.category,
      subcategory: context.subcategory,
    });
    return resolveAtelierCustomizationDefaults(profile, context);
  }
}
