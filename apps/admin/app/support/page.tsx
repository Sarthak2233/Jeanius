import React from 'react';
import { AdminNav } from '../../components/admin-nav';
import { StatusBadge } from '../../components/status-badge';

export const dynamic = 'force-dynamic';

export default function SupportDeskPage() {
  return (
    <div>
      <AdminNav currentBench="SUPPORT" />
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem 4rem 2rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #334155',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#a855f7',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Atelier Concierge & Customer Care
            </span>
            <h1 style={{ fontSize: '1.75rem', margin: '0.25rem 0 0 0', color: '#f8fafc' }}>
              Order Inquiries & Bespoke Adjustment Desk
            </h1>
          </div>
          <span
            style={{
              padding: '0.35rem 0.75rem',
              background: '#581c87',
              color: '#e9d5ff',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            ACTIVE SUPPORT CONSOLE
          </span>
        </div>

        {/* Operational Care Guardrails */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem',
          }}
        >
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '1.25rem',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              24h Pre-Production Window
            </span>
            <h3 style={{ fontSize: '1.3rem', margin: '0.35rem 0', color: '#f8fafc' }}>
              Pre-Cut Cancellation
            </h3>
            <p style={{ margin: 0, color: '#a855f7', fontSize: '0.85rem' }}>
              Self-service eligible before cutting stage
            </p>
          </div>

          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '1.25rem',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              Atelier Measurements Vault
            </span>
            <h3 style={{ fontSize: '1.3rem', margin: '0.35rem 0', color: '#f8fafc' }}>
              Sizing Adjustments
            </h3>
            <p style={{ margin: 0, color: '#38bdf8', fontSize: '0.85rem' }}>
              Customer modifications sync to active tickets
            </p>
          </div>

          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '1.25rem',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              Direct Artisan Notes
            </span>
            <h3 style={{ fontSize: '1.3rem', margin: '0.35rem 0', color: '#f8fafc' }}>
              Bench Communications
            </h3>
            <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.85rem' }}>
              Append notes to Pasang (Tailor) or Bikash (Jeweller)
            </p>
          </div>
        </div>

        {/* Support Tickets Queue */}
        <div
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '1.5rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.1rem',
              margin: '0 0 1rem 0',
              color: '#f8fafc',
              textTransform: 'uppercase',
            }}
          >
            Active Customer Inquiries & Bespoke Requests
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.85rem',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                  <th style={{ padding: '0.75rem' }}>Ticket</th>
                  <th style={{ padding: '0.75rem' }}>Customer</th>
                  <th style={{ padding: '0.75rem' }}>Inquiry Type</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Care Action</th>
                </tr>
              </thead>
              <tbody style={{ color: '#cbd5e1' }}>
                <tr>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontWeight: 700 }}>
                    TCK-2026-088
                  </td>
                  <td style={{ padding: '0.75rem' }}>Alex Raw Denim Collector</td>
                  <td style={{ padding: '0.75rem' }}>
                    Requesting 0.5" hem shortening on Lot 001 before cutting
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <StatusBadge status="PENDING" variant="om" />
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button
                      type="button"
                      style={{
                        padding: '0.35rem 0.75rem',
                        background: '#7c3aed',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      Update Cut Ticket & Notify Tailor
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
