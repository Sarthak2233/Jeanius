import React from 'react';
import type { Metadata } from 'next';
import { AdminNav } from '../../components/admin-nav';
import { ContentWorkbenchClient } from './content-workbench-client';
import {
  listAllContentPagesAction,
  listAllAnnouncementsAction,
} from '../../actions/content.actions';

export const metadata: Metadata = {
  title: 'Atelier Content & CMS Workbench — Jeanius Console',
  description: 'Manage storytelling pages, sizing guides, and operational announcements.',
};

export default async function AdminContentPage() {
  const [pagesResult, annResult] = await Promise.all([
    listAllContentPagesAction(),
    listAllAnnouncementsAction(),
  ]);

  const pages = pagesResult.success && pagesResult.data ? pagesResult.data : [];
  const announcements = annResult.success && annResult.data ? annResult.data : [];

  return (
    <div style={{ backgroundColor: '#0b0f19', minHeight: '100vh', color: '#f8fafc' }}>
      <AdminNav currentBench="CMS" />
      <ContentWorkbenchClient initialPages={pages} initialAnnouncements={announcements} />
    </div>
  );
}
