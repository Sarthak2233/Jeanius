'use client';

import React from 'react';

// ============================================================================
// 1. Admin Telemetry Skeleton Placeholder
// ============================================================================

export interface AdminSkeletonProps {
  readonly width?: string | number;
  readonly height?: string | number;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function AdminSkeleton({
  width = '100%',
  height = '1rem',
  className = '',
  style,
}: AdminSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        width,
        height,
        backgroundColor: 'var(--bg-bench, #1e293b)',
        backgroundImage:
          'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(56, 189, 248, 0.08) 50%, rgba(255,255,255,0) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: 'var(--radius-none, 0px)',
        border: '1px solid var(--border-grid, #334155)',
        ...style,
      }}
    />
  );
}

// ============================================================================
// 2. Admin Monospace Spinner
// ============================================================================

export interface AdminSpinnerProps {
  readonly label?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function AdminSpinner({
  label = 'PROCESSING TELEMETRY...',
  className = '',
  style,
}: AdminSpinnerProps) {
  return (
    <div
      role="status"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: 'var(--font-size-xs, 0.75rem)',
        color: 'var(--color-telemetry, #38bdf8)',
        letterSpacing: 'var(--tracking-mono, 0.05em)',
        ...style,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: '0.75rem',
          height: '0.75rem',
          borderRadius: '50%',
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          animation: 'spin 600ms linear infinite',
        }}
      />
      <span>{label}</span>
    </div>
  );
}

// ============================================================================
// 3. Admin Loading Overlay
// ============================================================================

export interface AdminLoadingOverlayProps {
  readonly message?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function AdminLoadingOverlay({
  message = 'SYNCING WORKBENCH OPERATIONS...',
  className = '',
  style,
}: AdminLoadingOverlayProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        zIndex: 50,
        ...style,
      }}
    >
      <AdminSpinner label={message} />
    </div>
  );
}
