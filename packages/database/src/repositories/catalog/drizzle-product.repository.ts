import { eq } from 'drizzle-orm';
import {
  Product,
  Money,
  type ProductId,
  type Currency,
  type CommerceModel,
  type ProductCategory,
  type ProductStatus,
} from '@jeanius/domain';
import type { IProductRepository } from '@jeanius/application';
import { db, type Database } from '../../client';
import { products } from '../../schema/catalog';

export class DrizzleProductRepository implements IProductRepository {
  constructor(private readonly database: Database = db) {}

  async findById(id: string): Promise<Product | null> {
    const result = await this.database.select().from(products).where(eq(products.id, id)).limit(1);

    const row = result[0];
    if (!row) return null;
    return this.mapToDomain(row);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const result = await this.database
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    const row = result[0];
    if (!row) return null;
    return this.mapToDomain(row);
  }

  async listPublished(): Promise<readonly Product[]> {
    const rows = await this.database
      .select()
      .from(products)
      .where(eq(products.status, 'PUBLISHED'));

    return rows.map((row) => this.mapToDomain(row));
  }

  async save(product: Product): Promise<void> {
    await this.database
      .insert(products)
      .values({
        id: product.id,
        slug: product.slug,
        title: product.title,
        description: product.description,
        basePriceAmount: product.basePrice.amount,
        basePriceCurrency: product.basePrice.currency,
        commerceModel: product.commerceModel,
        category: product.category,
        status: product.status,
        publishAt: product.publishAt,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      })
      .onConflictDoUpdate({
        target: products.id,
        set: {
          slug: product.slug,
          title: product.title,
          description: product.description,
          basePriceAmount: product.basePrice.amount,
          basePriceCurrency: product.basePrice.currency,
          commerceModel: product.commerceModel,
          category: product.category,
          status: product.status,
          publishAt: product.publishAt,
          updatedAt: product.updatedAt,
        },
      });
  }

  private mapToDomain(row: typeof products.$inferSelect): Product {
    return new Product({
      id: row.id as ProductId,
      slug: row.slug,
      title: row.title,
      description: row.description,
      basePrice: new Money(row.basePriceAmount, row.basePriceCurrency as Currency),
      commerceModel: row.commerceModel as CommerceModel,
      category: row.category as ProductCategory,
      status: row.status as ProductStatus,
      publishAt: row.publishAt ? new Date(row.publishAt) : undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }
}
