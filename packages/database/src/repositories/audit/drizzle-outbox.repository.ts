import { eq, inArray } from 'drizzle-orm';
import type { DomainEvent } from '@jeanius/domain';
import type { IOutboxRepository, OutboxMessage } from '@jeanius/application';
import { db, type Database } from '../../client';
import { outboxEvents } from '../../schema/audit';

export class DrizzleOutboxRepository implements IOutboxRepository {
  constructor(private readonly database: Database = db) {}

  async append(events: readonly (DomainEvent | OutboxMessage)[]): Promise<void> {
    if (events.length === 0) return;

    await this.database.insert(outboxEvents).values(
      events.map((evt) => {
        const isDomainEvent = 'eventId' in evt;
        const id = isDomainEvent ? evt.eventId : evt.id;
        const eventName = isDomainEvent ? evt.eventType : evt.eventName;
        const aggregateId =
          !isDomainEvent && evt.aggregateId
            ? evt.aggregateId
            : (((evt.payload as Record<string, unknown>)?.['aggregateId'] as string) ??
              'aggregate_unknown');
        const eventType = evt.eventType;
        const payload = (evt.payload as Record<string, unknown>) ?? {};

        return {
          id: id ?? undefined,
          eventName,
          aggregateId,
          eventType,
          payload,
          status: 'PENDING' as const,
          retryCount: 0,
          createdAt: new Date(),
        };
      }),
    );
  }

  async fetchPendingBatch(batchSize = 20): Promise<readonly OutboxMessage[]> {
    const rows = await this.database
      .select()
      .from(outboxEvents)
      .where(eq(outboxEvents.status, 'PENDING'))
      .limit(batchSize);

    return rows.map((r) => ({
      id: r.id,
      eventName: r.eventName,
      aggregateId: r.aggregateId,
      eventType: r.eventType,
      payload: r.payload,
    }));
  }

  async markCompleted(eventIds: readonly string[]): Promise<void> {
    if (eventIds.length === 0) return;

    await this.database
      .update(outboxEvents)
      .set({
        status: 'COMPLETED',
        processedAt: new Date(),
      })
      .where(inArray(outboxEvents.id, [...eventIds]));
  }

  async markFailed(eventId: string, error: string): Promise<void> {
    const existing = await this.database
      .select({ retryCount: outboxEvents.retryCount })
      .from(outboxEvents)
      .where(eq(outboxEvents.id, eventId))
      .limit(1);

    const currentCount = existing[0]?.retryCount ?? 0;

    await this.database
      .update(outboxEvents)
      .set({
        status: currentCount >= 3 ? 'FAILED' : 'PENDING',
        retryCount: currentCount + 1,
        lastError: error,
      })
      .where(eq(outboxEvents.id, eventId));
  }
}
