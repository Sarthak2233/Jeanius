import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { defaultStorefrontMetadata } from '../lib/metadata';
import { StorefrontHeader } from '../components/storefront-header';
import { StorefrontFooter } from '../components/storefront-footer';
import { AnnouncementBar } from '../components/announcement-bar';
import { SearchModal } from '../components/search-modal';
import { CartDrawer } from '../components/cart-drawer';
import { ToastProvider } from '../components/toast';

export const metadata: Metadata = defaultStorefrontMetadata;

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ToastProvider>
          {/* JN-156: Skip link for keyboard accessibility */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>

          {/* JN-154: Operational Announcement Bar */}
          <AnnouncementBar />

          {/* JN-147, JN-148, JN-155: Global Responsive Sticky Header */}
          <StorefrontHeader />

          {/* Main Landmark Area */}
          <main id="main-content" role="main" tabIndex={-1} style={{ outline: 'none' }}>
            {children}
          </main>

          {/* JN-150: Global Editorial Atelier Footer */}
          <StorefrontFooter />

          {/* Global Client Overlay Islands */}
          <SearchModal />
          <CartDrawer />
        </ToastProvider>
      </body>
    </html>
  );
}
