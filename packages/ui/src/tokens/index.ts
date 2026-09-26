/**
 * @jeanius/ui design tokens
 * Minimalist, restrained raw-denim aesthetic: indigo, natural selvedge ecru, deep charcoal, muted warm gray.
 */
export const tokens = {
  colors: {
    indigoDark: '#121826',
    indigoDeep: '#1e293b',
    rawDenim: '#243048',
    selvedgeRed: '#b91c1c',
    ecru: '#fdfbf7',
    canvas: '#f8fafc',
    borderLight: '#e2e8f0',
    borderDark: '#334155',
    textPrimary: '#0f172a',
    textMuted: '#64748b',
    surfaceOverlay: 'rgba(18, 24, 38, 0.6)',
  },
  typography: {
    fontSans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontMono: '"JetBrains Mono", Menlo, Monaco, Consolas, monospace',
  },
  radii: {
    none: '0px',
    sm: '2px',
    md: '4px',
    lg: '8px',
  },
} as const;
