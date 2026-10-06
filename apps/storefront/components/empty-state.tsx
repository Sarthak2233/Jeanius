'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from './button';

export interface EmptyStateProps {
  readonly title: string;
  readonly description: string;
  readonly icon?: React.ReactNode;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly actionHref?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  actionHref,
  className = '',
  style,
}: EmptyStateProps) {
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
        padding: '4rem 2rem',
        backgroundColor: 'var(--color-bg-elevated, #faf8f4)',
        border: '1px solid var(--border-subtle, #cbd5e1)',
        borderRadius: 'var(--radius-sm, 2px)',
        maxWidth: '540px',
        margin: '0 auto',
        ...style,
      }}
    >
      {/* Emblem / Monogram */}
      <div
        aria-hidden="true"
        style={{
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: '50%',
          backgroundColor: 'var(--color-bg-surface, #ffffff)',
          border: '1px solid var(--border-subtle, #cbd5e1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          color: 'var(--color-text-muted, #64748b)',
        }}
      >
        {icon || (
          <span
            style={{
              fontFamily: 'var(--font-serif, serif)',
              fontWeight: 600,
              fontSize: '1.25rem',
              letterSpacing: '0.08em',
              color: 'var(--color-text-subtle, #94a3b8)',
            }}
          >
            J&J
          </span>
        )}
      </div>

      <h3
        style={{
          margin: '0 0 0.5rem 0',
          fontSize: 'var(--font-size-lg, 1.25rem)',
          fontFamily: 'var(--font-serif, serif)',
          fontWeight: 600,
          color: 'var(--color-text-primary, #0f172a)',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: '0 0 1.75rem 0',
          fontSize: 'var(--font-size-sm, 0.875rem)',
          fontFamily: 'var(--font-sans, sans-serif)',
          color: 'var(--color-text-secondary, #334155)',
          lineHeight: 'var(--leading-relaxed, 1.75)',
          maxWidth: '380px',
        }}
      >
        {description}
      </p>

      {actionLabel &&
        (actionHref ? (
          <Link href={actionHref} style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="md">
              {actionLabel}
            </Button>
          </Link>
        ) : onAction ? (
          <Button variant="primary" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null)}
    </div>
  );
}
