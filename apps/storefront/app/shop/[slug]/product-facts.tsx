'use client';

import React, { useState } from 'react';
import type { ProductDetailDto } from '@jeanius/contracts';

export interface ProductFactsProps {
  readonly product: ProductDetailDto;
}

export function ProductFacts({ product }: ProductFactsProps) {
  const [isOpen, setIsOpen] = useState(true);

  const specs = [
    {
      label: 'Precious Alloy',
      value: product.craftSpecs?.purity ?? 'Solid .925 Sterling Silver',
    },
    {
      label: 'Workshop Origin',
      value: product.craftSpecs?.workshop ?? 'Kathmandu Artisan Atelier, Nepal',
    },
    {
      label: 'Official Hallmark',
      value: product.craftSpecs?.hallmark ?? "Stamped '925' + Kathmandu Artisan Seal",
    },
    {
      label: 'Craft Technique',
      value: 'Lost-Wax Casting, Chasing & Liver of Sulfur Patina',
    },
    {
      label: 'Presentation Casing',
      value: product.craftSpecs?.casing ?? 'Himalayan Handcrafted Teakwood Box',
    },
  ];

  return (
    <div
      style={{
        border: '1px solid #ebe7df',
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        marginTop: '1.5rem',
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        aria-expanded={isOpen}
      >
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#0f172a',
          }}
        >
          Craft Specifications &amp; Metallurgy
        </span>
        <span style={{ fontSize: '1.1rem', color: '#64748b' }}>{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen && (
        <div
          style={{
            padding: '0 1.25rem 1.25rem 1.25rem',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '1rem',
          }}
        >
          <dl
            style={{
              margin: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            {specs.map((item) => (
              <div key={item.label}>
                <dt
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    textTransform: 'uppercase',
                    color: '#94a3b8',
                    letterSpacing: '0.05em',
                    marginBottom: '0.2rem',
                  }}
                >
                  {item.label}
                </dt>
                <dd
                  style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#0f172a',
                  }}
                >
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
