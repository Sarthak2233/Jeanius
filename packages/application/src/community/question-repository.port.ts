import type { Question } from '@jeanius/domain';

export interface IQuestionRepository {
  findById(id: string): Promise<Question | null>;
  listByProductId(productId: string): Promise<readonly Question[]>;
  save(question: Question): Promise<void>;
}
