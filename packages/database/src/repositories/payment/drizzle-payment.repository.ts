import { eq } from 'drizzle-orm';
import {
  Payment,
  Money,
  createEntityId,
  type PaymentProvider,
  type PaymentStatus,
  type Currency,
} from '@jeanius/domain';
import type { IPaymentRepository } from '@jeanius/application';
import { db, type Database } from '../../client';
import { payments } from '../../schema/payment';

export class DrizzlePaymentRepository implements IPaymentRepository {
  constructor(private readonly database: Database = db) {}

  async findById(id: string): Promise<Payment | null> {
    const records = await this.database.select().from(payments).where(eq(payments.id, id)).limit(1);

    const row = records[0];
    if (!row) return null;
    return this.mapToDomain(row);
  }

  async findByOrderId(orderId: string): Promise<readonly Payment[]> {
    const rows = await this.database.select().from(payments).where(eq(payments.orderId, orderId));

    return rows.map((r) => this.mapToDomain(r));
  }

  async findByIdempotencyKey(key: string): Promise<Payment | null> {
    const records = await this.database
      .select()
      .from(payments)
      .where(eq(payments.idempotencyKey, key))
      .limit(1);

    const row = records[0];
    if (!row) return null;
    return this.mapToDomain(row);
  }

  async save(payment: Payment): Promise<void> {
    await this.database
      .insert(payments)
      .values({
        id: payment.id,
        orderId: payment.orderId,
        amount: payment.amount.amount,
        currency: payment.amount.currency,
        settlementAmount: payment.settlementAmount.amount,
        settlementCurrency: payment.settlementAmount.currency,
        provider: payment.provider,
        status: payment.status,
        transactionId: payment.transactionId ?? null,
        voucherReference: payment.notes ?? null,
        notes: payment.notes ?? null,
        idempotencyKey: payment.idempotencyKey,
        refundedAmount: payment.refundedAmount.amount,
        refundedCurrency: payment.refundedAmount.currency,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      })
      .onConflictDoUpdate({
        target: payments.id,
        set: {
          status: payment.status,
          transactionId: payment.transactionId ?? null,
          voucherReference: payment.notes ?? null,
          notes: payment.notes ?? null,
          settlementAmount: payment.settlementAmount.amount,
          settlementCurrency: payment.settlementAmount.currency,
          refundedAmount: payment.refundedAmount.amount,
          refundedCurrency: payment.refundedAmount.currency,
          updatedAt: payment.updatedAt,
        },
      });
  }

  private mapToDomain(row: typeof payments.$inferSelect): Payment {
    const currency = row.currency as Currency;
    const settlementCurrency = (row.settlementCurrency ?? row.currency) as Currency;
    const refundedCurrency = (row.refundedCurrency ?? row.currency) as Currency;

    return new Payment({
      id: createEntityId<'Payment'>(row.id),
      orderId: createEntityId<'Order'>(row.orderId),
      amount: new Money(row.amount, currency),
      settlementAmount: new Money(row.settlementAmount ?? row.amount, settlementCurrency),
      provider: row.provider as PaymentProvider,
      status: row.status as PaymentStatus,
      transactionId: row.transactionId ?? undefined,
      voucherReference: row.voucherReference ?? undefined,
      notes: row.notes ?? row.voucherReference ?? undefined,
      idempotencyKey: row.idempotencyKey,
      refundedAmount: new Money(row.refundedAmount, refundedCurrency),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
