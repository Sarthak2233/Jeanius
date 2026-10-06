import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { AdminModal } from '../components/admin-modal';
import { AdminDrawer } from '../components/admin-drawer';
import { AdminEmptyState } from '../components/admin-empty-state';
import { AdminErrorState } from '../components/admin-error-state';
import { AdminButton } from '../components/admin-button';
import { AdminInput } from '../components/admin-input';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

describe('Admin Telemetry Accessibility Audit (JN-144)', () => {
  describe('Dark Terminal Contrast Ratios', () => {
    it('primary phosphor text (#f8fafc) on terminal (#0b0f19) exceeds WCAG AAA (7:1)', () => {
      const ratio = getContrastRatio('#f8fafc', '#0b0f19');
      assert.ok(ratio >= 15.0, `Expected contrast >= 15.0, got ${ratio.toFixed(2)}`);
    });

    it('telemetry cyan (#38bdf8) on terminal (#0b0f19) exceeds WCAG AAA (7:1)', () => {
      const ratio = getContrastRatio('#38bdf8', '#0b0f19');
      assert.ok(ratio >= 8.0, `Expected contrast >= 8.0, got ${ratio.toFixed(2)}`);
    });

    it('QC pass green (#10b981) on terminal (#0b0f19) exceeds WCAG AAA (7:1)', () => {
      const ratio = getContrastRatio('#10b981', '#0b0f19');
      assert.ok(ratio >= 7.0, `Expected contrast >= 7.0, got ${ratio.toFixed(2)}`);
    });

    it('hazard red (#ef4444) on terminal (#0b0f19) exceeds WCAG AA (4.5:1)', () => {
      const ratio = getContrastRatio('#ef4444', '#0b0f19');
      assert.ok(ratio >= 4.5, `Expected contrast >= 4.5, got ${ratio.toFixed(2)}`);
    });
  });

  describe('Admin Keyboard Shortcuts and ARIA Roles', () => {
    it('renders <kbd> tags for mechanical terminal shortcuts', () => {
      const buttonHtml = renderToString(<AdminButton shortcut="ENTER">SUBMIT</AdminButton>);
      assert.ok(buttonHtml.includes('<kbd'));
      assert.ok(buttonHtml.includes('ENTER'));

      const inputHtml = renderToString(<AdminInput label="Length" shortcut="TAB" />);
      assert.ok(inputHtml.includes('<kbd'));
      assert.ok(inputHtml.includes('TAB'));
    });

    it('AdminModal and AdminDrawer declare role="dialog" and aria-modal', () => {
      const modalHtml = renderToString(
        <AdminModal isOpen onClose={() => {}} title="Cut Sheet">
          <div>Content</div>
        </AdminModal>,
      );
      assert.ok(modalHtml.includes('aria-modal="true"'));
      assert.ok(modalHtml.includes('aria-label="Close modal"'));

      const drawerHtml = renderToString(
        <AdminDrawer isOpen onClose={() => {}} title="Telemetry">
          <div>Content</div>
        </AdminDrawer>,
      );
      assert.ok(drawerHtml.includes('role="dialog"'));
      assert.ok(drawerHtml.includes('aria-modal="true"'));
    });

    it('AdminErrorState declares role="alert"', () => {
      const html = renderToString(<AdminErrorState message="Machine error" />);
      assert.ok(html.includes('role="alert"'));
    });

    it('AdminEmptyState declares role="status"', () => {
      const html = renderToString(
        <AdminEmptyState title="No Jobs" description="Queue is empty." />,
      );
      assert.ok(html.includes('role="status"'));
    });
  });

  describe('Admin Reduced Motion Compliance', () => {
    it('verifies admin globals.css contains prefers-reduced-motion overrides', () => {
      const globalsCssPath = path.resolve(__dirname, '../app/globals.css');
      const cssContent = fs.readFileSync(globalsCssPath, 'utf8');

      assert.ok(cssContent.includes('@media (prefers-reduced-motion: reduce)'));
      assert.ok(cssContent.includes('animation-duration: 0.01ms !important'));
    });
  });
});
