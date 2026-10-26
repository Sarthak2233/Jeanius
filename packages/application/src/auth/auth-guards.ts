import type { Actor, ActorRole, AccessLevel } from '@jeanius/domain';
import { canActorAccessLevel, ForbiddenError, UnauthorizedError } from '@jeanius/domain';

/**
 * Asserts that an actor session exists (is not anonymous/guest).
 */
export function assertAuthenticated(actor: Actor | null | undefined): asserts actor is Actor {
  if (!actor || actor.role === 'GUEST') {
    throw new UnauthorizedError('Authentication required to access this resource.');
  }
}

/**
 * Asserts that an actor possesses one of the allowed roles.
 */
export function assertActorHasRole(actor: Actor, allowedRoles: readonly ActorRole[]): void {
  assertAuthenticated(actor);
  if (!allowedRoles.includes(actor.role)) {
    throw new ForbiddenError(
      actor.role,
      `Access restricted to roles: [${allowedRoles.join(', ')}]`,
    );
  }
}

/**
 * Asserts that an actor has at least the required access level.
 */
export function assertActorAccessLevel(actor: Actor, requiredLevel: AccessLevel): void {
  if (!canActorAccessLevel(actor.role, requiredLevel)) {
    throw new ForbiddenError(actor.role, `Requires ${requiredLevel} access level`);
  }
}

/**
 * Asserts whether a Project 925 OM production job can still be cancelled or edited.
 * Point of No Return:
 * - Sterling Silver Jewellery: Stage 'CASTING' (once molten .925 sterling silver is poured into flask)
 */
export function assertPrePointOfNoReturn(_category: string, currentStage: string): void {
  const irreversibleStages = [
    'CASTING',
    'SETTING',
    'PATINA',
    'POLISHING',
    'QC',
    'READY',
    'SHIPPED',
  ];

  if (irreversibleStages.includes(currentStage)) {
    throw new ForbiddenError(
      'PRODUCTION',
      `Order item cannot be modified or cancelled: metalsmithing process has already reached stage '${currentStage}'. (Point of No Return is 'CASTING' when liquid sterling silver is poured).`,
    );
  }
}
