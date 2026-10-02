import type { MetalStock, MetalAlloy } from '@jeanius/domain';

export interface IMetalStockRepository {
  findById(id: string): Promise<MetalStock | null>;
  findByLotNumber(lotNumber: string): Promise<MetalStock | null>;
  findActiveByAlloy(alloy: MetalAlloy): Promise<readonly MetalStock[]>;
  save(stock: MetalStock): Promise<void>;
}
