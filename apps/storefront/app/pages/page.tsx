import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { listPublishedContentPagesAction } from '../../actions/content.actions';
import { createStorefrontMetadata } from '../../lib/metadata';

export const metadata: Metadata = createStorefrontMetadata({
  title: 'Atelier Stories & Archive — Project 925',
  description:
    'Explore craft monographs, origin journals, and atelier dispatches from Kathmandu Workshop.',
});

const CORE_STATIC_SLUGS = new Set([
  'about',
  'sizing',
  'guide',
  'contact',
  'terms',
  'returns',
  'privacy',
]);

export default async function AtelierArchivePage() {
  const result = await listPublishedContentPagesAction();
  const allPages = result.success && result.data ? result.data : [];

  // Filter dynamic editorial stories from core system pages
  const dynamicStories = allPages.filter((p) => !CORE_STATIC_SLUGS.has(p.slug));

  return (
    <div style={{ backgroundColor: 'var(--color-bg-canvas, #fdfbf7)', minHeight: '100vh' }}>
      <div
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          padding: '4.5rem 2rem 6rem 2rem',
        }}
      >
        {/* Header Section */}
        <header
          style={{
            borderBottom: '1px solid #ebe7df',
            paddingBottom: '2.5rem',
            marginBottom: '3.5rem',
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
            ATELIER ARCHIVE · CHRONICLES &amp; CRAFT
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              margin: '0 0 1rem 0',
            }}
          >
            Inside the Loom &amp; Forge
          </h1>
          <p
            style={{
              maxWidth: '680px',
              fontSize: '1rem',
              lineHeight: 1.6,
              color: '#64748b',
              margin: 0,
            }}
          >
            Origin journals, mill monographs, and master tailoring notes published directly from our
            Kathmandu cutting tables and jewellery workbench.
          </p>
        </header>

        {/* Stories Grid */}
        {dynamicStories.length === 0 ? (
          <div
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              backgroundColor: '#faf8f4',
              borderRadius: '4px',
              border: '1px solid #ebe7df',
              color: '#64748b',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.95rem' }}>
              No custom chronicles currently published. Check back soon for new atelier monographs.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '2rem',
              marginBottom: '4rem',
            }}
          >
            {dynamicStories.map((story) => (
              <article
                key={story.slug}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #ebe7df',
                  borderRadius: '4px',
                  padding: '2rem',
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
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '0.65rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#b45309',
                        fontWeight: 600,
                        backgroundColor: '#fffbeb',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '2px',
                        border: '1px solid #fde68a',
                      }}
                    >
                      CHRONICLE · {story.slug}
                    </span>
                    {story.publishedAt && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: '#94a3b8',
                          fontFamily: 'var(--font-mono, monospace)',
                        }}
                      >
                        {new Date(story.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>

                  <h2
                    style={{
                      fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
                      fontSize: '1.35rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      lineHeight: 1.3,
                      marginBottom: '0.75rem',
                    }}
                  >
                    <Link
                      href={`/pages/${story.slug}`}
                      style={{
                        color: 'inherit',
                        textDecoration: 'none',
                      }}
                    >
                      {story.title}
                    </Link>
                  </h2>

                  {story.metaDescription && (
                    <p
                      style={{
                        fontSize: '0.88rem',
                        lineHeight: 1.6,
                        color: '#64748b',
                        margin: '0 0 1.5rem 0',
                      }}
                    >
                      {story.metaDescription}
                    </p>
                  )}
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid #f8fafc' }}>
                  <Link
                    href={`/pages/${story.slug}`}
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#0f172a',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    Read Story <span>&rarr;</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Core Atelier Manuals Bar */}
        <section
          style={{
            borderTop: '1px solid #ebe7df',
            paddingTop: '3rem',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono, monospace)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#94a3b8',
              fontWeight: 600,
              marginBottom: '1.25rem',
            }}
          >
            ATELIER FOUNDATIONS &amp; PROTOCOLS
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            <Link
              href="/about"
              style={{
                textDecoration: 'none',
                padding: '1.25rem',
                backgroundColor: '#ffffff',
                border: '1px solid #ebe7df',
                borderRadius: '4px',
              }}
            >
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  marginBottom: '0.25rem',
                }}
              >
                Origins &amp; Protocol &rarr;
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                About Project 925 Kathmandu workshop
              </div>
            </Link>

            <Link
              href="/sizing"
              style={{
                textDecoration: 'none',
                padding: '1.25rem',
                backgroundColor: '#ffffff',
                border: '1px solid #ebe7df',
                borderRadius: '4px',
              }}
            >
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  marginBottom: '0.25rem',
                }}
              >
                Precision Sizing Studio &rarr;
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Ring mandrel and jewellery sizing guides
              </div>
            </Link>

            <Link
              href="/guide"
              style={{
                textDecoration: 'none',
                padding: '1.25rem',
                backgroundColor: '#ffffff',
                border: '1px solid #ebe7df',
                borderRadius: '4px',
              }}
            >
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  marginBottom: '0.25rem',
                }}
              >
                Craft &amp; Care Rituals &rarr;
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Silver polish &amp; dark patina care
              </div>
            </Link>

            <Link
              href="/contact"
              style={{
                textDecoration: 'none',
                padding: '1.25rem',
                backgroundColor: '#ffffff',
                border: '1px solid #ebe7df',
                borderRadius: '4px',
              }}
            >
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  marginBottom: '0.25rem',
                }}
              >
                Studio Concierge &rarr;
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Bespoke and workshop contact
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
