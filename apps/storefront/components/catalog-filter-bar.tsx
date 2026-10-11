'use client';

import React from 'react';
import type { ProductSortOptionDto } from '@jeanius/contracts';

export interface CatalogFilterBarProps {
  readonly selectedCommerceModel: 'ALL' | 'OM' | 'DROP';
  readonly selectedSort: ProductSortOptionDto;
  readonly searchQuery: string;
  readonly onSelectCommerceModel: (model: 'ALL' | 'OM' | 'DROP') => void;
  readonly onSelectSort: (sort: ProductSortOptionDto) => void;
  readonly onSearchChange: (query: string) => void;
  readonly onResetFilters: () => void;
  readonly showCommerceModelFilter?: boolean;
  readonly className?: string;
}

const SORT_OPTIONS: readonly { readonly value: ProductSortOptionDto; readonly label: string }[] = [
  { value: 'FEATURED', label: 'Featured Atelier Order' },
  { value: 'PRICE_ASC', label: 'Price: Low to High' },
  { value: 'PRICE_DESC', label: 'Price: High to Low' },
  { value: 'NEWEST', label: 'Newest Releases' },
  { value: 'TITLE_ASC', label: 'Title: A to Z' },
];

export function CatalogFilterBar({
  selectedCommerceModel,
  selectedSort,
  searchQuery,
  onSelectCommerceModel,
  onSelectSort,
  onSearchChange,
  onResetFilters,
  showCommerceModelFilter = true,
  className = '',
}: CatalogFilterBarProps) {
  const hasActiveFilters =
    (showCommerceModelFilter && selectedCommerceModel !== 'ALL') || searchQuery.trim().length > 0;

  return (
    <div className={`catalog-toolbar ${className}`}>
      {/* Commerce Model Segmented Filter */}
      {showCommerceModelFilter && (
        <div className="catalog-segmented-group">
          <button
            type="button"
            onClick={() => onSelectCommerceModel('ALL')}
            className={`catalog-segmented-btn ${selectedCommerceModel === 'ALL' ? 'active' : ''}`}
          >
            All Pieces
          </button>
          <button
            type="button"
            onClick={() => onSelectCommerceModel('OM')}
            className={`catalog-segmented-btn ${selectedCommerceModel === 'OM' ? 'active-om' : ''}`}
          >
            Order-Made (OM)
          </button>
          <button
            type="button"
            onClick={() => onSelectCommerceModel('DROP')}
            className={`catalog-segmented-btn ${selectedCommerceModel === 'DROP' ? 'active-drop' : ''}`}
          >
            Ready to Ship (DROP)
          </button>
        </div>
      )}

      {/* Search & Sort Controls */}
      <div className="catalog-controls">
        {/* Search Input */}
        <div className="catalog-search-wrapper">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search lot, fabric, metal..."
            className="catalog-search-input"
          />
          <svg
            className="catalog-search-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Sort Select */}
        <div className="catalog-select-wrapper">
          <select
            value={selectedSort}
            onChange={(e) => onSelectSort(e.target.value as ProductSortOptionDto)}
            className="catalog-sort-select"
            aria-label="Sort products by"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="catalog-select-chevron">
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button type="button" onClick={onResetFilters} className="catalog-reset-link">
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
