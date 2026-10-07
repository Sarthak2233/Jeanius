import { eq, and, lte, or, gt, isNull, desc } from 'drizzle-orm';
import type { Database } from '../../client';
import { announcements } from '../../schema/content';
import type { IAnnouncementRepository } from '@jeanius/application';
import {
  Announcement,
  createEntityId,
  type AnnouncementId,
  type AnnouncementType,
} from '@jeanius/domain';

export class DrizzleAnnouncementRepository implements IAnnouncementRepository {
  constructor(private readonly db: Database) {}

  async findById(id: AnnouncementId): Promise<Announcement | null> {
    const rows = await this.db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id))
      .limit(1);

    const row = rows[0];
    if (!row) return null;
    return this.mapToDomain(row);
  }

  async listActive(at: Date = new Date()): Promise<readonly Announcement[]> {
    const rows = await this.db
      .select()
      .from(announcements)
      .where(
        and(
          lte(announcements.startDate, at),
          or(isNull(announcements.endDate), gt(announcements.endDate, at)),
        ),
      )
      .orderBy(desc(announcements.priority), desc(announcements.startDate));

    return rows.map((r) => this.mapToDomain(r));
  }

  async listAll(): Promise<readonly Announcement[]> {
    const rows = await this.db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.priority), desc(announcements.createdAt));

    return rows.map((r) => this.mapToDomain(r));
  }

  async save(announcement: Announcement): Promise<void> {
    await this.db
      .insert(announcements)
      .values({
        id: announcement.id,
        title: announcement.title,
        message: announcement.message,
        type: announcement.type,
        startDate: announcement.startDate,
        endDate: announcement.endDate ?? null,
        priority: announcement.priority,
      })
      .onConflictDoUpdate({
        target: announcements.id,
        set: {
          title: announcement.title,
          message: announcement.message,
          type: announcement.type,
          startDate: announcement.startDate,
          endDate: announcement.endDate ?? null,
          priority: announcement.priority,
        },
      });
  }

  async delete(id: AnnouncementId): Promise<void> {
    await this.db.delete(announcements).where(eq(announcements.id, id));
  }

  private mapToDomain(row: typeof announcements.$inferSelect): Announcement {
    return new Announcement({
      id: createEntityId<'Announcement'>(row.id),
      title: row.title,
      message: row.message,
      type: row.type as AnnouncementType,
      startDate: row.startDate,
      endDate: row.endDate ?? undefined,
      priority: row.priority,
    });
  }
}
