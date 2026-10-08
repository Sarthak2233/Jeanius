'use server';

import { db, DrizzleContentPageRepository, DrizzleAnnouncementRepository } from '@jeanius/database';
import { ContentService } from '@jeanius/application';
import { createLogger, generateTraceId } from '@jeanius/observability';

const logger = createLogger('storefront:content-actions');

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
  const traceId = generateTraceId();
  const start = Date.now();
  logger.debug('getContentPageAction invoked', { traceId, slug });

  try {
    const service = getContentService();
    const page = await service.getPageBySlug(slug);

    if (!page) {
      logger.warn('Content page not found in action', {
        traceId,
        slug,
        durationMs: Date.now() - start,
      });
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: `Page "${slug}" not found or not published` },
      };
    }

    logger.info('Content page retrieved successfully', {
      traceId,
      slug,
      id: page.id,
      durationMs: Date.now() - start,
    });

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
    logger.error('Failed to retrieve content page in action', err, {
      traceId,
      slug,
      durationMs: Date.now() - start,
    });
    return {
      success: false,
      error: { code: 'CONTENT_RETRIEVAL_FAILED', message },
    };
  }
}

export async function listPublishedContentPagesAction(): Promise<
  ActionResult<readonly ContentPageDto[]>
> {
  const traceId = generateTraceId();
  const start = Date.now();
  logger.debug('listPublishedContentPagesAction invoked', { traceId });

  try {
    const service = getContentService();
    const pages = await service.listPublishedPages();

    logger.info('Listed published content pages', {
      traceId,
      count: pages.length,
      durationMs: Date.now() - start,
    });

    return {
      success: true,
      data: pages.map((page) => ({
        id: page.id,
        slug: page.slug,
        title: page.title,
        contentMarkdown: page.contentMarkdown,
        metaDescription: page.metaDescription,
        status: page.status,
        publishedAt: page.publishedAt?.toISOString(),
        updatedAt: page.updatedAt.toISOString(),
      })),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to list published content pages';
    logger.error('Failed to list published content pages in action', err, {
      traceId,
      durationMs: Date.now() - start,
    });
    return {
      success: false,
      error: { code: 'CONTENT_LIST_FAILED', message },
    };
  }
}

export async function getActiveAnnouncementsAction(): Promise<
  ActionResult<readonly AnnouncementDto[]>
> {
  const traceId = generateTraceId();
  const start = Date.now();
  logger.debug('getActiveAnnouncementsAction invoked', { traceId });

  try {
    const service = getContentService();
    const active = await service.getActiveAnnouncements();

    logger.info('Retrieved active announcements', {
      traceId,
      count: active.length,
      durationMs: Date.now() - start,
    });

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
    logger.error('Failed to retrieve active announcements in action', err, {
      traceId,
      durationMs: Date.now() - start,
    });
    return {
      success: false,
      error: { code: 'ANNOUNCEMENT_RETRIEVAL_FAILED', message },
    };
  }
}
