'use client';

import React, { useState } from 'react';

export interface ShippingInfoProps {
  readonly commerceModel: 'OM' | 'DROP' | 'CUSTOM_ORDER' | 'PRE_ORDER';
  readonly leadTimeDays?: number;
  readonly initialOpen?: boolean;
}

export function ShippingInfo({
  commerceModel,
  leadTimeDays = 21,
  initialOpen = true,
}: ShippingInfoProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const isOM = commerceModel === 'OM';

  return (
    <div
      style={{
        border: '1px solid #ebe7df',
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        marginTop: '1.5rem',
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        aria-expanded={isOpen}
      >
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#0f172a',
          }}
        >
          Workshop Lead Time &amp; Global Logistics
        </span>
        <span style={{ fontSize: '1.1rem', color: '#64748b', transition: 'transform 200ms ease' }}>
          {isOpen ? '−' : '+'}
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            padding: '0 1.25rem 1.25rem 1.25rem',
            fontSize: '0.82rem',
            lineHeight: 1.6,
            color: '#475569',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '1rem',
          }}
        >
          <div style={{ marginBottom: '0.85rem' }}>
            <strong style={{ color: '#0f172a' }}>Atelier Production Timeline:</strong>
            <p style={{ margin: '0.25rem 0 0 0' }}>
              {isOM
                ? `Each Order-Made piece is cast from grain and hand-chased to your exact specification in Kathmandu. Workshop lead time is approximately ${leadTimeDays} business days prior to dispatch.`
                : 'Limited Capsule Drop pieces are finished, quality-controlled, and ready for dispatch within 2 business days.'}
            </p>
          </div>

          <div style={{ marginBottom: '0.85rem' }}>
            <strong style={{ color: '#0f172a' }}>International Air Express:</strong>
            <p style={{ margin: '0.25rem 0 0 0' }}>
              Dispatched via DHL Express Worldwide direct from Tribhuvan International Airport (TIA)
              with secure door-to-door tracking. Typical transit time is 13–17 business days.
            </p>
          </div>

          <div>
            <strong style={{ color: '#0f172a' }}>Customs Declaration &amp; Compliance:</strong>
            <p style={{ margin: '0.25rem 0 0 0' }}>
              Accompanied by official Nepal Customs export declaration under Harmonized System Code
              HS 7113.11 (.925 Silver Jewellery with Master Artisan Certificate of Authenticity).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
