'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function StorefrontFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      style={{
        backgroundColor: '#faf8f4',
        borderTop: '1px solid #e2e8f0',
        color: '#334155',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '4rem 2rem 2.5rem 2rem',
        }}
      >
        {/* Atelier Manifesto Header */}
        <div
          style={{
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}
          >
            Jeanius &amp; Jewl Atelier
          </h2>
          <p
            style={{
              maxWidth: '720px',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              color: '#64748b',
              margin: 0,
            }}
          >
            Crafted one piece at a time between our Kathmandu cutting tables and jewellery bench.
            All garments and sterling silver pieces are crafted to order with lifetime repair
            backing.
          </p>
        </div>

        {/* 4-Column Bento Links */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3.5rem',
          }}
        >
          {/* Column 1: Atelier Works */}
          <div>
            <h3
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#0f172a',
                marginBottom: '1rem',
              }}
            >
              Atelier Works
            </h3>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
              }}
            >
              <li>
                <Link
                  href="/"
                  style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem' }}
                >
                  Order-Made (OM) Catalog
                </Link>
              </li>
              <li>
                <Link
                  href="/drop"
                  style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem' }}
                >
                  Limited Drops (VIP Access)
                </Link>
              </li>
              <li>
                <Link
                  href="/member"
                  style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem' }}
                >
                  VIP Collector Salon
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem' }}
                >
                  Bespoke Studio Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Craft & Sizing */}
          <div>
            <h3
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#0f172a',
                marginBottom: '1rem',
              }}
            >
              Craft &amp; Sizing
            </h3>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
              }}
            >
              <li>
                <Link
                  href="/sizing"
                  style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem' }}
                >
                  Denim Fit &amp; Shrinkage Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/sizing"
                  style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem' }}
                >
                  Ring Mandrel Sizing Chart
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem' }}
                >
                  Sterling Silver (925) Care
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem' }}
                >
                  Raw Selvedge Bolt Traceability
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Client Care & Policies */}
          <div>
            <h3
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#0f172a',
                marginBottom: '1rem',
              }}
            >
              Client Care &amp; Policies
            </h3>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
              }}
            >
              <li>
                <Link
                  href="/about"
                  style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem' }}
                >
                  Worldwide Shipping &amp; Customs
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem' }}
                >
                  OM Point of No Return Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem' }}
                >
                  5-Day Drop Return Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem' }}
                >
                  Concierge Support Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Studio Dispatch */}
          <div>
            <h3
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#0f172a',
                marginBottom: '1rem',
              }}
            >
              Studio Dispatch
            </h3>
            <p
              style={{
                fontSize: '0.85rem',
                color: '#64748b',
                lineHeight: 1.5,
                marginBottom: '0.75rem',
              }}
            >
              Receive announcements for limited bolt allocations and private Drop access.
            </p>

            {subscribed ? (
              <p
                role="status"
                style={{
                  fontSize: '0.8rem',
                  color: '#065f46',
                  backgroundColor: '#ecfdf5',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '3px',
                  border: '1px solid #10b981',
                }}
              >
                ✓ Registered for atelier dispatch.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="collector@domain.com"
                  aria-label="Email address for atelier dispatch"
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '3px',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    minWidth: 0,
                  }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '3px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar: Copyright, Social & Telemetry */}
        <div
          style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.75rem',
            color: '#94a3b8',
          }}
        >
          <div>
            © {currentYear} Jeanius &amp; Jewl Studio. All rights reserved. Precision Selvedge &amp;
            Silversmithing.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#64748b', textDecoration: 'none' }}
            >
              X / Twitter
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#64748b', textDecoration: 'none' }}
            >
              Instagram
            </a>
            <span>USD ($) • Kathmandu </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
