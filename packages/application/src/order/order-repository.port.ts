import type { Order } from '@jeanius/domain';

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  findByIdempotencyKey(key: string): Promise<Order | null>;
  listByCustomerId?(customerId: string): Promise<readonly Order[]>;
  save(order: Order, idempotencyKey?: string): Promise<void>;
}
