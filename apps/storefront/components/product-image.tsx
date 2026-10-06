'use client';

import React, { useState } from 'react';

export interface ProductImageProps {
  readonly src: string;
  readonly alt: string;
  readonly aspectRatio?: '1:1' | '4:5' | '16:9' | 'auto';
  readonly fit?: 'contain' | 'cover';
  readonly fetchPriority?: 'high' | 'low';
  readonly loading?: 'lazy' | 'eager';
  readonly frame?: boolean;
  readonly fallbackSrc?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly onClick?: () => void;
}

export function ProductImage({
  src,
  alt,
  aspectRatio = '1:1',
  fit = 'contain',
  fetchPriority,
  loading = fetchPriority === 'high' ? 'eager' : 'lazy',
  frame = false,
  fallbackSrc,
  className = '',
  style,
  onClick,
}: ProductImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const aspectRatioStyles: Record<'1:1' | '4:5' | '16:9' | 'auto', string> = {
    '1:1': '1 / 1',
    '4:5': '4 / 5',
    '16:9': '16 / 9',
    auto: 'auto',
  };

  const effectiveSrc = hasError && fallbackSrc ? fallbackSrc : src;

  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: aspectRatioStyles[aspectRatio],
        backgroundColor: 'var(--color-bg-elevated, #faf8f4)',
        border: frame ? '1px solid var(--border-subtle, #e2e8f0)' : 'none',
        borderRadius: 'var(--radius-sm, 2px)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {/* Loading Skeleton */}
      {!isLoaded && !hasError && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'var(--color-bg-elevated, #faf8f4)',
            backgroundImage:
              'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            zIndex: 1,
          }}
        />
      )}

      {/* Error Fallback State */}
      {hasError && !fallbackSrc ? (
        <div
          role="img"
          aria-label={alt}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            textAlign: 'center',
            color: 'var(--color-text-muted, #64748b)',
            gap: '0.5rem',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-serif, serif)',
              fontSize: '1.5rem',
              letterSpacing: '0.1em',
              fontWeight: 600,
              color: 'var(--color-text-subtle, #94a3b8)',
            }}
          >
            J&J
          </span>
          <span
            style={{
              fontSize: 'var(--font-size-xs, 0.75rem)',
              fontFamily: 'var(--font-mono, monospace)',
              letterSpacing: '0.05em',
            }}
          >
            {alt || 'IMAGE UNAVAILABLE'}
          </span>
        </div>
      ) : (
        /* Image Element */
        <img
          src={effectiveSrc}
          alt={alt}
          loading={loading}
          fetchPriority={fetchPriority}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: fit,
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 200ms ease-out',
            zIndex: 2,
          }}
        />
      )}
    </div>
  );
}
