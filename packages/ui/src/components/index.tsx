import React from 'react';

export interface PriceDisplayProps {
  amount: number; // in cents
  currency?: string;
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  amount,
  currency = 'USD',
  className = '',
}) => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);

  return <span className={`font-mono font-medium ${className}`}>{formatted}</span>;
};

export interface StatusBadgeProps {
  status: string;
  variant?: 'om' | 'drop' | 'neutral';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'neutral',
  className = '',
}) => {
  const badgeStyles =
    variant === 'om'
      ? 'border border-amber-600 text-amber-700 bg-amber-50'
      : variant === 'drop'
        ? 'border border-blue-600 text-blue-700 bg-blue-50'
        : 'border border-slate-300 text-slate-700 bg-slate-50';

  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-mono tracking-wider uppercase rounded-sm ${badgeStyles} ${className}`}
    >
      {status}
    </span>
  );
};
