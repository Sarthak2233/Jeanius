import { eq, asc } from 'drizzle-orm';
import { Category, type CategoryId } from '@jeanius/domain';
import type { ICategoryRepository } from '@jeanius/application';
import { createLogger } from '@jeanius/observability';
import { db, type Database } from '../../client.js';
import { categories } from '../../schema/catalog.js';

export class DrizzleCategoryRepository implements ICategoryRepository {
  private readonly logger = createLogger('database:category-repository');

  constructor(private readonly database: Database = db) {}

  async findById(id: string): Promise<Category | null> {
    const result = await this.database
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    const row = result[0];
    if (!row) {
      this.logger.debug('Category not found by ID', { id });
      return null;
    }

    return this.mapToDomain(row);
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const normalized = slug.trim().toLowerCase();
    const result = await this.database
      .select()
      .from(categories)
      .where(eq(categories.slug, normalized))
      .limit(1);

    const row = result[0];
    if (!row) {
      this.logger.debug('Category not found by slug', { slug: normalized });
      return null;
    }

    return this.mapToDomain(row);
  }

  async listAll(): Promise<readonly Category[]> {
    const rows = await this.database
      .select()
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.name));

    return rows.map((row) => this.mapToDomain(row));
  }

  async listActive(): Promise<readonly Category[]> {
    const rows = await this.database
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder), asc(categories.name));

    return rows.map((row) => this.mapToDomain(row));
  }

  async save(category: Category): Promise<void> {
    this.logger.info('Persisting category', { id: category.id, slug: category.slug });

    await this.database
      .insert(categories)
      .values({
        id: category.id,
        slug: category.slug,
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      })
      .onConflictDoUpdate({
        target: categories.id,
        set: {
          slug: category.slug,
          name: category.name,
          description: category.description,
          sortOrder: category.sortOrder,
          isActive: category.isActive,
          updatedAt: category.updatedAt,
        },
      });
  }

  async delete(id: string): Promise<void> {
    this.logger.info('Deleting category from database', { id });
    await this.database.delete(categories).where(eq(categories.id, id));
  }

  private mapToDomain(row: typeof categories.$inferSelect): Category {
    return new Category({
      id: row.id as CategoryId,
      slug: row.slug,
      name: row.name,
      description: row.description ?? undefined,
      sortOrder: row.sortOrder,
      isActive: row.isActive,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }
}
