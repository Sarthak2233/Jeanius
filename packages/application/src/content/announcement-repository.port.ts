import type { Announcement, AnnouncementId } from '@jeanius/domain';

export interface IAnnouncementRepository {
  findById(id: AnnouncementId): Promise<Announcement | null>;
  listActive(at?: Date): Promise<readonly Announcement[]>;
  listAll(): Promise<readonly Announcement[]>;
  save(announcement: Announcement): Promise<void>;
  delete(id: AnnouncementId): Promise<void>;
}
