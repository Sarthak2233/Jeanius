import type { ContentPage, ContentPageId } from '@jeanius/domain';

export interface IContentPageRepository {
  findById(id: ContentPageId): Promise<ContentPage | null>;
  findBySlug(slug: string): Promise<ContentPage | null>;
  listPublished(): Promise<readonly ContentPage[]>;
  listAll(): Promise<readonly ContentPage[]>;
  save(page: ContentPage): Promise<void>;
  delete(id: ContentPageId): Promise<void>;
}
