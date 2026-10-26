import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getContentPageAction } from '../../actions/content.actions';
import { AtelierMarkdown } from '../../components/atelier-markdown';
import { createStorefrontMetadata } from '../../lib/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const result = await getContentPageAction('about');
  if (result.success && result.data) {
    return createStorefrontMetadata({
      title: `${result.data.title} — The Atelier Protocol`,
      description:
        result.data.metaDescription ||
        'Origins of Project 925 and our Order-Made silversmithing covenant.',
    });
  }
  return createStorefrontMetadata({
    title: 'About Project 925 Kathmandu Atelier',
    description:
      'Origins of Project 925, our Kathmandu metalsmithing bench, and .925 sterling silver lost-wax casting.',
  });
}

export default async function AboutPage() {
  const result = await getContentPageAction('about');
  const page = result.success ? result.data : null;

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
          KATHMANDU WORKSHOP · ATELIER ORIGINS &amp; OPERATIONAL RULES
        </div>

        {page ? (
          <AtelierMarkdown content={page.contentMarkdown} />
        ) : (
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
                fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
                fontWeight: 700,
                color: '#0f172a',
                marginBottom: '1.5rem',
              }}
            >
              About Project 925 Kathmandu Atelier
            </h1>
            <p style={{ color: '#475569', lineHeight: 1.75, fontSize: '1.1rem' }}>
              Founded on the uncompromising craft of Himalayan lost-wax casting and hand-carved .925
              sterling silver talismanic jewellery. We operate strictly from our Kathmandu workshop.
            </p>
          </div>
        )}

        {/* Section Action Links */}
        <div
          style={{
            marginTop: '3.5rem',
            paddingTop: '2.5rem',
            borderTop: '1px solid #ebe7df',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
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
            Consult Precision Sizing Studio →
          </Link>
          <Link
            href="/guide"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#f1f5f9',
              color: '#0f172a',
              padding: '0.75rem 1.5rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              border: '1px solid #cbd5e1',
            }}
          >
            Read Silver Care &amp; Patina Rituals
          </Link>
        </div>
      </article>
    </div>
  );
}
