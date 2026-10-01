/**
 * Product aggregate root (JN-066).
 * Orchestrates options, variants, pricing, and lifecycle transitions.
 */
import type { ProductId } from '../common/entity-id.js';
import { type Money } from '../common/money.vo.js';
import {
  type CommerceModel,
  type ProductCategory,
  type ProductStatus,
  canTransitionProductStatus,
} from './product-type.js';
import type { ProductOption } from './product-option.entity.js';
import type { ProductVariant } from './variant.entity.js';
import { DomainError } from '../errors/index.js';

export interface ProductProps {
  readonly id: ProductId;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly basePrice: Money;
  readonly commerceModel: CommerceModel;
  readonly category: ProductCategory;
  readonly status?: ProductStatus;
  readonly publishAt?: Date;
  readonly options?: readonly ProductOption[];
  readonly variants?: readonly ProductVariant[];
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export class Product {
  readonly id: ProductId;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly basePrice: Money;
  readonly commerceModel: CommerceModel;
  readonly category: ProductCategory;
  private _status: ProductStatus;
  private _publishAt?: Date;
  private readonly _options: ProductOption[];
  private readonly _variants: ProductVariant[];
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: ProductProps) {
    if (!props.slug?.trim()) {
      throw new DomainError('Product slug is required');
    }
    if (!props.title?.trim()) {
      throw new DomainError('Product title is required');
    }

    this.id = props.id;
    this.slug = props.slug.trim().toLowerCase();
    this.title = props.title.trim();
    this.description = props.description ?? '';
    this.basePrice = props.basePrice;
    this.commerceModel = props.commerceModel;
    this.category = props.category;
    this._status = props.status ?? 'DRAFT';
    this._publishAt = props.publishAt;
    this._options = props.options ? [...props.options] : [];
    this._variants = props.variants ? [...props.variants] : [];
    this.createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get status(): ProductStatus {
    return this._status;
  }

  get publishAt(): Date | undefined {
    return this._publishAt;
  }

  get isPublished(): boolean {
    return this._status === 'PUBLISHED';
  }

  get options(): readonly ProductOption[] {
    return [...this._options];
  }

  get variants(): readonly ProductVariant[] {
    return [...this._variants];
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  publish(now: Date = new Date()): void {
    if (!canTransitionProductStatus(this._status, 'PUBLISHED')) {
      throw new DomainError(`Cannot transition product status from ${this._status} to PUBLISHED`);
    }
    this._status = 'PUBLISHED';
    this._publishAt = now;
    this._updatedAt = now;
  }

  schedule(publishAt: Date): void {
    if (!canTransitionProductStatus(this._status, 'SCHEDULED')) {
      throw new DomainError(`Cannot schedule product from status ${this._status}`);
    }
    if (publishAt.getTime() <= Date.now()) {
      throw new DomainError('Scheduled publish date must be in the future');
    }
    this._status = 'SCHEDULED';
    this._publishAt = publishAt;
    this._updatedAt = new Date();
  }

  archive(): void {
    if (!canTransitionProductStatus(this._status, 'ARCHIVED')) {
      throw new DomainError(`Cannot archive product from status ${this._status}`);
    }
    this._status = 'ARCHIVED';
    this._updatedAt = new Date();
  }

  markSoldOut(): void {
    if (!canTransitionProductStatus(this._status, 'SOLD_OUT')) {
      throw new DomainError(`Cannot mark product sold out from status ${this._status}`);
    }
    this._status = 'SOLD_OUT';
    this._updatedAt = new Date();
  }

  addOption(opt: ProductOption): void {
    if (this._options.some((o) => o.code === opt.code)) {
      throw new DomainError(`Product option with code "${opt.code}" already exists on product`);
    }
    this._options.push(opt);
    this._updatedAt = new Date();
  }

  addVariant(variant: ProductVariant): void {
    if (this._variants.some((v) => v.sku === variant.sku)) {
      throw new DomainError(`Variant with SKU "${variant.sku}" already exists on product`);
    }
    this._variants.push(variant);
    this._updatedAt = new Date();
  }

  findVariantBySku(sku: string): ProductVariant | undefined {
    return this._variants.find((v) => v.sku.toUpperCase() === sku.toUpperCase());
  }
}
