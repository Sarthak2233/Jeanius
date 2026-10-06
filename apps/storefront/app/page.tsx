import React from 'react';
import Link from 'next/link';
import { PriceDisplay } from '../components/price-display';
import { StatusBadge } from '../components/status-badge';
import type { CommerceModel } from '@jeanius/domain';

export default function HomePage() {
  const model: CommerceModel = 'OM';

  return (
    <div style={{ backgroundColor: 'var(--color-bg-canvas, #fdfbf7)', minHeight: '100vh' }}>
      {/* =====================================================================
          Hero Section: Editorial Atelier Manifesto
          ===================================================================== */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '4.5rem 2rem 3.5rem 2rem',
          borderBottom: '1px solid #ebe7df',
        }}
      >
        <div style={{ maxWidth: '820px' }}>
          {/* Eyebrow badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#475569',
              marginBottom: '1.5rem',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#b91c1c',
              }}
            />
            KATHMANDU CUTTING TABLES · SEOUL SILVERSMITHING BENCH
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: '-0.025em',
              color: '#0f172a',
              margin: '0 0 1.5rem 0',
              textTransform: 'uppercase',
            }}
          >
            Precision Raw Selvedge &amp; Bespoke Silversmithing
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              lineHeight: 1.7,
              color: '#475569',
              margin: '0 0 2.25rem 0',
              maxWidth: '680px',
              fontWeight: 400,
            }}
          >
            Crafted one piece at a time between our Kathmandu cutting tables and jewellery bench.
            Authentic Japanese Kurabo shuttle-loom denim paired with hand-carved 925 sterling silver
            hardware. Zero deadstock, made strictly to order.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <a
              href="#atelier-lots"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                padding: '0.85rem 1.75rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                boxShadow: '0 2px 4px rgba(15, 23, 42, 0.1)',
                transition: 'opacity 150ms ease',
              }}
            >
              Explore OM Catalog (14-21D)
              <span aria-hidden="true">↓</span>
            </a>

            <Link
              href="/sizing"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                padding: '0.85rem 1.5rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'border-color 150ms ease',
              }}
            >
              Precision Sizing Guide
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Studio Telemetry Ribbon */}
        <div
          style={{
            marginTop: '3.5rem',
            paddingTop: '2rem',
            borderTop: '1px solid #f1ede6',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono, monospace)',
                color: '#94a3b8',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.25rem',
              }}
            >
              Production Protocol
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              14–21 Workshop Days
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Precision cut on demand</div>
          </div>

          <div>
            <div
              style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono, monospace)',
                color: '#94a3b8',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.25rem',
              }}
            >
              Denim Provenance
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              14oz Kurabo Mills
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Okayama vintage shuttle looms
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono, monospace)',
                color: '#94a3b8',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.25rem',
              }}
            >
              Silversmithing Bench
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              Solid 925 Sterling Silver
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Hand-forged &amp; hallmarked in Seoul
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono, monospace)',
                color: '#94a3b8',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.25rem',
              }}
            >
              Workshop Guarantee
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              Lifetime Repair Backing
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Union Special chainstitch repairs
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          Featured Atelier Works (The Catalog Bento)
          ===================================================================== */}
      <section
        id="atelier-lots"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '4rem 2rem',
        }}
      >
        <div style={{ marginBottom: '2.5rem' }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono, monospace)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#94a3b8',
              fontWeight: 600,
              marginBottom: '0.5rem',
            }}
          >
            ACTIVE STUDIO ALLOCATIONS
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
              fontSize: '2.2rem',
              color: '#0f172a',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Order-Made Atelier Catalog
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0.5rem 0 0 0' }}>
            Allocated from limited bolt yardage and individually assembled upon sizing confirmation.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '2rem',
          }}
        >
          {/* Card 1: Lot 001 — Straight Raw Selvedge */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '2rem',
              boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'border-color 200ms ease, transform 200ms ease',
            }}
          >
            <div>
              {/* Badges strip */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap',
                }}
              >
                <StatusBadge status={model} variant="om" />
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '2px',
                    backgroundColor: '#eff6ff',
                    color: '#1e40af',
                    fontWeight: 600,
                  }}
                >
                  KURABO 14OZ RAW
                </span>
              </div>

              {/* Denim illustration frame */}
              <div
                style={{
                  height: '180px',
                  backgroundColor: '#1e293b',
                  borderRadius: '4px',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundImage:
                    'repeating-linear-gradient(45deg, #1e293b, #1e293b 8px, #243048 8px, #243048 16px)',
                }}
              >
                {/* Red Selvedge Line Accent */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    right: '24px',
                    width: '4px',
                    backgroundColor: '#b91c1c',
                    boxShadow: '0 0 6px rgba(185, 28, 28, 0.4)',
                  }}
                />
                <div
                  style={{
                    textAlign: 'center',
                    color: '#f8fafc',
                    zIndex: 2,
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
                      fontSize: '1.4rem',
                      letterSpacing: '0.12em',
                      fontWeight: 600,
                    }}
                  >
                    LOT 001
                  </div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono, monospace)',
                      color: '#94a3b8',
                      letterSpacing: '0.15em',
                      marginTop: '4px',
                    }}
                  >
                    RAW SELVEDGE JEAN
                  </div>
                </div>
              </div>

              <h3
                style={{
                  fontSize: '1.45rem',
                  color: '#0f172a',
                  margin: '0 0 0.5rem 0',
                  fontWeight: 600,
                }}
              >
                Lot 001 — Straight Raw Selvedge
              </h3>

              <p
                style={{
                  color: '#475569',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  margin: '0 0 1.25rem 0',
                }}
              >
                14oz Japanese Kurabo denim cut and assembled by master artisans. Mid-rise, straight
                leg silhouette, custom waist and inseam specifications, and Union Special
                chainstitch hem.
              </p>

              {/* Specs Pills */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.4rem',
                  marginBottom: '1.5rem',
                }}
              >
                {[
                  '14oz Kurabo Mill',
                  'Chainstitch Hem',
                  'Custom Inseam (28"-36")',
                  'Solid Brass Hardware',
                ].map((spec) => (
                  <span
                    key={spec}
                    style={{
                      fontSize: '0.72rem',
                      padding: '0.2rem 0.5rem',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '3px',
                      color: '#475569',
                    }}
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                    Tailored Price
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                    <PriceDisplay amount={28000} currency="USD" />
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: '#d97706',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontWeight: 600,
                  }}
                >
                  14–21 DAYS
                </span>
              </div>

              <Link
                href="/sizing"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  transition: 'opacity 150ms ease',
                }}
              >
                Configure Measurements &amp; Sizing →
              </Link>
            </div>
          </div>

          {/* Card 2: Lot 002 — Solid Silver 925 Signet Ring */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '2rem',
              boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'border-color 200ms ease, transform 200ms ease',
            }}
          >
            <div>
              {/* Badges strip */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap',
                }}
              >
                <StatusBadge status={model} variant="om" />
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '2px',
                    backgroundColor: '#f1f5f9',
                    color: '#334155',
                    fontWeight: 600,
                  }}
                >
                  SOLID 925 SILVER
                </span>
              </div>

              {/* Silver illustration frame */}
              <div
                style={{
                  height: '180px',
                  backgroundColor: '#0f172a',
                  borderRadius: '4px',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundImage: 'radial-gradient(circle at center, #334155 0%, #0f172a 100%)',
                }}
              >
                <div
                  style={{
                    textAlign: 'center',
                    color: '#f8fafc',
                    zIndex: 2,
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
                      fontSize: '1.4rem',
                      letterSpacing: '0.12em',
                      fontWeight: 600,
                    }}
                  >
                    RING 001
                  </div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono, monospace)',
                      color: '#cbd5e1',
                      letterSpacing: '0.15em',
                      marginTop: '4px',
                    }}
                  >
                    HAND-FORGED 925 SIGNET
                  </div>
                </div>
              </div>

              <h3
                style={{
                  fontSize: '1.45rem',
                  color: '#0f172a',
                  margin: '0 0 0.5rem 0',
                  fontWeight: 600,
                }}
              >
                Lot 002 — Solid Silver 925 Signet Ring
              </h3>

              <p
                style={{
                  color: '#475569',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  margin: '0 0 1.25rem 0',
                }}
              >
                Hand-carved in wax and cast in solid 925 sterling silver in Seoul. Finished with a
                directional satin face and chamfered bevels. Sized to exact mandrel specification.
              </p>

              {/* Specs Pills */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.4rem',
                  marginBottom: '1.5rem',
                }}
              >
                {[
                  'Solid 925 Sterling Silver',
                  'US 4–14 Mandrel Precision',
                  'Directional Satin Face',
                  'Studio Hallmark Stamped',
                ].map((spec) => (
                  <span
                    key={spec}
                    style={{
                      fontSize: '0.72rem',
                      padding: '0.2rem 0.5rem',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '3px',
                      color: '#475569',
                    }}
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                    Artisan Price
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                    <PriceDisplay amount={19500} currency="USD" />
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: '#d97706',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontWeight: 600,
                  }}
                >
                  10–14 DAYS
                </span>
              </div>

              <Link
                href="/sizing"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  transition: 'opacity 150ms ease',
                }}
              >
                View Mandrel Sizing Chart →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          The 3 Atelier Standards Bento
          ===================================================================== */}
      <section
        style={{
          backgroundColor: '#faf8f4',
          borderTop: '1px solid #ebe7df',
          borderBottom: '1px solid #ebe7df',
          padding: '4rem 2rem',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ maxWidth: '640px', marginBottom: '2.5rem' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono, monospace)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#94a3b8',
                fontWeight: 600,
                marginBottom: '0.5rem',
              }}
            >
              ATELIER INVARIANTS
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
                fontSize: '2rem',
                color: '#0f172a',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              The Three Craft Commitments
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '2rem',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#b91c1c',
                  marginBottom: '0.75rem',
                }}
              >
                01 / POINT OF NO RETURN
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                Zero Deadstock Discipline
              </h3>
              <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                Once our master tailor marks the Kurabo bolt or our silversmith pours molten 925
                silver, sizing is permanently locked. No garment is ever pre-sewn to sit on
                warehouse shelves.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '2rem',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#d97706',
                  marginBottom: '0.75rem',
                }}
              >
                02 / HERITAGE METALS &amp; DYE
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                Pure Kurabo &amp; Solid Silver
              </h3>
              <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                Slow rope-dyed indigo selvedge with natural warp irregularity, paired with
                nickel-free solid 925 sterling silver. Materials designed to evolve with honest,
                lifelong patina.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '2rem',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  marginBottom: '0.75rem',
                }}
              >
                03 / LIFETIME WORKSHOP BACKING
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                Free Alterations &amp; Care
              </h3>
              <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                Every piece is registered to its collector. We provide complimentary Union Special
                chainstitch re-hemming, structural seam reinforcement, and silver ultrasonic
                re-polishing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          Studio Concierge Inquiries
          ===================================================================== */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '4rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '2rem',
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
              fontSize: '1.8rem',
              color: '#0f172a',
              margin: '0 0 0.5rem 0',
            }}
          >
            Need Tailoring Guidance or Bespoke Specs?
          </h2>
          <p style={{ color: '#475569', fontSize: '0.95rem', margin: 0, maxWidth: '600px' }}>
            Our concierge desk assists with inseam shrinkage calculations, waist rise adjustments,
            and jewellery ring mandrel sizing before your cut ticket is issued.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link
            href="/contact"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            Contact Studio Concierge →
          </Link>
          <Link
            href="/about"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            Read Workshop Guide
          </Link>
        </div>
      </section>
    </div>
  );
}
