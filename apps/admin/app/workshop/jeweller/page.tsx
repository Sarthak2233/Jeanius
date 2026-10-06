import React from 'react';
import { AdminNav } from '../../../components/admin-nav';
import { StatusBadge } from '../../../components/status-badge';

export const dynamic = 'force-dynamic';

export default function JewellerWorkbenchPage() {
  return (
    <div>
      <AdminNav currentBench="JEWELLER" />
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
                color: '#f59e0b',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Kathmandu Silversmith & Foundry Bench
            </span>
            <h1 style={{ fontSize: '1.75rem', margin: '0.25rem 0 0 0', color: '#f8fafc' }}>
              Metalsmithing & Ingot Allocation Workbench
            </h1>
          </div>
          <span
            style={{
              padding: '0.35rem 0.75rem',
              background: '#78350f',
              color: '#fde68a',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            ACTIVE JEWELLER BENCH
          </span>
        </div>

        {/* Precious Metal Stock Status */}
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
              Precious Alloy Lot
            </span>
            <h3 style={{ fontSize: '1.2rem', margin: '0.35rem 0', color: '#f8fafc' }}>
              MS-AG-01 (.925 Sterling Silver)
            </h3>
            <p style={{ margin: 0, color: '#f59e0b', fontSize: '0.9rem', fontWeight: 600 }}>
              5,000.00g Available Stock
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
              Solid Yellow Brass
            </span>
            <h3 style={{ fontSize: '1.2rem', margin: '0.35rem 0', color: '#f8fafc' }}>
              MS-BR-01 (Cartridge Brass)
            </h3>
            <p style={{ margin: 0, color: '#f59e0b', fontSize: '0.9rem', fontWeight: 600 }}>
              10,000.00g Available Stock
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
              Casting Stage Trigger
            </h3>
            <p style={{ margin: 0, color: '#ef4444', fontSize: '0.85rem' }}>
              Molten metal pour locks 24h cancellation
            </p>
          </div>
        </div>

        {/* Foundry & Casting Queue Table */}
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
            Hand-Forging & Casting Queue (Kathmandu Bench)
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
                  <th style={{ padding: '0.75rem' }}>Workpiece Ref</th>
                  <th style={{ padding: '0.75rem' }}>Item & Alloy</th>
                  <th style={{ padding: '0.75rem' }}>Bespoke Specs (Vault Resolved)</th>
                  <th style={{ padding: '0.75rem' }}>Stage</th>
                  <th style={{ padding: '0.75rem' }}>Foundry Action</th>
                </tr>
              </thead>
              <tbody style={{ color: '#cbd5e1' }}>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontWeight: 700 }}>
                    JW-2026-0012
                  </td>
                  <td style={{ padding: '0.75rem' }}>Selvedge Seal Signet (.925 Silver)</td>
                  <td style={{ padding: '0.75rem', color: '#f59e0b' }}>
                    Ring Size: US 10.5 • Mandrel: 20.2mm • Oxidized Patina
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <StatusBadge status="QUEUED" variant="neutral" />
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button
                      type="button"
                      style={{
                        padding: '0.35rem 0.75rem',
                        background: '#d97706',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      Deduct Ingot & Pour Mold
                    </button>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontWeight: 700 }}>
                    JW-2026-0019
                  </td>
                  <td style={{ padding: '0.75rem' }}>Artisan Hand-Carved Cuff (Brass)</td>
                  <td style={{ padding: '0.75rem', color: '#f59e0b' }}>
                    Wrist: 7.25" • Gap: 28mm • Hammered Raw Finish
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <StatusBadge status="HARDWARE" variant="om" />
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
                      Advance to Final QC
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
