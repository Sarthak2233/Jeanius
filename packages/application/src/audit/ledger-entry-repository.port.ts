import type { LedgerEntry } from '@jeanius/domain';

export interface ILedgerEntryRepository {
  record(entry: LedgerEntry): Promise<void>;
  listByReference(reference: string): Promise<readonly LedgerEntry[]>;
}
