import { eq, and } from 'drizzle-orm';
import {
  MetalStock,
  type MetalStockId,
  type MetalAlloy,
  type MetalStockStatus,
  type MetalAllocationId,
  type OrderLineId,
} from '@jeanius/domain';
import type { IMetalStockRepository } from '@jeanius/application';
import { db, type Database } from '../../client';
import { metalStocks, metalAllocations } from '../../schema/inventory';

export class DrizzleMetalStockRepository implements IMetalStockRepository {
  constructor(private readonly database: Database = db) {}

  async findById(id: string): Promise<MetalStock | null> {
    const stockRow = await this.database
      .select()
      .from(metalStocks)
      .where(eq(metalStocks.id, id))
      .limit(1);

    if (!stockRow[0]) return null;

    const allocationsRows = await this.database
      .select()
      .from(metalAllocations)
      .where(eq(metalAllocations.metalStockId, id));

    return this.mapToDomain(stockRow[0], allocationsRows);
  }

  async findByLotNumber(lotNumber: string): Promise<MetalStock | null> {
    const stockRow = await this.database
      .select()
      .from(metalStocks)
      .where(eq(metalStocks.lotNumber, lotNumber))
      .limit(1);

    if (!stockRow[0]) return null;

    const allocationsRows = await this.database
      .select()
      .from(metalAllocations)
      .where(eq(metalAllocations.metalStockId, stockRow[0].id));

    return this.mapToDomain(stockRow[0], allocationsRows);
  }

  async findActiveByAlloy(alloy: MetalAlloy): Promise<readonly MetalStock[]> {
    const stockRows = await this.database
      .select()
      .from(metalStocks)
      .where(and(eq(metalStocks.metalAlloy, alloy), eq(metalStocks.status, 'ACTIVE')));

    if (stockRows.length === 0) return [];

    // Drizzle ORM doesn't easily let us batch fetch relations for raw SQL without relation API.
    // So we'll iterate or use a query. Since this is an aggregate root, we must load its components.
    const result: MetalStock[] = [];
    for (const row of stockRows) {
      const allocationsRows = await this.database
        .select()
        .from(metalAllocations)
        .where(eq(metalAllocations.metalStockId, row.id));
      result.push(this.mapToDomain(row, allocationsRows));
    }

    return result;
  }

  async save(stock: MetalStock): Promise<void> {
    await this.database.transaction(async (tx) => {
      await tx
        .insert(metalStocks)
        .values({
          id: stock.id,
          metalAlloy: stock.metalAlloy,
          purity: stock.purity.toString(),
          lotNumber: stock.lotNumber,
          initialWeightGrams: stock.initialWeightGrams.toString(),
          remainingWeightGrams: stock.remainingWeightGrams.toString(),
          supplier: stock.supplier,
          status: stock.status,
          createdAt: stock.createdAt,
          updatedAt: stock.updatedAt,
        })
        .onConflictDoUpdate({
          target: metalStocks.id,
          set: {
            remainingWeightGrams: stock.remainingWeightGrams.toString(),
            status: stock.status,
            updatedAt: stock.updatedAt,
          },
        });

      // Simple implementation: delete and insert for allocations since they are append-only mostly,
      // but append-only can just do insert on conflict ignore.
      if (stock.allocations.length > 0) {
        await tx
          .insert(metalAllocations)
          .values(
            stock.allocations.map((alloc) => ({
              id: alloc.id,
              metalStockId: stock.id,
              orderLineId: alloc.orderLineId,
              gramsAllocated: alloc.gramsAllocated.toString(),
              allocatedAt: alloc.allocatedAt,
            })),
          )
          .onConflictDoNothing({ target: metalAllocations.id });
      }
    });
  }

  private mapToDomain(
    row: typeof metalStocks.$inferSelect,
    allocationsRows: (typeof metalAllocations.$inferSelect)[],
  ): MetalStock {
    return new MetalStock({
      id: row.id as MetalStockId,
      metalAlloy: row.metalAlloy as MetalAlloy,
      purity: Number(row.purity),
      lotNumber: row.lotNumber,
      initialWeightGrams: Number(row.initialWeightGrams),
      remainingWeightGrams: Number(row.remainingWeightGrams),
      supplier: row.supplier,
      status: row.status as MetalStockStatus,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      allocations: allocationsRows.map((a) => ({
        id: a.id as MetalAllocationId,
        orderLineId: a.orderLineId as OrderLineId,
        gramsAllocated: Number(a.gramsAllocated),
        allocatedAt: new Date(a.allocatedAt),
      })),
    });
  }
}
