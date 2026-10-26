import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { CatalogFilterCriteriaSchema, type ProductCardDto } from '@jeanius/contracts';
import { queryClient } from '@jeanius/database';
import { ProductCard } from '../components/product-card';
import { CategoryBar } from '../components/category-bar';
import { CatalogFilterBar } from '../components/catalog-filter-bar';
import { CatalogJsonLd } from '../components/catalog-jsonld';
import { getCatalogAction, getDropCatalogAction } from '../actions/catalog.actions';

describe('State 09: Product Catalog (JN-168 → JN-179)', () => {
  after(async () => {
    await queryClient.end();
  });
  const sampleProduct: ProductCardDto = {
    id: 'a0000000-0000-0000-0000-000000000001',
    slug: 'lot-001-straight-selvedge',
    title: 'Lot 001 — Straight Selvedge Raw Denim',
    description: '14oz Japanese Kurabo raw selvedge denim. Hand-cut in Kathmandu.',
    basePriceAmount: 28000,
    basePriceCurrency: 'USD',
    commerceModel: 'OM',
    category: 'BOTTOMS',
    status: 'PUBLISHED',
    primaryImage: {
      url: 'http://localhost:54321/storage/v1/object/public/product-media/products/lot-001/primary.png',
      altText: 'Lot 001 Primary',
      position: 0,
      isPrimary: true,
    },
    images: [],
  };

  describe('JN-168 & JN-169: ProductCard Presentation Component', () => {
    it('renders title, price, lead time notice, and OM status badge', () => {
      const html = renderToString(<ProductCard product={sampleProduct} />);

      assert.ok(html.includes('Lot 001 — Straight Selvedge Raw Denim'));
      assert.ok(html.includes('$280.00'));
      assert.ok(html.includes('ORDER-MADE'));
      assert.ok(html.includes('14–21 Day Silversmithing Bench Queue'));
      assert.ok(html.includes('href="/shop/lot-001-straight-selvedge"'));
      assert.ok(html.includes('Configure Piece'));
      assert.ok(html.includes('BOTTOMS'));
    });

    it('renders ready-to-ship notice for DROP products', () => {
      const dropProduct: ProductCardDto = {
        ...sampleProduct,
        id: 'a0000000-0000-0000-0000-000000000002',
        slug: 'lot-002-slim-tapered',
        commerceModel: 'DROP',
      };
      const html = renderToString(<ProductCard product={dropProduct} />);

      assert.ok(html.includes('LIMITED DROP'));
      assert.ok(html.includes('Ready to Dispatch (48h)'));
    });

    it('renders countdown pill for SCHEDULED products', () => {
      const scheduledProduct: ProductCardDto = {
        ...sampleProduct,
        id: 'a0000000-0000-0000-0000-000000000010',
        status: 'SCHEDULED',
      };
      const html = renderToString(<ProductCard product={scheduledProduct} />);

      assert.ok(html.includes('COUNTDOWN'));
      assert.ok(html.includes('Preview Only'));
    });
  });

  describe('JN-170: CategoryBar Tabbed Navigation', () => {
    it('renders all 4 canonical categories plus ALL with accurate counts', () => {
      const counts = [
        { category: 'BOTTOMS' as const, count: 4 },
        { category: 'TOPS' as const, count: 2 },
        { category: 'JEWELLERY' as const, count: 4 },
        { category: 'ACCESSORIES' as const, count: 2 },
      ];

      const html = renderToString(
        <CategoryBar
          activeCategory="BOTTOMS"
          categoryCounts={counts}
          totalAllCount={12}
          onSelectCategory={() => {}}
        />,
      );

      assert.ok(html.includes('All Pieces'));
      assert.ok(html.includes('Bottoms'));
      assert.ok(html.includes('Tops'));
      assert.ok(html.includes('Jewellery'));
      assert.ok(html.includes('Accessories'));
      assert.ok(html.includes('12')); // Total count
      assert.ok(html.includes('4')); // Bottoms count
    });
  });

  describe('JN-175 & JN-176: CatalogFilterBar Controls', () => {
    it('renders commerce model toggles and sort options', () => {
      const html = renderToString(
        <CatalogFilterBar
          selectedCommerceModel="OM"
          selectedSort="PRICE_ASC"
          searchQuery="Kurabo"
          onSelectCommerceModel={() => {}}
          onSelectSort={() => {}}
          onSearchChange={() => {}}
          onResetFilters={() => {}}
        />,
      );

      assert.ok(html.includes('Order-Made (OM)'));
      assert.ok(html.includes('Ready to Ship (DROP)'));
      assert.ok(html.includes('Price: Low to High'));
      assert.ok(html.includes('Kurabo'));
      assert.ok(html.includes('Clear Filters'));
    });

    it('hides commerce model toggles when showCommerceModelFilter is false', () => {
      const html = renderToString(
        <CatalogFilterBar
          selectedCommerceModel="OM"
          selectedSort="PRICE_ASC"
          searchQuery=""
          onSelectCommerceModel={() => {}}
          onSelectSort={() => {}}
          onSearchChange={() => {}}
          onResetFilters={() => {}}
          showCommerceModelFilter={false}
        />,
      );

      assert.ok(!html.includes('Order-Made (OM)'));
      assert.ok(!html.includes('Ready to Ship (DROP)'));
      assert.ok(html.includes('Price: Low to High'));
    });
  });

  describe('JN-173: Drop Access Gating & Model Segregation (Spec Section 23 & 42)', () => {
    it('rejects unauthenticated request for DROP catalog with UNAUTHORIZED', async () => {
      const result = await getCatalogAction({
        commerceModel: 'DROP',
      });

      assert.equal(result.success, false);
      assert.equal(result.error?.code, 'UNAUTHORIZED');
      assert.ok(result.error?.message.includes('registered members only'));
    });

    it('rejects unauthenticated request via getDropCatalogAction with UNAUTHORIZED', async () => {
      const result = await getDropCatalogAction();

      assert.equal(result.success, false);
      assert.equal(result.error?.code, 'UNAUTHORIZED');
    });

    it('forces commerceModel to OM for unauthenticated queries with ALL to prevent data leakage', async () => {
      const result = await getCatalogAction({
        commerceModel: 'ALL',
      });

      if (result.success && result.data) {
        // Every product returned to an unauthenticated caller must strictly be OM
        for (const product of result.data.products) {
          assert.equal(product.commerceModel, 'OM');
        }
      } else {
        assert.equal(result.error?.code, 'CATALOG_ERROR');
      }
    });
  });

  describe('JN-178 & JN-179: Catalog SEO & JSON-LD Structured Data', () => {
    it('generates valid Schema.org ItemList with nested products and prices', () => {
      const html = renderToString(
        <CatalogJsonLd products={[sampleProduct]} categoryName="Bottoms" />,
      );

      assert.ok(html.includes('application/ld+json'));
      assert.ok(html.includes('https://schema.org'));
      assert.ok(html.includes('ItemList'));
      assert.ok(html.includes('Lot 001 — Straight Selvedge Raw Denim'));
      assert.ok(html.includes('280.00'));
      assert.ok(html.includes('USD'));
      assert.ok(html.includes('https://schema.org/InStock'));
    });
  });

  describe('Contract Validation & Boundary Guard Clauses', () => {
    it('applies defaults for empty query criteria', () => {
      const parsed = CatalogFilterCriteriaSchema.parse({});
      assert.equal(parsed.category, 'ALL');
      assert.equal(parsed.commerceModel, 'ALL');
      assert.equal(parsed.sortBy, 'FEATURED');
      assert.equal(parsed.page, 1);
      assert.equal(parsed.pageSize, 12);
    });

    it('rejects invalid categories or sort options', () => {
      const result = CatalogFilterCriteriaSchema.safeParse({
        category: 'FOOTWEAR_INVALID',
      });
      assert.equal(result.success, false);
    });
  });
});
