import React from 'react';

export type AdminStatusVariant =
  | 'om'
  | 'drop'
  | 'queued'
  | 'cutting'
  | 'sewing'
  | 'washing'
  | 'hardware'
  | 'qc'
  | 'ready'
  | 'shipped'
  | 'telemetry'
  | 'hazard'
  | 'neutral';

export interface AdminStatusBadgeProps {
  readonly status: string;
  readonly variant?: AdminStatusVariant | string;
  readonly dot?: boolean;
  readonly pulse?: boolean;
  readonly size?: 'sm' | 'md';
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

interface AdminTokenConfig {
  readonly bg: string;
  readonly text: string;
  readonly border: string;
  readonly dotColor: string;
}

export function StatusBadge({
  status,
  variant = 'neutral',
  dot = false,
  pulse = false,
  size = 'sm',
  className = '',
  style,
}: AdminStatusBadgeProps) {
  const normalizedVariant = (variant || '').toLowerCase();

  const getBadgeColors = (): AdminTokenConfig => {
    switch (normalizedVariant) {
      case 'om':
        return {
          bg: 'var(--color-craft-om-subtle, rgba(245, 158, 11, 0.15))',
          text: 'var(--color-craft-om, #f59e0b)',
          border: 'var(--color-craft-om, #f59e0b)',
          dotColor: '#f59e0b',
        };
      case 'drop':
      case 'telemetry':
      case 'cutting':
      case 'sewing':
        return {
          bg: 'var(--color-telemetry-subtle, rgba(56, 189, 248, 0.15))',
          text: 'var(--color-telemetry, #38bdf8)',
          border: 'var(--color-telemetry, #38bdf8)',
          dotColor: '#38bdf8',
        };
      case 'qc':
      case 'ready':
      case 'shipped':
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          text: '#10b981',
          border: '#10b981',
          dotColor: '#10b981',
        };
      case 'hazard':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          text: 'var(--border-hazard, #ef4444)',
          border: 'var(--border-hazard, #ef4444)',
          dotColor: '#ef4444',
        };
      case 'washing':
      case 'hardware':
        return {
          bg: 'rgba(148, 163, 184, 0.15)',
          text: '#e2e8f0',
          border: '#94a3b8',
          dotColor: '#cbd5e1',
        };
      case 'queued':
      case 'neutral':
      default:
        return {
          bg: 'var(--bg-bench, #1e293b)',
          text: 'var(--text-secondary, #cbd5e1)',
          border: 'var(--border-grid, #334155)',
          dotColor: '#94a3b8',
        };
    }
  };

  const colors = getBadgeColors();
  const showDot = dot || pulse;

  const sizeStyles: Record<'sm' | 'md', React.CSSProperties> = {
    sm: {
      padding: '0.125rem 0.5rem',
      fontSize: 'var(--font-size-2xs, 0.65rem)',
      gap: '0.3rem',
    },
    md: {
      padding: '0.2rem 0.65rem',
      fontSize: 'var(--font-size-xs, 0.75rem)',
      gap: '0.4rem',
    },
  };

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: 'var(--font-mono, monospace)',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: 'var(--tracking-mono, 0.05em)',
        textTransform: 'uppercase',
        borderRadius: 'var(--radius-xs, 2px)',
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.bg,
        color: colors.text,
        fontWeight: 600,
        lineHeight: 1.2,
        transition: 'var(--transition-interactive, transform 150ms cubic-bezier(0, 0, 0.2, 1))',
        ...sizeStyles[size],
        ...style,
      }}
    >
      {showDot && (
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: '0.4rem',
            height: '0.4rem',
            borderRadius: '50%',
            backgroundColor: colors.dotColor,
            boxShadow: pulse ? `0 0 0 2px ${colors.dotColor}33` : 'none',
            animation: pulse ? 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
            flexShrink: 0,
          }}
        />
      )}
      <span>{status}</span>
    </span>
  );
}
