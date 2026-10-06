import React from 'react';

export interface AdminPriceDisplayProps {
  readonly amount: number; // in cents
  readonly compareAtAmount?: number;
  readonly currency?: string;
  readonly size?: '2xs' | 'xs' | 'sm' | 'base' | 'lg';
  readonly delta?: boolean;
  readonly variant?: 'default' | 'telemetry' | 'hazard' | 'qc';
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function PriceDisplay({
  amount,
  compareAtAmount,
  currency = 'USD',
  size = 'sm',
  delta = false,
  variant = 'default',
  className = '',
  style,
}: AdminPriceDisplayProps) {
  const formatAmount = (cents: number): string => {
    const absCents = Math.abs(cents);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(absCents / 100);
  };

  const isSale = compareAtAmount !== undefined && compareAtAmount > amount;
  const isPositiveDelta = amount > 0;
  const isNegativeDelta = amount < 0;

  const sizeStyles: Record<'2xs' | 'xs' | 'sm' | 'base' | 'lg', React.CSSProperties> = {
    '2xs': { fontSize: 'var(--font-size-2xs, 0.65rem)' },
    xs: { fontSize: 'var(--font-size-xs, 0.75rem)' },
    sm: { fontSize: 'var(--font-size-sm, 0.85rem)' },
    base: { fontSize: 'var(--font-size-base, 0.95rem)' },
    lg: { fontSize: 'var(--font-size-lg, 1.15rem)', fontWeight: 600 },
  };

  const variantColors: Record<'default' | 'telemetry' | 'hazard' | 'qc', string> = {
    default: 'var(--text-primary, #f8fafc)',
    telemetry: 'var(--color-telemetry, #38bdf8)',
    hazard: 'var(--border-hazard, #ef4444)',
    qc: '#10b981',
  };

  const deltaPrefix = delta ? (isPositiveDelta ? '+' : isNegativeDelta ? '−' : '') : '';

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: '0.35rem',
        fontFamily: 'var(--font-mono, monospace)',
        fontVariantNumeric: 'tabular-nums',
        fontWeight: 500,
        color: variantColors[variant],
        ...sizeStyles[size],
        ...style,
      }}
    >
      {isSale && (
        <del
          style={{
            fontSize: '0.85em',
            color: 'var(--text-muted, #94a3b8)',
            textDecoration: 'line-through',
          }}
        >
          {formatAmount(compareAtAmount)}
        </del>
      )}

      <data value={amount / 100}>{`${deltaPrefix}${formatAmount(amount)}`}</data>
    </span>
  );
}
