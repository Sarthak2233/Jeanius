import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storefrontTokens } from './tokens';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Storefront Design System Tokens (JN-128 → JN-132)', () => {
  it('JN-128: defines typography scales, fonts, and line heights', () => {
    assert.ok(storefrontTokens.typography.fonts.serif.includes('Playfair Display'));
    assert.ok(storefrontTokens.typography.fonts.sans.includes('Inter'));
    assert.ok(storefrontTokens.typography.fonts.mono.includes('JetBrains Mono'));

    assert.equal(storefrontTokens.typography.sizes.xs, '0.75rem');
    assert.equal(storefrontTokens.typography.sizes.base, '1rem');
    assert.equal(storefrontTokens.typography.sizes['2xl'], '2rem');
    assert.ok(storefrontTokens.typography.sizes.hero.includes('clamp'));

    assert.equal(storefrontTokens.typography.leading.tight, '1.1');
    assert.equal(storefrontTokens.typography.tracking.tight, '-0.02em');
  });

  it('JN-129: defines neutral atelier color tokens and craft accents', () => {
    assert.equal(storefrontTokens.colors.bg.canvas, '#fdfbf7');
    assert.equal(storefrontTokens.colors.text.primary, '#0f172a');
    assert.equal(storefrontTokens.colors.craft.selvedgeRed, '#b91c1c');
    assert.equal(storefrontTokens.colors.craft.brass, '#d97706');
    assert.equal(storefrontTokens.colors.indigo.dark, '#121826');

    // Semantic status pairs
    assert.equal(storefrontTokens.colors.status.om.text, '#92400e');
    assert.equal(storefrontTokens.colors.status.drop.text, '#1e40af');
    assert.equal(storefrontTokens.colors.status.success.text, '#065f46');
  });

  it('JN-130: defines 8px modular spacing rhythm and container bounds', () => {
    assert.equal(storefrontTokens.spacing[1], '4px');
    assert.equal(storefrontTokens.spacing[2], '8px');
    assert.equal(storefrontTokens.spacing[4], '16px');
    assert.equal(storefrontTokens.spacing[8], '32px');
    assert.equal(storefrontTokens.spacing[16], '64px');
  });

  it('JN-131: defines thin editorial borders and radii', () => {
    assert.ok(storefrontTokens.borders.hairline.includes('1px solid'));
    assert.equal(storefrontTokens.radii.sm, '2px');
    assert.equal(storefrontTokens.radii.md, '4px');
    assert.equal(storefrontTokens.radii.pill, '9999px');
  });

  it('JN-132: defines motion tokens obeying the 150ms-250ms rule', () => {
    assert.equal(storefrontTokens.motion.durations.micro, '150ms');
    assert.equal(storefrontTokens.motion.durations.normal, '200ms');
    assert.equal(storefrontTokens.motion.durations.reveal, '250ms');
    assert.ok(storefrontTokens.motion.easings.outCubic.includes('cubic-bezier'));
  });

  it('verifies globals.css includes CSS variables and prefers-reduced-motion override', () => {
    const cssPath = path.resolve(__dirname, '../app/globals.css');
    assert.ok(fs.existsSync(cssPath), 'globals.css must exist');

    const cssContent = fs.readFileSync(cssPath, 'utf8');
    assert.ok(cssContent.includes('--color-bg-canvas: #fdfbf7;'));
    assert.ok(cssContent.includes('--font-serif:'));
    assert.ok(cssContent.includes('--border-width-hairline: 1px;'));
    assert.ok(cssContent.includes('--duration-micro: 150ms;'));
    assert.ok(cssContent.includes('@media (prefers-reduced-motion: reduce)'));
    assert.ok(cssContent.includes('animation-duration: 0.01ms !important;'));
  });
});
