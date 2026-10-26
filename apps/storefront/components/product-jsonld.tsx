import React from 'react';
import type { ProductDetailDto } from '@jeanius/contracts';

export interface ProductJsonLdProps {
  readonly product: ProductDetailDto;
  readonly siteUrl?: string;
}

export function ProductJsonLd({ product, siteUrl = 'https://jeanius.co' }: ProductJsonLdProps) {
  const images =
    product.images.length > 0
      ? product.images.map((img) => img.url)
      : product.primaryImage
        ? [product.primaryImage.url]
        : [];

  const inStock = product.status === 'PUBLISHED';
  const isOM = product.commerceModel === 'OM';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: images,
    url: `${siteUrl}/shop/${product.slug}`,
    sku: product.slug.toUpperCase(),
    brand: {
      '@type': 'Brand',
      name: 'Project 925',
    },
    material: 'Solid .925 Sterling Silver',
    countryOfOrigin: {
      '@type': 'Country',
      name: 'Nepal',
    },
    category: product.category,
    offers: {
      '@type': 'Offer',
      price: (product.basePriceAmount / 100).toFixed(2),
      priceCurrency: product.basePriceCurrency,
      availability: isOM
        ? 'https://schema.org/PreOrder'
        : inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Project 925 Kathmandu Atelier',
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
