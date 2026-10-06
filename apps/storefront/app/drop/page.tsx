import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createStorefrontMetadata } from '../../lib/metadata';
import { createClient } from '../../lib/supabase/server';
import { StatusBadge } from '../../components/status-badge';

export const metadata: Metadata = createStorefrontMetadata({
  title: 'Limited Drops — Atelier Vault',
  description:
    'Exclusive limited-run selvedge bolt allocations and hallmarked sterling silver releases for registered VIP members.',
});

export default async function DropPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = (user?.user_metadata?.role as string) || 'CUSTOMER';
  const isMember = role === 'MEMBER' || role === 'ADMIN';

  return (
    <div style={{ backgroundColor: 'var(--color-bg-canvas, #fdfbf7)', minHeight: '100vh' }}>
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '4.5rem 2rem',
        }}
      >
        {/* Header Eyebrow */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono, monospace)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: isMember ? '#b45309' : '#94a3b8',
            fontWeight: 600,
            marginBottom: '0.75rem',
          }}
        >
          <span>{isMember ? '★ VIP ACCESS UNLOCKED' : '🔒 VIP RESTRICTED VAULT'}</span>
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
            maxWidth: '680px',
          }}
        >
          Special allocation bolts from deceased mills, natural hank-dyed indigo runs, and
          one-of-one hand-engraved silver jewellery. Released in numbered editions of 25 pieces or
          fewer.
        </p>

        {!isMember ? (
          /* Gated Member Banner */
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
              Early Access to Numbered Drops
            </h2>
            <p
              style={{
                color: '#92400e',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                margin: '0 0 1.5rem 0',
              }}
            >
              Active collectors with verified purchase histories or VIP invitations unlock 48-hour
              advance purchasing before general public allocation. Sign in or register to connect
              your account.
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
        ) : (
          /* VIP Unlocked Banner */
          <div
            style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '8px',
              padding: '1.5rem 2rem',
              marginBottom: '3rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              maxWidth: '820px',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.95rem' }}>
                VIP Collector Status Active
              </div>
              <div style={{ color: '#047857', fontSize: '0.85rem' }}>
                You have immediate allocation privileges for all upcoming vault releases.
              </div>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono, monospace)',
                backgroundColor: '#ffffff',
                border: '1px solid #10b981',
                padding: '0.25rem 0.6rem',
                borderRadius: '4px',
                color: '#065f46',
                fontWeight: 600,
              }}
            >
              PRIORITY ALLOCATION
            </span>
          </div>
        )}

        {/* Archival Drop Previews */}
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
              fontSize: '1.75rem',
              color: '#0f172a',
              margin: '0 0 1.5rem 0',
            }}
          >
            Vault Archive &amp; Upcoming Drops
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
            }}
          >
            {/* Drop Card 1 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '2rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    color: '#b91c1c',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                  }}
                >
                  DROP 01 · 25 EDITIONS
                </span>
                <StatusBadge status="OM" variant="drop" />
              </div>

              <h3 style={{ fontSize: '1.3rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                18oz Heavy Slub Deadstock Selvedge
              </h3>
              <p
                style={{
                  color: '#475569',
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                  margin: '0 0 1.25rem 0',
                }}
              >
                Unwashed loomstate Japanese selvedge with extreme slub nep texture. Hand-numbered
                leather patch with Kathmandu copper rivets.
              </p>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  color: '#64748b',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                STATUS: SOLD OUT (ARCHIVED)
              </div>
            </div>

            {/* Drop Card 2 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '2rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    color: '#d97706',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                  }}
                >
                  DROP 02 · FORTHCOMING
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '2px',
                    color: '#92400e',
                    fontWeight: 600,
                  }}
                >
                  NOVEMBER 2026
                </span>
              </div>

              <h3 style={{ fontSize: '1.3rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                Seoul Bench: Hand-Carved Dragon Talon Cuff (925)
              </h3>
              <p
                style={{
                  color: '#475569',
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                  margin: '0 0 1.25rem 0',
                }}
              >
                Heavy 65g solid 925 sterling silver wrist cuff. Individually hallmarked with custom
                client initials upon allocation.
              </p>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  color: '#64748b',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                STATUS: ALLOCATION PENDING
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
