import { eq } from 'drizzle-orm';
import {
  FabricBolt,
  type BoltId,
  type OrderLineId,
  type BoltStatus,
  type BoltAllocation,
} from '@jeanius/domain';
import type { IFabricBoltRepository } from '@jeanius/application';
import { db, type Database } from '../../client';
import { fabricBolts, boltAllocations } from '../../schema/inventory';

export class DrizzleFabricBoltRepository implements IFabricBoltRepository {
  constructor(private readonly database: Database = db) {}

  async findById(id: string): Promise<FabricBolt | null> {
    const result = await this.database
      .select()
      .from(fabricBolts)
      .where(eq(fabricBolts.id, id))
      .limit(1);

    const row = result[0];
    if (!row) return null;
    return this.loadBoltWithAllocations(row);
  }

  async findByCode(code: string): Promise<FabricBolt | null> {
    const result = await this.database
      .select()
      .from(fabricBolts)
      .where(eq(fabricBolts.fabricCode, code.toUpperCase()))
      .limit(1);

    const row = result[0];
    if (!row) return null;
    return this.loadBoltWithAllocations(row);
  }

  async listActive(): Promise<readonly FabricBolt[]> {
    const rows = await this.database
      .select()
      .from(fabricBolts)
      .where(eq(fabricBolts.status, 'ACTIVE'));

    return Promise.all(rows.map((row) => this.loadBoltWithAllocations(row)));
  }

  async save(bolt: FabricBolt): Promise<void> {
    await this.database
      .insert(fabricBolts)
      .values({
        id: bolt.id,
        millName: bolt.millName,
        fabricCode: bolt.fabricCode,
        weightOz: bolt.weightOz.toFixed(2),
        initialLengthYards: bolt.initialLengthYards.toFixed(2),
        remainingLengthYards: bolt.remainingLengthYards.toFixed(2),
        status: bolt.status,
        createdAt: bolt.createdAt,
        updatedAt: bolt.updatedAt,
      })
      .onConflictDoUpdate({
        target: fabricBolts.id,
        set: {
          remainingLengthYards: bolt.remainingLengthYards.toFixed(2),
          status: bolt.status,
          updatedAt: bolt.updatedAt,
        },
      });

    // Sync allocations
    for (const alloc of bolt.allocations) {
      await this.database
        .insert(boltAllocations)
        .values({
          id: alloc.allocationId,
          boltId: bolt.id,
          orderLineId: alloc.orderLineId,
          yardageAllocated: alloc.yardageAllocated.toFixed(2),
          allocatedAt: alloc.allocatedAt,
        })
        .onConflictDoNothing();
    }
  }

  private async loadBoltWithAllocations(row: typeof fabricBolts.$inferSelect): Promise<FabricBolt> {
    const allocRows = await this.database
      .select()
      .from(boltAllocations)
      .where(eq(boltAllocations.boltId, row.id));

    const allocations: BoltAllocation[] = allocRows.map((a) => ({
      allocationId: a.id,
      orderLineId: a.orderLineId as OrderLineId,
      yardageAllocated: Number(a.yardageAllocated),
      allocatedAt: new Date(a.allocatedAt),
    }));

    return new FabricBolt({
      id: row.id as BoltId,
      millName: row.millName,
      fabricCode: row.fabricCode,
      weightOz: Number(row.weightOz),
      initialLengthYards: Number(row.initialLengthYards),
      remainingLengthYards: Number(row.remainingLengthYards),
      status: row.status as BoltStatus,
      allocations,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }
}
