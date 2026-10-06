import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jeanius.studio';
const DEFAULT_TITLE = 'Jeanius & Jewl — Handmade Denim & Jewellery Studio';
const DEFAULT_DESCRIPTION =
  'Precision handmade selvedge denim craftsmanship and bespoke sterling silver jewellery. Order-Made (OM) & Limited Drop collections from our Kathmandu & Seoul ateliers.';

export const defaultStorefrontMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: '%s | Jeanius & Jewl',
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    'handmade denim',
    'selvedge denim',
    'bespoke jewellery',
    'order-made',
    'sterling silver 925',
    'raw denim',
    'artisan atelier',
    'Kathmandu denim',
    'Seoul jewellery',
  ],
  authors: [{ name: 'Jeanius & Jewl Atelier Studio' }],
  creator: 'Jeanius & Jewl',
  publisher: 'Jeanius & Jewl',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Jeanius & Jewl',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Jeanius & Jewl Atelier — Raw Selvedge Denim & Sterling Silver Jewellery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    creator: '@jeanius_jewl',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

/**
 * Creates page-specific metadata with consistent defaults.
 */
export function createStorefrontMetadata(overrides: Partial<Metadata> = {}): Metadata {
  return {
    ...defaultStorefrontMetadata,
    ...overrides,
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
