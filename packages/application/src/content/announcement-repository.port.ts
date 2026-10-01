import type { Announcement } from '@jeanius/domain';

export interface IAnnouncementRepository {
  listActive(): Promise<readonly Announcement[]>;
  save(announcement: Announcement): Promise<void>;
}
