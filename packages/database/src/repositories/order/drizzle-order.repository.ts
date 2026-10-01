import { eq } from 'drizzle-orm';
import {
  Order,
  OrderLine,
  Address,
  Money,
  type OrderId,
  type OrderLineId,
  type ProductId,
  type VariantId,
  type BoltId,
  type CustomerId,
  type Currency,
  type OrderStatus,
  type PaymentStatus,
  type CommerceModel,
} from '@jeanius/domain';
import type { IOrderRepository } from '@jeanius/application';
import { db, type Database } from '../../client';
import { orders, orderLines } from '../../schema/order';

export class DrizzleOrderRepository implements IOrderRepository {
  constructor(private readonly database: Database = db) {}

  async findById(id: string): Promise<Order | null> {
    const result = await this.database.select().from(orders).where(eq(orders.id, id)).limit(1);

    const row = result[0];
    if (!row) return null;
    return this.loadOrderWithLines(row);
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const result = await this.database
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber))
      .limit(1);

    const row = result[0];
    if (!row) return null;
    return this.loadOrderWithLines(row);
  }

  async listByCustomerId(customerId: string): Promise<readonly Order[]> {
    const rows = await this.database.select().from(orders).where(eq(orders.customerId, customerId));

    return Promise.all(rows.map((row) => this.loadOrderWithLines(row)));
  }

  async save(order: Order): Promise<void> {
    await this.database
      .insert(orders)
      .values({
        id: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        customerEmail: order.customerEmail,
        status: order.status,
        paymentStatus: order.paymentStatus,
        shippingAddress: {
          fullName: order.shippingAddress.fullName,
          addressLine1: order.shippingAddress.addressLine1,
          addressLine2: order.shippingAddress.addressLine2,
          city: order.shippingAddress.city,
          stateOrProvince: order.shippingAddress.stateOrProvince,
          postalCode: order.shippingAddress.postalCode,
          country: order.shippingAddress.country,
          phone: order.shippingAddress.phone,
        },
        billingAddress: order.billingAddress
          ? {
              fullName: order.billingAddress.fullName,
              addressLine1: order.billingAddress.addressLine1,
              addressLine2: order.billingAddress.addressLine2,
              city: order.billingAddress.city,
              stateOrProvince: order.billingAddress.stateOrProvince,
              postalCode: order.billingAddress.postalCode,
              country: order.billingAddress.country,
              phone: order.billingAddress.phone,
            }
          : null,
        subtotalAmount: order.subtotal.amount,
        shippingCostAmount: order.shippingCost.amount,
        totalAmount: order.total.amount,
        currency: order.currency,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })
      .onConflictDoUpdate({
        target: orders.id,
        set: {
          status: order.status,
          paymentStatus: order.paymentStatus,
          updatedAt: order.updatedAt,
        },
      });

    // Insert order lines if not present
    for (const line of order.lines) {
      await this.database
        .insert(orderLines)
        .values({
          id: line.id,
          orderId: order.id,
          productId: line.productId,
          variantId: line.variantId,
          productTitle: line.productTitle,
          sku: line.sku,
          commerceModel: line.commerceModel,
          unitPriceAmount: line.unitPrice.amount,
          unitPriceCurrency: line.unitPrice.currency,
          quantity: line.quantity,
          lineTotalAmount: line.lineTotal.amount,
          lineTotalCurrency: line.lineTotal.currency,
          selectedOptions: line.selectedOptions,
          customTailoring: line.customTailoring,
          allocatedBoltId: line.allocatedBoltId,
          createdAt: new Date(),
        })
        .onConflictDoNothing();
    }
  }

  private async loadOrderWithLines(orderRow: typeof orders.$inferSelect): Promise<Order> {
    const lineRows = await this.database
      .select()
      .from(orderLines)
      .where(eq(orderLines.orderId, orderRow.id));

    const lines = lineRows.map(
      (lineRow) =>
        new OrderLine({
          id: lineRow.id as OrderLineId,
          orderId: lineRow.orderId as OrderId,
          productId: lineRow.productId as ProductId,
          variantId: lineRow.variantId as VariantId,
          productTitle: lineRow.productTitle,
          sku: lineRow.sku,
          commerceModel: lineRow.commerceModel as CommerceModel,
          unitPrice: new Money(lineRow.unitPriceAmount, lineRow.unitPriceCurrency as Currency),
          quantity: lineRow.quantity,
          lineTotal: new Money(lineRow.lineTotalAmount, lineRow.lineTotalCurrency as Currency),
          selectedOptions: lineRow.selectedOptions,
          customTailoring: lineRow.customTailoring ?? undefined,
          allocatedBoltId: lineRow.allocatedBoltId
            ? (lineRow.allocatedBoltId as BoltId)
            : undefined,
        }),
    );

    const shippingRaw = orderRow.shippingAddress as Record<string, string>;
    const billingRaw = orderRow.billingAddress as Record<string, string> | null;

    return new Order({
      id: orderRow.id as OrderId,
      orderNumber: orderRow.orderNumber,
      customerId: orderRow.customerId ? (orderRow.customerId as CustomerId) : undefined,
      customerEmail: orderRow.customerEmail,
      status: orderRow.status as OrderStatus,
      paymentStatus: orderRow.paymentStatus as PaymentStatus,
      shippingAddress: new Address({
        fullName: shippingRaw.fullName ?? '',
        addressLine1: shippingRaw.addressLine1 ?? '',
        addressLine2: shippingRaw.addressLine2,
        city: shippingRaw.city ?? '',
        stateOrProvince: shippingRaw.stateOrProvince,
        postalCode: shippingRaw.postalCode ?? '',
        country: shippingRaw.country ?? 'NP',
        phone: shippingRaw.phone ?? '',
      }),
      billingAddress: billingRaw
        ? new Address({
            fullName: billingRaw.fullName ?? '',
            addressLine1: billingRaw.addressLine1 ?? '',
            addressLine2: billingRaw.addressLine2,
            city: billingRaw.city ?? '',
            stateOrProvince: billingRaw.stateOrProvince,
            postalCode: billingRaw.postalCode ?? '',
            country: billingRaw.country ?? 'NP',
            phone: billingRaw.phone ?? '',
          })
        : undefined,
      lines,
      subtotal: new Money(orderRow.subtotalAmount, orderRow.currency as Currency),
      shippingCost: new Money(orderRow.shippingCostAmount, orderRow.currency as Currency),
      total: new Money(orderRow.totalAmount, orderRow.currency as Currency),
      currency: orderRow.currency as Currency,
      createdAt: new Date(orderRow.createdAt),
      updatedAt: new Date(orderRow.updatedAt),
    });
  }
}
