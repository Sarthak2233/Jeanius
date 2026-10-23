import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getCatalogAction, getRelatedProductsAction } from '../../actions/catalog.actions';
import { ShopCatalogClient } from './shop-catalog-client';
import { RelatedProducts } from '../../components/related-products';
import { CatalogJsonLd } from '../../components/catalog-jsonld';
import type { ProductCardDto } from '@jeanius/contracts';

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    model?: string;
    sort?: string;
    search?: string;
    page?: string;
  }>;
}

const CATEGORY_SEO_MAP: Record<string, { title: string; description: string }> = {
  rings: {
    title: 'Hand-Carved .925 Sterling Silver Rings | Project 925',
    description:
      'Explore hand-carved wax matrices cast in solid .925 sterling silver. Signets, talismanic bands, and comfort-fit rings tuned to exact mandrel measurements.',
  },
  'bracelets-cuffs': {
    title: 'Solid Silver Chiseled Cuffs & Heavy Bracelets | Project 925',
    description:
      'Forged from heavy triangular silver bar stock with sacred Newar chiseling and calibrated entrance wrist gaps at our Kathmandu workshop.',
  },
  'necklaces-pendants': {
    title: 'Talismanic Pendants & Sacred Amulets | Project 925',
    description:
      'Lost-wax cast sacred Nepalese deities, vajras, and repoussé amulets crafted in solid .925 silver with intentional shadow patina.',
  },
  'chains-links': {
    title: 'Solid Sterling Silver Chains & Hand-Drawn Links | Project 925',
    description:
      'Hand-linked curb, cable, and heavy talisman chains drawn from fine .925 silver wire with substantial fluid drape.',
  },
  artefacts: {
    title: 'Sacred Atelier Artefacts & Silversmith Objects | Project 925',
    description:
      'One-of-a-kind Kathmandu workshop sculptures, talismanic altar bells, and repoussé ritual objects in solid sterling silver.',
  },
  ALL: {
    title: 'Atelier Catalog — Handcrafted .925 Sterling Silver Jewellery | Project 925',
    description:
      'Discover the complete Project 925 collection: order-made .925 sterling silver rings, heavy cuffs, and sacred talismans from our Kathmandu workshop.',
  },
};

export async function generateMetadata(props: ShopPageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const categoryKey = searchParams.category?.toLowerCase() || 'ALL';
  const seo = CATEGORY_SEO_MAP[categoryKey] ?? {
    title: 'Atelier Catalog — Handcrafted .925 Sterling Silver Jewellery | Project 925',
    description:
      'Discover the complete Project 925 collection: order-made .925 sterling silver rings, heavy cuffs, and sacred talismans from our Kathmandu workshop.',
  };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const canonicalUrl =
    categoryKey === 'ALL' ? `${siteUrl}/shop` : `${siteUrl}/shop?category=${categoryKey}`;

  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: canonicalUrl,
      siteName: 'Project 925 Kathmandu Atelier',
      type: 'website',
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'}/storage/v1/object/public/product-media/products/lot-r01-vajra-signet-ring/primary.png`,
          width: 600,
          height: 600,
          alt: 'Project 925 Kathmandu Atelier Collection',
        },
      ],
    },
  };
}

export default async function ShopPage(props: ShopPageProps) {
  const searchParams = await props.searchParams;

  const category = searchParams.category || 'ALL';
  const sortBy = (searchParams.sort || 'FEATURED') as
    'FEATURED' | 'PRICE_ASC' | 'PRICE_DESC' | 'NEWEST' | 'TITLE_ASC';
  const searchQuery = searchParams.search || '';
  const page = parseInt(searchParams.page || '1', 10) || 1;

  // Dedicated Order-Made Catalog (JN-169, JN-172)
  const catalogResult = await getCatalogAction({
    category,
    commerceModel: 'OM',
    sortBy,
    searchQuery,
    page,
    pageSize: 12,
  });

  const catalogData = catalogResult.data ?? {
    products: [],
    totalCount: 0,
    page: 1,
    pageSize: 12,
    totalPages: 0,
    categoryCounts: [],
    selectedCategory: 'ALL',
    selectedCommerceModel: 'OM',
    selectedSort: 'FEATURED',
  };

  // Fetch companion recommendations if single category filtered
  let companionProducts: readonly ProductCardDto[] = [];
  if (category !== 'ALL' && catalogData.products.length > 0) {
    const firstProduct = catalogData.products[0];
    if (firstProduct) {
      const relatedResult = await getRelatedProductsAction(firstProduct.id, 4);
      if (relatedResult.success && relatedResult.data) {
        companionProducts = relatedResult.data;
      }
    }
  }

  const categoryTitle =
    category === 'ALL'
      ? 'Order-Made Jewellery Collection'
      : category === 'rings'
        ? 'Solid .925 Sterling Silver Rings'
        : category === 'bracelets-cuffs'
          ? 'Heavy Silver Cuffs & Bracelets'
          : category === 'necklaces-pendants'
            ? 'Talismanic Pendants & Sacred Amulets'
            : category === 'chains-links'
              ? 'Hand-Drawn Solid Silver Chains'
              : 'Atelier Artefacts & Sculptures';

  return (
    <div className="catalog-page">
      {/* Schema.org Structured Microdata (JN-179) */}
      <CatalogJsonLd
        products={catalogData.products}
        categoryName={categoryTitle}
        siteUrl={process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}
      />

      <main className="catalog-container">
        {/* Editorial Manifesto Header */}
        <header className="catalog-header">
          <div className="catalog-header-badge">
            <span className="catalog-pulse-dot" />
            Kathmandu Workshop Silversmithing Queue
          </div>

          <h1 className="catalog-title">{categoryTitle}</h1>

          <p className="catalog-manifesto">
            Every piece in our Order-Made collection is created with intentional slowness.
            Individually cast from molten .925 sterling silver grain to your exact mandrel and wrist
            calibrations at our Kathmandu workshop.
          </p>

          {/* Bespoke Queue Legend & Drop Vault Gateway */}
          <div className="catalog-legend-group">
            <div className="catalog-legend-badge catalog-legend-om">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706' }} />
              <span>
                <strong>OM:</strong> 10–18 Day Silversmithing Bench Queue
              </span>
            </div>
            <Link
              href="/drop"
              className="catalog-legend-badge catalog-legend-drop"
              style={{ textDecoration: 'none', cursor: 'pointer' }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669' }} />
              <span>
                <strong>LIMITED DROP:</strong> Ready to Dispatch (48h) →
              </span>
            </Link>
          </div>
        </header>

        {/* Dynamic Interactive Filter & Grid System */}
        <Suspense fallback={<div className="catalog-loading">Loading atelier works...</div>}>
          <ShopCatalogClient initialData={catalogData} />
        </Suspense>
        <p>Related Products Section</p>
        {/* Cross-Category Recommendations */}
        {companionProducts.length > 0 && (
          <aside className="catalog-companion-section">
            <RelatedProducts products={companionProducts} />
          </aside>
        )}
      </main>
    </div>
  );
}
