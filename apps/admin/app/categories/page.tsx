import React from 'react';
import type { Metadata } from 'next';
import { AdminNav } from '../../components/admin-nav';
import { CategoryManagementClient } from './category-management-client';
import { getCategoriesAction } from '../../actions/category.actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Jewellery Categories Workbench — Project 925 Console',
  description:
    'Manage .925 sterling silver jewellery categories and custom artisan classifications.',
};

export default async function AdminCategoriesPage() {
  const result = await getCategoriesAction();
  const categories = result.success && result.data ? result.data : [];

  return (
    <div style={{ backgroundColor: '#0b0f19', minHeight: '100vh', color: '#f8fafc' }}>
      <AdminNav currentBench="CATEGORIES" />
      <CategoryManagementClient initialCategories={categories} />
    </div>
  );
}
