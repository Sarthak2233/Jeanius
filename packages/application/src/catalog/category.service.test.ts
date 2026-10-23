import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CategoryService } from './category.service.js';
import type { ICategoryRepository } from './category-repository.port.js';
import type { Category } from '@jeanius/domain';

class MockCategoryRepository implements ICategoryRepository {
  private categories: Category[] = [];

  constructor(initial: Category[] = []) {
    this.categories = [...initial];
  }

  async findById(id: string): Promise<Category | null> {
    return this.categories.find((c) => c.id === id) ?? null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.categories.find((c) => c.slug === slug) ?? null;
  }

  async listAll(): Promise<readonly Category[]> {
    return [...this.categories].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async listActive(): Promise<readonly Category[]> {
    return this.categories.filter((c) => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async save(category: Category): Promise<void> {
    const idx = this.categories.findIndex((c) => c.id === category.id);
    if (idx >= 0) {
      this.categories[idx] = category;
    } else {
      this.categories.push(category);
    }
  }

  async delete(id: string): Promise<void> {
    this.categories = this.categories.filter((c) => c.id !== id);
  }
}

describe('CategoryService Application Service — Project 925 Dynamic Categories', () => {
  it('creates and lists active categories in sort order', async () => {
    const repo = new MockCategoryRepository();
    const service = new CategoryService(repo);

    const c1 = await service.createCategory({
      slug: 'rings',
      name: 'Rings',
      description: 'Hand-carved sterling silver rings',
      sortOrder: 1,
    });

    const c2 = await service.createCategory({
      slug: 'bracelets-cuffs',
      name: 'Bracelets & Cuffs',
      sortOrder: 2,
    });

    const c3 = await service.createCategory({
      slug: 'archived-collection',
      name: 'Archived Collection',
      sortOrder: 3,
      isActive: false,
    });

    assert.equal(c1.slug, 'rings');
    assert.equal(c2.slug, 'bracelets-cuffs');
    assert.equal(c3.isActive, false);

    const active = await service.listCategories(true);
    assert.equal(active.length, 2);
    assert.equal(active[0]?.slug, 'rings');
    assert.equal(active[1]?.slug, 'bracelets-cuffs');

    const all = await service.listCategories(false);
    assert.equal(all.length, 3);
  });

  it('rejects duplicate slugs on creation', async () => {
    const repo = new MockCategoryRepository();
    const service = new CategoryService(repo);

    await service.createCategory({ slug: 'rings', name: 'Rings' });
    await assert.rejects(
      () => service.createCategory({ slug: 'rings', name: 'Duplicate Rings' }),
      /already exists/,
    );
  });

  it('updates category properties and toggles active status', async () => {
    const repo = new MockCategoryRepository();
    const service = new CategoryService(repo);

    const created = await service.createCategory({
      slug: 'pendants',
      name: 'Pendants',
      sortOrder: 5,
    });

    const updated = await service.updateCategory({
      id: created.id,
      name: 'Pendants & Amulets',
      sortOrder: 4,
    });
    assert.equal(updated.name, 'Pendants & Amulets');
    assert.equal(updated.sortOrder, 4);

    const toggledOff = await service.toggleCategoryStatus(created.id);
    assert.equal(toggledOff.isActive, false);

    const activeList = await service.listCategories(true);
    assert.equal(activeList.length, 0);

    const toggledOn = await service.toggleCategoryStatus(created.id);
    assert.equal(toggledOn.isActive, true);
  });

  it('deletes category', async () => {
    const repo = new MockCategoryRepository();
    const service = new CategoryService(repo);

    const created = await service.createCategory({
      slug: 'temporary',
      name: 'Temporary Category',
    });

    await service.deleteCategory(created.id);
    const found = await service.getCategoryById(created.id);
    assert.equal(found, null);
  });
});
