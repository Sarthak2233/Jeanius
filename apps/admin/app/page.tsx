import React from 'react';
import Link from 'next/link';
import { StatusBadge } from '../components/status-badge';
import type { ProductionStage } from '@jeanius/domain';
import { db, DrizzleAuditLogRepository } from '@jeanius/database';
import { AdminNav } from '../components/admin-nav';
import { AuditActionTrigger } from '../components/audit-action-trigger';

const STAGES: readonly ProductionStage[] = [
  'QUEUED',
  'CUTTING',
  'SEWING',
  'WASHING',
  'HARDWARE',
  'QC',
  'READY',
  'SHIPPED',
];

export default async function AdminDashboardPage() {
  const auditRepo = new DrizzleAuditLogRepository(db);
  const recentLogs = await auditRepo.findRecent(10).catch(() => []);

  return (
    <div>
      <AdminNav currentBench="DIRECTOR" />

      <main style={{ padding: '0 2rem 3rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <header
          style={{
            borderBottom: '1px solid #334155',
            paddingBottom: '1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <h1
              style={{ fontSize: '1.75rem', letterSpacing: '0.05em', margin: 0, color: '#f8fafc' }}
            >
              JEANIUS WORKSHOP OPERATIONS
            </h1>
            <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
              Dual-Craft Atelier Operations (Bespoke Denim & Handcrafted Precious Jewellery)
            </p>
          </div>
          <span
            style={{
              fontSize: '0.8rem',
              padding: '0.35rem 0.85rem',
              background: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '4px',
              color: '#38bdf8',
              fontWeight: 600,
            }}
          >
            Director Control Plane • Kathmandu
          </span>
        </header>

        {/* Specialized Workbenches Grid */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2
            style={{
              fontSize: '1rem',
              letterSpacing: '0.08em',
              color: '#cbd5e1',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Specialized Craft Workbenches
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            <Link
              href="/workshop/tailor"
              style={{
                textDecoration: 'none',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                transition: 'border-color 0.2s',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: '1.2rem' }}>✂️</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: '#0369a1',
                    color: '#ffffff',
                    fontWeight: 700,
                  }}
                >
                  TAILOR
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
                Denim Cutting Bench
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Bespoke waist, inseam, rise cuts and selvedge bolt yardage allocation.
              </p>
            </Link>

            <Link
              href="/workshop/jeweller"
              style={{
                textDecoration: 'none',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                transition: 'border-color 0.2s',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: '1.2rem' }}>💍</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: '#a16207',
                    color: '#ffffff',
                    fontWeight: 700,
                  }}
                >
                  JEWELLER
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
                Foundry & Metallurgy
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Precious metalsmithing, ring mandrel calibration, and hallmarking.
              </p>
            </Link>

            <Link
              href="/fulfillment"
              style={{
                textDecoration: 'none',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                transition: 'border-color 0.2s',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: '1.2rem' }}>📦</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: '#15803d',
                    color: '#ffffff',
                    fontWeight: 700,
                  }}
                >
                  FULFILLMENT
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>Dispatch Dock</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Protective cedar packaging, anti-tarnish jewel pouches, and international air
                waybills.
              </p>
            </Link>

            <Link
              href="/support"
              style={{
                textDecoration: 'none',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                transition: 'border-color 0.2s',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: '1.2rem' }}>🪡</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: '#7c3aed',
                    color: '#ffffff',
                    fontWeight: 700,
                  }}
                >
                  SUPPORT
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
                Customer Care Desk
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Post-cut alterations, ring re-sizing inquiries, and bespoke customer assistance.
              </p>
            </Link>
          </div>
        </section>

        {/* Manufacturing Pipeline Stages */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2
            style={{
              fontSize: '1rem',
              letterSpacing: '0.08em',
              color: '#cbd5e1',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Order Made Production Pipeline Stages
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '1rem',
            }}
          >
            {STAGES.map((stage, idx) => (
              <div
                key={stage}
                style={{
                  border: '1px solid #334155',
                  padding: '1rem',
                  borderRadius: '6px',
                  background: '#1e293b',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  STAGE {idx + 1}
                </div>
                <StatusBadge status={stage} variant="neutral" />
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                  0 active jobs
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Privileged Audit Trail (JN-127) */}
        <section
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #334155',
              paddingBottom: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '1.1rem',
                  letterSpacing: '0.05em',
                  color: '#f8fafc',
                  margin: 0,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Privileged Audit Trail (JN-127)
              </h2>
              <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                Append-only PostgreSQL audit log protected by Row-Level Security policies.
              </p>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                background: '#047857',
                color: '#ecfdf5',
                fontWeight: 700,
              }}
            >
              RLS Enforced: Append-Only
            </span>
          </div>

          {recentLogs.length === 0 ? (
            <div
              style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}
            >
              No audit records currently found. Use the simulator below to author a verified
              privileged event.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid #334155',
                      textAlign: 'left',
                      color: '#94a3b8',
                    }}
                  >
                    <th style={{ padding: '0.75rem' }}>TIMESTAMP</th>
                    <th style={{ padding: '0.75rem' }}>ROLE</th>
                    <th style={{ padding: '0.75rem' }}>ACTION</th>
                    <th style={{ padding: '0.75rem' }}>ENTITY</th>
                    <th style={{ padding: '0.75rem' }}>METADATA</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log, index) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom: '1px solid #2d3748',
                        color: '#e2e8f0',
                      }}
                    >
                      <td
                        style={{
                          padding: '0.75rem',
                          whiteSpace: 'nowrap',
                          color: '#94a3b8',
                          fontSize: '0.75rem',
                        }}
                      >
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.4rem',
                            borderRadius: '3px',
                            background: '#334155',
                            color: '#38bdf8',
                          }}
                        >
                          {log.actorRole}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>
                        {log.action}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>
                        {log.entityType} <span style={{ color: '#64748b' }}>[{log.entityId}]</span>
                      </td>
                      <td
                        style={{
                          padding: '0.75rem',
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          color: '#94a3b8',
                        }}
                      >
                        {log.payload ? JSON.stringify(log.payload) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <AuditActionTrigger />
        </section>
      </main>
    </div>
  );
}
