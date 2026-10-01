import { eq, and, lt } from 'drizzle-orm';
import {
  InventoryReservation,
  type ReservationId,
  type VariantId,
  type CartId,
  type ReservationStatus,
} from '@jeanius/domain';
import type { IInventoryReservationRepository } from '@jeanius/application';
import { db, type Database } from '../../client';
import { inventoryReservations } from '../../schema/inventory';

export class DrizzleInventoryReservationRepository implements IInventoryReservationRepository {
  constructor(private readonly database: Database = db) {}

  async findById(id: string): Promise<InventoryReservation | null> {
    const result = await this.database
      .select()
      .from(inventoryReservations)
      .where(eq(inventoryReservations.id, id))
      .limit(1);

    const row = result[0];
    if (!row) return null;
    return this.mapToDomain(row);
  }

  async findByVariantId(variantId: string): Promise<readonly InventoryReservation[]> {
    const rows = await this.database
      .select()
      .from(inventoryReservations)
      .where(eq(inventoryReservations.variantId, variantId));

    return rows.map((r) => this.mapToDomain(r));
  }

  async save(reservation: InventoryReservation): Promise<void> {
    await this.database
      .insert(inventoryReservations)
      .values({
        id: reservation.id,
        variantId: reservation.variantId,
        cartId: reservation.cartId,
        quantity: reservation.quantity,
        status: reservation.status,
        expiresAt: reservation.expiresAt,
        createdAt: reservation.createdAt,
      })
      .onConflictDoUpdate({
        target: inventoryReservations.id,
        set: {
          status: reservation.status,
        },
      });
  }

  async releaseExpired(): Promise<number> {
    const now = new Date();
    const result = await this.database
      .update(inventoryReservations)
      .set({ status: 'EXPIRED' })
      .where(
        and(eq(inventoryReservations.status, 'HELD'), lt(inventoryReservations.expiresAt, now)),
      );

    return result.length;
  }

  private mapToDomain(row: typeof inventoryReservations.$inferSelect): InventoryReservation {
    return new InventoryReservation({
      id: row.id as ReservationId,
      variantId: row.variantId as VariantId,
      cartId: row.cartId ? (row.cartId as CartId) : undefined,
      quantity: row.quantity,
      status: row.status as ReservationStatus,
      expiresAt: new Date(row.expiresAt),
      createdAt: new Date(row.createdAt),
    });
  }
}
