import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { adminTokens } from './tokens';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Admin Workbench Design System Tokens (JN-128 → JN-132)', () => {
  it('JN-128: defines tactical telemetry monospace and sans typography', () => {
    assert.ok(adminTokens.typography.fonts.mono.includes('JetBrains Mono'));
    assert.ok(adminTokens.typography.fonts.sans.includes('Inter'));

    assert.equal(adminTokens.typography.sizes['2xs'], '0.65rem');
    assert.equal(adminTokens.typography.sizes.xs, '0.75rem');
    assert.equal(adminTokens.typography.sizes.base, '0.95rem');
    assert.equal(adminTokens.typography.sizes['2xl'], '1.75rem');

    assert.equal(adminTokens.typography.tracking.mono, '0.05em');
    assert.equal(adminTokens.typography.weights.black, 800);
  });

  it('JN-129: defines CRT dark slate substrates and telemetry functional signals', () => {
    assert.equal(adminTokens.colors.bg.terminal, '#0b0f19');
    assert.equal(adminTokens.colors.bg.surface, '#121826');
    assert.equal(adminTokens.colors.bg.bench, '#1e293b');
    assert.equal(adminTokens.colors.text.primary, '#f8fafc');

    // Telemetry signals
    assert.equal(adminTokens.colors.telemetry.cyan, '#38bdf8');
    assert.equal(adminTokens.colors.telemetry.hazard, '#ef4444');
    assert.equal(adminTokens.colors.telemetry.craftOm, '#f59e0b');
    assert.equal(adminTokens.colors.telemetry.qcPass, '#10b981');
  });

  it('JN-130: defines dense 4px spacing rhythm for operations workbench', () => {
    assert.equal(adminTokens.spacing[1], '4px');
    assert.equal(adminTokens.spacing[2], '8px');
    assert.equal(adminTokens.spacing[4], '16px');
    assert.equal(adminTokens.spacing[8], '32px');
  });

  it('JN-131: defines 1px division grid hairlines and industrial radii', () => {
    assert.ok(adminTokens.borders.grid.includes('1px solid'));
    assert.ok(adminTokens.borders.hazard.includes('#ef4444'));
    assert.equal(adminTokens.radii.xs, '2px');
    assert.equal(adminTokens.radii.sm, '4px');
  });

  it('JN-132: defines instantaneous telemetry motion tokens', () => {
    assert.equal(adminTokens.motion.durations.instant, '100ms');
    assert.equal(adminTokens.motion.durations.fast, '150ms');
    assert.ok(adminTokens.motion.easings.terminal.includes('cubic-bezier'));
  });

  it('verifies admin globals.css includes CSS variables and prefers-reduced-motion override', () => {
    const cssPath = path.resolve(__dirname, '../app/globals.css');
    assert.ok(fs.existsSync(cssPath), 'admin globals.css must exist');

    const cssContent = fs.readFileSync(cssPath, 'utf8');
    assert.ok(cssContent.includes('--bg-terminal: #0b0f19;'));
    assert.ok(cssContent.includes('--font-mono:'));
    assert.ok(cssContent.includes('--color-telemetry: #38bdf8;'));
    assert.ok(cssContent.includes('--border-grid: #334155;'));
    assert.ok(cssContent.includes('--duration-fast: 150ms;'));
    assert.ok(cssContent.includes('@media (prefers-reduced-motion: reduce)'));
    assert.ok(cssContent.includes('animation-duration: 0.01ms !important;'));
  });
});
