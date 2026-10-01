import type { Shipment } from '@jeanius/domain';

export interface IShipmentRepository {
  findById(id: string): Promise<Shipment | null>;
  findByOrderId(orderId: string): Promise<Shipment | null>;
  save(shipment: Shipment): Promise<void>;
}
