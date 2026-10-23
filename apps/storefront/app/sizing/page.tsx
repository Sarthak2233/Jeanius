import React from 'react';
import type { Metadata } from 'next';
import { getContentPageAction } from '../../actions/content.actions';
import { SizingStudioClient } from './sizing-studio-client';
import { createStorefrontMetadata } from '../../lib/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const result = await getContentPageAction('sizing');
  if (result.success && result.data) {
    return createStorefrontMetadata({
      title: `${result.data.title} — Bench Mandrel System`,
      description:
        result.data.metaDescription ||
        'Precision sizing guide for solid .925 sterling silver rings, cuff wrist gaps, and chain drape lengths.',
    });
  }
  return createStorefrontMetadata({
    title: 'Project 925 Sizing & Mandrel Studio',
    description:
      'Master guide to measuring solid .925 sterling silver rings, cuff wrist gaps, and chain drape lengths.',
  });
}

export default async function SizingPage() {
  return <SizingStudioClient />;
}
