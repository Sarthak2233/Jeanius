import React from 'react';
import type { Metadata } from 'next';
import { ContentPageTemplate } from '../../components/content-page-template';
import { createStorefrontMetadata } from '../../lib/metadata';

export const metadata: Metadata = createStorefrontMetadata({
  title: 'Master Craft & Care Guide — The Denim & Silver Ritual',
  description:
    'Care rituals for raw Japanese selvedge denim and solid 925 sterling silver hardware.',
});

export default function GuidePage() {
  return (
    <ContentPageTemplate
      slug="guide"
      eyebrow="CRAFT &amp; PRESERVATION PROTOCOL"
      fallbackTitle="Master Craft &amp; Care Guide"
    />
  );
}
