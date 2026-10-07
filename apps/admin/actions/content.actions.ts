'use server';

import {
  db,
  DrizzleContentPageRepository,
  DrizzleAnnouncementRepository,
  DrizzleAuditLogRepository,
} from '@jeanius/database';
import { ContentService, RecordPrivilegedActionUseCase } from '@jeanius/application';
import { createEntityId, type Actor, type ActorRole } from '@jeanius/domain';
import { createClient } from '../lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface AdminActionResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: {
    readonly code: string;
    readonly message: string;
  };
}

export interface ContentPageSummaryDto {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly contentMarkdown: string;
  readonly metaDescription?: string;
  readonly status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  readonly isPublished: boolean;
  readonly publishedAt?: string;
  readonly updatedAt: string;
}

export interface AnnouncementAdminDto {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly type: 'INFO' | 'WARNING' | 'ALERT' | 'PROMO';
  readonly startDate: string;
  readonly endDate?: string;
  readonly priority: number;
}

async function getAdminContentService() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  const role = (user.user_metadata?.role as string) || 'STAFF';
  if (role !== 'ADMIN' && role !== 'SUPPORT') {
    throw new Error('Unauthorized staff role');
  }

  const actor: Actor = {
    id: user.id,
    role: role as ActorRole,
    email: user.email || 'staff@jeanius.co',
  };

  const pageRepo = new DrizzleContentPageRepository(db);
  const annRepo = new DrizzleAnnouncementRepository(db);
  const auditRepo = new DrizzleAuditLogRepository(db);
  const contentService = new ContentService(pageRepo, annRepo);
  const auditUseCase = new RecordPrivilegedActionUseCase(auditRepo);

  return { actor, contentService, auditUseCase };
}

export async function listAllContentPagesAction(): Promise<
  AdminActionResult<readonly ContentPageSummaryDto[]>
> {
  try {
    const { contentService } = await getAdminContentService();
    const pages = await contentService.listAllPages();

    return {
      success: true,
      data: pages.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        contentMarkdown: p.contentMarkdown,
        metaDescription: p.metaDescription,
        status: p.status,
        isPublished: p.isPublished,
        publishedAt: p.publishedAt?.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to list content pages';
    return { success: false, error: { code: 'LIST_PAGES_FAILED', message } };
  }
}

export async function saveContentPageAction(data: {
  readonly id?: string;
  readonly slug: string;
  readonly title: string;
  readonly contentMarkdown: string;
  readonly metaDescription?: string;
  readonly status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}): Promise<AdminActionResult<{ id: string }>> {
  try {
    const { actor, contentService, auditUseCase } = await getAdminContentService();

    if (data.id) {
      const pageId = createEntityId<'ContentPage'>(data.id);
      await contentService.updatePage({
        id: pageId,
        title: data.title,
        contentMarkdown: data.contentMarkdown,
        metaDescription: data.metaDescription,
        status: data.status,
      });

      await auditUseCase.execute({
        actor,
        action: 'UPDATE_CONTENT_PAGE',
        entityType: 'ContentPage',
        entityId: data.id,
        payload: { title: data.title, status: data.status },
      });

      revalidatePath('/content');
      return { success: true, data: { id: data.id } };
    }

    const pageId = createEntityId<'ContentPage'>(crypto.randomUUID());
    await contentService.createPage({
      id: pageId,
      slug: data.slug,
      title: data.title,
      contentMarkdown: data.contentMarkdown,
      metaDescription: data.metaDescription,
      status: data.status ?? 'DRAFT',
    });

    await auditUseCase.execute({
      actor,
      action: 'CREATE_CONTENT_PAGE',
      entityType: 'ContentPage',
      entityId: pageId,
      payload: { slug: data.slug, title: data.title },
    });

    revalidatePath('/content');
    return { success: true, data: { id: pageId } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save content page';
    return { success: false, error: { code: 'SAVE_PAGE_FAILED', message } };
  }
}

export async function publishContentPageAction(id: string): Promise<AdminActionResult<void>> {
  try {
    const { actor, contentService, auditUseCase } = await getAdminContentService();
    const pageId = createEntityId<'ContentPage'>(id);
    await contentService.publishPage(pageId);

    await auditUseCase.execute({
      actor,
      action: 'PUBLISH_CONTENT_PAGE',
      entityType: 'ContentPage',
      entityId: id,
    });

    revalidatePath('/content');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to publish content page';
    return { success: false, error: { code: 'PUBLISH_PAGE_FAILED', message } };
  }
}

export async function archiveContentPageAction(id: string): Promise<AdminActionResult<void>> {
  try {
    const { actor, contentService, auditUseCase } = await getAdminContentService();
    const pageId = createEntityId<'ContentPage'>(id);
    await contentService.archivePage(pageId);

    await auditUseCase.execute({
      actor,
      action: 'ARCHIVE_CONTENT_PAGE',
      entityType: 'ContentPage',
      entityId: id,
    });

    revalidatePath('/content');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to archive content page';
    return { success: false, error: { code: 'ARCHIVE_PAGE_FAILED', message } };
  }
}

export async function listAllAnnouncementsAction(): Promise<
  AdminActionResult<readonly AnnouncementAdminDto[]>
> {
  try {
    const { contentService } = await getAdminContentService();
    const list = await contentService.listAllAnnouncements();

    return {
      success: true,
      data: list.map((a) => ({
        id: a.id,
        title: a.title,
        message: a.message,
        type: a.type,
        startDate: a.startDate.toISOString(),
        endDate: a.endDate?.toISOString(),
        priority: a.priority,
      })),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to list announcements';
    return { success: false, error: { code: 'LIST_ANNOUNCEMENTS_FAILED', message } };
  }
}

export async function saveAnnouncementAction(data: {
  readonly id?: string;
  readonly title: string;
  readonly message: string;
  readonly type?: 'INFO' | 'WARNING' | 'ALERT' | 'PROMO';
  readonly startDate: string;
  readonly endDate?: string;
  readonly priority?: number;
}): Promise<AdminActionResult<{ id: string }>> {
  try {
    const { actor, contentService, auditUseCase } = await getAdminContentService();
    const annId = createEntityId<'Announcement'>(data.id || crypto.randomUUID());

    await contentService.createAnnouncement({
      id: annId,
      title: data.title,
      message: data.message,
      type: data.type ?? 'INFO',
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      priority: data.priority ?? 0,
    });

    await auditUseCase.execute({
      actor,
      action: 'SAVE_ANNOUNCEMENT',
      entityType: 'Announcement',
      entityId: annId,
      payload: { title: data.title, priority: data.priority },
    });

    revalidatePath('/content');
    return { success: true, data: { id: annId } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save announcement';
    return { success: false, error: { code: 'SAVE_ANNOUNCEMENT_FAILED', message } };
  }
}

export async function deleteAnnouncementAction(id: string): Promise<AdminActionResult<void>> {
  try {
    const { actor, contentService, auditUseCase } = await getAdminContentService();
    const annId = createEntityId<'Announcement'>(id);
    await contentService.deleteAnnouncement(annId);

    await auditUseCase.execute({
      actor,
      action: 'DELETE_ANNOUNCEMENT',
      entityType: 'Announcement',
      entityId: id,
    });

    revalidatePath('/content');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete announcement';
    return { success: false, error: { code: 'DELETE_ANNOUNCEMENT_FAILED', message } };
  }
}
