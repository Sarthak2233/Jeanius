import type { Review } from '@jeanius/domain';

export interface IReviewRepository {
  findById(id: string): Promise<Review | null>;
  listByProductId(productId: string): Promise<readonly Review[]>;
  save(review: Review): Promise<void>;
}
