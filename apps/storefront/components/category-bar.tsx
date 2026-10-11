'use client';

import React from 'react';
import type { CategoryCountDto } from '@jeanius/contracts';

export type CategoryKey = 'ALL' | 'BOTTOMS' | 'TOPS' | 'JEWELLERY' | 'ACCESSORIES';

export interface CategoryBarProps {
  readonly activeCategory: CategoryKey;
  readonly categoryCounts: readonly CategoryCountDto[];
  readonly totalAllCount?: number;
  readonly onSelectCategory: (category: CategoryKey) => void;
  readonly className?: string;
}

interface CategoryOption {
  readonly key: CategoryKey;
  readonly label: string;
  readonly craftSubtitle: string;
}

const CATEGORIES: readonly CategoryOption[] = [
  { key: 'ALL', label: 'All Pieces', craftSubtitle: 'Kathmandu Workshop' },
  { key: 'BOTTOMS', label: 'Bottoms', craftSubtitle: 'Kurabo & Kuroki Raw Denim' },
  { key: 'TOPS', label: 'Tops', craftSubtitle: 'Type II Jackets & Overshirts' },
  { key: 'JEWELLERY', label: 'Jewellery', craftSubtitle: '.925 Silver & Solid Brass' },
  { key: 'ACCESSORIES', label: 'Accessories', craftSubtitle: 'Tochigi Bridle Leather' },
];

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

  return (
    <nav aria-label="Product categories" className={`catalog-category-bar ${className}`}>
      <div role="tablist" aria-orientation="horizontal" className="catalog-category-list">
        {CATEGORIES.map((cat) => {
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
