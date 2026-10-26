import { eq } from 'drizzle-orm';
import {
  Cart,
  CartLine,
  Money,
  type CartId,
  type CartLineId,
  type ProductId,
  type VariantId,
  type CustomerId,
  type Currency,
  type CommerceModel,
} from '@jeanius/domain';
import type { ICartRepository } from '@jeanius/application';
import { createLogger } from '@jeanius/observability';
import { db, type Database } from '../../client.js';
import { carts, cartLines } from '../../schema/cart.js';

export class DrizzleCartRepository implements ICartRepository {
  private readonly logger = createLogger('database:cart-repository');

  constructor(private readonly database: Database = db) {}

  async findById(id: string): Promise<Cart | null> {
    const cartResult = await this.database.select().from(carts).where(eq(carts.id, id)).limit(1);

    const cartRow = cartResult[0];
    if (!cartRow) {
      this.logger.debug('Cart not found by ID', { id });
      return null;
    }

    const lineRows = await this.database.select().from(cartLines).where(eq(cartLines.cartId, id));
    return this.mapToDomain(cartRow, lineRows);
  }

  async findByCustomerId(customerId: string): Promise<Cart | null> {
    const cartResult = await this.database
      .select()
      .from(carts)
      .where(eq(carts.customerId, customerId))
      .limit(1);

    const cartRow = cartResult[0];
    if (!cartRow) {
      this.logger.debug('Cart not found for customer', { customerId });
      return null;
    }

    const lineRows = await this.database
      .select()
      .from(cartLines)
      .where(eq(cartLines.cartId, cartRow.id));

    return this.mapToDomain(cartRow, lineRows);
  }

  async save(cart: Cart): Promise<void> {
    await this.database.transaction(async (tx) => {
      await tx
        .insert(carts)
        .values({
          id: cart.id,
          customerId: cart.customerId,
          currency: cart.currency,
          createdAt: cart.createdAt,
          updatedAt: cart.updatedAt,
        })
        .onConflictDoUpdate({
          target: carts.id,
          set: {
            customerId: cart.customerId,
            currency: cart.currency,
            updatedAt: cart.updatedAt,
          },
        });

      // Synchronize lines within transaction
      await tx.delete(cartLines).where(eq(cartLines.cartId, cart.id));

      if (cart.lines.length > 0) {
        await tx.insert(cartLines).values(
          cart.lines.map((line) => ({
            id: line.id,
            cartId: cart.id,
            productId: line.productId,
            variantId: line.variantId ?? null,
            productTitle: line.productTitle,
            commerceModel: line.commerceModel,
            unitPriceAmount: line.unitPrice.amount,
            unitPriceCurrency: line.unitPrice.currency,
            quantity: line.quantity,
            selectedOptions: line.selectedOptions,
            customTailoringMeasurements: line.customTailoringMeasurements,
            customSpecifications: line.customSpecifications
              ? (line.customSpecifications as Record<string, unknown>)
              : null,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
        );
      }
    });

    this.logger.debug('Cart saved successfully', {
      cartId: cart.id,
      customerId: cart.customerId,
      lineCount: cart.lines.length,
    });
  }

  async delete(id: string): Promise<void> {
    await this.database.delete(carts).where(eq(carts.id, id));
    this.logger.debug('Cart deleted', { id });
  }

  private mapToDomain(
    cartRow: typeof carts.$inferSelect,
    lineRows: (typeof cartLines.$inferSelect)[],
  ): Cart {
    const lines = lineRows.map(
      (lineRow) =>
        new CartLine({
          id: lineRow.id as CartLineId,
          cartId: lineRow.cartId as CartId,
          productId: lineRow.productId as ProductId,
          variantId: lineRow.variantId ? (lineRow.variantId as VariantId) : undefined,
          productTitle: lineRow.productTitle,
          commerceModel: lineRow.commerceModel as CommerceModel,
          unitPrice: new Money(lineRow.unitPriceAmount, lineRow.unitPriceCurrency as Currency),
          quantity: lineRow.quantity,
          selectedOptions: lineRow.selectedOptions,
          customTailoringMeasurements: lineRow.customTailoringMeasurements ?? undefined,
          customSpecifications:
            (lineRow.customSpecifications as Record<string, unknown>) ?? undefined,
        }),
    );

    return new Cart({
      id: cartRow.id as CartId,
      customerId: cartRow.customerId ? (cartRow.customerId as CustomerId) : undefined,
      currency: cartRow.currency as Currency,
      lines,
      createdAt: new Date(cartRow.createdAt),
      updatedAt: new Date(cartRow.updatedAt),
    });
  }
}
