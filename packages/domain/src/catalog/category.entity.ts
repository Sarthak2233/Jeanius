/**
 * Category entity (Project 925).
 * Represents dynamic sterling silver jewellery classifications with custom category support.
 */
import { type CategoryId, createEntityId } from '../common/entity-id.js';
import { DomainError } from '../errors/index.js';

export interface CategoryProps {
  readonly id: CategoryId;
  readonly slug: string;
  readonly name: string;
  readonly description?: string;
  readonly sortOrder?: number;
  readonly isActive?: boolean;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

const SLUG_REGEX = /^[a-z0-9-]+$/;

export class Category {
  readonly id: CategoryId;
  readonly slug: string;
  private _name: string;
  private _description?: string;
  private _sortOrder: number;
  private _isActive: boolean;
  readonly createdAt: Date;
  private _updatedAt: Date;

  static create(props: {
    readonly id?: CategoryId;
    readonly slug: string;
    readonly name: string;
    readonly description?: string;
    readonly sortOrder?: number;
    readonly isActive?: boolean;
  }): Category {
    return new Category({
      id: props.id ?? createEntityId<'Category'>(crypto.randomUUID()),
      slug: props.slug,
      name: props.name,
      description: props.description,
      sortOrder: props.sortOrder ?? 0,
      isActive: props.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  constructor(props: CategoryProps) {
    const slug = props.slug?.trim().toLowerCase();
    if (!slug || !SLUG_REGEX.test(slug)) {
      throw new DomainError(
        `Category slug "${props.slug}" is invalid. Must be lowercase alphanumeric with hyphens.`,
      );
    }

    const name = props.name?.trim();
    if (!name || name.length < 2) {
      throw new DomainError('Category name must be at least 2 characters.');
    }

    this.id = props.id;
    this.slug = slug;
    this._name = name;
    this._description = props.description?.trim();
    this._sortOrder = props.sortOrder ?? 0;
    this._isActive = props.isActive ?? true;
    this.createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get name(): string {
    return this._name;
  }

  get description(): string | undefined {
    return this._description;
  }

  get sortOrder(): number {
    return this._sortOrder;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  updateDetails(updates: {
    readonly name?: string;
    readonly description?: string;
    readonly sortOrder?: number;
  }): void {
    if (updates.name !== undefined) {
      const trimmed = updates.name.trim();
      if (trimmed.length < 2) {
        throw new DomainError('Category name must be at least 2 characters.');
      }
      this._name = trimmed;
    }

    if (updates.description !== undefined) {
      this._description = updates.description.trim() || undefined;
    }

    if (updates.sortOrder !== undefined) {
      this._sortOrder = updates.sortOrder;
    }

    this._updatedAt = new Date();
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }
}
