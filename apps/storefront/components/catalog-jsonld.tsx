import React from 'react';
import type { ProductCardDto } from '@jeanius/contracts';

export interface CatalogJsonLdProps {
  readonly products: readonly ProductCardDto[];
  readonly categoryName?: string;
  readonly siteUrl?: string;
}

export function CatalogJsonLd({
  products,
  categoryName = 'All Atelier Collections',
  siteUrl = 'https://jeanius.co',
}: CatalogJsonLdProps) {
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${categoryName} — Project 925 Kathmandu Atelier`,
    description:
      'Lost-wax cast and hand-carved .925 sterling silver jewellery crafted in our Kathmandu workshop.',
    itemListElement: products.map((product, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Product',
        name: product.title,
        description: product.description,
        image: product.primaryImage?.url || undefined,
        url: `${siteUrl}/shop/${product.slug}`,
        category: product.category,
        offers: {
          '@type': 'Offer',
          price: (product.basePriceAmount / 100).toFixed(2),
          priceCurrency: product.basePriceCurrency,
          availability:
            product.status === 'PUBLISHED'
              ? 'https://schema.org/InStock'
              : product.status === 'SOLD_OUT'
                ? 'https://schema.org/OutOfStock'
                : 'https://schema.org/PreOrder',
          itemCondition: 'https://schema.org/NewCondition',
        },
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
    />
  );
}
