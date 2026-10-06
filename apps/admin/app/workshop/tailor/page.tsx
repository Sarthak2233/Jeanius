import React from 'react';
import { AdminNav } from '../../../components/admin-nav';
import { StatusBadge } from '../../../components/status-badge';

export const dynamic = 'force-dynamic';

export default function TailorWorkbenchPage() {
  return (
    <div>
      <AdminNav currentBench="TAILOR" />
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
                color: '#38bdf8',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Kathmandu Master Cutting Bench
            </span>
            <h1 style={{ fontSize: '1.75rem', margin: '0.25rem 0 0 0', color: '#f8fafc' }}>
              Denim Tailoring & Bolt Allocation Workbench
            </h1>
          </div>
          <span
            style={{
              padding: '0.35rem 0.75rem',
              background: '#065f46',
              color: '#6ee7b7',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            ACTIVE TAILOR SESSION
          </span>
        </div>

        {/* Active Bolt Inventory Status */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
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
              Assigned Selvedge Bolt
            </span>
            <h3 style={{ fontSize: '1.2rem', margin: '0.35rem 0', color: '#f8fafc' }}>
              KB-14-RAW (Kurabo Japan)
            </h3>
            <p style={{ margin: 0, color: '#38bdf8', fontSize: '0.9rem', fontWeight: 600 }}>
              100.00 Yards Remaining
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
              Heavyweight Deep Indigo
            </span>
            <h3 style={{ fontSize: '1.2rem', margin: '0.35rem 0', color: '#f8fafc' }}>
              KK-155-IND (Kuroki Japan)
            </h3>
            <p style={{ margin: 0, color: '#38bdf8', fontSize: '0.9rem', fontWeight: 600 }}>
              85.00 Yards Remaining
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
              Point of No Return Rule
            </span>
            <h3 style={{ fontSize: '1.2rem', margin: '0.35rem 0', color: '#f8fafc' }}>
              Cutting Stage Trigger
            </h3>
            <p style={{ margin: 0, color: '#f59e0b', fontSize: '0.85rem' }}>
              Locks 24h customer cancellation upon cutting
            </p>
          </div>
        </div>

        {/* Tailoring Cutting Queue Table */}
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
            Bespoke Cut Ticket Queue (Kathmandu Atelier)
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
                  <th style={{ padding: '0.75rem' }}>Order Ref</th>
                  <th style={{ padding: '0.75rem' }}>Garment</th>
                  <th style={{ padding: '0.75rem' }}>Bespoke Specs (Vault Resolved)</th>
                  <th style={{ padding: '0.75rem' }}>Stage</th>
                  <th style={{ padding: '0.75rem' }}>Bench Action</th>
                </tr>
              </thead>
              <tbody style={{ color: '#cbd5e1' }}>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontWeight: 700 }}>
                    JN-2026-0041
                  </td>
                  <td style={{ padding: '0.75rem' }}>Lot 001 Straight Selvedge</td>
                  <td style={{ padding: '0.75rem', color: '#38bdf8' }}>
                    Waist: 32" • Inseam: 34" • Hem: 1" (Chainstitch)
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <StatusBadge status="QUEUED" variant="neutral" />
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button
                      type="button"
                      style={{
                        padding: '0.35rem 0.75rem',
                        background: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      Allocate Bolt & Begin Cut
                    </button>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontWeight: 700 }}>
                    JN-2026-0048
                  </td>
                  <td style={{ padding: '0.75rem' }}>Type II Selvedge Trucker Jacket</td>
                  <td style={{ padding: '0.75rem', color: '#38bdf8' }}>
                    Chest: 40" • Shoulders: 18" • Sleeve: 25" (Boxy Fit)
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <StatusBadge status="CUTTING" variant="om" />
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button
                      type="button"
                      style={{
                        padding: '0.35rem 0.75rem',
                        background: '#065f46',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      Advance to Sewing
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
