import React from 'react';
import Link from 'next/link';
import { getContentPageAction } from '../actions/content.actions';
import { AtelierMarkdown } from './atelier-markdown';

export interface ContentPageTemplateProps {
  readonly slug: string;
  readonly fallbackTitle?: string;
  readonly fallbackMarkdown?: string;
  readonly eyebrow?: string;
}

export async function ContentPageTemplate({
  slug,
  fallbackTitle = 'Atelier Document',
  fallbackMarkdown = 'Content is being updated by the workshop.',
  eyebrow = 'ATELIER PROTOCOL',
}: ContentPageTemplateProps) {
  const result = await getContentPageAction(slug);
  const page = result.success ? result.data : null;

  const title = page?.title || fallbackTitle;
  const markdown = page?.contentMarkdown || fallbackMarkdown;
  const hasH1 = markdown.trim().startsWith('# ');

  return (
    <div style={{ backgroundColor: 'var(--color-bg-canvas, #fdfbf7)', minHeight: '100vh' }}>
      <article
        style={{
          maxWidth: '880px',
          margin: '0 auto',
          padding: '4.5rem 2rem',
        }}
      >
        {/* Eyebrow */}
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
          {eyebrow}
        </div>

        {!hasH1 && (
          <h1
            style={{
              fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
              fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)',
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: '#0f172a',
              margin: '0 0 2rem 0',
              textTransform: 'uppercase',
            }}
          >
            {title}
          </h1>
        )}

        <AtelierMarkdown content={markdown} />

        {/* Footer Back Link */}
        <div
          style={{
            marginTop: '3.5rem',
            paddingTop: '2rem',
            borderTop: '1px solid #ebe7df',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
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
          <Link
            href="/sizing"
            style={{
              fontSize: '0.8rem',
              color: '#0f172a',
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 600,
            }}
          >
            Consult Sizing Studio →
          </Link>
        </div>
      </article>
    </div>
  );
}
