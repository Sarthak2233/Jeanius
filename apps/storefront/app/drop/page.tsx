import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createStorefrontMetadata } from '../../lib/metadata';
import { createClient } from '../../lib/supabase/server';
import { getCatalogAction } from '../../actions/catalog.actions';
import { checkDropAccessAction } from '../../actions/membership.actions';
import { DropCatalogClient } from './drop-catalog-client';
import { InviteTokenRedeemer } from './invite-token-redeemer';

export const metadata: Metadata = createStorefrontMetadata({
  title: 'Limited Drops — Atelier Vault (Members Only)',
  description:
    'Exclusive limited-edition solid .925 sterling silver releases, ready-to-ship talisman drops, and Kathmandu workshop artefacts for registered collectors.',
});

export const dynamic = 'force-dynamic';

interface DropPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function DropPage(props: DropPageProps) {
  const access = await checkDropAccessAction();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fullName =
    (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || 'Collector';

  // 1. TIER 1: Unauthenticated Guest Gate (Mandatory Account Prerequisite)
  if (!access.allowed && access.reason === 'GUEST') {
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
            Exclusive small-batch solid .925 sterling silver releases. Unlike our bespoke Order-Made
            queue, Drop items are pre-crafted in strictly numbered editions and dispatched within 48
            hours. An active collector account is strictly required to unlock vault allocations.
          </p>

          {/* Guest Acquisition Card */}
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
              COLLECTOR ACCOUNT REQUIRED
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
                fontSize: '1.75rem',
                color: '#78350f',
                margin: '0 0 0.75rem 0',
              }}
            >
              Sign In to Unlock Numbered Drops
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
              collector account or register a new profile to access vault allocations and immediate
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
                href="/signup?returnUrl=/drop"
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

          {/* Three Pillars of Drop Model (Project 925 Solid Silver) */}
          <div className="drop-gate-features">
            <div className="drop-gate-feature-card">
              <h3>Numbered Small Batches</h3>
              <p>
                Released in editions of 25 pieces or fewer. Each solid .925 sterling silver piece
                bears master silversmith Kathmandu forge hallmarks and serial engravings.
              </p>
            </div>
            <div className="drop-gate-feature-card">
              <h3>48-Hour Kathmandu Dispatch</h3>
              <p>
                Unlike the 10–18 day bespoke bench table wait for Order-Made items, Drop pieces are
                pre-finished in our Kathmandu workshop and ship immediately upon ordering.
              </p>
            </div>
            <div className="drop-gate-feature-card">
              <h3>5-Day Inspection Window</h3>
              <p>
                Because Drop pieces are ready-to-ship rather than tailored to anatomical mandrel
                measurements, they carry a dedicated 5-day post-delivery inspection window with
                seals intact.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. TIER 2: Authenticated CUSTOMER but Threshold Not Met -> VIP Member Privilege Gate
  if (!access.allowed && access.reason === 'QUALIFICATION_REQUIRED') {
    const currentOrders = access.currentOrders ?? 0;
    const requiredOrders = access.requiredOrders ?? 2;
    const remainingOrders = Math.max(0, requiredOrders - currentOrders);

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
              color: '#d97706',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}
          >
            <span>★ VIP MEMBER PRIVILEGE REQUIRED</span>
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
              margin: '0 0 2.5rem 0',
              maxWidth: '720px',
            }}
          >
            Welcome, <strong>{fullName}</strong>. Vault allocations are strictly reserved for Guild
            VIP Members. Because ready-to-ship runs are limited to 25 pieces or fewer, purchase
            access is reserved for patrons who actively commission bespoke atelier pieces or hold an
            invitation token.
          </p>

          {/* Member Qualification Progress Card */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '2.5rem',
              maxWidth: '820px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '1rem',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    color: '#64748b',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Qualification Milestone
                </span>
                <h2
                  style={{
                    fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
                    fontSize: '1.5rem',
                    color: '#0f172a',
                    margin: '0.25rem 0 0 0',
                  }}
                >
                  {remainingOrders} More Bespoke Order Required
                </h2>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: '#0f172a',
                }}
              >
                {currentOrders} / {requiredOrders} Orders
              </div>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e2e8f0',
                borderRadius: '9999px',
                overflow: 'hidden',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, (currentOrders / requiredOrders) * 100)}%`,
                  height: '100%',
                  backgroundColor: '#d97706',
                  transition: 'width 300ms ease',
                }}
              />
            </div>

            <p
              style={{
                color: '#475569',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                margin: '0 0 1.5rem 0',
              }}
            >
              Complete {remainingOrders} more bespoke commission in our Order-Made collection to
              automatically elevate your account to VIP Member status. Once unlocked, you remain a
              permanent member.
            </p>

            <Link
              href="/shop"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#0f172a',
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
              Commission Bespoke Piece in Shop →
            </Link>

            {/* Invite Token Redeemer Form */}
            <InviteTokenRedeemer />
          </div>
        </div>
      </div>
    );
  }

  // 3. TIER 3: Authenticated & Qualified Member / Admin / Threshold 0 -> Real DROP Catalog
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
              color: '#b45309',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}
          >
            <span>★ VIP ACCESS UNLOCKED</span>
          </div>

          <h1 className="catalog-title">Limited Drops &amp; Archival Vault</h1>

          <p className="catalog-manifesto">
            Numbered editions of 25 pieces or fewer cast in solid .925 sterling silver. Ready to
            dispatch within 48 hours directly from our Kathmandu workshop.
          </p>

          {/* Member Status Active Banner */}
          <div
            className="drop-vault-status-active drop-vault-status-vip"
            style={{ marginTop: '1.5rem' }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>★ VIP Priority Collector</div>
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
              PRIORITY
            </span>
          </div>

          {/* Drop Shipping & Return Policy Banner */}
          <div className="drop-policy-notice">
            <div>
              <strong>48h Immediate Dispatch:</strong> All pieces ship pre-finished within 48 hours
              directly from our Kathmandu workshop.
            </div>
            <div>
              <strong>5-Day Inspection Window:</strong> Eligible for return within 5 days of
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
