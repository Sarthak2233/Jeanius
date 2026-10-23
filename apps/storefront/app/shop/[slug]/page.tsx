import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getProductDetailBySlugAction,
  getRelatedProductsAction,
} from '../../../actions/catalog.actions';
import { ProductDetailClient } from './product-detail-client';
import { ProductJsonLd } from '../../../components/product-jsonld';
import type { ProductCardDto } from '@jeanius/contracts';

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProductDetailBySlugAction(slug);

  if (!result.success || !result.data) {
    return {
      title: 'Piece Not Found | Project 925 Atelier',
      description:
        'The requested artisan piece could not be found in our Kathmandu workshop archive.',
    };
  }

  const product = result.data;
  const primaryImageUrl = product.primaryImage?.url ?? product.images[0]?.url;

  return {
    title: `${product.title} — Solid .925 Silver | Project 925`,
    description: product.description,
    openGraph: {
      title: `${product.title} | Project 925 Kathmandu Atelier`,
      description: product.description,
      images: primaryImageUrl ? [{ url: primaryImageUrl, alt: product.title }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} | Project 925`,
      description: product.description,
      images: primaryImageUrl ? [primaryImageUrl] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const result = await getProductDetailBySlugAction(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const product = result.data;

  // Retrieve curated companion craft pieces
  let relatedProducts: readonly ProductCardDto[] = [];
  const relatedResult = await getRelatedProductsAction(product.id, 4);
  if (relatedResult.success && relatedResult.data) {
    relatedProducts = relatedResult.data;
  }

  return (
    <>
      <ProductJsonLd product={product} />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
