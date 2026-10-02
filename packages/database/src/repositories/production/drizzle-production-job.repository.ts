import { eq } from 'drizzle-orm';
import {
  ProductionJob,
  type ProductionJobId,
  type OrderId,
  type OrderLineId,
  type ProductionStage,
  type CraftTicket,
} from '@jeanius/domain';
import type { IProductionJobRepository } from '@jeanius/application';
import { db, type Database } from '../../client';
import { productionJobs } from '../../schema/production';

export class DrizzleProductionJobRepository implements IProductionJobRepository {
  constructor(private readonly database: Database = db) {}

  async findById(id: string): Promise<ProductionJob | null> {
    const result = await this.database
      .select()
      .from(productionJobs)
      .where(eq(productionJobs.id, id))
      .limit(1);

    const row = result[0];
    if (!row) return null;
    return this.mapToDomain(row);
  }

  async findByOrderId(orderId: string): Promise<readonly ProductionJob[]> {
    const rows = await this.database
      .select()
      .from(productionJobs)
      .where(eq(productionJobs.orderId, orderId));

    return rows.map((row) => this.mapToDomain(row));
  }

  async findByStage(stage: ProductionStage): Promise<readonly ProductionJob[]> {
    const rows = await this.database
      .select()
      .from(productionJobs)
      .where(eq(productionJobs.currentStage, stage));

    return rows.map((row) => this.mapToDomain(row));
  }

  async save(job: ProductionJob): Promise<void> {
    await this.database
      .insert(productionJobs)
      .values({
        id: job.id,
        orderId: job.orderId,
        orderLineId: job.orderLineId,
        currentStage: job.currentStage,
        targetCompletionDate: job.targetCompletionDate,
        craftTicket: (job.craftTicket as unknown as Record<string, unknown>) ?? undefined,
        assignedArtisanId: job.assignedArtisanId,
        reworkCount: job.reworkCount,
        delayDays: job.delayDays,
        delayReason: job.delayReason,
        notes: [...job.notes],
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      })
      .onConflictDoUpdate({
        target: productionJobs.id,
        set: {
          currentStage: job.currentStage,
          targetCompletionDate: job.targetCompletionDate,
          assignedArtisanId: job.assignedArtisanId,
          reworkCount: job.reworkCount,
          delayDays: job.delayDays,
          delayReason: job.delayReason,
          notes: [...job.notes],
          updatedAt: job.updatedAt,
        },
      });
  }

  private mapToDomain(row: typeof productionJobs.$inferSelect): ProductionJob {
    return new ProductionJob({
      id: row.id as ProductionJobId,
      orderId: row.orderId as OrderId,
      orderLineId: row.orderLineId as OrderLineId,
      currentStage: row.currentStage as ProductionStage,
      targetCompletionDate: new Date(row.targetCompletionDate),
      craftTicket:
        (row.craftTicket ?? row.cutTicket)
          ? ((row.craftTicket ?? row.cutTicket) as unknown as CraftTicket)
          : undefined,
      assignedArtisanId: row.assignedArtisanId ?? undefined,
      reworkCount: row.reworkCount,
      delayDays: row.delayDays,
      delayReason: row.delayReason ?? undefined,
      notes: row.notes,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }
}
