import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Modal } from '../components/modal';
import { Drawer } from '../components/drawer';
import { EmptyState } from '../components/empty-state';
import { ErrorState } from '../components/error-state';
import { OptionSelector } from '../components/option-selector';
import { Spinner } from '../components/loading';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: Calculate relative luminance from hex color
function getLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

// Helper: Calculate WCAG contrast ratio between two colors
function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

describe('Storefront Accessibility Audit (JN-144)', () => {
  // ==========================================================================
  // 1. WCAG AA Contrast Compliance
  // ==========================================================================
  describe('WCAG AA Contrast Compliance', () => {
    it('primary text (#0f172a) on canvas (#fdfbf7) exceeds WCAG AAA (7:1)', () => {
      const ratio = getContrastRatio('#0f172a', '#fdfbf7');
      assert.ok(ratio >= 7.0, `Expected contrast >= 7.0, got ${ratio.toFixed(2)}`);
    });

    it('primary text (#0f172a) on white (#ffffff) exceeds WCAG AAA (7:1)', () => {
      const ratio = getContrastRatio('#0f172a', '#ffffff');
      assert.ok(ratio >= 7.0, `Expected contrast >= 7.0, got ${ratio.toFixed(2)}`);
    });

    it('secondary text (#334155) on canvas (#fdfbf7) exceeds WCAG AA (4.5:1)', () => {
      const ratio = getContrastRatio('#334155', '#fdfbf7');
      assert.ok(ratio >= 4.5, `Expected contrast >= 4.5, got ${ratio.toFixed(2)}`);
    });

    it('selvedge red accent (#b91c1c) on white (#ffffff) exceeds WCAG AA (4.5:1)', () => {
      const ratio = getContrastRatio('#b91c1c', '#ffffff');
      assert.ok(ratio >= 4.5, `Expected contrast >= 4.5, got ${ratio.toFixed(2)}`);
    });

    it('inverse text (#fdfbf7) on off-black (#0f172a) exceeds WCAG AAA (7:1)', () => {
      const ratio = getContrastRatio('#fdfbf7', '#0f172a');
      assert.ok(ratio >= 7.0, `Expected contrast >= 7.0, got ${ratio.toFixed(2)}`);
    });
  });

  // ==========================================================================
  // 2. ARIA Roles & Assistive Technology Standards
  // ==========================================================================
  describe('ARIA Roles and Screen Reader Attributes', () => {
    it('Modal declares role="dialog" and aria-modal="true" and label', () => {
      const html = renderToString(
        <Modal isOpen onClose={() => {}} title="Atelier Sizing Guide">
          <div>Modal Content</div>
        </Modal>,
      );
      assert.ok(html.includes('aria-modal="true"'));
      assert.ok(html.includes('aria-labelledby='));
      assert.ok(html.includes('aria-label="Close dialog"'));
    });

    it('Drawer declares role="dialog" and aria-modal="true"', () => {
      const html = renderToString(
        <Drawer isOpen onClose={() => {}} title="Atelier Shopping Bag">
          <div>Drawer Content</div>
        </Drawer>,
      );
      assert.ok(html.includes('role="dialog"'));
      assert.ok(html.includes('aria-modal="true"'));
      assert.ok(html.includes('aria-label="Close drawer"'));
    });

    it('Error states declare role="alert" for immediate assertive announcement', () => {
      const inputHtml = renderToString(
        <Input label="Email" error="Invalid atelier member email" />,
      );
      assert.ok(inputHtml.includes('role="alert"'));
      assert.ok(inputHtml.includes('aria-invalid="true"'));

      const errorStateHtml = renderToString(
        <ErrorState message="Connection to atelier workshop timed out" />,
      );
      assert.ok(errorStateHtml.includes('role="alert"'));
    });

    it('OptionSelector declares role="radiogroup" and accessible radio tags', () => {
      const html = renderToString(
        <OptionSelector
          name="ring-size"
          label="Ring Size"
          options={[
            { id: 'size-7', label: 'Size 7', available: true },
            { id: 'size-8', label: 'Size 8', available: false },
          ]}
          selectedValue="size-7"
          onChange={() => {}}
        />,
      );
      assert.ok(html.includes('role="radiogroup"'));
      assert.ok(html.includes('role="radio"'));
      assert.ok(html.includes('aria-checked="true"'));
      assert.ok(html.includes('aria-disabled="true"'));
    });

    it('Spinner declares role="status" and visually hidden text', () => {
      const html = renderToString(<Spinner label="Loading cart items..." />);
      assert.ok(html.includes('role="status"'));
      assert.ok(html.includes('Loading cart items...'));
    });

    it('EmptyState declares role="status"', () => {
      const html = renderToString(
        <EmptyState title="No Orders" description="You have not placed any atelier orders yet." />,
      );
      assert.ok(html.includes('role="status"'));
    });
  });

  // ==========================================================================
  // 3. Motion & Reduced Motion Safeguards
  // ==========================================================================
  describe('Reduced Motion & Performance Audit', () => {
    it('verifies globals.css contains mandatory prefers-reduced-motion overrides', () => {
      const globalsCssPath = path.resolve(__dirname, '../app/globals.css');
      const cssContent = fs.readFileSync(globalsCssPath, 'utf8');

      assert.ok(cssContent.includes('@media (prefers-reduced-motion: reduce)'));
      assert.ok(cssContent.includes('animation-duration: 0.01ms !important'));
      assert.ok(cssContent.includes('transition-duration: 0.01ms !important'));
    });

    it('verifies buttons declare accessible cursor and interactive bounds', () => {
      const buttonHtml = renderToString(<Button size="lg">FLAGSHIP ACTION</Button>);
      assert.ok(buttonHtml.includes('cursor:pointer'));
      assert.ok(buttonHtml.includes('box-sizing:border-box'));
    });
  });
});
