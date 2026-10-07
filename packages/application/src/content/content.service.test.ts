import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  type ContentPage,
  type Announcement,
  createEntityId,
  type ContentPageId,
  type AnnouncementId,
  DomainError,
} from '@jeanius/domain';
import { ContentService } from './content.service.js';
import type { IContentPageRepository } from './content-page-repository.port.js';
import type { IAnnouncementRepository } from './announcement-repository.port.js';

class MockContentPageRepository implements IContentPageRepository {
  private pages = new Map<string, ContentPage>();

  async findById(id: ContentPageId): Promise<ContentPage | null> {
    return this.pages.get(id) ?? null;
  }

  async findBySlug(slug: string): Promise<ContentPage | null> {
    for (const page of this.pages.values()) {
      if (page.slug === slug.toLowerCase()) return page;
    }
    return null;
  }

  async listPublished(): Promise<readonly ContentPage[]> {
    return Array.from(this.pages.values()).filter((p) => p.isPublished);
  }

  async listAll(): Promise<readonly ContentPage[]> {
    return Array.from(this.pages.values());
  }

  async save(page: ContentPage): Promise<void> {
    this.pages.set(page.id, page);
  }

  async delete(id: ContentPageId): Promise<void> {
    this.pages.delete(id);
  }
}

class MockAnnouncementRepository implements IAnnouncementRepository {
  private announcements = new Map<string, Announcement>();

  async findById(id: AnnouncementId): Promise<Announcement | null> {
    return this.announcementRepoList().find((a) => a.id === id) ?? null;
  }

  private announcementRepoList(): Announcement[] {
    return Array.from(this.announcements.values());
  }

  async listActive(at: Date = new Date()): Promise<readonly Announcement[]> {
    return this.announcementRepoList()
      .filter((a) => a.isActive(at))
      .sort((a, b) => b.priority - a.priority);
  }

  async listAll(): Promise<readonly Announcement[]> {
    return this.announcementRepoList().sort((a, b) => b.priority - a.priority);
  }

  async save(announcement: Announcement): Promise<void> {
    this.announcements.set(announcement.id, announcement);
  }

  async delete(id: AnnouncementId): Promise<void> {
    this.announcements.delete(id);
  }
}

describe('ContentService', () => {
  it('creates and retrieves published pages by slug', async () => {
    const pageRepo = new MockContentPageRepository();
    const annRepo = new MockAnnouncementRepository();
    const service = new ContentService(pageRepo, annRepo);

    const pageId = createEntityId<'ContentPage'>('10000000-0000-0000-0000-000000000001');
    await service.createPage({
      id: pageId,
      slug: 'about',
      title: 'About Jeanius Atelier',
      contentMarkdown: '# Atelier Story',
      status: 'PUBLISHED',
    });

    const retrieved = await service.getPageBySlug('about');
    assert.ok(retrieved);
    assert.equal(retrieved?.title, 'About Jeanius Atelier');
    assert.equal(retrieved?.status, 'PUBLISHED');
  });

  it('hides draft pages from public slug retrieval unless allowDraft is true', async () => {
    const pageRepo = new MockContentPageRepository();
    const annRepo = new MockAnnouncementRepository();
    const service = new ContentService(pageRepo, annRepo);

    const pageId = createEntityId<'ContentPage'>('10000000-0000-0000-0000-000000000002');
    await service.createPage({
      id: pageId,
      slug: 'secret-drop',
      title: 'Secret Drop Preview',
      contentMarkdown: '# Draft Content',
      status: 'DRAFT',
    });

    const publicView = await service.getPageBySlug('secret-drop');
    assert.equal(publicView, null);

    const previewView = await service.getPageBySlug('secret-drop', { allowDraft: true });
    assert.ok(previewView);
    assert.equal(previewView?.title, 'Secret Drop Preview');
    assert.equal(previewView?.status, 'DRAFT');
  });

  it('rejects duplicate slugs on creation', async () => {
    const pageRepo = new MockContentPageRepository();
    const annRepo = new MockAnnouncementRepository();
    const service = new ContentService(pageRepo, annRepo);

    const id1 = createEntityId<'ContentPage'>('10000000-0000-0000-0000-000000000003');
    await service.createPage({
      id: id1,
      slug: 'sizing-guide',
      title: 'Sizing Guide',
      contentMarkdown: '# Sizing',
    });

    const id2 = createEntityId<'ContentPage'>('10000000-0000-0000-0000-000000000004');
    await assert.rejects(
      async () => {
        await service.createPage({
          id: id2,
          slug: 'sizing-guide',
          title: 'Duplicate Guide',
          contentMarkdown: '# Another',
        });
      },
      (err: Error) => {
        assert.ok(err instanceof DomainError);
        assert.match(err.message, /already exists/);
        return true;
      },
    );
  });

  it('manages announcement lifecycle and active filtering', async () => {
    const pageRepo = new MockContentPageRepository();
    const annRepo = new MockAnnouncementRepository();
    const service = new ContentService(pageRepo, annRepo);

    const now = new Date();
    const past = new Date(now.getTime() - 86400000 * 2);
    const yesterday = new Date(now.getTime() - 86400000);
    const tomorrow = new Date(now.getTime() + 86400000);

    const annId1 = createEntityId<'Announcement'>('20000000-0000-0000-0000-000000000001');
    await service.createAnnouncement({
      id: annId1,
      title: 'Current Capsule Drop',
      message: 'Active now',
      type: 'PROMO',
      startDate: yesterday,
      endDate: tomorrow,
      priority: 10,
    });

    const annId2 = createEntityId<'Announcement'>('20000000-0000-0000-0000-000000000002');
    await service.createAnnouncement({
      id: annId2,
      title: 'Expired Notice',
      message: 'Old notice',
      type: 'INFO',
      startDate: past,
      endDate: yesterday,
      priority: 5,
    });

    const active = await service.getActiveAnnouncements(now);
    assert.equal(active.length, 1);
    assert.equal(active[0]?.title, 'Current Capsule Drop');
  });
});
