import React from 'react';
import type { Metadata } from 'next';
import { createStorefrontMetadata } from '../../lib/metadata';
import { CartView } from './cart-view';

export const metadata: Metadata = createStorefrontMetadata({
  title: 'Your Atelier Bag — Kathmandu Handcrafted Silver',
  description:
    'Review your bespoke Order-Made jewellery specifications, mandrel ring measurements, and numbered Drop allocations before checkout.',
});

export const dynamic = 'force-dynamic';

export default function CartPage() {
  return (
    <main
      style={{
        backgroundColor: 'var(--color-bg-canvas, #fdfbf7)',
        minHeight: '100vh',
      }}
    >
      <CartView />
    </main>
  );
}
