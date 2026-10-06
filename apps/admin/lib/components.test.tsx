import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { AdminButton } from '../components/admin-button';
import { AdminInput } from '../components/admin-input';

describe('Admin Operations Components (JN-133 & JN-134)', () => {
  describe('JN-133: AdminButton Component', () => {
    it('renders tactical bench action button with monospace typography', () => {
      const html = renderToString(<AdminButton variant="bench">CONFIRM CUT TICKET</AdminButton>);
      assert.ok(html.includes('CONFIRM CUT TICKET'));
      assert.ok(html.includes('var(--bg-bench, #1e293b)'));
      assert.ok(html.includes('var(--font-mono, monospace)'));
      assert.ok(html.includes('var(--radius-none, 0px)'));
    });

    it('renders telemetry cyan variant and shortcut badge', () => {
      const html = renderToString(
        <AdminButton variant="telemetry" shortcut="ENTER">
          DISPATCH TO TAILOR
        </AdminButton>,
      );
      assert.ok(html.includes('DISPATCH TO TAILOR'));
      assert.ok(html.includes('var(--color-telemetry, #38bdf8)'));
      assert.ok(html.includes('<kbd'));
      assert.ok(html.includes('ENTER'));
    });

    it('renders hazard and QC variants', () => {
      const hazardHtml = renderToString(<AdminButton variant="hazard">ABORT RUN</AdminButton>);
      assert.ok(hazardHtml.includes('ABORT RUN'));
      assert.ok(hazardHtml.includes('var(--border-hazard, #ef4444)'));

      const qcHtml = renderToString(<AdminButton variant="qc">APPROVE QC</AdminButton>);
      assert.ok(qcHtml.includes('APPROVE QC'));
      assert.ok(qcHtml.includes('#10b981'));
    });

    it('renders loading spinner and disabled state', () => {
      const html = renderToString(<AdminButton loading>SAVING</AdminButton>);
      assert.ok(html.includes('aria-busy="true"'));
      assert.ok(html.includes('disabled=""'));
    });
  });

  describe('JN-134: AdminInput Component', () => {
    it('renders dense telemetry input with unit tag', () => {
      const html = renderToString(
        <AdminInput label="Denim Weight" defaultValue="14.5" unitTag="OZ" shortcut="^W" />,
      );
      assert.ok(html.includes('Denim Weight'));
      assert.ok(html.includes('value="14.5"'));
      assert.ok(html.includes('>OZ<'));
      assert.ok(html.includes('^W'));
      assert.ok(html.includes('var(--bg-terminal, #0b0f19)'));
    });

    it('renders hazard red border and error alert', () => {
      const html = renderToString(
        <AdminInput label="Bolt Length" error="Bolt allocation exceeds remaining yardage" />,
      );
      assert.ok(html.includes('role="alert"'));
      assert.ok(html.includes('Bolt allocation exceeds remaining yardage'));
      assert.ok(html.includes('var(--border-hazard, #ef4444)'));
    });
  });
});
