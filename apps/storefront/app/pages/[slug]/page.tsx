import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContentPageAction } from '../../../actions/content.actions';
import { AtelierMarkdown } from '../../../components/atelier-markdown';
import { createStorefrontMetadata } from '../../../lib/metadata';
import Link from 'next/link';

interface PageProps {
  readonly params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getContentPageAction(slug);
  if (result.success && result.data) {
    return createStorefrontMetadata({
      title: `${result.data.title} — Jeanius Atelier`,
      description: result.data.metaDescription || result.data.title,
    });
  }
  return createStorefrontMetadata({
    title: 'Atelier Page',
  });
}

export default async function DynamicContentPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getContentPageAction(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const page = result.data;

  return (
    <div style={{ backgroundColor: 'var(--color-bg-canvas, #fdfbf7)', minHeight: '100vh' }}>
      <article
        style={{
          maxWidth: '880px',
          margin: '0 auto',
          padding: '4.5rem 2rem',
        }}
      >
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
          ATELIER ARCHIVE · {page.slug.toUpperCase()}
        </div>

        <AtelierMarkdown content={page.contentMarkdown} />

        <div
          style={{
            marginTop: '3.5rem',
            paddingTop: '2rem',
            borderTop: '1px solid #ebe7df',
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: '0.8rem',
              color: '#64748b',
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 600,
            }}
          >
            ← Return to Studio Catalog
          </Link>
        </div>
      </article>
    </div>
  );
}
