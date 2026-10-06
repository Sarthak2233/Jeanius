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
 * Asserts whether an OM production job can still be cancelled or edited by the customer/support.
 * Point of No Return:
 * - Denim (BOTTOMS / TOPS): Stage 'CUTTING'
 * - Jewellery (JEWELLERY): Stage 'CASTING'
 */
export function assertPrePointOfNoReturn(
  category: 'BOTTOMS' | 'TOPS' | 'JEWELLERY' | 'ACCESSORIES',
  currentStage: string,
): void {
  const isJewellery = category === 'JEWELLERY';
  const pointOfNoReturn = isJewellery ? 'CASTING' : 'CUTTING';
  const irreversibleStages = isJewellery
    ? ['CASTING', 'SETTING', 'PATINA', 'POLISHING', 'QC', 'READY', 'SHIPPED']
    : ['CUTTING', 'SEWING', 'WASHING', 'HARDWARE', 'QC', 'READY', 'SHIPPED'];

  if (irreversibleStages.includes(currentStage)) {
    throw new ForbiddenError(
      category,
      `Order item cannot be modified or cancelled: craft process has already reached stage '${currentStage}'. (Point of No Return for ${isJewellery ? 'jewellery' : 'denim'} is '${pointOfNoReturn}').`,
    );
  }
}
