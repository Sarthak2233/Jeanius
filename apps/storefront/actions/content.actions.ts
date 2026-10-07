'use server';

import { db, DrizzleContentPageRepository, DrizzleAnnouncementRepository } from '@jeanius/database';
import { ContentService } from '@jeanius/application';

export interface ActionResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: {
    readonly code: string;
    readonly message: string;
  };
}

export interface ContentPageDto {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly contentMarkdown: string;
  readonly metaDescription?: string;
  readonly status: string;
  readonly publishedAt?: string;
  readonly updatedAt: string;
}

export interface AnnouncementDto {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly type: string;
  readonly priority: number;
}

function getContentService() {
  const contentPageRepo = new DrizzleContentPageRepository(db);
  const announcementRepo = new DrizzleAnnouncementRepository(db);
  return new ContentService(contentPageRepo, announcementRepo);
}

export async function getContentPageAction(slug: string): Promise<ActionResult<ContentPageDto>> {
  try {
    const service = getContentService();
    const page = await service.getPageBySlug(slug);

    if (!page) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: `Page "${slug}" not found or not published` },
      };
    }

    return {
      success: true,
      data: {
        id: page.id,
        slug: page.slug,
        title: page.title,
        contentMarkdown: page.contentMarkdown,
        metaDescription: page.metaDescription,
        status: page.status,
        publishedAt: page.publishedAt?.toISOString(),
        updatedAt: page.updatedAt.toISOString(),
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve content page';
    return {
      success: false,
      error: { code: 'CONTENT_RETRIEVAL_FAILED', message },
    };
  }
}

export async function getActiveAnnouncementsAction(): Promise<
  ActionResult<readonly AnnouncementDto[]>
> {
  try {
    const service = getContentService();
    const active = await service.getActiveAnnouncements();

    return {
      success: true,
      data: active.map((a) => ({
        id: a.id,
        title: a.title,
        message: a.message,
        type: a.type,
        priority: a.priority,
      })),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve active announcements';
    return {
      success: false,
      error: { code: 'ANNOUNCEMENT_RETRIEVAL_FAILED', message },
    };
  }
}
