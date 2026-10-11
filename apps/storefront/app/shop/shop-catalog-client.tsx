'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { CatalogPageDto, ProductSortOptionDto } from '@jeanius/contracts';
import { CategoryBar, type CategoryKey } from '../../components/category-bar';
import { CatalogFilterBar } from '../../components/catalog-filter-bar';
import { ProductCard } from '../../components/product-card';
import { EmptyState } from '../../components/empty-state';

export interface ShopCatalogClientProps {
  readonly initialData: CatalogPageDto;
}

export function ShopCatalogClient({ initialData }: ShopCatalogClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = React.useState<string>(searchParams.get('search') ?? '');

  // Sync state if URL changes externally
  React.useEffect(() => {
    setSearchQuery(searchParams.get('search') ?? '');
  }, [searchParams]);

  const updateFilters = React.useCallback(
    (updates: {
      category?: string;
      model?: string;
      sort?: string;
      search?: string;
      page?: number;
    }) => {
      const current = new URLSearchParams(searchParams.toString());

      if (updates.category !== undefined) {
        if (updates.category === 'ALL') current.delete('category');
        else current.set('category', updates.category);
        current.delete('page'); // reset page on category change
      }

      if (updates.model !== undefined) {
        if (updates.model === 'ALL') current.delete('model');
        else current.set('model', updates.model);
        current.delete('page');
      }

      if (updates.sort !== undefined) {
        if (updates.sort === 'FEATURED') current.delete('sort');
        else current.set('sort', updates.sort);
      }

      if (updates.search !== undefined) {
        if (!updates.search.trim()) current.delete('search');
        else current.set('search', updates.search.trim());
        current.delete('page');
      }

      if (updates.page !== undefined) {
        if (updates.page <= 1) current.delete('page');
        else current.set('page', updates.page.toString());
      }

      const queryString = current.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(targetUrl, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const handleCategorySelect = (category: CategoryKey) => {
    updateFilters({ category });
  };

  const handleCommerceModelSelect = (model: 'ALL' | 'OM' | 'DROP') => {
    updateFilters({ model });
  };

  const handleSortSelect = (sort: ProductSortOptionDto) => {
    updateFilters({ sort });
  };

  // Debounced search handling
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      updateFilters({ search: query });
    }, 350);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    router.push(pathname, { scroll: false });
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Category Navigation Bar */}
      <CategoryBar
        activeCategory={initialData.selectedCategory}
        categoryCounts={initialData.categoryCounts}
        totalAllCount={initialData.categoryCounts.reduce((acc, c) => acc + c.count, 0)}
        onSelectCategory={handleCategorySelect}
      />

      {/* Filter and Search Controls */}
      <CatalogFilterBar
        selectedCommerceModel="OM"
        selectedSort={initialData.selectedSort}
        searchQuery={searchQuery}
        onSelectCommerceModel={handleCommerceModelSelect}
        onSelectSort={handleSortSelect}
        onSearchChange={handleSearchChange}
        onResetFilters={handleResetFilters}
        showCommerceModelFilter={false}
      />

      {/* Telemetry Status Line */}
      <div className="catalog-telemetry">
        <div>
          Showing <strong>{initialData.products.length}</strong> of{' '}
          <strong>{initialData.totalCount}</strong> Order-Made bespoke pieces
        </div>
        {initialData.selectedCategory !== 'ALL' && (
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Filtered by: {initialData.selectedCategory}
          </span>
        )}
      </div>

      {/* Product Grid or Empty State */}
      {initialData.products.length === 0 ? (
        <div style={{ padding: '4rem 0' }}>
          <EmptyState
            title="No Atelier Pieces Found"
            description="No products match your selected category, filter criteria, or search keywords."
            actionLabel="Reset All Filters"
            onAction={handleResetFilters}
          />
        </div>
      ) : (
        <div className="catalog-grid">
          {initialData.products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {initialData.totalPages > 1 && (
        <nav aria-label="Pagination Navigation" className="catalog-pagination">
          <button
            type="button"
            disabled={initialData.page <= 1}
            onClick={() => updateFilters({ page: initialData.page - 1 })}
            className="catalog-page-btn"
          >
            ← Previous
          </button>

          <span className="catalog-page-label">
            Page {initialData.page} of {initialData.totalPages}
          </span>

          <button
            type="button"
            disabled={initialData.page >= initialData.totalPages}
            onClick={() => updateFilters({ page: initialData.page + 1 })}
            className="catalog-page-btn"
          >
            Next →
          </button>
        </nav>
      )}
    </div>
  );
}
