'use client';

import React from 'react';
import Link from 'next/link';
import { SearchTrigger } from './search-trigger';
import { AccountNavState } from './account-nav-state';
import { CartIndicator } from './cart-indicator';
import { useUiStore } from '../stores';

export interface DesktopHeaderProps {
  readonly isAuthenticated: boolean;
  readonly role?: string;
  readonly fullName?: string;
  readonly cartItemCount?: number;
}

export function DesktopHeader({
  isAuthenticated,
  role = 'COLLECTOR',
  fullName = 'Collector',
  cartItemCount = 0,
}: DesktopHeaderProps) {
  const isMemberOrAdmin = role === 'MEMBER' || role === 'ADMIN';
  const openSearch = useUiStore((state) => state.openSearch);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      {/* =====================================================================
          Tier 1: Main Brand, Navigation & Utilities
          ===================================================================== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 2rem',
          height: '64px',
        }}
      >
        {/* Brand & Studio Emblem */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <Link
            href="/"
            aria-label="Jeanius &amp; Jewl Home"
            style={{
              textDecoration: 'none',
              color: '#0f172a',
              display: 'flex',
              flexDirection: 'column',
              lineHeight: 1.1,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
                fontSize: '1.28rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              Jeanius &amp; Jewl
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.55rem',
                letterSpacing: '0.22em',
                color: '#94a3b8',
                fontWeight: 500,
                marginTop: '3px',
                textTransform: 'uppercase',
              }}
            >
              ATELIER · KTM
            </span>
          </Link>

          {/* Primary Editorial Navigation */}
          <nav
            aria-label="Primary desktop navigation"
            style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}
          >
            <Link
              href="/about"
              style={{
                textDecoration: 'none',
                color: '#334155',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                transition: 'color var(--duration-micro, 150ms) ease',
              }}
            >
              About/Guide
            </Link>

            <Link
              href="/"
              style={{
                textDecoration: 'none',
                color: '#334155',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                transition: 'color var(--duration-micro, 150ms) ease',
              }}
            >
              Shop (OM)
            </Link>

            <Link
              href="/drop"
              style={{
                textDecoration: 'none',
                color: isMemberOrAdmin ? '#b45309' : '#334155',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'color var(--duration-micro, 150ms) ease',
              }}
            >
              <span>Drop</span>
              {!isMemberOrAdmin ? (
                <span
                  style={{
                    fontSize: '0.62rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  🔒 VIP
                </span>
              ) : (
                <span style={{ color: '#b45309', fontSize: '0.75rem' }}>★</span>
              )}
            </Link>

            <Link
              href="/together"
              style={{
                textDecoration: 'none',
                color: '#334155',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                transition: 'color var(--duration-micro, 150ms) ease',
              }}
            >
              Together
            </Link>

            <Link
              href="/sizing"
              style={{
                textDecoration: 'none',
                color: '#334155',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                transition: 'color var(--duration-micro, 150ms) ease',
              }}
            >
              Sizing
            </Link>

            <Link
              href="/contact"
              style={{
                textDecoration: 'none',
                color: '#334155',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                transition: 'color var(--duration-micro, 150ms) ease',
              }}
            >
              Contact
            </Link>
          </nav>
        </div>

        {/* Utility Tray: Currency, Account State & Cart Bag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <span
            style={{
              fontSize: '0.72rem',
              color: '#64748b',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-mono, monospace)',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            USD ($)
          </span>

          <AccountNavState
            isAuthenticated={isAuthenticated}
            role={role}
            fullName={fullName}
            variant="desktop"
          />

          <CartIndicator itemCount={cartItemCount} />
        </div>
      </div>

      {/* =====================================================================
          Tier 2: Dedicated Atelier Discovery & Search Sub-Bar (Moved Below)
          ===================================================================== */}
      <div
        style={{
          width: '100%',
          borderTop: '1px solid #ebe7df',
          backgroundColor: 'rgba(250, 248, 244, 0.75)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0.4rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
          }}
        >
          {/* Aesthetic Search Bar Trigger */}
          <SearchTrigger />

          {/* Curated Atelier Quick Discovery Tags */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            <span
              style={{
                fontSize: '0.68rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#94a3b8',
                fontWeight: 600,
                marginRight: '0.25rem',
              }}
            >
              Quick Discover:
            </span>

            <button
              type="button"
              onClick={openSearch}
              style={{
                background: 'none',
                border: '1px solid #e2e8f0',
                borderRadius: '9999px',
                padding: '0.22rem 0.65rem',
                fontSize: '0.72rem',
                color: '#475569',
                cursor: 'pointer',
                backgroundColor: '#ffffff',
                transition: 'border-color 150ms ease, color 150ms ease',
              }}
            >
              14oz Kurabo Selvedge
            </button>

            <Link
              href="/sizing"
              style={{
                textDecoration: 'none',
                border: '1px solid #e2e8f0',
                borderRadius: '9999px',
                padding: '0.22rem 0.65rem',
                fontSize: '0.72rem',
                color: '#475569',
                backgroundColor: '#ffffff',
                transition: 'border-color 150ms ease, color 150ms ease',
              }}
            >
              Ring Mandrel Chart
            </Link>

            <Link
              href="/about"
              style={{
                textDecoration: 'none',
                border: '1px solid #e2e8f0',
                borderRadius: '9999px',
                padding: '0.22rem 0.65rem',
                fontSize: '0.72rem',
                color: '#475569',
                backgroundColor: '#ffffff',
                transition: 'border-color 150ms ease, color 150ms ease',
              }}
            >
              OM Lead Times (14-21d)
            </Link>

            <button
              type="button"
              onClick={openSearch}
              style={{
                background: 'none',
                border: '1px solid #e2e8f0',
                borderRadius: '9999px',
                padding: '0.22rem 0.65rem',
                fontSize: '0.72rem',
                color: '#475569',
                cursor: 'pointer',
                backgroundColor: '#ffffff',
                transition: 'border-color 150ms ease, color 150ms ease',
              }}
            >
              925 Sterling Silver
            </button>

            <Link
              href="/drop"
              style={{
                textDecoration: 'none',
                border: '1px solid #fde68a',
                borderRadius: '9999px',
                padding: '0.22rem 0.65rem',
                fontSize: '0.72rem',
                color: '#92400e',
                backgroundColor: '#fffbeb',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}
            >
              Drop 01 Vault
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
