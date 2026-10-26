'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductDetailDto } from '@jeanius/contracts';
import { useCartStore } from '../../../stores/cart-store';

export interface DropConfiguratorProps {
  readonly product: ProductDetailDto;
}

function useSafeRouter() {
  try {
    return useRouter();
  } catch {
    return null;
  }
}

export function DropConfigurator({ product }: DropConfiguratorProps) {
  const router = useSafeRouter();
  const addItemToCart = useCartStore((state) => state.addItem);

  // Initialize with first available variant or fallback
  const availableVariants = product.variants.filter((v) => v.inventoryCount > 0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    availableVariants[0]?.id ?? product.variants[0]?.id ?? '',
  );
  const [quantity, setQuantity] = useState<number>(1);

  const activeVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];
  const unitPrice = product.basePriceAmount + (activeVariant?.additionalPriceAmount ?? 0);
  const isSoldOut = !activeVariant || activeVariant.inventoryCount <= 0;

  const handleAddToBag = () => {
    if (isSoldOut) return;

    addItemToCart({
      productId: product.id,
      variantId: activeVariant?.id,
      sku: activeVariant?.sku ?? product.slug.toUpperCase(),
      title: product.title,
      slug: product.slug,
      commerceModel: 'DROP',
      unitPriceAmount: unitPrice,
      unitPriceCurrency: product.basePriceCurrency,
      selectedOptions: activeVariant?.options ?? {},
      imageUrl: product.primaryImage?.url,
      quantity,
    });
  };

  const handleBuyNow = () => {
    handleAddToBag();
    router?.push('/checkout');
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>
      {/* Batch Vault Telemetry */}
      <div
        style={{
          padding: '0.85rem 1rem',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.68rem',
              fontFamily: 'monospace',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#0284c7',
              display: 'block',
            }}
          >
            LIMITED DROP BATCH
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
            {isSoldOut
              ? 'Sold Out in Atelier Vault'
              : `Only ${activeVariant?.inventoryCount ?? 0} pieces in Kathmandu vault`}
          </span>
        </div>
        <span
          style={{
            fontSize: '0.72rem',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            backgroundColor: isSoldOut ? '#fee2e2' : '#ecfdf5',
            color: isSoldOut ? '#991b1b' : '#065f46',
            fontWeight: 600,
            fontFamily: 'monospace',
          }}
        >
          {isSoldOut ? 'VAULT DEPLETED' : 'READY TO SHIP'}
        </span>
      </div>

      {/* Price */}
      <div style={{ marginBottom: '1.5rem' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono, monospace)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#64748b',
            display: 'block',
            marginBottom: '0.25rem',
          }}
        >
          PRE-MANUFACTURED PRICE
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '2rem',
              fontWeight: 600,
              fontFamily: 'var(--font-serif, "Playfair Display", serif)',
              color: '#0f172a',
            }}
          >
            ${(unitPrice / 100).toFixed(2)}
          </span>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontFamily: 'monospace' }}>
            {product.basePriceCurrency}
          </span>
        </div>
      </div>

      {/* Physical Variant Selection */}
      {product.variants.length > 1 && (
        <div style={{ marginBottom: '1.75rem' }}>
          <label
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#0f172a',
              display: 'block',
              marginBottom: '0.5rem',
            }}
          >
            Select Ready-to-Ship Variant
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {product.variants.map((v) => {
              const optionLabels = Object.entries(v.options)
                .map(([k, val]) => `${k.replace('_', ' ')}: ${val.replace('_', ' ')}`)
                .join(' • ');
              const isSelected = v.id === selectedVariantId;
              const hasStock = v.inventoryCount > 0;

              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={!hasStock}
                  onClick={() => setSelectedVariantId(v.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    border: isSelected ? '2px solid #0f172a' : '1px solid #cbd5e1',
                    borderRadius: '4px',
                    backgroundColor: isSelected ? '#fafafa' : '#ffffff',
                    cursor: hasStock ? 'pointer' : 'not-allowed',
                    opacity: hasStock ? 1 : 0.45,
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <div
                      style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize' }}
                    >
                      {optionLabels}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>
                      SKU: {v.sku}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      ${((product.basePriceAmount + v.additionalPriceAmount) / 100).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: hasStock ? '#059669' : '#dc2626' }}>
                      {hasStock ? `${v.inventoryCount} in stock` : 'Sold out'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>Quantity</span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
          }}
        >
          <button
            type="button"
            disabled={isSoldOut}
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            style={{
              width: '36px',
              height: '36px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            −
          </button>
          <span
            style={{ width: '36px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 600 }}
          >
            {quantity}
          </span>
          <button
            type="button"
            disabled={isSoldOut}
            onClick={() => setQuantity(Math.min(activeVariant?.inventoryCount ?? 1, quantity + 1))}
            style={{
              width: '36px',
              height: '36px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Dispatch Notice */}
      <div
        style={{
          padding: '0.85rem',
          backgroundColor: '#f1f5f9',
          borderRadius: '4px',
          marginBottom: '1.5rem',
          fontSize: '0.78rem',
          color: '#475569',
          lineHeight: 1.5,
        }}
      >
        <strong>DHL Express Worldwide Dispatch:</strong> Ships in 24–48 hours from the Kathmandu
        workshop. Accompanied by official Customs Commercial Export Invoice (HS Code 7113.11).
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button
          type="button"
          disabled={isSoldOut}
          onClick={handleAddToBag}
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: isSoldOut ? '#94a3b8' : '#0f172a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.9rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: isSoldOut ? 'not-allowed' : 'pointer',
          }}
        >
          {isSoldOut
            ? 'Vault Depleted'
            : `Add to Atelier Bag • $${((unitPrice * quantity) / 100).toFixed(2)}`}
        </button>

        {!isSoldOut && (
          <button
            type="button"
            onClick={handleBuyNow}
            style={{
              width: '100%',
              padding: '0.85rem',
              backgroundColor: 'transparent',
              color: '#0f172a',
              border: '1.5px solid #0f172a',
              borderRadius: '4px',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Buy Now
          </button>
        )}
      </div>
    </div>
  );
}
