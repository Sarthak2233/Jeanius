'use client';

import React from 'react';
import type { ProductDetailDto } from '@jeanius/contracts';
import { OrderMadeConfigurator } from './order-made-configurator';
import { DropConfigurator } from './drop-configurator';

export { OrderMadeConfigurator, DropConfigurator };

export interface ProductConfiguratorProps {
  readonly product: ProductDetailDto;
}

/**
 * ProductConfigurator delegates cleanly between:
 * 1. OrderMadeConfigurator (OM): Kathmandu artisan bench-crafted pieces with continuous inputs
 *    (ring quarter-sizing, wide-shank offset, custom wrist circumference, inside-band engraving, patina finish)
 * 2. DropConfigurator (DROP): Pre-manufactured limited batches with discrete variants and vault telemetry
 */
export function ProductConfigurator({ product }: ProductConfiguratorProps) {
  if (product.commerceModel === 'OM') {
    return <OrderMadeConfigurator product={product} />;
  }
  return <DropConfigurator product={product} />;
}
