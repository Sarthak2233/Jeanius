import type { ProductionJob, ProductionStage } from '@jeanius/domain';

export interface IProductionJobRepository {
  findById(id: string): Promise<ProductionJob | null>;
  findByOrderId?(orderId: string): Promise<readonly ProductionJob[]>;
  findByStage(stage: ProductionStage): Promise<readonly ProductionJob[]>;
  save(job: ProductionJob): Promise<void>;
}
