'use client';

import React from 'react';
import type { ProductCardDto } from '@jeanius/contracts';
import { ProductCard } from './product-card';

export interface RelatedProductsProps {
  readonly products: readonly ProductCardDto[];
  readonly title?: string;
  readonly subtitle?: string;
  readonly className?: string;
}

export function RelatedProducts({
  products,
  title = 'Atelier Companion Craft',
  subtitle = 'Curated cross-craft pairings connecting bespoke raw Japanese denim with hand-cast talismanic silver and bridle leather.',
  className = '',
}: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section
      className={className}
      style={{
        paddingTop: '3rem',
        borderTop: '1px solid var(--border-subtle, #e2e8f0)',
      }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
            fontSize: '1.75rem',
            fontWeight: 500,
            color: 'var(--color-text-primary, #0f172a)',
            margin: '0 0 0.5rem 0',
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-sans, sans-serif)',
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary, #334155)',
            maxWidth: '42rem',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {subtitle}
        </p>
      </div>

      <div className="catalog-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
