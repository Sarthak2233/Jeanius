'use client';

import React from 'react';
import { useCartStore, selectCartTotalCount, useCartHydrated } from '../stores';

export interface CartIndicatorProps {
  readonly itemCount?: number;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function CartIndicator({ itemCount: propItemCount, className, style }: CartIndicatorProps) {
  const toggleCartDrawer = useCartStore((state) => state.toggleCartDrawer);
  const storeTotalCount = useCartStore(selectCartTotalCount);
  const isHydrated = useCartHydrated();

  const effectiveCount =
    propItemCount !== undefined ? propItemCount : isHydrated ? storeTotalCount : 0;

  return (
    <button
      type="button"
      onClick={toggleCartDrawer}
      aria-label={`Shopping bag, ${effectiveCount} items`}
      className={className}
      style={{
        background: 'none',
        border: 'none',
        color: '#0f172a',
        cursor: 'pointer',
        padding: '10px',
        minWidth: '44px',
        minHeight: '44px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        borderRadius: '4px',
        ...style,
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>

      {effectiveCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: '9999px',
            fontSize: '0.625rem',
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 700,
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        >
          {effectiveCount > 99 ? '99+' : effectiveCount}
        </span>
      )}
    </button>
  );
}
