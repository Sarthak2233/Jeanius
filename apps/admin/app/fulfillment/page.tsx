import React from 'react';
import { AdminNav } from '../../components/admin-nav';
import { StatusBadge } from '../../components/status-badge';

export const dynamic = 'force-dynamic';

export default function FulfillmentPage() {
  return (
    <div>
      <AdminNav currentBench="FULFILLMENT" />
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
                color: '#10b981',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Kathmandu Logistics & Export Center
            </span>
            <h1 style={{ fontSize: '1.75rem', margin: '0.25rem 0 0 0', color: '#f8fafc' }}>
              International Fulfillment & Courier Dispatch
            </h1>
          </div>
          <span
            style={{
              padding: '0.35rem 0.75rem',
              background: '#064e3b',
              color: '#a7f3d0',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            ACTIVE LOGISTICS CONSOLE
          </span>
        </div>

        {/* Dispatch Metrics */}
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
              Ready for Packaging
            </span>
            <h3 style={{ fontSize: '1.4rem', margin: '0.35rem 0', color: '#f8fafc' }}>
              2 Garments
            </h3>
            <p style={{ margin: 0, color: '#10b981', fontSize: '0.85rem' }}>QC Passed & Washed</p>
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
              Primary International Courier
            </span>
            <h3 style={{ fontSize: '1.4rem', margin: '0.35rem 0', color: '#f8fafc' }}>
              DHL Express (TIA)
            </h3>
            <p style={{ margin: 0, color: '#38bdf8', fontSize: '0.85rem' }}>
              Tribhuvan Int. Airport Hub
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
              Customs Harmonized Code
            </span>
            <h3 style={{ fontSize: '1.4rem', margin: '0.35rem 0', color: '#f8fafc' }}>
              HS 6203.42
            </h3>
            <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.85rem' }}>
              Men's Cotton Raw Trousers (NP Export)
            </p>
          </div>
        </div>

        {/* Outbound Dispatch Queue */}
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
            Outbound Parcel Packaging Station
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
                  <th style={{ padding: '0.75rem' }}>Shipment Ref</th>
                  <th style={{ padding: '0.75rem' }}>Destination</th>
                  <th style={{ padding: '0.75rem' }}>Declared Contents</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Packaging Action</th>
                </tr>
              </thead>
              <tbody style={{ color: '#cbd5e1' }}>
                <tr>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontWeight: 700 }}>
                    SH-NP-9921
                  </td>
                  <td style={{ padding: '0.75rem' }}>San Francisco, CA, USA</td>
                  <td style={{ padding: '0.75rem' }}>1x Lot 001 Jeans (1.2kg) • 1x Brass Pin</td>
                  <td style={{ padding: '0.75rem' }}>
                    <StatusBadge status="READY" variant="om" />
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button
                      type="button"
                      style={{
                        padding: '0.35rem 0.75rem',
                        background: '#047857',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      Print DHL Airwaybill & Seal Box
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
