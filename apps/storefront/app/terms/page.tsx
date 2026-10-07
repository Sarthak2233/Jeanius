import React from 'react';
import type { Metadata } from 'next';
import { ContentPageTemplate } from '../../components/content-page-template';
import { createStorefrontMetadata } from '../../lib/metadata';

export const metadata: Metadata = createStorefrontMetadata({
  title: 'Terms of Service — Atelier Contract',
  description:
    'Official commercial terms, production timelines, and agreements for Jeanius & Jewl clients.',
});

export default function TermsPage() {
  return (
    <ContentPageTemplate
      slug="terms"
      eyebrow="COMMERCIAL COVENANTS"
      fallbackTitle="Terms of Service &amp; Atelier Contract"
    />
  );
}
