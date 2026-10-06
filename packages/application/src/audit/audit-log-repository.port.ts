export interface AuditLogRecord {
  readonly actorId: string;
  readonly actorRole: string;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly payload?: Record<string, unknown>;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly createdAt?: Date;
}

export interface IAuditLogRepository {
  record(log: AuditLogRecord): Promise<void>;
  findRecent(limit?: number): Promise<AuditLogRecord[]>;
}
