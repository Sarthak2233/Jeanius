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
import { db, type Database } from '../../client';
import { carts, cartLines } from '../../schema/cart';

export class DrizzleCartRepository implements ICartRepository {
  constructor(private readonly database: Database = db) {}

  async findById(id: string): Promise<Cart | null> {
    const cartResult = await this.database.select().from(carts).where(eq(carts.id, id)).limit(1);

    const cartRow = cartResult[0];
    if (!cartRow) return null;

    const lineRows = await this.database.select().from(cartLines).where(eq(cartLines.cartId, id));

    const lines = lineRows.map(
      (lineRow) =>
        new CartLine({
          id: lineRow.id as CartLineId,
          cartId: lineRow.cartId as CartId,
          productId: lineRow.productId as ProductId,
          variantId: lineRow.variantId as VariantId,
          productTitle: lineRow.productTitle,
          commerceModel: lineRow.commerceModel as CommerceModel,
          unitPrice: new Money(lineRow.unitPriceAmount, lineRow.unitPriceCurrency as Currency),
          quantity: lineRow.quantity,
          selectedOptions: lineRow.selectedOptions,
          customTailoringMeasurements: lineRow.customTailoringMeasurements ?? undefined,
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

  async save(cart: Cart): Promise<void> {
    await this.database
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

    // Sync lines
    await this.database.delete(cartLines).where(eq(cartLines.cartId, cart.id));

    if (cart.lines.length > 0) {
      await this.database.insert(cartLines).values(
        cart.lines.map((line) => ({
          id: line.id,
          cartId: cart.id,
          productId: line.productId,
          variantId: line.variantId,
          productTitle: line.productTitle,
          commerceModel: line.commerceModel,
          unitPriceAmount: line.unitPrice.amount,
          unitPriceCurrency: line.unitPrice.currency,
          quantity: line.quantity,
          selectedOptions: line.selectedOptions,
          customTailoringMeasurements: line.customTailoringMeasurements,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      );
    }
  }

  async delete(id: string): Promise<void> {
    await this.database.delete(carts).where(eq(carts.id, id));
  }
}
