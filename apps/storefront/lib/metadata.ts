import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://project925.studio';
const DEFAULT_TITLE = 'Project 925 — Kathmandu .925 Sterling Silver Atelier';
const DEFAULT_DESCRIPTION =
  'Bespoke hand-carved and lost-wax cast .925 sterling silver jewellery. Order-Made (OM) & Limited Drop collections from our Kathmandu workshop.';

export const defaultStorefrontMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: '%s | Project 925',
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    'solid sterling silver 925',
    'bespoke jewellery',
    'order-made',
    'Kathmandu silver',
    'lost-wax casting',
    'repoussé talisman',
    'artisan atelier',
    'signet ring',
    'hand-carved cuff',
    'Himalayan silversmithing',
  ],
  authors: [{ name: 'Project 925 Kathmandu Atelier' }],
  creator: 'Project 925',
  publisher: 'Project 925',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Project 925',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Project 925 Kathmandu Atelier — Solid .925 Sterling Silver Artisan Jewellery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    creator: '@project925_ktm',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export function createStorefrontMetadata(overrides: Partial<Metadata>): Metadata {
  return {
    ...defaultStorefrontMetadata,
    ...overrides,
    title: overrides.title
      ? typeof overrides.title === 'string'
        ? overrides.title
        : overrides.title
      : defaultStorefrontMetadata.title,
    openGraph: {
      ...defaultStorefrontMetadata.openGraph,
      ...overrides.openGraph,
    },
    twitter: {
      ...defaultStorefrontMetadata.twitter,
      ...overrides.twitter,
    },
  };
}
