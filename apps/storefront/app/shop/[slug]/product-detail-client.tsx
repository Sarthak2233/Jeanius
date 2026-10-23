'use client';

import React from 'react';
import Link from 'next/link';
import type { ProductDetailDto, ProductCardDto } from '@jeanius/contracts';
import { ProductGallery, type GalleryImage } from '../../../components/product-gallery';
import { StatusBadge } from '../../../components/status-badge';
import { RelatedProducts } from '../../../components/related-products';
import { ProductConfigurator } from './product-configurator';
import { ProductFacts } from './product-facts';
import { ShippingInfo } from './shipping-info';

export interface ProductDetailClientProps {
  readonly product: ProductDetailDto;
  readonly relatedProducts?: readonly ProductCardDto[];
}

export function ProductDetailClient({ product, relatedProducts = [] }: ProductDetailClientProps) {
  // Format gallery images
  const galleryImages: GalleryImage[] = React.useMemo(() => {
    if (product.images.length > 0) {
      return product.images.map((img) => ({
        src: img.url,
        alt: img.altText ?? product.title,
        title: product.title,
      }));
    }
    if (product.primaryImage) {
      return [
        {
          src: product.primaryImage.url,
          alt: product.primaryImage.altText ?? product.title,
          title: product.title,
        },
      ];
    }
    return [
      {
        src: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200',
        alt: product.title,
        title: product.title,
      },
    ];
  }, [product]);

  const isOM = product.commerceModel === 'OM';
  const categoryLabel = product.category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-canvas, #fdfbf7)',
        minHeight: '100vh',
        color: 'var(--color-text-primary, #0f172a)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '2rem 1.5rem 5rem 1.5rem',
        }}
      >
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono, monospace)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-text-muted, #64748b)',
            marginBottom: '2rem',
          }}
        >
          <Link
            href="/shop"
            style={{
              color: 'var(--color-text-muted, #64748b)',
              textDecoration: 'none',
              transition: 'color 150ms ease',
            }}
          >
            Atelier Shop
          </Link>
          <span style={{ color: '#cbd5e1' }}>/</span>
          <Link
            href={`/shop?category=${product.category}`}
            style={{
              color: 'var(--color-text-muted, #64748b)',
              textDecoration: 'none',
              transition: 'color 150ms ease',
            }}
          >
            {categoryLabel}
          </Link>
          <span style={{ color: '#cbd5e1' }}>/</span>
          <span
            style={{
              color: 'var(--color-text-primary, #0f172a)',
              fontWeight: 600,
              maxWidth: '300px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {product.title}
          </span>
        </nav>

        {/* Main 2-Column Product Detail Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
            gap: '3.5rem',
            alignItems: 'start',
            marginBottom: '5rem',
          }}
        >
          {/* Left Column: Media Gallery */}
          <section aria-label="Product Media">
            <div
              style={{
                position: 'sticky',
                top: '6rem',
                backgroundColor: 'var(--color-bg-surface, #ffffff)',
                border: '1px solid #ebe7df',
                borderRadius: '8px',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <ProductGallery
                images={galleryImages}
                aspectRatio="1:1"
                fit="contain"
                showThumbnails
                enableLightbox
              />
            </div>
          </section>

          {/* Right Column: Configuration & Narrative */}
          <section aria-label="Product Details and Configuration">
            {/* Model Badge & Origin */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <StatusBadge
                status={isOM ? 'ORDER-MADE' : 'LIMITED DROP'}
                variant={isOM ? 'om' : 'drop'}
                dot
              />
              <span
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted, #64748b)',
                }}
              >
                Kathmandu Atelier • Solid .925 Silver
              </span>
            </div>

            {/* Product Title */}
            <h1
              style={{
                fontFamily: 'var(--font-serif, "Playfair Display", Didot, Georgia, serif)',
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                fontWeight: 600,
                lineHeight: 1.2,
                color: 'var(--color-text-primary, #0f172a)',
                margin: '0 0 1rem 0',
                letterSpacing: '-0.02em',
              }}
            >
              {product.title}
            </h1>

            {/* Editorial Description */}
            <div
              style={{
                fontSize: '0.95rem',
                lineHeight: 1.7,
                color: 'var(--color-text-secondary, #334155)',
                marginBottom: '1.5rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid #ebe7df',
              }}
            >
              <p style={{ margin: 0 }}>{product.description}</p>
            </div>

            {/* Interactive Jewellery Configurator */}
            <ProductConfigurator product={product} />

            {/* Craft Metallurgy Specifications Accordion */}
            <ProductFacts product={product} />

            {/* Shipping, Lead-Time & Customs Accordion */}
            <ShippingInfo
              commerceModel={product.commerceModel}
              leadTimeDays={product.leadTimeDays}
            />
          </section>
        </div>

        {/* Related / Companion Products Section */}
        {relatedProducts.length > 0 && (
          <RelatedProducts
            products={relatedProducts}
            title="Atelier Companion Craft"
            subtitle="Curated companion creations cast and chiseled in our Kathmandu workshop."
          />
        )}
      </div>
    </div>
  );
}
