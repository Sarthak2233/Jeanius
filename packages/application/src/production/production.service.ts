import type { ProductionJob, ProductionStage } from '@jeanius/domain';
import type { IProductionJobRepository } from './production-job-repository.port';

export class ProductionService {
  constructor(private readonly productionRepo: IProductionJobRepository) {}

  async transitionStage(
    jobId: string,
    nextStage: ProductionStage,
    notes?: string,
  ): Promise<ProductionJob> {
    const job = await this.productionRepo.findById(jobId);
    if (!job) {
      throw new Error(`ProductionJob ${jobId} not found`);
    }

    job.advanceStage(nextStage);
    void notes;

    await this.productionRepo.save(job);
    return job;
  }
}
