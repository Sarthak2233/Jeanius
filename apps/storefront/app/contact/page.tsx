import React from 'react';
import type { Metadata } from 'next';
import { getContentPageAction } from '../../actions/content.actions';
import { ContactClient } from './contact-client';
import { createStorefrontMetadata } from '../../lib/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const result = await getContentPageAction('contact');
  if (result.success && result.data) {
    return createStorefrontMetadata({
      title: `${result.data.title} — The Atelier Concierge`,
      description:
        result.data.metaDescription ||
        'Direct consultation with our tailoring cutters in Kathmandu and jewellery artisans.',
    });
  }
  return createStorefrontMetadata({
    title: 'Contact Studio Concierge',
    description:
      'Direct consultation with our tailoring cutters in Kathmandu and jewellery artisans.',
  });
}

export default async function ContactPage() {
  const result = await getContentPageAction('contact');
  const markdown = result.success ? result.data?.contentMarkdown : undefined;

  return <ContactClient pageMarkdown={markdown} />;
}
