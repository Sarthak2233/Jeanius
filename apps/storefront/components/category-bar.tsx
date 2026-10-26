'use client';

import React from 'react';
import type { CategoryCountDto } from '@jeanius/contracts';

export type CategoryKey = string;

export interface CategoryBarProps {
  readonly activeCategory: CategoryKey;
  readonly categoryCounts: readonly CategoryCountDto[];
  readonly totalAllCount?: number;
  readonly onSelectCategory: (category: CategoryKey) => void;
  readonly className?: string;
}

const CANONICAL_LABELS: Record<string, string> = {
  ALL: 'All Pieces',
  rings: 'Rings',
  'bracelets-cuffs': 'Bracelets & Cuffs',
  'necklaces-pendants': 'Necklaces & Pendants',
  earrings: 'Earrings',
  'chains-links': 'Chains & Links',
  artefacts: 'Artefacts',
  BOTTOMS: 'Bottoms',
  TOPS: 'Tops',
  JEWELLERY: 'Jewellery',
  ACCESSORIES: 'Accessories',
};

function formatLabel(slug: string): string {
  if (CANONICAL_LABELS[slug]) return CANONICAL_LABELS[slug];
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function CategoryBar({
  activeCategory,
  categoryCounts,
  totalAllCount,
  onSelectCategory,
  className = '',
}: CategoryBarProps) {
  const countMap = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const c of categoryCounts) {
      map.set(c.category, c.count);
    }
    return map;
  }, [categoryCounts]);

  const allCount = totalAllCount ?? categoryCounts.reduce((acc, curr) => acc + curr.count, 0);

  // Derive active category tabs dynamically from categoryCounts
  const categoriesToDisplay = React.useMemo(() => {
    if (categoryCounts.length > 0) {
      return [
        { key: 'ALL', label: 'All Pieces' },
        ...categoryCounts.map((c) => ({
          key: c.category,
          label: formatLabel(c.category),
        })),
      ];
    }
    // Fallback if no counts yet
    return [
      { key: 'ALL', label: 'All Pieces' },
      { key: 'rings', label: 'Rings' },
      { key: 'bracelets-cuffs', label: 'Bracelets & Cuffs' },
      { key: 'necklaces-pendants', label: 'Necklaces & Pendants' },
      { key: 'chains-links', label: 'Chains & Links' },
      { key: 'artefacts', label: 'Artefacts' },
    ];
  }, [categoryCounts]);

  return (
    <nav aria-label="Product categories" className={`catalog-category-bar ${className}`}>
      <div role="tablist" aria-orientation="horizontal" className="catalog-category-list">
        {categoriesToDisplay.map((cat) => {
          const isActive = activeCategory === cat.key;
          const count = cat.key === 'ALL' ? allCount : (countMap.get(cat.key) ?? 0);

          return (
            <button
              key={cat.key}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSelectCategory(cat.key)}
              className={`catalog-category-tab ${isActive ? 'active' : ''}`}
            >
              <span>{cat.label}</span>
              <span className="catalog-category-count">{count}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
