import type { DomainEvent } from '@jeanius/domain';

export interface OutboxMessage {
  readonly id?: string;
  readonly eventName: string;
  readonly aggregateId: string;
  readonly eventType: string;
  readonly payload: Record<string, unknown>;
}

export interface IOutboxRepository {
  append(events: readonly (DomainEvent | OutboxMessage)[]): Promise<void>;
  fetchPendingBatch(batchSize: number): Promise<readonly OutboxMessage[]>;
  markCompleted(eventIds: readonly string[]): Promise<void>;
  markFailed(eventId: string, error: string): Promise<void>;
}
