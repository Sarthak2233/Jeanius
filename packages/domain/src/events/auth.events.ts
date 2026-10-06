import type { DomainEvent } from './domain-event.js';
import type { ActorRole } from '../index.js';

export interface UserRegisteredPayload {
  readonly email: string;
  readonly fullName: string;
  readonly role: ActorRole;
}

export class UserRegisteredEvent implements DomainEvent<UserRegisteredPayload> {
  readonly eventId: string;
  readonly eventType = 'USER_REGISTERED';
  readonly eventName = 'USER_REGISTERED';
  readonly occurredAt: string;

  constructor(
    readonly aggregateId: string,
    readonly payload: UserRegisteredPayload,
  ) {
    this.eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.occurredAt = new Date().toISOString();
  }
}

export interface PasswordResetRequestedPayload {
  readonly email: string;
}

export class PasswordResetRequestedEvent implements DomainEvent<PasswordResetRequestedPayload> {
  readonly eventId: string;
  readonly eventType = 'PASSWORD_RESET_REQUESTED';
  readonly eventName = 'PASSWORD_RESET_REQUESTED';
  readonly occurredAt: string;

  constructor(
    readonly aggregateId: string,
    readonly payload: PasswordResetRequestedPayload,
  ) {
    this.eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.occurredAt = new Date().toISOString();
  }
}

export interface StaffRoleAssignedPayload {
  readonly email: string;
  readonly newRole: ActorRole;
  readonly assignedBy: string;
}

export class StaffRoleAssignedEvent implements DomainEvent<StaffRoleAssignedPayload> {
  readonly eventId: string;
  readonly eventType = 'STAFF_ROLE_ASSIGNED';
  readonly eventName = 'STAFF_ROLE_ASSIGNED';
  readonly occurredAt: string;

  constructor(
    readonly aggregateId: string,
    readonly payload: StaffRoleAssignedPayload,
  ) {
    this.eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.occurredAt = new Date().toISOString();
  }
}
