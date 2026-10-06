import React from 'react';

export interface PriceDisplayProps {
  readonly amount: number; // in cents
  readonly compareAtAmount?: number; // original price in cents
  readonly currency?: string;
  readonly size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  readonly delta?: boolean; // prefix with + or -
  readonly showCurrencyCode?: boolean; // render currency suffix (e.g. "USD")
  readonly highlightSale?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function PriceDisplay({
  amount,
  compareAtAmount,
  currency = 'USD',
  size = 'md',
  delta = false,
  showCurrencyCode = false,
  highlightSale = true,
  className = '',
  style,
}: PriceDisplayProps) {
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

  const sizeStyles: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero', React.CSSProperties> = {
    xs: { fontSize: 'var(--font-size-xs, 0.75rem)' },
    sm: { fontSize: 'var(--font-size-sm, 0.875rem)' },
    md: { fontSize: 'var(--font-size-base, 1rem)' },
    lg: { fontSize: 'var(--font-size-lg, 1.25rem)' },
    xl: { fontSize: 'var(--font-size-xl, 1.5rem)' },
    hero: { fontSize: 'var(--font-size-2xl, 2rem)', fontWeight: 600 },
  };

  const deltaPrefix = delta ? (isPositiveDelta ? '+' : isNegativeDelta ? '−' : '') : '';

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: '0.4rem',
        fontFamily: 'var(--font-mono, monospace)',
        fontVariantNumeric: 'tabular-nums',
        fontWeight: 500,
        color:
          isSale && highlightSale
            ? 'var(--color-craft-selvedgeRed, #b91c1c)'
            : 'var(--color-text-primary, #0f172a)',
        ...sizeStyles[size],
        ...style,
      }}
    >
      {/* Compare-at Strikethrough Original Price */}
      {isSale && (
        <del
          style={{
            fontSize: '0.85em',
            color: 'var(--color-text-muted, #64748b)',
            textDecoration: 'line-through',
            fontWeight: 400,
          }}
        >
          {formatAmount(compareAtAmount)}
        </del>
      )}

      {/* Primary Price */}
      <data value={amount / 100}>{`${deltaPrefix}${formatAmount(amount)}`}</data>

      {/* Optional Currency Code */}
      {showCurrencyCode && (
        <span
          style={{
            fontSize: '0.7em',
            color: 'var(--color-text-muted, #64748b)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {currency}
        </span>
      )}
    </span>
  );
}
