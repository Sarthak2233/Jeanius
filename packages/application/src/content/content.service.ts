/**
 * ContentService (JN-157 -> JN-167).
 * Application service orchestrating CMS pages and operational site announcements.
 */
import {
  ContentPage,
  type ContentPageId,
  type ContentPageStatus,
  Announcement,
  type AnnouncementId,
  type AnnouncementType,
  DomainError,
} from '@jeanius/domain';
import { createLogger } from '@jeanius/observability';
import type { IContentPageRepository } from './content-page-repository.port.js';
import type { IAnnouncementRepository } from './announcement-repository.port.js';

export interface CreateContentPageDto {
  readonly id: ContentPageId;
  readonly slug: string;
  readonly title: string;
  readonly contentMarkdown: string;
  readonly metaDescription?: string;
  readonly status?: ContentPageStatus;
}

export interface UpdateContentPageDto {
  readonly id: ContentPageId;
  readonly title?: string;
  readonly contentMarkdown?: string;
  readonly metaDescription?: string;
  readonly status?: ContentPageStatus;
}

export interface CreateAnnouncementDto {
  readonly id: AnnouncementId;
  readonly title: string;
  readonly message: string;
  readonly type?: AnnouncementType;
  readonly startDate: Date;
  readonly endDate?: Date;
  readonly priority?: number;
}

export class ContentService {
  private readonly logger = createLogger('content-service');

  constructor(
    private readonly contentPageRepo: IContentPageRepository,
    private readonly announcementRepo: IAnnouncementRepository,
  ) {}

  // ================= Content Pages =================

  async getPageBySlug(
    slug: string,
    options?: { readonly allowDraft?: boolean },
  ): Promise<ContentPage | null> {
    const page = await this.contentPageRepo.findBySlug(slug);
    if (!page) {
      this.logger.debug('Content page not found by slug', { slug });
      return null;
    }

    if (!options?.allowDraft && page.status !== 'PUBLISHED') {
      this.logger.debug('Content page exists but is not published', { slug, status: page.status });
      return null;
    }

    this.logger.debug('Content page resolved', { slug, id: page.id, status: page.status });
    return page;
  }

  async getPageById(id: ContentPageId): Promise<ContentPage | null> {
    return this.contentPageRepo.findById(id);
  }

  async listPublishedPages(): Promise<readonly ContentPage[]> {
    const pages = await this.contentPageRepo.listPublished();
    this.logger.debug('Listed published content pages', { count: pages.length });
    return pages;
  }

  async listAllPages(): Promise<readonly ContentPage[]> {
    const pages = await this.contentPageRepo.listAll();
    this.logger.debug('Listed all content pages', { count: pages.length });
    return pages;
  }

  async createPage(dto: CreateContentPageDto): Promise<ContentPage> {
    const existing = await this.contentPageRepo.findBySlug(dto.slug);
    if (existing) {
      this.logger.warn('Failed to create content page: slug already exists', { slug: dto.slug });
      throw new DomainError(`Content page with slug "${dto.slug}" already exists`);
    }

    const page = new ContentPage({
      id: dto.id,
      slug: dto.slug,
      title: dto.title,
      contentMarkdown: dto.contentMarkdown,
      metaDescription: dto.metaDescription,
      status: dto.status ?? 'DRAFT',
    });

    await this.contentPageRepo.save(page);
    this.logger.info('Created content page', {
      id: page.id,
      slug: page.slug,
      status: page.status,
      title: page.title,
    });
    return page;
  }

  async updatePage(dto: UpdateContentPageDto): Promise<ContentPage> {
    const existing = await this.contentPageRepo.findById(dto.id);
    if (!existing) {
      this.logger.warn('Failed to update content page: page not found', { id: dto.id });
      throw new DomainError(`Content page not found: ${dto.id}`);
    }

    const updated = new ContentPage({
      id: existing.id,
      slug: existing.slug,
      title: dto.title ?? existing.title,
      contentMarkdown: dto.contentMarkdown ?? existing.contentMarkdown,
      metaDescription:
        dto.metaDescription !== undefined ? dto.metaDescription : existing.metaDescription,
      status: dto.status ?? existing.status,
      publishedAt:
        dto.status === 'PUBLISHED' ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    await this.contentPageRepo.save(updated);
    this.logger.info('Updated content page', {
      id: updated.id,
      slug: updated.slug,
      status: updated.status,
    });
    return updated;
  }

  async publishPage(id: ContentPageId): Promise<ContentPage> {
    const page = await this.contentPageRepo.findById(id);
    if (!page) {
      this.logger.warn('Failed to publish content page: not found', { id });
      throw new DomainError(`Content page not found: ${id}`);
    }

    page.publish();
    await this.contentPageRepo.save(page);
    this.logger.info('Published content page', {
      id: page.id,
      slug: page.slug,
      publishedAt: page.publishedAt?.toISOString(),
    });
    return page;
  }

  async archivePage(id: ContentPageId): Promise<ContentPage> {
    const page = await this.contentPageRepo.findById(id);
    if (!page) {
      this.logger.warn('Failed to archive content page: not found', { id });
      throw new DomainError(`Content page not found: ${id}`);
    }

    page.archive();
    await this.contentPageRepo.save(page);
    this.logger.info('Archived content page', { id: page.id, slug: page.slug });
    return page;
  }

  async deletePage(id: ContentPageId): Promise<void> {
    await this.contentPageRepo.delete(id);
    this.logger.info('Deleted content page', { id });
  }

  // ================= Announcements =================

  async getActiveAnnouncements(at: Date = new Date()): Promise<readonly Announcement[]> {
    const announcements = await this.announcementRepo.listActive(at);
    this.logger.debug('Retrieved active announcements', { count: announcements.length });
    return announcements;
  }

  async listAllAnnouncements(): Promise<readonly Announcement[]> {
    return this.announcementRepo.listAll();
  }

  async createAnnouncement(dto: CreateAnnouncementDto): Promise<Announcement> {
    const announcement = new Announcement({
      id: dto.id,
      title: dto.title,
      message: dto.message,
      type: dto.type,
      startDate: dto.startDate,
      endDate: dto.endDate,
      priority: dto.priority,
    });

    await this.announcementRepo.save(announcement);
    this.logger.info('Created site announcement', {
      id: announcement.id,
      type: announcement.type,
      priority: announcement.priority,
    });
    return announcement;
  }

  async deleteAnnouncement(id: AnnouncementId): Promise<void> {
    await this.announcementRepo.delete(id);
    this.logger.info('Deleted site announcement', { id });
  }
}
