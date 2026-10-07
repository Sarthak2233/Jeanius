'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AtelierMarkdown } from '../../components/atelier-markdown';

export interface ContactClientProps {
  readonly pageMarkdown?: string;
}

export function ContactClient({ pageMarkdown }: ContactClientProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: 'sizing',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg-canvas, #fdfbf7)', minHeight: '100vh' }}>
      <div
        style={{
          maxWidth: '1040px',
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
          ATELIER COMMUNICATIONS
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
          Contact Studio Concierge
        </h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3.5rem',
            marginTop: '2.5rem',
          }}
        >
          {/* Left: Dynamic CMS Content (Studio Locations, Operating Hours) */}
          <div>
            {pageMarkdown ? (
              <AtelierMarkdown content={pageMarkdown} />
            ) : (
              <div>
                <p
                  style={{
                    color: '#475569',
                    lineHeight: 1.7,
                    fontSize: '1.05rem',
                    margin: '0 0 2rem 0',
                  }}
                >
                  Direct consultation with our tailoring cutters in Kathmandu and jewellery
                  artisans. We respond to sizing queries, repair requests, and bespoke inquiries
                  within 24 hours.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div
                    style={{
                      padding: '1.5rem',
                      backgroundColor: '#faf8f4',
                      border: '1px solid #ebe7df',
                      borderRadius: '6px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono, monospace)',
                        color: '#b91c1c',
                        fontWeight: 700,
                      }}
                    >
                      KATHMANDU STUDIO
                    </div>
                    <div style={{ fontWeight: 600, color: '#0f172a', margin: '0.25rem 0' }}>
                      Denim Cutting &amp; Chainstitch Bench
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      Baber Mahal Revisited, Kathmandu, Nepal
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Interactive Inquiry Form */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '2.25rem',
              boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)',
              alignSelf: 'start',
            }}
          >
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#ecfdf5',
                    color: '#065f46',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem auto',
                    fontSize: '1.5rem',
                  }}
                >
                  ✓
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
                    fontSize: '1.5rem',
                    color: '#0f172a',
                    margin: '0 0 0.5rem 0',
                  }}
                >
                  Inquiry Dispatched
                </h3>
                <p
                  style={{
                    color: '#64748b',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    margin: '0 0 1.5rem 0',
                  }}
                >
                  Thank you, {formData.name || 'Collector'}. Our atelier concierge will review your
                  message and reply to {formData.email} within 24 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  style={{
                    padding: '0.6rem 1.25rem',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    color: '#334155',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
              >
                <div>
                  <label
                    htmlFor="contact-name"
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#334155',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Collector Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sarthak Thorne"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#334155',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="collector@domain.com"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-type"
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#334155',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Inquiry Topic
                  </label>
                  <select
                    id="contact-type"
                    value={formData.inquiryType}
                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      backgroundColor: '#ffffff',
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  >
                    <option value="sizing">Denim &amp; Ring Sizing Consultation</option>
                    <option value="custom">Bespoke Workshop Commission</option>
                    <option value="repair">Union Special Hemming &amp; Repair Intake</option>
                    <option value="drop">VIP Drop Vault Access</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#334155',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Message &amp; Anatomical Notes
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide measurements, desired inseam, or bespoke queries..."
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    padding: '0.8rem',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'opacity 150ms ease',
                  }}
                >
                  Send Message to Master Tailor →
                </button>
              </form>
            )}
          </div>
        </div>

        <div style={{ marginTop: '3rem' }}>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              fontSize: '0.78rem',
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
      </div>
    </div>
  );
}
