import React from 'react';
import type { Metadata } from 'next';
import { ContentPageTemplate } from '../../components/content-page-template';
import { createStorefrontMetadata } from '../../lib/metadata';

export const metadata: Metadata = createStorefrontMetadata({
  title: 'Bespoke & Returns Policy — The Atelier Guarantee',
  description:
    'Details on our Order-Made fit guarantee, alteration terms, and lifetime repair covenants.',
});

export default function ReturnsPage() {
  return (
    <ContentPageTemplate
      slug="returns"
      eyebrow="GUARANTEE &amp; ALTERATIONS"
      fallbackTitle="Bespoke &amp; Made-To-Order Policy"
    />
  );
}
