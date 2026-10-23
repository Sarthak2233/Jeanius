import React from 'react';
import type { Metadata } from 'next';
import { ContentPageTemplate } from '../../components/content-page-template';
import { createStorefrontMetadata } from '../../lib/metadata';

export const metadata: Metadata = createStorefrontMetadata({
  title: 'Project 925 Craft & Care Guide — The Sterling Silver Ritual',
  description:
    'Care rituals for cultivating natural oxidized patina on solid .925 sterling silver hardware and talismans.',
});

export default function GuidePage() {
  return (
    <ContentPageTemplate
      slug="guide"
      eyebrow="CRAFT &amp; PRESERVATION PROTOCOL"
      fallbackTitle="Sterling Silver Craft &amp; Care Guide"
    />
  );
}
