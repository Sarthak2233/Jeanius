'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  useCartStore,
  selectCartItems,
  selectCartTotalCount,
  selectCartSubtotal,
} from '../../stores';
import { useCartHydrated } from '../../stores/use-hydrated';
import { PriceDisplay } from '../../components/price-display';
import { CartSummary } from '../../components/cart-summary';
import { EmptyState } from '../../components/empty-state';
import { validateAndRecalculateCartAction } from '../../actions/cart.actions';
import type { CartItemWarningDto } from '@jeanius/contracts';

export function CartView() {
  const isHydrated = useCartHydrated();
  const items = useCartStore(selectCartItems);
  const totalCount = useCartStore(selectCartTotalCount);
  const subtotal = useCartStore(selectCartSubtotal);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const setCartItems = useCartStore((state) => state.setCartItems);

  const [warnings, setWarnings] = useState<readonly CartItemWarningDto[]>([]);
  const [hasUnavailable, setHasUnavailable] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Validate cart against server-authoritative catalog prices and inventory on mount
  useEffect(() => {
    if (!isHydrated || items.length === 0) return;

    let isMounted = true;
    setIsValidating(true);

    validateAndRecalculateCartAction({ items })
      .then((res) => {
        if (!isMounted || !res.success || !res.data) return;

        setWarnings(res.data.warnings);
        setHasUnavailable(res.data.hasUnavailableItems);

        // If items were clamped or prices adjusted, synchronize store
        if (res.data.hasPriceChanges || res.data.warnings.length > 0) {
          setCartItems(res.data.items);
        }
      })
      .finally(() => {
        if (isMounted) setIsValidating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isHydrated, items.length, setCartItems]);

  if (!isHydrated) {
    return (
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '4rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ color: '#64748b', fontSize: '0.95rem' }}>Loading your atelier bag...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '5rem 1.5rem' }}>
        <EmptyState
          title="Your Atelier Bag is Empty"
          description="Every piece in our Kathmandu workshop is individually cast from pure .925 sterling silver grain. Explore bespoke made-to-order rings, talismans, and cuffs."
          actionLabel="EXPLORE ATELIER COLLECTION"
          actionHref="/shop"
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3.5rem 1.5rem' }}>
      {/* Editorial Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div
          style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono, monospace)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#64748b',
            marginBottom: '0.5rem',
          }}
        >
          Kathmandu Workshop Reservation
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 0.5rem 0',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}
        >
          Your Atelier Bag ({totalCount})
        </h1>
        <p style={{ color: '#475569', fontSize: '0.95rem', margin: 0 }}>
          Review your bespoke casting specifications and numbered vault allocations prior to
          checkout.
        </p>
      </div>

      {/* Validation Warnings Banner */}
      {warnings.length > 0 && (
        <div
          style={{
            backgroundColor: hasUnavailable ? '#fef2f2' : '#fffbeb',
            border: `1px solid ${hasUnavailable ? '#fca5a5' : '#fde68a'}`,
            borderRadius: '8px',
            padding: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              fontWeight: 600,
              color: hasUnavailable ? '#991b1b' : '#92400e',
              marginBottom: '0.5rem',
            }}
          >
            {hasUnavailable ? '⚠️ Inventory Update Required' : 'ℹ️ Atelier Catalog Update'}
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: '1.25rem',
              color: hasUnavailable ? '#b91c1c' : '#78350f',
              fontSize: '0.9rem',
            }}
          >
            {warnings.map((w, idx) => (
              <li key={idx} style={{ marginBottom: '0.25rem' }}>
                {w.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Two-Column Grid Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Line Items List */}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', gridColumn: 'span 2' }}
        >
          {items.map((item) => {
            const isOm = item.commerceModel === 'OM';
            const specs = item.customSpecifications as
              Record<string, string | number | boolean> | undefined;

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  padding: '1.75rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)',
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: '110px',
                    height: '110px',
                    position: 'relative',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#f1f5f9',
                    flexShrink: 0,
                  }}
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="110px"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      .925 SILVER
                    </div>
                  )}
                </div>

                {/* Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div>
                      <Link
                        href={`/shop/${item.slug}`}
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          textDecoration: 'none',
                          fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
                        }}
                      >
                        {item.title}
                      </Link>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                        SKU: {item.sku}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '1.25rem',
                        padding: '0.25rem',
                        lineHeight: 1,
                      }}
                      title="Remove item from bag"
                      aria-label={`Remove ${item.title}`}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Commerce Model Badge */}
                  <div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        backgroundColor: isOm ? '#eff6ff' : '#f0fdf4',
                        color: isOm ? '#1e40af' : '#166534',
                        border: `1px solid ${isOm ? '#bfdbfe' : '#bbf7d0'}`,
                      }}
                    >
                      {isOm
                        ? '⚒️ Bespoke Order-Made (7–14 days)'
                        : '⚡ Ready-to-Ship Drop Allocation'}
                    </span>
                  </div>

                  {/* Bespoke Specifications Bench Card */}
                  {specs && Object.keys(specs).length > 0 && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.75rem 1rem',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        color: '#334155',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '0.4rem',
                      }}
                    >
                      {Object.entries(specs).map(([key, val]) => (
                        <div key={key}>
                          <span style={{ color: '#64748b', textTransform: 'capitalize' }}>
                            {key.replace(/([A-Z])/g, ' $1')}:{' '}
                          </span>
                          <span style={{ fontWeight: 600 }}>{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Price and Quantity Stepper */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '1rem',
                      paddingTop: '0.85rem',
                      borderTop: '1px solid #f1f5f9',
                    }}
                  >
                    {/* Stepper */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        overflow: 'hidden',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        style={{
                          width: '32px',
                          height: '32px',
                          border: 'none',
                          backgroundColor: '#ffffff',
                          cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                          color: '#475569',
                          fontSize: '1rem',
                          fontWeight: 600,
                        }}
                      >
                        −
                      </button>
                      <span
                        style={{
                          width: '40px',
                          textAlign: 'center',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: '#0f172a',
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= 10}
                        style={{
                          width: '32px',
                          height: '32px',
                          border: 'none',
                          backgroundColor: '#ffffff',
                          cursor: item.quantity >= 10 ? 'not-allowed' : 'pointer',
                          color: '#475569',
                          fontSize: '1rem',
                          fontWeight: 600,
                        }}
                      >
                        +
                      </button>
                    </div>

                    {/* Line Total */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        <PriceDisplay
                          amount={item.unitPriceAmount}
                          currency={item.unitPriceCurrency}
                          size="sm"
                        />{' '}
                        each
                      </div>
                      <div style={{ fontWeight: 700, marginTop: '0.15rem' }}>
                        <PriceDisplay
                          amount={item.unitPriceAmount * item.quantity}
                          currency={item.unitPriceCurrency}
                          size="md"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Order Summary Card */}
        <div style={{ position: 'sticky', top: '2rem' }}>
          <CartSummary
            subtotalAmount={subtotal}
            currency="USD"
            hasUnavailableItems={hasUnavailable}
            isLoading={isValidating}
            checkoutHref="/checkout"
          />
        </div>
      </div>
    </div>
  );
}
