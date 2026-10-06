import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createStorefrontMetadata } from '../../lib/metadata';

export const metadata: Metadata = createStorefrontMetadata({
  title: 'Together — The Patina & Repair Journal',
  description:
    'Documenting the aging, fading, and lifelong repair journey of raw selvedge denim and solid sterling silver.',
});

export default function TogetherPage() {
  return (
    <div style={{ backgroundColor: 'var(--color-bg-canvas, #fdfbf7)', minHeight: '100vh' }}>
      <div
        style={{
          maxWidth: '1080px',
          margin: '0 auto',
          padding: '4.5rem 2rem',
        }}
      >
        {/* Header Eyebrow */}
        <div
          style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono, monospace)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#94a3b8',
            fontWeight: 600,
            marginBottom: '0.75rem',
          }}
        >
          COMMUNITY ARCHIVE &amp; REPAIR DIARY
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
          Together: The Patina Journal
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            lineHeight: 1.75,
            color: '#334155',
            margin: '0 0 3.5rem 0',
            maxWidth: '720px',
          }}
        >
          We do not create disposable fast-fashion. We build garments and jewellery intended to
          accompany you across decades. This journal documents the natural evolution of indigo dye
          and silver oxidation.
        </p>

        {/* Section 1: Denim Fading Progression Bento */}
        <section style={{ marginBottom: '4rem' }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono, monospace)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#b91c1c',
              fontWeight: 700,
              marginBottom: '0.5rem',
            }}
          >
            KURABO 14OZ FADE TIMELINE
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
              fontSize: '1.8rem',
              color: '#0f172a',
              margin: '0 0 1.5rem 0',
            }}
          >
            The Life Cycle of Raw Indigo
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Stage 1 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1.5rem',
              }}
            >
              <div
                style={{
                  height: '120px',
                  backgroundColor: '#121826',
                  borderRadius: '4px',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                DEEP INDIGO · CRISP
              </div>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                Day 01: Raw &amp; Unwashed
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                Rigid hand feel, pure dark indigo rope dye, and sharp crease memory forming around
                the hips and back of the knees.
              </p>
            </div>

            {/* Stage 2 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1.5rem',
              }}
            >
              <div
                style={{
                  height: '120px',
                  backgroundColor: '#1e293b',
                  borderRadius: '4px',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#cbd5e1',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                HONEYCOMBS &amp; WHISKERS
              </div>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                Month 06: Initial Contrast
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                High-tension friction points begin shedding indigo to reveal pure white cotton yarn
                beneath. First cold soak tightens the weave.
              </p>
            </div>

            {/* Stage 3 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1.5rem',
              }}
            >
              <div
                style={{
                  height: '120px',
                  backgroundColor: '#334155',
                  borderRadius: '4px',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f8fafc',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                HIGH CONTRAST VINTAGE
              </div>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                Year 02: Second Skin
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                Complete drape conformity to the wearer's anatomy. Distinct roping effect on the
                chainstitched hem and soft vintage cast.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Lifetime Repair Intake */}
        <section
          style={{
            backgroundColor: '#faf8f4',
            border: '1px solid #ebe7df',
            borderRadius: '8px',
            padding: '2.5rem',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono, monospace)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#d97706',
              fontWeight: 700,
              marginBottom: '0.5rem',
            }}
          >
            SUSTAINABILITY THROUGH PERMANENCE
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
              fontSize: '1.8rem',
              color: '#0f172a',
              margin: '0 0 1rem 0',
            }}
          >
            Submit Garment or Ring for Workshop Servicing
          </h2>
          <p
            style={{
              color: '#475569',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              margin: '0 0 1.75rem 0',
              maxWidth: '640px',
            }}
          >
            Whether your selvedge jeans require a chainstitch hem adjustment after wash or your
            sterling silver signet ring needs ultrasonic reshaping, our Kathmandu and Seoul
            workshops service all Jeanius pieces free of charge.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              href="/contact"
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
              Initiate Free Repair Intake →
            </Link>
            <Link
              href="/about"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                padding: '0.75rem 1.5rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Read Atelier Philosophy
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
