'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProductImage } from './product-image';

export interface GalleryImage {
  readonly src: string;
  readonly alt: string;
  readonly title?: string;
}

export interface ProductGalleryProps {
  readonly images: ReadonlyArray<GalleryImage>;
  readonly initialIndex?: number;
  readonly aspectRatio?: '1:1' | '4:5';
  readonly fit?: 'contain' | 'cover';
  readonly showThumbnails?: boolean;
  readonly enableLightbox?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function ProductGallery({
  images,
  initialIndex = 0,
  aspectRatio = '1:1',
  fit = 'contain',
  showThumbnails = true,
  enableLightbox = true,
  className = '',
  style,
}: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(
    Math.min(Math.max(0, initialIndex), Math.max(0, images.length - 1)),
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const total = images.length;
  const currentImage = images[currentIndex];

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  }, [total]);

  // Keyboard navigation for carousel and lightbox
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        handlePrev();
      } else if (event.key === 'ArrowRight') {
        handleNext();
      } else if (event.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, isLightboxOpen]);

  // Lock body scroll during lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isLightboxOpen]);

  if (total === 0 || !currentImage) {
    return (
      <div
        className={className}
        style={{
          width: '100%',
          aspectRatio: aspectRatio === '1:1' ? '1 / 1' : '4 / 5',
          backgroundColor: 'var(--color-bg-elevated, #faf8f4)',
          border: '1px solid var(--border-subtle, #e2e8f0)',
          borderRadius: 'var(--radius-sm, 2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-muted, #64748b)',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: 'var(--font-size-xs, 0.75rem)',
          ...style,
        }}
      >
        NO MEDIA AVAILABLE
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem', ...style }}
    >
      {/* Main Viewport */}
      <div style={{ position: 'relative', width: '100%' }}>
        <ProductImage
          src={currentImage.src}
          alt={currentImage.alt}
          aspectRatio={aspectRatio}
          fit={fit}
          fetchPriority={currentIndex === 0 ? 'high' : 'low'}
          frame
          onClick={enableLightbox ? () => setIsLightboxOpen(true) : undefined}
          style={{ cursor: enableLightbox ? 'zoom-in' : 'default' }}
        />

        {/* Prev / Next Navigation Controls */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Previous image"
              style={{
                position: 'absolute',
                top: '50%',
                left: '0.75rem',
                transform: 'translateY(-50%)',
                zIndex: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid var(--border-subtle, #cbd5e1)',
                borderRadius: '50%',
                width: '2rem',
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: 'var(--color-text-primary, #0f172a)',
                transition: 'background-color 150ms ease, transform 150ms ease',
              }}
            >
              ‹
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next image"
              style={{
                position: 'absolute',
                top: '50%',
                right: '0.75rem',
                transform: 'translateY(-50%)',
                zIndex: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid var(--border-subtle, #cbd5e1)',
                borderRadius: '50%',
                width: '2rem',
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: 'var(--color-text-primary, #0f172a)',
                transition: 'background-color 150ms ease, transform 150ms ease',
              }}
            >
              ›
            </button>
          </>
        )}

        {/* Counter Badge */}
        {total > 1 && (
          <span
            style={{
              position: 'absolute',
              bottom: '0.75rem',
              right: '0.75rem',
              zIndex: 3,
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              color: '#ffffff',
              padding: '0.2rem 0.5rem',
              borderRadius: '2px',
              fontFamily: 'var(--font-mono, monospace)',
              fontVariantNumeric: 'tabular-nums',
              fontSize: '0.7rem',
              letterSpacing: '0.05em',
            }}
          >
            {`${currentIndex + 1} / ${total}`}
          </span>
        )}
      </div>

      {/* Thumbnails Strip */}
      {showThumbnails && total > 1 && (
        <div
          role="tablist"
          aria-label="Product image thumbnails"
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.25rem',
          }}
        >
          {images.map((img, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={img.src + idx}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-label={`View image ${idx + 1} of ${total}`}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  flex: '0 0 4rem',
                  height: '4rem',
                  padding: '2px',
                  backgroundColor: 'var(--color-bg-elevated, #faf8f4)',
                  border: isSelected
                    ? '2px solid var(--color-text-primary, #0f172a)'
                    : '1px solid var(--border-subtle, #cbd5e1)',
                  borderRadius: 'var(--radius-sm, 2px)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  opacity: isSelected ? 1 : 0.65,
                  transition: 'opacity 150ms ease, border-color 150ms ease',
                }}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: fit,
                    display: 'block',
                  }}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal View */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Product media zoom lightbox"
          onClick={() => setIsLightboxOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            backdropFilter: 'blur(4px)',
          }}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close lightbox"
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '1.75rem',
              cursor: 'pointer',
              zIndex: 10000,
              padding: '0.5rem',
              lineHeight: 1,
            }}
          >
            ✕
          </button>

          {/* Lightbox Center Image */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={currentImage.src}
              alt={currentImage.alt}
              style={{
                maxWidth: '85vw',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: '2px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              }}
            />

            {/* Prev/Next within Lightbox */}
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous image"
                  style={{
                    position: 'absolute',
                    left: '-3.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '50%',
                    width: '3rem',
                    height: '3rem',
                    color: '#ffffff',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next image"
                  style={{
                    position: 'absolute',
                    right: '-3.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '50%',
                    width: '3rem',
                    height: '3rem',
                    color: '#ffffff',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
