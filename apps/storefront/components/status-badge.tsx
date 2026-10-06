import React from 'react';

export type StatusBadgeVariant =
  | 'om'
  | 'drop'
  | 'in_stock'
  | 'low_stock'
  | 'made_to_order'
  | 'out_of_stock'
  | 'sold_out'
  | 'pending'
  | 'confirmed'
  | 'in_production'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'success'
  | 'warning'
  | 'hazard'
  | 'error'
  | 'info'
  | 'neutral';

export interface StatusBadgeProps {
  readonly status: string;
  readonly variant?: StatusBadgeVariant;
  readonly dot?: boolean;
  readonly pulse?: boolean;
  readonly size?: 'sm' | 'md';
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

interface TokenConfig {
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
}: StatusBadgeProps) {
  const getBadgeColors = (): TokenConfig => {
    switch (variant) {
      case 'om':
      case 'made_to_order':
        return {
          bg: 'var(--color-om-bg, #fffbeb)',
          text: 'var(--color-om-text, #92400e)',
          border: 'var(--color-om-border, #d97706)',
          dotColor: '#d97706',
        };
      case 'drop':
      case 'info':
        return {
          bg: 'var(--color-drop-bg, #eff6ff)',
          text: 'var(--color-drop-text, #1e40af)',
          border: 'var(--color-drop-border, #3b82f6)',
          dotColor: '#3b82f6',
        };
      case 'in_stock':
      case 'success':
      case 'delivered':
      case 'confirmed':
        return {
          bg: 'var(--color-status-success-bg, #ecfdf5)',
          text: 'var(--color-status-success-text, #065f46)',
          border: 'var(--color-status-success-border, #10b981)',
          dotColor: '#10b981',
        };
      case 'in_production':
        return {
          bg: 'rgba(59, 130, 246, 0.08)',
          text: '#1e40af',
          border: '#3b82f6',
          dotColor: '#2563eb',
        };
      case 'low_stock':
      case 'warning':
      case 'pending':
        return {
          bg: '#fffbeb',
          text: '#b45309',
          border: '#f59e0b',
          dotColor: '#f59e0b',
        };
      case 'out_of_stock':
      case 'sold_out':
      case 'cancelled':
      case 'hazard':
      case 'error':
        return {
          bg: 'var(--color-craft-selvedgeRedSubtle, #fef2f2)',
          text: 'var(--color-craft-selvedgeRed, #b91c1c)',
          border: 'rgba(185, 28, 28, 0.4)',
          dotColor: '#b91c1c',
        };
      case 'shipped':
        return {
          bg: '#f0fdf4',
          text: '#15803d',
          border: '#22c55e',
          dotColor: '#22c55e',
        };
      case 'neutral':
      default:
        return {
          bg: 'var(--color-neutral-bg, #f8fafc)',
          text: 'var(--color-neutral-text, #334155)',
          border: 'var(--color-neutral-border, #cbd5e1)',
          dotColor: '#64748b',
        };
    }
  };

  const colors = getBadgeColors();
  const showDot = dot || pulse;

  const sizeStyles: Record<'sm' | 'md', React.CSSProperties> = {
    sm: {
      padding: '0.125rem 0.5rem',
      fontSize: 'var(--font-size-xs, 0.75rem)',
      gap: '0.35rem',
    },
    md: {
      padding: '0.25rem 0.75rem',
      fontSize: 'var(--font-size-sm, 0.875rem)',
      gap: '0.45rem',
    },
  };

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: 'var(--font-mono, monospace)',
        letterSpacing: 'var(--tracking-wide, 0.05em)',
        textTransform: 'uppercase',
        borderRadius: 'var(--radius-sm, 2px)',
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.bg,
        color: colors.text,
        fontWeight: 600,
        lineHeight: 1.2,
        transition: 'var(--transition-interactive, transform 150ms cubic-bezier(0.16, 1, 0.3, 1))',
        ...sizeStyles[size],
        ...style,
      }}
    >
      {showDot && (
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: '0.45rem',
            height: '0.45rem',
            borderRadius: '50%',
            backgroundColor: colors.dotColor,
            boxShadow: pulse ? `0 0 0 2px ${colors.dotColor}33` : 'none',
            animation: pulse ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
            flexShrink: 0,
          }}
        />
      )}
      <span>{status}</span>
    </span>
  );
}
