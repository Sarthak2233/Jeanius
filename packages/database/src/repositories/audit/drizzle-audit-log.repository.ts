import { desc } from 'drizzle-orm';
import type { Database } from '../../client';
import { auditLogs } from '../../schema/audit';
import type { IAuditLogRepository, AuditLogRecord } from '@jeanius/application';

export class DrizzleAuditLogRepository implements IAuditLogRepository {
  constructor(private readonly db: Database) {}

  async record(log: AuditLogRecord): Promise<void> {
    await this.db.insert(auditLogs).values({
      actorId: log.actorId,
      actorRole: log.actorRole,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      payload: log.payload ?? null,
      ipAddress: log.ipAddress ?? null,
      userAgent: log.userAgent ?? null,
      createdAt: log.createdAt ?? new Date(),
    });
  }

  async findRecent(limit = 20): Promise<AuditLogRecord[]> {
    const rows = await this.db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);

    return rows.map((r) => ({
      actorId: r.actorId,
      actorRole: r.actorRole,
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId,
      payload: (r.payload as Record<string, unknown>) ?? undefined,
      ipAddress: r.ipAddress ?? undefined,
      userAgent: r.userAgent ?? undefined,
      createdAt: r.createdAt,
    }));
  }
}
