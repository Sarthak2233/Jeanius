import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createStorefrontMetadata } from '../../lib/metadata';

export const metadata: Metadata = createStorefrontMetadata({
  title: 'Precision Sizing Guide — Denim Fit & Ring Mandrel',
  description:
    'Comprehensive guide to measuring raw selvedge denim, shrinkage allowances, and jewellery ring mandrel sizing charts.',
});

const RING_SIZES = [
  { us: '5', diameter: '15.7 mm', circumference: '49.3 mm' },
  { us: '6', diameter: '16.5 mm', circumference: '51.9 mm' },
  { us: '7', diameter: '17.3 mm', circumference: '54.4 mm' },
  { us: '8', diameter: '18.1 mm', circumference: '57.0 mm' },
  { us: '9', diameter: '18.9 mm', circumference: '59.5 mm' },
  { us: '10', diameter: '19.8 mm', circumference: '62.1 mm' },
  { us: '11', diameter: '20.6 mm', circumference: '64.6 mm' },
  { us: '12', diameter: '21.4 mm', circumference: '67.2 mm' },
  { us: '13', diameter: '22.2 mm', circumference: '69.7 mm' },
];

export default function SizingPage() {
  return (
    <div style={{ backgroundColor: 'var(--color-bg-canvas, #fdfbf7)', minHeight: '100vh' }}>
      <article
        style={{
          maxWidth: '960px',
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
          STUDIO MEASUREMENT METHODOLOGY
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
            fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: '#0f172a',
            margin: '0 0 2rem 0',
            textTransform: 'uppercase',
          }}
        >
          Precision Sizing &amp; Shrinkage Guide
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            lineHeight: 1.75,
            color: '#334155',
            margin: '0 0 3rem 0',
            borderLeft: '2px solid #d97706',
            paddingLeft: '1.25rem',
          }}
        >
          Because our denim is unsanforized or lightly starched raw Japanese selvedge and our
          jewellery is cast in solid 925 sterling silver, precise anatomical measurements ensure an
          immaculate fit for life.
        </p>

        {/* Section 1: Denim Measurement Guide */}
        <section
          style={{
            borderTop: '1px solid #ebe7df',
            paddingTop: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.75rem',
              color: '#b91c1c',
              letterSpacing: '0.1em',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            PART 01 · RAW DENIM MEASUREMENT
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
              fontSize: '1.8rem',
              color: '#0f172a',
              margin: '0 0 1rem 0',
            }}
          >
            How to Measure Your Best-Fitting Jeans
          </h2>
          <p
            style={{ color: '#475569', lineHeight: 1.7, fontSize: '1rem', margin: '0 0 1.5rem 0' }}
          >
            Do not measure your body with a loose tape measure for jeans. Instead, take your
            favorite pair of 100% cotton non-stretch denim, lay it flat on a table, and measure as
            follows:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '1.25rem',
                borderRadius: '6px',
              }}
            >
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                1. Waist (Flat Across)
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                Pull front and back waistband aligned. Measure edge to edge and double. A 16.5" flat
                measurement equals a true 33" waist.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '1.25rem',
                borderRadius: '6px',
              }}
            >
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                2. Front Rise
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                From crotch intersection seam directly up to top of waistband button.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '1.25rem',
                borderRadius: '6px',
              }}
            >
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                3. Thigh (At Crotch)
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                Measure straight across the leg 1 inch below the crotch seam intersection.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '1.25rem',
                borderRadius: '6px',
              }}
            >
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                4. Inseam Length
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                From crotch seam down the inner leg seam to bottom edge of leg hem opening.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Kurabo 14oz Shrinkage Expectations */}
        <section
          style={{
            borderTop: '1px solid #ebe7df',
            paddingTop: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.75rem',
              color: '#d97706',
              letterSpacing: '0.1em',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            PART 02 · WASH &amp; SHRINKAGE BEHAVIOR
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
              fontSize: '1.8rem',
              color: '#0f172a',
              margin: '0 0 1rem 0',
            }}
          >
            Kurabo 14oz Denim Shrinkage Rates
          </h2>
          <p
            style={{ color: '#475569', lineHeight: 1.7, fontSize: '1rem', margin: '0 0 1.5rem 0' }}
          >
            Our Lot 001 fabric is loomstate raw denim. It will shrink on its first warm soak:
          </p>

          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              overflow: 'hidden',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.85rem',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem 1rem', color: '#475569' }}>Dimension</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#475569' }}>Cold Soak Shrinkage</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#475569' }}>Warm Machine Wash</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#475569' }}>
                    Post-Wear Stretchback
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Waist</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>-0.5" to -0.75"</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>-1.0" to -1.25"</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#065f46' }}>
                    Stretches back +1.0" with wear
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Thigh &amp; Knee</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>-0.25"</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>-0.4"</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#065f46' }}>
                    Stretches back +0.25"
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Inseam Length</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>-1.0" to -1.5"</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>-1.75" to -2.0"</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#b91c1c' }}>
                    Does not stretch back (add 1.5" to order)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Ring Mandrel Chart */}
        <section
          style={{
            borderTop: '1px solid #ebe7df',
            paddingTop: '2.5rem',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.75rem',
              color: '#0f172a',
              letterSpacing: '0.1em',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            PART 03 · JEWELLERY MANDREL SPECIFICATIONS
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
              fontSize: '1.8rem',
              color: '#0f172a',
              margin: '0 0 1rem 0',
            }}
          >
            US Standard Ring Mandrel Table
          </h2>
          <p
            style={{ color: '#475569', lineHeight: 1.7, fontSize: '1rem', margin: '0 0 1.5rem 0' }}
          >
            All Jeanius &amp; Jewl rings are sized on steel calibrated jeweler's mandrels. For wide
            bands (Lot 002 signet, {'>'} 8mm width), we recommend sizing up 0.5 US size for comfort.
          </p>

          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              overflow: 'hidden',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.85rem',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem 1rem', color: '#475569' }}>US Size</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#475569' }}>
                    Inside Diameter (mm)
                  </th>
                  <th style={{ padding: '0.75rem 1rem', color: '#475569' }}>
                    Inside Circumference (mm)
                  </th>
                </tr>
              </thead>
              <tbody>
                {RING_SIZES.map((row) => (
                  <tr key={row.us} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                      US {row.us}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem 1rem',
                        fontFamily: 'var(--font-mono, monospace)',
                        color: '#475569',
                      }}
                    >
                      {row.diameter}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem 1rem',
                        fontFamily: 'var(--font-mono, monospace)',
                        color: '#475569',
                      }}
                    >
                      {row.circumference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              href="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
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
              Ask Sizing Concierge →
            </Link>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
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
              Back to Catalog
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}
