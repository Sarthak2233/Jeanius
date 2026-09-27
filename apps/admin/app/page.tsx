import { StatusBadge } from '@jeanius/ui';
import type { ProductionStage } from '@jeanius/domain';

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

export default function AdminDashboardPage() {
  return (
    <div style={{ padding: '2.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ borderBottom: '1px solid #334155', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', letterSpacing: '0.05em', margin: 0 }}>
              JEANIUS WORKSHOP OPERATIONS
            </h1>
            <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
              Order Made Manufacturing Pipeline & DROP Inventory Orchestration
            </p>
          </div>
          <span style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem', background: '#1e293b', border: '1px solid #475569', borderRadius: '4px', color: '#38bdf8' }}>
            Kathmandu Workshop Rail
          </span>
        </div>
      </header>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', letterSpacing: '0.05em', color: '#cbd5e1', marginBottom: '1rem', textTransform: 'uppercase' }}>
          Order Made Production Pipeline Stages
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          {STAGES.map((stage, idx) => (
            <div
              key={stage}
              style={{
                border: '1px solid #334155',
                padding: '1rem',
                borderRadius: '4px',
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
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                0 active jobs
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
