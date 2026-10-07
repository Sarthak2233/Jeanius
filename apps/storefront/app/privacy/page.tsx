import React from 'react';
import type { Metadata } from 'next';
import { ContentPageTemplate } from '../../components/content-page-template';
import { createStorefrontMetadata } from '../../lib/metadata';

export const metadata: Metadata = createStorefrontMetadata({
  title: 'Privacy & Atelier Vault Security — Client Data Covenant',
  description:
    'Our commitment to protecting your anatomical measurements, privacy, and personal data.',
});

export default function PrivacyPage() {
  return (
    <ContentPageTemplate
      slug="privacy"
      eyebrow="ATELIER VAULT PRIVACY"
      fallbackTitle="Privacy &amp; Vault Security Policy"
    />
  );
}
