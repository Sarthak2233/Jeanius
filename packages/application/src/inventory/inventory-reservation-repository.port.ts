import type { InventoryReservation } from '@jeanius/domain';

export interface IInventoryReservationRepository {
  findById(id: string): Promise<InventoryReservation | null>;
  findByVariantId(variantId: string): Promise<readonly InventoryReservation[]>;
  save(reservation: InventoryReservation): Promise<void>;
  releaseExpired(): Promise<number>;
}
