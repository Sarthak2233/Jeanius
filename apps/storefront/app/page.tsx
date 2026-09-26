import { PriceDisplay, StatusBadge } from '@jeanius/ui';
import type { CommerceModel } from '@jeanius/domain';

export default function HomePage() {
  const model: CommerceModel = 'OM';

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', letterSpacing: '0.1em', margin: 0, textTransform: 'uppercase' }}>
          JEANIUS
        </h1>
        <p style={{ color: '#64748b', margin: '0.5rem 0 0 0', fontSize: '0.95rem' }}>
          Handmade Raw Denim & Made-to-Order Studio
        </p>
      </header>

      <section style={{ border: '1px solid #e2e8f0', padding: '2rem', borderRadius: '4px', background: '#fff' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
          <StatusBadge status={model} variant="om" />
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Order-Made Workflow Active</span>
        </div>
        <h2 style={{ fontSize: '1.5rem', marginTop: 0 }}>Lot 001 — Straight Raw Selvedge</h2>
        <p style={{ color: '#334155', lineHeight: 1.6 }}>
          14oz Japanese Kurabo denim cut and assembled by master artisans. Custom fit, waist, and inseam options available.
        </p>
        <div style={{ marginTop: '1.5rem', fontSize: '1.25rem' }}>
          <PriceDisplay amount={28000} currency="USD" />
        </div>
      </section>
    </div>
  );
}
