import React from 'react';
import { createClient } from '../../lib/supabase/server';
import { StatusBadge } from '../../components/status-badge';
import { PriceDisplay } from '../../components/price-display';

export const dynamic = 'force-dynamic';

export default async function MemberVipSalonPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fullName = user?.user_metadata?.full_name || 'Honored Member';

  return (
    <div style={{ maxWidth: '1100px', margin: '3rem auto', padding: '0 2rem 5rem 2rem' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
          color: '#fdfbf7',
          padding: '3rem 2.5rem',
          borderRadius: '8px',
          boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.3)',
          marginBottom: '3rem',
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}
        >
          <span
            style={{
              padding: '0.25rem 0.6rem',
              background: '#fbbf24',
              color: '#78350f',
              borderRadius: '3px',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            VIP MEMBER ACCESS
          </span>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Authenticated via Supabase RBAC
          </span>
        </div>

        <h1
          style={{
            fontSize: '2.5rem',
            margin: '0 0 0.5rem 0',
            fontFamily: 'serif',
            letterSpacing: '0.04em',
          }}
        >
          The Inner Salon & Rare Archives
        </h1>
        <p
          style={{
            color: '#cbd5e1',
            fontSize: '1.05rem',
            margin: 0,
            maxWidth: '650px',
            lineHeight: 1.6,
          }}
        >
          Welcome, {fullName}. You hold privileged early access to numbered bolt runs, deadstock
          Japanese selvedge rolls, and limited metalsmith drops before public release.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.25rem 0', color: '#0f172a' }}>
            Exclusive Member Drop Queue
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Reserved yardage allocations and priority bench fabrication slots
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
        }}
      >
        {/* Drop Item 1 */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          }}
        >
          <div
            style={{
              height: '180px',
              background: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              padding: '1rem',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.2em',
                color: '#fbbf24',
                textTransform: 'uppercase',
              }}
            >
              Extremely Limited Run • 30 Pairs
            </span>
            <h3 style={{ fontSize: '1.35rem', margin: '0.5rem 0 0 0', fontFamily: 'serif' }}>
              Lot 004 — Kakishibu Persimmon Indigo
            </h3>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}
            >
              <StatusBadge status="DROP" variant="drop" />
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Release: Friday 00:00 UTC
              </span>
            </div>
            <p
              style={{
                color: '#334155',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                margin: '0 0 1.25rem 0',
              }}
            >
              16.5oz hand-dyed fermented persimmon tannin warp over natural fermented indigo weft.
              Milled by Shinya Mills on vintage Toyoda G3 shuttle looms.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <PriceDisplay amount={42000} currency="USD" />
              <button
                type="button"
                style={{
                  padding: '0.5rem 1rem',
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reserve Allocation
              </button>
            </div>
          </div>
        </div>

        {/* Drop Item 2 */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          }}
        >
          <div
            style={{
              height: '180px',
              background: '#1e293b',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              padding: '1rem',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.2em',
                color: '#93c5fd',
                textTransform: 'uppercase',
              }}
            >
              Hand-Forged Edition • 15 Units
            </span>
            <h3 style={{ fontSize: '1.35rem', margin: '0.5rem 0 0 0', fontFamily: 'serif' }}>
              Gilded Skull & Selvedge Signet Ring
            </h3>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}
            >
              <StatusBadge status="OM" variant="om" />
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Custom Cast in Kathmandu</span>
            </div>
            <p
              style={{
                color: '#334155',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                margin: '0 0 1.25rem 0',
              }}
            >
              Heavy .925 Sterling Silver core with 18K solid yellow gold repoussé bezel.
              Individually engraved with your bespoke family monogram.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <PriceDisplay amount={38500} currency="USD" />
              <button
                type="button"
                style={{
                  padding: '0.5rem 1rem',
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reserve Casting Slot
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
