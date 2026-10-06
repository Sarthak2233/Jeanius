import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { PriceDisplay } from '../components/price-display';
import { StatusBadge } from '../components/status-badge';
import { AdminModal } from '../components/admin-modal';
import { AdminDrawer } from '../components/admin-drawer';
import { AdminToastProvider } from '../components/admin-toast';
import { AdminSkeleton, AdminSpinner, AdminLoadingOverlay } from '../components/admin-loading';
import { AdminEmptyState } from '../components/admin-empty-state';
import { AdminErrorState } from '../components/admin-error-state';

describe('Admin Overlays, Feedback & Loading States (JN-138 → JN-143)', () => {
  describe('JN-138: Admin PriceDisplay', () => {
    it('renders telemetry and hazard variant styles', () => {
      const telemHtml = renderToString(<PriceDisplay amount={25000} variant="telemetry" />);
      assert.ok(telemHtml.includes('$250.00'));
      assert.ok(telemHtml.includes('var(--color-telemetry, #38bdf8)'));

      const hazardHtml = renderToString(<PriceDisplay amount={1500} delta variant="hazard" />);
      assert.ok(hazardHtml.includes('+$15.00'));
      assert.ok(hazardHtml.includes('var(--border-hazard, #ef4444)'));
    });
  });

  describe('JN-139: Admin StatusBadge with Stages', () => {
    it('renders 8-stage workshop production pipeline stages', () => {
      const cuttingHtml = renderToString(<StatusBadge status="CUTTING" variant="cutting" pulse />);
      assert.ok(cuttingHtml.includes('CUTTING'));
      assert.ok(cuttingHtml.includes('animation:pulse'));

      const qcHtml = renderToString(<StatusBadge status="QC" variant="qc" dot />);
      assert.ok(qcHtml.includes('QC'));
      assert.ok(qcHtml.includes('#10b981'));

      const readyHtml = renderToString(<StatusBadge status="READY" variant="ready" />);
      assert.ok(readyHtml.includes('READY'));
    });
  });

  describe('JN-140: Admin Modal and Drawer', () => {
    it('renders AdminModal with rigid 90-degree corners and <kbd>ESC</kbd>', () => {
      const html = renderToString(
        <AdminModal isOpen onClose={() => {}} title="Tailor Cutting Pattern">
          <div>Pattern #001</div>
        </AdminModal>,
      );
      assert.ok(html.includes('Tailor Cutting Pattern'));
      assert.ok(html.includes('ESC'));
      assert.ok(html.includes('var(--radius-none, 0px)'));
      assert.ok(html.includes('Pattern #001'));
    });

    it('renders AdminDrawer with slide animation and telemetry header', () => {
      const html = renderToString(
        <AdminDrawer isOpen onClose={() => {}} title="Bolt Inventory Stream">
          <div>Yardage remaining</div>
        </AdminDrawer>,
      );
      assert.ok(html.includes('Bolt Inventory Stream'));
      assert.ok(html.includes('role="dialog"'));
      assert.ok(html.includes('ESC'));
    });
  });

  describe('JN-141: Admin Toast Provider', () => {
    it('renders AdminToastProvider notification stack', () => {
      const html = renderToString(
        <AdminToastProvider>
          <div>Workshop Workbench</div>
        </AdminToastProvider>,
      );
      assert.ok(html.includes('Workshop Workbench'));
      assert.ok(html.includes('role="region"'));
      assert.ok(html.includes('System notifications'));
    });
  });

  describe('JN-142: Admin Loading States', () => {
    it('renders AdminSkeleton and AdminSpinner', () => {
      const skelHtml = renderToString(<AdminSkeleton height="1.5rem" />);
      assert.ok(skelHtml.includes('animation:shimmer'));
      assert.ok(skelHtml.includes('var(--bg-bench, #1e293b)'));

      const spinHtml = renderToString(<AdminSpinner label="ALLOCATING BOLT..." />);
      assert.ok(spinHtml.includes('role="status"'));
      assert.ok(spinHtml.includes('ALLOCATING BOLT...'));
    });

    it('renders AdminLoadingOverlay', () => {
      const html = renderToString(<AdminLoadingOverlay message="RUNNING AUDIT..." />);
      assert.ok(html.includes('role="status"'));
      assert.ok(html.includes('RUNNING AUDIT...'));
    });
  });

  describe('JN-143: Admin Empty and Error States', () => {
    it('renders AdminEmptyState with status telemetry', () => {
      const html = renderToString(
        <AdminEmptyState
          title="No Active Cut Tickets"
          description="Workshop queue is currently clear."
          code="QUEUE_IDLE"
        />,
      );
      assert.ok(html.includes('role="status"'));
      assert.ok(html.includes('[ STATUS // QUEUE_IDLE ]'));
      assert.ok(html.includes('No Active Cut Tickets'));
    });

    it('renders AdminErrorState with hazard border and retry action', () => {
      const html = renderToString(
        <AdminErrorState
          faultCode="FAULT_BOLT_DEPLETED"
          message="Selected bolt cannot satisfy required 3.25yd continuous cut."
          onRetry={() => {}}
        />,
      );
      assert.ok(html.includes('role="alert"'));
      assert.ok(html.includes('[ ALERT // FAULT_BOLT_DEPLETED ]'));
      assert.ok(html.includes('RETRY OPERATION'));
      assert.ok(html.includes('var(--border-hazard, #ef4444)'));
    });
  });
});
