import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createStorefrontMetadata } from '../../lib/metadata';
import { createClient } from '../../lib/supabase/server';
import { getCatalogAction } from '../../actions/catalog.actions';
import { DropCatalogClient } from './drop-catalog-client';

export const metadata: Metadata = createStorefrontMetadata({
  title: 'Limited Drops — Atelier Vault (Members Only)',
  description:
    'Exclusive limited-run selvedge bolt allocations, ready-to-ship denim, and hallmarked sterling silver releases for registered collectors.',
});

interface DropPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function DropPage(props: DropPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = Boolean(user);
  const role = (user?.user_metadata?.role as string) || 'CUSTOMER';
  const isVipMember = role === 'MEMBER' || role === 'ADMIN';
  const fullName =
    (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || 'Collector';

  // 1. Unauthenticated Guest: Gated Access Gate (Spec Section 23 & 42: zero data leakage)
  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg-canvas, #fdfbf7)', minHeight: '100vh' }}>
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '4.5rem 2rem',
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono, monospace)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#94a3b8',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}
          >
            <span>🔒 VIP RESTRICTED VAULT</span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
              fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: '#0f172a',
              margin: '0 0 1rem 0',
              textTransform: 'uppercase',
            }}
          >
            Limited Drops &amp; Archival Vault
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              lineHeight: 1.7,
              color: '#475569',
              margin: '0 0 3rem 0',
              maxWidth: '720px',
            }}
          >
            Exclusive small-batch denim allocations and handcrafted sterling silver releases. Unlike
            our bespoke Order-Made queue, Drop items are pre-crafted in numbered editions and
            dispatched within 48 hours. Access is reserved exclusively for registered members and
            collectors.
          </p>

          {/* Gated Member Gate Card */}
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              padding: '2.5rem',
              marginBottom: '3.5rem',
              maxWidth: '820px',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono, monospace)',
                color: '#92400e',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              VIP MEMBER PRIVILEGE
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
                fontSize: '1.75rem',
                color: '#78350f',
                margin: '0 0 0.75rem 0',
              }}
            >
              Member Access to Numbered Drops
            </h2>
            <p
              style={{
                color: '#92400e',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                margin: '0 0 1.5rem 0',
              }}
            >
              Ready-to-ship allocations are released in strictly numbered runs. Sign in with your
              collector account or create a profile to unlock vault allocations and immediate
              48-hour workshop dispatch.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                href="/login?returnUrl=/drop"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: '#78350f',
                  color: '#ffffff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                }}
              >
                Sign In to Unlock Vault →
              </Link>
              <Link
                href="/signup"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d97706',
                  color: '#78350f',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                }}
              >
                Register Collector Profile
              </Link>
            </div>
          </div>

          {/* Three Pillars of Drop Model (Spec Section 9.2 & 19) */}
          <div className="drop-gate-features">
            <div className="drop-gate-feature-card">
              <h3>Numbered Small Batches</h3>
              <p>
                Released in editions of 25 pieces or fewer. Each denim pair features a hand-numbered
                leather patch; jewellery pieces bear master silversmith forge hallmarks.
              </p>
            </div>
            <div className="drop-gate-feature-card">
              <h3>48-Hour Kathmandu Dispatch</h3>
              <p>
                Unlike the 14–21 day bespoke cutting table wait for Order-Made items, Drop pieces
                are pre-finished in our Kathmandu workshop and ship immediately upon ordering.
              </p>
            </div>
            <div className="drop-gate-feature-card">
              <h3>5-Day Inspection Guarantee</h3>
              <p>
                Because Drop pieces are not tailored to anatomical measurements, they carry a
                dedicated 5-day post-delivery return window for unworn items with security seals
                intact.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated Collector / Member: Real DROP Catalog
  const searchParams = await props.searchParams;
  const category = (searchParams.category?.toUpperCase() || 'ALL') as
    'ALL' | 'BOTTOMS' | 'TOPS' | 'JEWELLERY' | 'ACCESSORIES';
  const sortBy = (searchParams.sort || 'FEATURED') as
    'FEATURED' | 'PRICE_ASC' | 'PRICE_DESC' | 'NEWEST' | 'TITLE_ASC';
  const searchQuery = searchParams.search || '';
  const page = parseInt(searchParams.page || '1', 10) || 1;

  const catalogResult = await getCatalogAction({
    category,
    commerceModel: 'DROP',
    sortBy,
    searchQuery,
    page,
    pageSize: 12,
  });

  const catalogData = catalogResult.data ?? {
    products: [],
    totalCount: 0,
    page: 1,
    pageSize: 12,
    totalPages: 0,
    categoryCounts: [
      { category: 'BOTTOMS', count: 0 },
      { category: 'TOPS', count: 0 },
      { category: 'JEWELLERY', count: 0 },
      { category: 'ACCESSORIES', count: 0 },
    ],
    selectedCategory: 'ALL',
    selectedCommerceModel: 'DROP',
    selectedSort: 'FEATURED',
  };

  return (
    <div className="catalog-page">
      <main className="catalog-container">
        {/* Unlocked Eyebrow */}
        <header className="catalog-header">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono, monospace)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: isVipMember ? '#b45309' : '#047857',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}
          >
            <span>{isVipMember ? '★ VIP ACCESS UNLOCKED' : '★ COLLECTOR ACCESS ACTIVE'}</span>
          </div>

          <h1 className="catalog-title">Limited Drops &amp; Archival Vault</h1>

          <p className="catalog-manifesto">
            Rare deadstock selvedge allocations and hand-forged jewellery releases in numbered
            editions of 25 pieces or fewer. Ready to ship within 48 hours from our Kathmandu
            atelier.
          </p>

          {/* Member Status Active Banner */}
          <div
            className={`drop-vault-status-active ${isVipMember ? 'drop-vault-status-vip' : ''}`}
            style={{ marginTop: '1.5rem' }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {isVipMember ? '★ VIP Priority Collector' : 'Collector Vault Access Active'}
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                Welcome, {fullName}. You have unlocked immediate allocation for limited
                ready-to-ship drops.
              </div>
            </div>
            <span
              style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono, monospace)',
                padding: '0.25rem 0.6rem',
                borderRadius: '4px',
                border: '1px solid currentColor',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              {isVipMember ? 'PRIORITY' : 'UNLOCKED'}
            </span>
          </div>

          {/* Drop Shipping & Return Policy Banner (Spec Section 9.2 & 19) */}
          <div className="drop-policy-notice">
            <div>
              <strong>48h Immediate Dispatch:</strong> All pieces ship pre-finished within 48 hours
              directly from our Kathmandu workshop.
            </div>
            <div>
              <strong>5-Day Inspection Window:</strong> Eligible for refund within 5 days of
              delivery (unworn, with security tags intact).
            </div>
          </div>
        </header>

        {/* Interactive Drop Catalog */}
        <Suspense
          fallback={
            <div
              style={{
                padding: '6rem 0',
                textAlign: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)',
              }}
            >
              Loading vault allocations...
            </div>
          }
        >
          <DropCatalogClient initialData={catalogData} />
        </Suspense>
      </main>
    </div>
  );
}
