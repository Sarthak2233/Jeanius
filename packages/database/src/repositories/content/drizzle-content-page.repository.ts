import { eq, or } from 'drizzle-orm';
import type { Database } from '../../client';
import { contentPages } from '../../schema/content';
import type { IContentPageRepository } from '@jeanius/application';
import {
  ContentPage,
  createEntityId,
  type ContentPageId,
  type ContentPageStatus,
} from '@jeanius/domain';

export class DrizzleContentPageRepository implements IContentPageRepository {
  constructor(private readonly db: Database) {}

  async findById(id: ContentPageId): Promise<ContentPage | null> {
    const rows = await this.db.select().from(contentPages).where(eq(contentPages.id, id)).limit(1);

    const row = rows[0];
    if (!row) return null;
    return this.mapToDomain(row);
  }

  async findBySlug(slug: string): Promise<ContentPage | null> {
    const rows = await this.db
      .select()
      .from(contentPages)
      .where(eq(contentPages.slug, slug.toLowerCase().trim()))
      .limit(1);

    const row = rows[0];
    if (!row) return null;
    return this.mapToDomain(row);
  }

  async listPublished(): Promise<readonly ContentPage[]> {
    const rows = await this.db
      .select()
      .from(contentPages)
      .where(or(eq(contentPages.status, 'PUBLISHED'), eq(contentPages.isPublished, true)));

    return rows.map((r) => this.mapToDomain(r));
  }

  async listAll(): Promise<readonly ContentPage[]> {
    const rows = await this.db.select().from(contentPages).orderBy(contentPages.updatedAt);

    return rows.map((r) => this.mapToDomain(r));
  }

  async save(page: ContentPage): Promise<void> {
    await this.db
      .insert(contentPages)
      .values({
        id: page.id,
        slug: page.slug,
        title: page.title,
        contentMarkdown: page.contentMarkdown,
        metaDescription: page.metaDescription ?? null,
        status: page.status,
        isPublished: page.isPublished,
        publishedAt: page.publishedAt ?? null,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
      })
      .onConflictDoUpdate({
        target: contentPages.slug,
        set: {
          title: page.title,
          contentMarkdown: page.contentMarkdown,
          metaDescription: page.metaDescription ?? null,
          status: page.status,
          isPublished: page.isPublished,
          publishedAt: page.publishedAt ?? null,
          updatedAt: page.updatedAt,
        },
      });
  }

  async delete(id: ContentPageId): Promise<void> {
    await this.db.delete(contentPages).where(eq(contentPages.id, id));
  }

  private mapToDomain(row: typeof contentPages.$inferSelect): ContentPage {
    return new ContentPage({
      id: createEntityId<'ContentPage'>(row.id),
      slug: row.slug,
      title: row.title,
      contentMarkdown: row.contentMarkdown,
      metaDescription: row.metaDescription ?? undefined,
      status: (row.status as ContentPageStatus) ?? (row.isPublished ? 'PUBLISHED' : 'DRAFT'),
      isPublished: row.isPublished,
      publishedAt: row.publishedAt ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
