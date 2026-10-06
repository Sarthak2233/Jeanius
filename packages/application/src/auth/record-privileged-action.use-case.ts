import type { Actor } from '@jeanius/domain';
import { assertActorHasRole } from './auth-guards';
import type { IAuditLogRepository } from '../audit/audit-log-repository.port';

export interface PrivilegedActionParams {
  readonly actor: Actor;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly payload?: Record<string, unknown>;
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

export class RecordPrivilegedActionUseCase {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async execute(params: PrivilegedActionParams): Promise<void> {
    // Only privileged staff and admin roles can author privileged actions
    assertActorHasRole(params.actor, ['ADMIN', 'TAILOR', 'JEWELLER', 'FULFILLMENT', 'SUPPORT']);

    await this.auditLogRepository.record({
      actorId: params.actor.id,
      actorRole: params.actor.role,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      payload: params.payload,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      createdAt: new Date(),
    });
  }
}
