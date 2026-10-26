import { Category, DomainError } from '@jeanius/domain';
import { createLogger } from '@jeanius/observability';
import type { ICategoryRepository } from './category-repository.port.js';

export interface CreateCategoryInput {
  readonly slug: string;
  readonly name: string;
  readonly description?: string;
  readonly sortOrder?: number;
  readonly isActive?: boolean;
}

export interface UpdateCategoryInput {
  readonly id: string;
  readonly name?: string;
  readonly description?: string;
  readonly sortOrder?: number;
  readonly isActive?: boolean;
}

export class CategoryService {
  private readonly logger = createLogger('application:category-service');

  constructor(private readonly categoryRepo: ICategoryRepository) {}

  async listCategories(activeOnly = true): Promise<readonly Category[]> {
    if (activeOnly) {
      return this.categoryRepo.listActive();
    }
    return this.categoryRepo.listAll();
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return this.categoryRepo.findBySlug(slug);
  }

  async getCategoryById(id: string): Promise<Category | null> {
    return this.categoryRepo.findById(id);
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    this.logger.info('Creating category', { slug: input.slug, name: input.name });

    const existing = await this.categoryRepo.findBySlug(input.slug);
    if (existing) {
      throw new DomainError(`Category with slug '${input.slug}' already exists`);
    }

    const category = Category.create({
      slug: input.slug,
      name: input.name,
      description: input.description,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
    });

    await this.categoryRepo.save(category);
    this.logger.info('Category created successfully', { id: category.id, slug: category.slug });
    return category;
  }

  async updateCategory(input: UpdateCategoryInput): Promise<Category> {
    this.logger.info('Updating category', { id: input.id });

    const category = await this.categoryRepo.findById(input.id);
    if (!category) {
      throw new DomainError(`Category with id '${input.id}' not found`);
    }

    const updated = new Category({
      id: category.id,
      slug: category.slug,
      name: input.name !== undefined ? input.name : category.name,
      description: input.description !== undefined ? input.description : category.description,
      sortOrder: input.sortOrder !== undefined ? input.sortOrder : category.sortOrder,
      isActive: input.isActive !== undefined ? input.isActive : category.isActive,
      createdAt: category.createdAt,
      updatedAt: new Date(),
    });

    await this.categoryRepo.save(updated);
    this.logger.info('Category updated successfully', { id: updated.id });
    return updated;
  }

  async toggleCategoryStatus(id: string): Promise<Category> {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw new DomainError(`Category with id '${id}' not found`);
    }

    if (category.isActive) {
      category.deactivate();
    } else {
      category.activate();
    }
    await this.categoryRepo.save(category);
    this.logger.info('Category status toggled', { id: category.id, isActive: category.isActive });
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    this.logger.info('Deleting category', { id });
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw new DomainError(`Category with id '${id}' not found`);
    }

    await this.categoryRepo.delete(id);
    this.logger.info('Category deleted successfully', { id });
  }
}
