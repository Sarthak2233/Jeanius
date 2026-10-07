import React from 'react';
import type { Metadata } from 'next';
import { getContentPageAction } from '../../actions/content.actions';
import { SizingStudioClient } from './sizing-studio-client';
import { createStorefrontMetadata } from '../../lib/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const result = await getContentPageAction('sizing');
  if (result.success && result.data) {
    return createStorefrontMetadata({
      title: `${result.data.title} — Modern Tailor System`,
      description:
        result.data.metaDescription ||
        'Precision sizing guide for raw Japanese selvedge denim (Points A–Q) and jewellery ring mandrel sizing charts.',
    });
  }
  return createStorefrontMetadata({
    title: 'Precision Sizing & Shrinkage Studio',
    description: 'Master guide to measuring raw selvedge denim and jewellery ring mandrel charts.',
  });
}

export default async function SizingPage() {
  const result = await getContentPageAction('sizing');
  const markdown = result.success ? result.data?.contentMarkdown : undefined;

  return <SizingStudioClient cmsMarkdown={markdown} />;
}
