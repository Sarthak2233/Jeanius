'use client';

import React from 'react';
import Link from 'next/link';
import type { ProductCardDto } from '@jeanius/contracts';
import { PriceDisplay } from './price-display';
import { StatusBadge } from './status-badge';
import { ProductImage } from './product-image';

export interface ProductCardProps {
  readonly product: ProductCardDto;
  readonly priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const aspectRatio = '1:1';

  const imageUrl = product.primaryImage?.url || product.images[0]?.url || '/placeholder-craft.png';

  const productHref = `/shop/${product.slug}`;

  const isSoldOut = product.status === 'SOLD_OUT';
  const isScheduled = product.status === 'SCHEDULED';

  const leadTimeNotice = isScheduled
    ? 'Preview Only'
    : isSoldOut
      ? 'Archived Edition'
      : product.commerceModel === 'OM'
        ? '14–21 Day Silversmithing Bench Queue'
        : 'Ready to Dispatch (48h)';

  return (
    <article className="catalog-card" role="article" aria-label={product.title}>
      {/* Top Image Container */}
      <Link href={productHref} className="catalog-card-media" tabIndex={-1}>
        <div className="catalog-card-media-zoom">
          <ProductImage
            src={imageUrl}
            alt={product.primaryImage?.altText || product.title}
            aspectRatio={aspectRatio}
            fit="cover"
            fetchPriority={priority ? 'high' : 'low'}
          />
        </div>

        {/* Status Badges Overlay */}
        <div className="catalog-card-badges">
          {product.commerceModel === 'OM' ? (
            <StatusBadge variant="om" status="ORDER-MADE" size="sm" />
          ) : (
            <StatusBadge variant="drop" status="LIMITED DROP" size="sm" />
          )}

          {isSoldOut && <StatusBadge variant="sold_out" status="SOLD OUT" size="sm" />}

          {isScheduled && <StatusBadge variant="warning" status="COUNTDOWN" size="sm" pulse />}
        </div>

        {/* Category Pill Overlay */}
        <span className="catalog-card-category-tag">{product.category}</span>
      </Link>

      {/* Product Content Meta */}
      <div className="catalog-card-body">
        <div>
          <h3 className="catalog-card-title">
            <Link href={productHref}>{product.title}</Link>
          </h3>

          <p className="catalog-card-desc">{product.description}</p>
        </div>

        {/* Pricing & Craft Queue Footer */}
        <div className="catalog-card-footer">
          <div>
            <div className="catalog-card-lead-time">{leadTimeNotice}</div>
            <PriceDisplay
              amount={product.basePriceAmount}
              currency={product.basePriceCurrency}
              size="md"
            />
          </div>

          <Link
            href={productHref}
            className={`catalog-action-btn ${
              isSoldOut
                ? 'catalog-btn-disabled'
                : product.commerceModel === 'OM'
                  ? 'catalog-btn-om'
                  : 'catalog-btn-drop'
            }`}
            aria-disabled={isSoldOut}
          >
            {product.commerceModel === 'OM'
              ? 'Configure Piece'
              : isSoldOut
                ? 'Sold Out'
                : 'Acquire Piece'}
          </Link>
        </div>
      </div>
    </article>
  );
}
