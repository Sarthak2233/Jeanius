import type { Actor } from '@jeanius/domain';

export interface MembershipAccessResult {
  readonly isAllowed: boolean;
  readonly reason?: string;
  readonly isVipMember: boolean;
  readonly hasEarlyAccess: boolean;
}

export class CheckMembershipAccessUseCase {
  async execute(actor: Actor | null | undefined): Promise<MembershipAccessResult> {
    if (!actor || actor.role === 'GUEST') {
      return {
        isAllowed: false,
        reason: 'Authentication required to view member collection.',
        isVipMember: false,
        hasEarlyAccess: false,
      };
    }

    if (actor.role === 'ADMIN' || actor.role === 'MEMBER') {
      return {
        isAllowed: true,
        isVipMember: true,
        hasEarlyAccess: true,
      };
    }

    return {
      isAllowed: false,
      reason: 'Membership in Selvedge & Jewellery Society required to access this release.',
      isVipMember: false,
      hasEarlyAccess: false,
    };
  }
}
