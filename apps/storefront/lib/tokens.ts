/**
 * @jeanius/storefront design system tokens
 * Strongly-typed constants mirroring CSS custom properties in globals.css.
 */

export const storefrontTokens = {
  typography: {
    fonts: {
      serif: "'Playfair Display', 'Instrument Serif', 'Newsreader', 'Lyon Text', Georgia, serif",
      sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      mono: "'JetBrains Mono', 'SF Mono', Menlo, Monaco, Consolas, monospace",
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      md: '1.125rem',
      lg: '1.25rem',
      xl: '1.5rem',
      '2xl': '2rem',
      '3xl': '2.5rem',
      hero: 'clamp(2.25rem, 5vw, 3.75rem)',
    },
    tracking: {
      tighter: '-0.04em',
      tight: '-0.02em',
      normal: '0em',
      wide: '0.05em',
      widest: '0.15em',
    },
    leading: {
      none: '1',
      tight: '1.1',
      snug: '1.35',
      normal: '1.6',
      relaxed: '1.75',
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  colors: {
    bg: {
      canvas: '#fdfbf7',
      surface: '#ffffff',
      elevated: '#faf8f4',
      dark: '#0f172a',
      overlay: 'rgba(15, 23, 42, 0.65)',
    },
    text: {
      primary: '#0f172a',
      secondary: '#334155',
      muted: '#64748b',
      subtle: '#94a3b8',
      inverse: '#fdfbf7',
      onDark: '#f8fafc',
    },
    indigo: {
      dark: '#121826',
      deep: '#1e293b',
      raw: '#243048',
    },
    craft: {
      selvedgeRed: '#b91c1c',
      selvedgeRedSubtle: '#fef2f2',
      brass: '#d97706',
      brassDark: '#92400e',
      brassSubtle: '#fffbeb',
      silver: '#94a3b8',
      silverLight: '#f1f5f9',
    },
    status: {
      om: {
        bg: '#fffbeb',
        text: '#92400e',
        border: '#d97706',
      },
      drop: {
        bg: '#eff6ff',
        text: '#1e40af',
        border: '#3b82f6',
      },
      success: {
        bg: '#ecfdf5',
        text: '#065f46',
        border: '#10b981',
      },
      neutral: {
        bg: '#f8fafc',
        text: '#334155',
        border: '#cbd5e1',
      },
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
    16: '64px',
    20: '80px',
    24: '96px',
    32: '128px',
  },
  borders: {
    hairline: '1px solid var(--border-subtle, #e2e8f0)',
    default: '1px solid var(--border-default, #cbd5e1)',
    strong: '1px solid var(--border-strong, #94a3b8)',
    dark: '1px solid var(--border-dark, #334155)',
  },
  radii: {
    none: '0px',
    sm: '2px',
    md: '4px',
    lg: '8px',
    pill: '9999px',
  },
  motion: {
    durations: {
      micro: '150ms',
      normal: '200ms',
      reveal: '250ms',
    },
    easings: {
      outCubic: 'cubic-bezier(0.16, 1, 0.3, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
} as const;

export type StorefrontTokens = typeof storefrontTokens;
