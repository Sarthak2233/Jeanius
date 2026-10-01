/**
 * ContentPage entity (JN-082).
 * CMS-like storytelling pages (e.g. Kathmandu Workshop, Kuroki Mill Story, Selvedge Care Guide).
 */
import type { ContentPageId } from '../common/entity-id.js';
import { DomainError } from '../errors/index.js';

export interface ContentPageProps {
  readonly id: ContentPageId;
  readonly slug: string;
  readonly title: string;
  readonly contentMarkdown: string;
  readonly metaDescription?: string;
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
  private _isPublished: boolean;
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
    this._isPublished = props.isPublished ?? false;
    this._publishedAt = props.publishedAt;
    this.createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get isPublished(): boolean {
    return this._isPublished;
  }

  get publishedAt(): Date | undefined {
    return this._publishedAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  publish(at: Date = new Date()): void {
    this._isPublished = true;
    this._publishedAt = at;
    this._updatedAt = at;
  }

  unpublish(): void {
    this._isPublished = false;
    this._updatedAt = new Date();
  }
}
