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
  BOTTOMS: {
    title: 'Bespoke Raw Selvedge Denim Jeans & Trousers | Jeanius & Jewl',
    description:
      'Explore hand-cut raw Japanese selvedge denim from Kurabo & Kuroki Mills. Tailored to your exact anatomical measurements on Union Special 43200G machines.',
  },
  TOPS: {
    title: 'Bespoke Denim Jackets & Artisanal Overshirts | Jeanius & Jewl',
    description:
      'Discover Type II raw denim jackets and rope-dyed western overshirts crafted with knife pleats and vintage hardware in Kathmandu.',
  },
  JEWELLERY: {
    title: 'Hand-Forged Sterling Silver & Brass Jewellery | Jeanius & Jewl',
    description:
      'Talismanic .925 sterling silver signet rings, hand-forged raw brass cuffs, and heavy curb denim wallet chains cast by master metalsmiths.',
  },
  ACCESSORIES: {
    title: 'Tochigi Bridle Leather Belts & Silver Slides | Jeanius & Jewl',
    description:
      'Vegetable-tanned Japanese bridle leather belts with hand-cast solid brass buckles and engraved silver bandana slides.',
  },
  ALL: {
    title: 'Atelier Catalog — Raw Selvedge Denim & Artisanal Jewellery | Jeanius & Jewl',
    description:
      'Discover the complete Jeanius & Jewl collection: order-made Japanese selvedge denim and hand-crafted artisanal jewellery from our Kathmandu workshop.',
  },
};

export async function generateMetadata(props: ShopPageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const categoryKey = searchParams.category?.toUpperCase() || 'ALL';
  const seo = CATEGORY_SEO_MAP[categoryKey] ?? {
    title: 'Atelier Catalog — Raw Selvedge Denim & Artisanal Jewellery | Jeanius & Jewl',
    description:
      'Discover the complete Jeanius & Jewl collection: order-made Japanese selvedge denim and hand-crafted artisanal jewellery from our Kathmandu workshop.',
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
      siteName: 'Jeanius & Jewl Atelier',
      type: 'website',
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'}/storage/v1/object/public/product-media/products/lot-001-straight-selvedge/primary.png`,
          width: 600,
          height: 750,
          alt: 'Jeanius & Jewl Atelier Collection',
        },
      ],
    },
  };
}

export default async function ShopPage(props: ShopPageProps) {
  const searchParams = await props.searchParams;

  const category = (searchParams.category?.toUpperCase() || 'ALL') as
    'ALL' | 'BOTTOMS' | 'TOPS' | 'JEWELLERY' | 'ACCESSORIES';
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
    categoryCounts: [
      { category: 'BOTTOMS', count: 0 },
      { category: 'TOPS', count: 0 },
      { category: 'JEWELLERY', count: 0 },
      { category: 'ACCESSORIES', count: 0 },
    ],
    selectedCategory: 'ALL',
    selectedCommerceModel: 'OM',
    selectedSort: 'FEATURED',
  };

  // Fetch cross-craft companion recommendations if single category filtered
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
      ? 'Order-Made Atelier Collection'
      : category === 'BOTTOMS'
        ? 'Bespoke Raw Selvedge Denim Bottoms'
        : category === 'TOPS'
          ? 'Bespoke Denim Jackets & Overshirts'
          : category === 'JEWELLERY'
            ? 'Hand-Cast Silver & Brass Jewellery'
            : 'Bridle Leather & Silver Accessories';

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
            Kathmandu Workshop Bespoke Queue
          </div>

          <h1 className="catalog-title">{categoryTitle}</h1>

          <p className="catalog-manifesto">
            Every garment and jewel in our Order-Made collection is created with intentional
            slowness. Tailored from uncut Japanese raw selvedge bolts and cast precious metals to
            your exact anatomical measurements on vintage Union Special machines.
          </p>

          {/* Bespoke Queue Legend & Drop Vault Gateway */}
          <div className="catalog-legend-group">
            <div className="catalog-legend-badge catalog-legend-om">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706' }} />
              <span>
                <strong>OM:</strong> 14–21 Day Bespoke Cutting Table Queue
              </span>
            </div>
            <Link
              href="/drop"
              className="catalog-legend-badge catalog-legend-drop"
              style={{ textDecoration: 'none', cursor: 'pointer' }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb' }} />
              <span>
                <strong>DROP:</strong> Ready to Ship Editions (Members Only 🔒) →
              </span>
            </Link>
          </div>
        </header>

        {/* Interactive Catalog Component */}
        <Suspense
          fallback={
            <div
              style={{
                padding: '6rem 0',
                textAlign: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)',
              }}
            >
              Loading atelier collections...
            </div>
          }
        >
          <ShopCatalogClient initialData={catalogData} />
        </Suspense>

        {/* Related Products Companion Rail (JN-177) */}
        {companionProducts.length > 0 && (
          <aside style={{ marginTop: '5rem' }}>
            <RelatedProducts products={companionProducts} />
          </aside>
        )}
      </main>
    </div>
  );
}
