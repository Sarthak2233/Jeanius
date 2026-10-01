/**
 * Review entity (JN-078).
 * Product review, verified purchase rating, and craftsman reply.
 */
import type { ReviewId, ProductId, CustomerId } from '../common/entity-id.js';
import { DomainError } from '../errors/index.js';

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ReviewProps {
  readonly id: ReviewId;
  readonly productId: ProductId;
  readonly customerId: CustomerId;
  readonly authorName: string;
  readonly rating: number; // 1 to 5
  readonly title: string;
  readonly body: string;
  readonly isVerifiedPurchase?: boolean;
  readonly artisanResponse?: string;
  readonly status?: ReviewStatus;
  readonly createdAt?: Date;
}

export class Review {
  readonly id: ReviewId;
  readonly productId: ProductId;
  readonly customerId: CustomerId;
  readonly authorName: string;
  readonly rating: number;
  readonly title: string;
  readonly body: string;
  readonly isVerifiedPurchase: boolean;
  private _artisanResponse?: string;
  private _status: ReviewStatus;
  readonly createdAt: Date;

  constructor(props: ReviewProps) {
    if (props.rating < 1 || props.rating > 5 || !Number.isInteger(props.rating)) {
      throw new DomainError(
        `Review rating must be an integer between 1 and 5, received: ${props.rating}`,
      );
    }
    if (!props.body?.trim()) {
      throw new DomainError('Review body cannot be empty');
    }

    this.id = props.id;
    this.productId = props.productId;
    this.customerId = props.customerId;
    this.authorName = props.authorName.trim();
    this.rating = props.rating;
    this.title = props.title.trim();
    this.body = props.body.trim();
    this.isVerifiedPurchase = props.isVerifiedPurchase ?? false;
    this._artisanResponse = props.artisanResponse;
    this._status = props.status ?? 'PENDING';
    this.createdAt = props.createdAt ?? new Date();
  }

  get artisanResponse(): string | undefined {
    return this._artisanResponse;
  }

  get status(): ReviewStatus {
    return this._status;
  }

  approve(): void {
    this._status = 'APPROVED';
  }

  reject(reason: string): void {
    this._status = 'REJECTED';
    void reason;
  }

  addArtisanResponse(response: string): void {
    if (!response.trim()) {
      throw new DomainError('Artisan response cannot be empty');
    }
    this._artisanResponse = response.trim();
  }
}
