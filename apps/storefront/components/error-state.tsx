'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from './button';

export interface ErrorStateProps {
  readonly title?: string;
  readonly message: string;
  readonly errorCode?: string;
  readonly onRetry?: () => void;
  readonly supportHref?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function ErrorState({
  title = 'An Atelier Error Occurred',
  message,
  errorCode,
  onRetry,
  supportHref = '/contact',
  className = '',
  style,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 2rem',
        backgroundColor: 'var(--color-bg-surface, #ffffff)',
        border: '1px solid rgba(185, 28, 28, 0.25)',
        borderTop: '3px solid var(--color-craft-selvedgeRed, #b91c1c)',
        borderRadius: 'var(--radius-sm, 2px)',
        maxWidth: '520px',
        margin: '0 auto',
        boxShadow: '0 10px 25px -5px rgba(185, 28, 28, 0.05)',
        ...style,
      }}
    >
      {errorCode && (
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 'var(--font-size-xs, 0.75rem)',
            color: 'var(--color-craft-selvedgeRed, #b91c1c)',
            backgroundColor: 'var(--color-craft-selvedgeRedSubtle, #fef2f2)',
            padding: '0.15rem 0.5rem',
            borderRadius: '2px',
            letterSpacing: '0.05em',
            marginBottom: '1rem',
          }}
        >
          {errorCode}
        </span>
      )}

      <h3
        style={{
          margin: '0 0 0.5rem 0',
          fontSize: 'var(--font-size-lg, 1.25rem)',
          fontFamily: 'var(--font-serif, serif)',
          fontWeight: 600,
          color: 'var(--color-text-primary, #0f172a)',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: '0 0 1.5rem 0',
          fontSize: 'var(--font-size-sm, 0.875rem)',
          fontFamily: 'var(--font-sans, sans-serif)',
          color: 'var(--color-text-secondary, #334155)',
          lineHeight: 'var(--leading-relaxed, 1.75)',
          maxWidth: '380px',
        }}
      >
        {message}
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {onRetry && (
          <Button variant="primary" size="md" onClick={onRetry}>
            TRY AGAIN
          </Button>
        )}
        {supportHref && (
          <Link href={supportHref} style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="md">
              CONTACT CONCIERGE
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
