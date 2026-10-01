import type { CustomOrderRequest } from '@jeanius/domain';

export interface ICustomOrderRepository {
  findById(id: string): Promise<CustomOrderRequest | null>;
  findByEmail(email: string): Promise<readonly CustomOrderRequest[]>;
  save(request: CustomOrderRequest): Promise<void>;
}
