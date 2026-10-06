'use client';

import React from 'react';
import { AdminButton } from './admin-button';

export interface AdminEmptyStateProps {
  readonly title: string;
  readonly description: string;
  readonly code?: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function AdminEmptyState({
  title,
  description,
  code = 'NULL_DATA',
  actionLabel,
  onAction,
  className = '',
  style,
}: AdminEmptyStateProps) {
  return (
    <div
      role="status"
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 2rem',
        backgroundColor: 'var(--bg-terminal, #0b0f19)',
        border: '1px solid var(--border-grid, #334155)',
        borderRadius: 'var(--radius-none, 0px)',
        fontFamily: 'var(--font-mono, monospace)',
        maxWidth: '560px',
        margin: '0 auto',
        ...style,
      }}
    >
      <span
        style={{
          fontSize: 'var(--font-size-2xs, 0.65rem)',
          letterSpacing: 'var(--tracking-mono, 0.05em)',
          color: 'var(--color-telemetry, #38bdf8)',
          marginBottom: '0.75rem',
        }}
      >
        {`[ STATUS // ${code} ]`}
      </span>

      <h3
        style={{
          margin: '0 0 0.5rem 0',
          fontSize: 'var(--font-size-sm, 0.85rem)',
          fontWeight: 600,
          color: 'var(--text-primary, #f8fafc)',
          letterSpacing: 'var(--tracking-mono, 0.05em)',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: '0 0 1.5rem 0',
          fontSize: 'var(--font-size-xs, 0.75rem)',
          color: 'var(--text-secondary, #cbd5e1)',
          lineHeight: 'var(--leading-relaxed, 1.6)',
          maxWidth: '420px',
        }}
      >
        {description}
      </p>

      {actionLabel && onAction && (
        <AdminButton variant="bench" size="sm" onClick={onAction}>
          {actionLabel}
        </AdminButton>
      )}
    </div>
  );
}
