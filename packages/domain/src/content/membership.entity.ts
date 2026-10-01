/**
 * Membership entity (JN-083).
 * Selvedge Society membership tiers, early drop access, and private craft archive access.
 */
import type { MembershipId, CustomerId } from '../common/entity-id.js';
import { DomainError } from '../errors/index.js';

export type MembershipTier = 'STANDARD' | 'SELVEDGE_SOCIETY' | 'FOUNDER';

export interface MembershipProps {
  readonly id: MembershipId;
  readonly customerId: CustomerId;
  readonly tier: MembershipTier;
  readonly startDate: Date;
  readonly endDate?: Date;
  readonly benefits?: readonly string[];
  readonly createdAt?: Date;
}

export class Membership {
  readonly id: MembershipId;
  readonly customerId: CustomerId;
  readonly tier: MembershipTier;
  readonly startDate: Date;
  readonly endDate?: Date;
  readonly benefits: readonly string[];
  readonly createdAt: Date;

  constructor(props: MembershipProps) {
    if (props.endDate && props.endDate.getTime() <= props.startDate.getTime()) {
      throw new DomainError('Membership end date must be after start date');
    }

    this.id = props.id;
    this.customerId = props.customerId;
    this.tier = props.tier;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.benefits = props.benefits ? [...props.benefits] : [];
    this.createdAt = props.createdAt ?? new Date();
  }

  isActive(at: Date = new Date()): boolean {
    const time = at.getTime();
    if (time < this.startDate.getTime()) return false;
    if (this.endDate && time > this.endDate.getTime()) return false;
    return true;
  }

  hasBenefit(benefit: string): boolean {
    return this.benefits.includes(benefit);
  }
}
