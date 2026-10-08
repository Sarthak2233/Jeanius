import type { ProductionJob, ProductionStage } from '@jeanius/domain';
import { createLogger } from '@jeanius/observability';
import type { IProductionJobRepository } from './production-job-repository.port';

export class ProductionService {
  private readonly logger = createLogger('production-service');

  constructor(private readonly productionRepo: IProductionJobRepository) {}

  async transitionStage(
    jobId: string,
    nextStage: ProductionStage,
    notes?: string,
  ): Promise<ProductionJob> {
    const job = await this.productionRepo.findById(jobId);
    if (!job) {
      this.logger.warn('ProductionJob not found for stage transition', { jobId, nextStage });
      throw new Error(`ProductionJob ${jobId} not found`);
    }

    job.advanceStage(nextStage);
    void notes;

    await this.productionRepo.save(job);
    this.logger.info('ProductionJob stage transitioned', {
      jobId,
      stage: nextStage,
      notes,
    });
    return job;
  }
}
