import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createStorefrontMetadata } from '../../lib/metadata';

export const metadata: Metadata = createStorefrontMetadata({
  title: 'About & Workshop Guide — The Atelier Protocol',
  description:
    'Origins of Jeanius & Jewl, our Kathmandu denim cutting tables, Seoul silversmithing bench, and Order-Made philosophy.',
});

export default function AboutPage() {
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
          ATELIER ORIGINS &amp; OPERATIONAL RULES
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
          About Jeanius &amp; Jewl Atelier
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            lineHeight: 1.75,
            color: '#334155',
            margin: '0 0 3rem 0',
            borderLeft: '2px solid #b91c1c',
            paddingLeft: '1.25rem',
          }}
        >
          Founded on the uncompromising intersection of heritage denim tailoring and artisanal
          silversmithing. We operate between two dedicated workshops: our denim cutting tables in
          Kathmandu and our jewellery bench in Seoul.
        </p>

        {/* Section 1: The Kathmandu Cutting Table */}
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
            CHAPTER 01 · KATHMANDU BENCH
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
              fontSize: '1.8rem',
              color: '#0f172a',
              margin: '0 0 1rem 0',
            }}
          >
            The Heritage Denim Cutting Tables
          </h2>
          <p style={{ color: '#475569', lineHeight: 1.7, fontSize: '1rem', margin: '0 0 1rem 0' }}>
            In Kathmandu, our master tailors work with rare vintage Union Special 43200G chainstitch
            machines. Every raw denim piece is hand-chalked and cut from verified Japanese Kurabo
            selvedge bolts. There is no automated assembly line: one tailor cuts, stitches, and
            finishes the garment from start to completion.
          </p>
          <p style={{ color: '#475569', lineHeight: 1.7, fontSize: '1rem', margin: 0 }}>
            Because raw denim contracts on its initial wash, our patterns incorporate calculated
            shrinkage ratios. Each client receives a piece dialed to their exact inseam and
            anatomical waist curve.
          </p>
        </section>

        {/* Section 2: The Seoul Jewellery Bench */}
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
            CHAPTER 02 · KATHMANDU WORKBENCH
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
              fontSize: '1.8rem',
              color: '#0f172a',
              margin: '0 0 1rem 0',
            }}
          >
            Solid 925 Sterling Silver Hardware
          </h2>
          <p style={{ color: '#475569', lineHeight: 1.7, fontSize: '1rem', margin: '0 0 1rem 0' }}>
            In Kathmandu, our silversmiths carve ring blanks in wax before lost-wax vacuum casting
            in solid 925 sterling silver. From heavy signet rings to hand-turned denim shank buttons
            and key carabiners, every piece is stamped with the studio hallmark and hand-finished
            with directional satin brushing.
          </p>
          <p style={{ color: '#475569', lineHeight: 1.7, fontSize: '1rem', margin: 0 }}>
            We reject rhodium flash plating: our silver is meant to breathe, oxidise, and accumulate
            the unique patina of its wearer alongside fading denim.
          </p>
        </section>

        {/* Section 3: The Order-Made (OM) Protocol */}
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
              color: '#1e40af',
              letterSpacing: '0.1em',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            CHAPTER 03 · OPERATIONAL DISCIPLINE
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
              fontSize: '1.8rem',
              color: '#0f172a',
              margin: '0 0 1rem 0',
            }}
          >
            The Order-Made (OM) Production Cycle
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem',
              margin: '1.5rem 0',
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                borderRadius: '6px',
              }}
            >
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                Stage 1: Confirmation &amp; Lock
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                Upon checkout, your measurements are reviewed. You have 24 hours to request
                adjustments before the bolt is cut.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                borderRadius: '6px',
              }}
            >
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                Stage 2: 14–21 Day Assembly
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                The raw bolt is allocated, pattern pieces carved, chainstitched on the Union
                Special, and hardware hand-riveted.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                borderRadius: '6px',
              }}
            >
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                Stage 3: Inspection &amp; DHL Dispatch
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                Final quality calipers measure the inseam and waist. Garments are wrapped in ecru
                canvas and dispatched worldwide.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Policies & Warranty */}
        <section
          style={{
            borderTop: '1px solid #ebe7df',
            paddingTop: '2.5rem',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
              fontSize: '1.8rem',
              color: '#0f172a',
              margin: '0 0 1rem 0',
            }}
          >
            Returns, Alterations &amp; Lifetime Repairs
          </h2>
          <p style={{ color: '#475569', lineHeight: 1.7, fontSize: '1rem', margin: '0 0 1rem 0' }}>
            Because each OM piece is custom tailored, returns are not accepted for buyer
            change-of-mind once cutting begins. However, we stand behind the craftsmanship for life.
          </p>
          <ul
            style={{
              color: '#475569',
              lineHeight: 1.8,
              fontSize: '0.95rem',
              paddingLeft: '1.25rem',
            }}
          >
            <li>
              <strong>Complimentary Hemming:</strong> Need your jeans shortened after the initial
              soak? Send them back anytime for authentic Union Special roping chainstitch
              re-hemming.
            </li>
            <li>
              <strong>Crotch &amp; Seam Re-inforcement:</strong> Blown out your raw selvedge after 2
              years of heavy wear? We provide free sashiko and darning repair.
            </li>
            <li>
              <strong>Silver Ultrasonic Cleaning &amp; Resizing:</strong> All jewellery includes
              lifetime ultrasonic cleansing and size tuning.
            </li>
          </ul>

          <div style={{ marginTop: '2.5rem' }}>
            <Link
              href="/sizing"
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
              Consult Denim &amp; Ring Sizing Guide →
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}
