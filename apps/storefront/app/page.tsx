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
                backgroundColor: '#0284c7',
              }}
            />
            KATHMANDU WORKSHOP · .925 STERLING SILVERSMITHING
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
            Handcrafted .925 Sterling Silver &amp; Lost-Wax Talismans
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
            Forged one piece at a time at our Kathmandu metalsmithing bench. Ancient lost-wax
            casting, hand-carved matrices, and sacred Newar repoussé traditions rendered in solid
            .925 sterling silver. Zero deadstock, crafted strictly to order.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <Link
              href="/shop"
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
              Explore OM Catalog (10-18D)
              <span aria-hidden="true">→</span>
            </Link>

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
              Mandrel &amp; Sizing Studio
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
              10–18 Workshop Days
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Individual lost-wax casting</div>
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
              Metalsmithing Bench
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              Solid .925 Sterling Silver
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Kathmandu hallmarked fine alloy
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
              Craft Lineage
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              Sacred Newar Repoussé
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Lost-wax &amp; chisel detailing
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
              Workshop Covenant
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              Lifetime Craft Warranty
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Complimentary resizing &amp; polishing
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
            Order-Made Jewellery Catalog
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0.5rem 0 0 0' }}>
            Cast from certified fine silver grain and individually tuned upon mandrel sizing
            confirmation.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '2rem',
          }}
        >
          {/* Card 1: Lot 001 — Solid Silver 925 Signet Ring */}
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
                  SOLID .925 STERLING
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
                    LOT 001
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
                    KATHMANDU SIGNET RING
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
                Lot 001 — Solid Silver 925 Signet Ring
              </h3>

              <p
                style={{
                  color: '#475569',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  margin: '0 0 1.25rem 0',
                }}
              >
                Hand-carved in wax and cast in solid .925 sterling silver at our Kathmandu workshop.
                Finished with a directional satin face and chamfered comfort-fit bevels. Sized to
                exact mandrel specification.
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
                  'Solid .925 Sterling Silver',
                  'US 4–14 Mandrel Precision',
                  'Directional Satin Face',
                  'Kathmandu Hallmark Stamped',
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
                Configure Mandrel Measurements →
              </Link>
            </div>
          </div>

          {/* Card 2: Lot 002 — Kathmandu Chiseled Heavy Cuff */}
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
                  48 GRAMS SOLID SILVER
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
                  backgroundImage: 'radial-gradient(circle at center, #1e293b 0%, #0b0f19 100%)',
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
                    LOT 002
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
                    CHISELED HEAVY CUFF
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
                Lot 002 — Kathmandu Chiseled Heavy Cuff
              </h3>

              <p
                style={{
                  color: '#475569',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  margin: '0 0 1.25rem 0',
                }}
              >
                Heavy triangular profile cuff forged from solid .925 sterling silver bar stock.
                Carved with traditional Newar geometric chiseling and finished with deliberate
                sulfur shadow oxidation.
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
                  '48 Grams Solid Silver',
                  'Anvil Chiseled Motifs',
                  'Sacred Antiqued Patina',
                  'Custom Wrist Gap (S–XL)',
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
                    <PriceDisplay amount={34000} currency="USD" />
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
                  12–16 DAYS
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
                Calibrate Wrist Gap →
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
                Once molten .925 sterling silver is poured into the investment mold at the CASTING
                stage, sizing is permanently locked. No piece is ever pre-cast to sit on warehouse
                shelves.
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
                02 / SACRED METALLURGY
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                Pure .925 Alloy &amp; Natural Patina
              </h3>
              <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                Certified fine silver grain alloyed with copper for structural resilience. Never
                plated, nickel-free, and designed to cultivate deep shadow oxidation in carved
                recesses over a lifetime of wear.
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
                03 / LIFETIME WORKSHOP COVENANT
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                Complimentary Sizing &amp; Care
              </h3>
              <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                Every piece is registered to its collector. We provide complimentary ring size
                tuning (+/- 1 US size), joint and link reinforcement, and ultrasonic workshop
                repolishing for life.
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
            Need Mandrel Guidance or Custom Casting?
          </h2>
          <p style={{ color: '#475569', fontSize: '0.95rem', margin: 0, maxWidth: '600px' }}>
            Our Kathmandu workshop silversmiths assist with knuckle clearance, heavy cuff gap
            calibration, and custom talisman waxes before your casting tree is invested.
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
            Contact Workshop Concierge →
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
