import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ContentPage } from './content-page.entity.js';
import type { ContentPageId } from '../common/entity-id.js';

describe('ContentPage Entity (JN-082, JN-166)', () => {
  const dummyId = '10000000-0000-0000-0000-000000000001' as ContentPageId;

  it('initializes with draft status by default', () => {
    const page = new ContentPage({
      id: dummyId,
      slug: 'selvedge-care',
      title: 'Selvedge Care Guide',
      contentMarkdown: '# How to soak and dry raw denim',
    });

    assert.strictEqual(page.slug, 'selvedge-care');
    assert.strictEqual(page.title, 'Selvedge Care Guide');
    assert.strictEqual(page.status, 'DRAFT');
    assert.strictEqual(page.isPublished, false);
    assert.strictEqual(page.publishedAt, undefined);
  });

  it('publishes and archives cleanly', () => {
    const page = new ContentPage({
      id: dummyId,
      slug: 'sizing-guide',
      title: 'Precision Sizing Guide',
      contentMarkdown: '# Master Tailor & Goldsmith Methodology',
    });

    const publishDate = new Date('2026-10-07T12:00:00Z');
    page.publish(publishDate);

    assert.strictEqual(page.status, 'PUBLISHED');
    assert.strictEqual(page.isPublished, true);
    assert.strictEqual(page.publishedAt?.toISOString(), publishDate.toISOString());

    page.archive();
    assert.strictEqual(page.status, 'ARCHIVED');
    assert.strictEqual(page.isPublished, false);

    page.unpublish();
    assert.strictEqual(page.status, 'DRAFT');
    assert.strictEqual(page.isPublished, false);
  });

  it('preserves backward compatibility when isPublished is passed', () => {
    const page = new ContentPage({
      id: dummyId,
      slug: 'about-atelier',
      title: 'Inside Kathmandu Atelier',
      contentMarkdown: '# High Himalaya Craft',
      isPublished: true,
    });

    assert.strictEqual(page.status, 'PUBLISHED');
    assert.strictEqual(page.isPublished, true);
    assert.ok(page.publishedAt !== undefined);
  });
});
