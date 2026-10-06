'use client';

import React from 'react';
import Link from 'next/link';
import { useUiStore } from '../stores';
import { SearchTrigger } from './search-trigger';
import { CartIndicator } from './cart-indicator';

export interface MobileHeaderProps {
  readonly cartItemCount?: number;
}

export function MobileHeader({ cartItemCount = 0 }: MobileHeaderProps) {
  const toggleMobileNav = useUiStore((state) => state.toggleMobileNav);
  const isMobileNavOpen = useUiStore((state) => state.isMobileNavOpen);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '0 1rem',
        height: '60px',
      }}
    >
      {/* Hamburger button */}
      <button
        type="button"
        onClick={toggleMobileNav}
        aria-label="Open navigation menu"
        aria-expanded={isMobileNavOpen}
        aria-controls="mobile-navigation-drawer"
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
          borderRadius: '4px',
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Brand logo */}
      <Link
        href="/"
        aria-label="Jeanius & Jewl Home"
        style={{
          textDecoration: 'none',
          color: '#0f172a',
          fontSize: '1.1rem',
          fontWeight: 800,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-serif, Georgia, serif)',
        }}
      >
        Jeanius &amp; Jewl
      </Link>

      {/* Utility Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <SearchTrigger variant="icon-only" />
        <CartIndicator itemCount={cartItemCount} />
      </div>
    </div>
  );
}
