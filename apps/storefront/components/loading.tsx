'use client';

import React from 'react';

// ============================================================================
// 1. Skeleton Shimmer Placeholder
// ============================================================================

export interface SkeletonProps {
  readonly variant?: 'text' | 'rectangular' | 'circular' | 'card';
  readonly width?: string | number;
  readonly height?: string | number;
  readonly borderRadius?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  borderRadius,
  className = '',
  style,
}: SkeletonProps) {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'circular':
        return {
          width: width || '2.5rem',
          height: height || '2.5rem',
          borderRadius: '50%',
        };
      case 'rectangular':
        return {
          width: width || '100%',
          height: height || '12rem',
          borderRadius: borderRadius || 'var(--radius-sm, 2px)',
        };
      case 'card':
        return {
          width: width || '100%',
          height: height || '18rem',
          borderRadius: borderRadius || 'var(--radius-sm, 2px)',
        };
      case 'text':
      default:
        return {
          width: width || '100%',
          height: height || '1rem',
          borderRadius: borderRadius || 'var(--radius-sm, 2px)',
        };
    }
  };

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        backgroundColor: 'var(--color-bg-elevated, #faf8f4)',
        backgroundImage:
          'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...getVariantStyles(),
        ...style,
      }}
    />
  );
}

// ============================================================================
// 2. Spinner Component
// ============================================================================

export interface SpinnerProps {
  readonly size?: 'sm' | 'md' | 'lg';
  readonly color?: string;
  readonly label?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function Spinner({
  size = 'md',
  color = 'var(--color-text-primary, #0f172a)',
  label = 'Loading...',
  className = '',
  style,
}: SpinnerProps) {
  const sizeMap: Record<'sm' | 'md' | 'lg', number> = {
    sm: 16,
    md: 24,
    lg: 36,
  };

  const dimension = sizeMap[size];

  return (
    <div
      role="status"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          animation: 'spin 600ms linear infinite',
        }}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeOpacity="0.2"
          style={{ color }}
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ color }}
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ============================================================================
// 3. LoadingOverlay Component
// ============================================================================

export interface LoadingOverlayProps {
  readonly message?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function LoadingOverlay({
  message = 'Processing atelier order...',
  className = '',
  style,
}: LoadingOverlayProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(253, 251, 247, 0.85)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        zIndex: 50,
        borderRadius: 'inherit',
        ...style,
      }}
    >
      <Spinner size="lg" />
      <span
        style={{
          fontFamily: 'var(--font-sans, sans-serif)',
          fontSize: 'var(--font-size-sm, 0.875rem)',
          fontWeight: 500,
          color: 'var(--color-text-secondary, #334155)',
          letterSpacing: '0.02em',
        }}
      >
        {message}
      </span>
    </div>
  );
}
