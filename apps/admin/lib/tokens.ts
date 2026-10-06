/**
 * @jeanius/admin design system tokens
 * Strongly-typed constants mirroring CSS custom properties in admin globals.css.
 */

export const adminTokens = {
  typography: {
    fonts: {
      mono: "'JetBrains Mono', 'SF Mono', Menlo, Monaco, Consolas, monospace",
      sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    sizes: {
      '2xs': '0.65rem',
      xs: '0.75rem',
      sm: '0.85rem',
      base: '0.95rem',
      lg: '1.15rem',
      xl: '1.4rem',
      '2xl': '1.75rem',
    },
    tracking: {
      mono: '0.05em',
      wide: '0.1em',
      tight: '-0.02em',
    },
    leading: {
      none: '1',
      tight: '1.2',
      normal: '1.45',
      relaxed: '1.6',
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 800,
    },
  },
  colors: {
    bg: {
      terminal: '#0b0f19',
      surface: '#121826',
      bench: '#1e293b',
      rowAlt: '#162032',
      overlay: 'rgba(11, 15, 25, 0.85)',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      muted: '#94a3b8',
      dim: '#64748b',
    },
    telemetry: {
      cyan: '#38bdf8',
      hazard: '#ef4444',
      craftOm: '#f59e0b',
      qcPass: '#10b981',
      jewelSilver: '#e2e8f0',
      neutral: '#64748b',
    },
  },
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
  },
  borders: {
    grid: '1px solid var(--border-grid, #334155)',
    active: '1px solid var(--border-active, #475569)',
    focus: '1px solid var(--border-focus, #38bdf8)',
    hazard: '1px solid var(--border-hazard, #ef4444)',
  },
  radii: {
    none: '0px',
    xs: '2px',
    sm: '4px',
    md: '6px',
  },
  motion: {
    durations: {
      instant: '100ms',
      fast: '150ms',
      normal: '200ms',
    },
    easings: {
      terminal: 'cubic-bezier(0, 0, 0.2, 1)',
      out: 'cubic-bezier(0.16, 1, 0.3, 1)',
    },
  },
} as const;

export type AdminTokens = typeof adminTokens;
