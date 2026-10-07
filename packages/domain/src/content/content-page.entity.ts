/**
 * ContentPage entity (JN-082).
 * CMS-like storytelling pages (e.g. Kathmandu Workshop, Kuroki Mill Story, Selvedge Care Guide).
 */
import type { ContentPageId } from '../common/entity-id.js';
import { DomainError } from '../errors/index.js';

export type ContentPageStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface ContentPageProps {
  readonly id: ContentPageId;
  readonly slug: string;
  readonly title: string;
  readonly contentMarkdown: string;
  readonly metaDescription?: string;
  readonly status?: ContentPageStatus;
  readonly isPublished?: boolean;
  readonly publishedAt?: Date;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export class ContentPage {
  readonly id: ContentPageId;
  readonly slug: string;
  readonly title: string;
  readonly contentMarkdown: string;
  readonly metaDescription?: string;
  private _status: ContentPageStatus;
  private _publishedAt?: Date;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: ContentPageProps) {
    if (!props.slug?.trim()) {
      throw new DomainError('Content page slug is required');
    }
    if (!props.title?.trim()) {
      throw new DomainError('Content page title is required');
    }

    this.id = props.id;
    this.slug = props.slug.trim().toLowerCase();
    this.title = props.title.trim();
    this.contentMarkdown = props.contentMarkdown ?? '';
    this.metaDescription = props.metaDescription?.trim();

    // Default status handling with backward compatibility for isPublished
    if (props.status) {
      this._status = props.status;
    } else if (props.isPublished) {
      this._status = 'PUBLISHED';
    } else {
      this._status = 'DRAFT';
    }

    this._publishedAt =
      props.publishedAt ?? (this._status === 'PUBLISHED' ? new Date() : undefined);
    this.createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get status(): ContentPageStatus {
    return this._status;
  }

  get isPublished(): boolean {
    return this._status === 'PUBLISHED';
  }

  get publishedAt(): Date | undefined {
    return this._publishedAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  publish(at: Date = new Date()): void {
    this._status = 'PUBLISHED';
    this._publishedAt = at;
    this._updatedAt = at;
  }

  archive(): void {
    this._status = 'ARCHIVED';
    this._updatedAt = new Date();
  }

  unpublish(): void {
    this._status = 'DRAFT';
    this._updatedAt = new Date();
  }
}
