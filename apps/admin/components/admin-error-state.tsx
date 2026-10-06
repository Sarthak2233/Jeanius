'use client';

import React from 'react';
import { AdminButton } from './admin-button';

export interface AdminErrorStateProps {
  readonly title?: string;
  readonly message: string;
  readonly faultCode?: string;
  readonly onRetry?: () => void;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function AdminErrorState({
  title = 'OPERATIONAL FAULT DETECTED',
  message,
  faultCode = 'ERR_OP_ABORT',
  onRetry,
  className = '',
  style,
}: AdminErrorStateProps) {
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
        padding: '2.5rem 1.5rem',
        backgroundColor: 'var(--bg-terminal, #0b0f19)',
        border: '1px solid var(--border-hazard, #ef4444)',
        borderLeft: '4px solid var(--border-hazard, #ef4444)',
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
          color: 'var(--border-hazard, #ef4444)',
          marginBottom: '0.5rem',
        }}
      >
        {`[ ALERT // ${faultCode} ]`}
      </span>

      <h3
        style={{
          margin: '0 0 0.5rem 0',
          fontSize: 'var(--font-size-xs, 0.75rem)',
          fontWeight: 700,
          color: 'var(--border-hazard, #ef4444)',
          letterSpacing: 'var(--tracking-mono, 0.05em)',
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
          maxWidth: '440px',
        }}
      >
        {message}
      </p>

      {onRetry && (
        <AdminButton variant="hazard" size="sm" onClick={onRetry}>
          RETRY OPERATION
        </AdminButton>
      )}
    </div>
  );
}
