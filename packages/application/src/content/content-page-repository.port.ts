import type { ContentPage } from '@jeanius/domain';

export interface IContentPageRepository {
  findBySlug(slug: string): Promise<ContentPage | null>;
  listPublished(): Promise<readonly ContentPage[]>;
  save(page: ContentPage): Promise<void>;
}
