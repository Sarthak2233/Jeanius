'use client';

import React from 'react';
import Link from 'next/link';
import { PriceDisplay } from './price-display';

export interface CartSummaryProps {
  readonly subtotalAmount: number;
  readonly estimatedShippingAmount?: number;
  readonly grandTotalAmount?: number;
  readonly currency?: string;
  readonly hasUnavailableItems?: boolean;
  readonly isLoading?: boolean;
  readonly onCheckoutClick?: () => void;
  readonly checkoutHref?: string;
}

export function CartSummary({
  subtotalAmount,
  estimatedShippingAmount = subtotalAmount >= 30000 || subtotalAmount === 0 ? 0 : 2500,
  grandTotalAmount = subtotalAmount + estimatedShippingAmount,
  currency = 'USD',
  hasUnavailableItems = false,
  isLoading = false,
  onCheckoutClick,
  checkoutHref = '/checkout',
}: CartSummaryProps) {
  const FREE_SHIPPING_THRESHOLD = 30000; // $300 USD in cents
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotalAmount);
  const progressPercent = Math.min(
    100,
    Math.round((subtotalAmount / FREE_SHIPPING_THRESHOLD) * 100),
  );

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.75rem',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
          fontSize: '1.35rem',
          fontWeight: 700,
          color: '#0f172a',
          margin: '0 0 1.25rem 0',
          letterSpacing: '-0.02em',
          textTransform: 'uppercase',
        }}
      >
        Order Summary
      </h2>

      {/* Free Shipping Tier Meter */}
      <div
        style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '0.85rem 1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#334155',
            marginBottom: '0.5rem',
          }}
        >
          <span>
            {remainingForFreeShipping === 0
              ? '✓ Complimentary Global Express Unlocked'
              : `Add $${(remainingForFreeShipping / 100).toFixed(2)} for Free DHL Express`}
          </span>
          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{progressPercent}%</span>
        </div>
        <div
          style={{
            height: '6px',
            width: '100%',
            backgroundColor: '#e2e8f0',
            borderRadius: '999px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              backgroundColor: remainingForFreeShipping === 0 ? '#10b981' : '#0f172a',
              borderRadius: '999px',
              transition: 'width 250ms ease',
            }}
          />
        </div>
      </div>

      {/* Itemized Line Costs */}
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.9rem',
            color: '#475569',
          }}
        >
          <span>Bag Subtotal</span>
          <PriceDisplay amount={subtotalAmount} currency={currency} size="sm" />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.9rem',
            color: '#475569',
          }}
        >
          <span>Kathmandu Atelier Packaging</span>
          <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>
            Complimentary
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.9rem',
            color: '#475569',
          }}
        >
          <span>DHL International Express</span>
          {estimatedShippingAmount === 0 ? (
            <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>Free</span>
          ) : (
            <PriceDisplay amount={estimatedShippingAmount} currency={currency} size="sm" />
          )}
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '1rem 0' }} />

      {/* Grand Total */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '1.75rem',
        }}
      >
        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
          Estimated Total
        </span>
        <PriceDisplay amount={grandTotalAmount} currency={currency} size="lg" />
      </div>

      {/* Checkout Action */}
      {hasUnavailableItems ? (
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#991b1b',
            fontSize: '0.85rem',
            textAlign: 'center',
            marginBottom: '1rem',
          }}
        >
          Please remove out-of-stock items before proceeding to checkout.
        </div>
      ) : null}

      {onCheckoutClick ? (
        <button
          type="button"
          onClick={onCheckoutClick}
          disabled={hasUnavailableItems || isLoading || subtotalAmount === 0}
          style={{
            display: 'block',
            width: '100%',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            textAlign: 'center',
            padding: '0.95rem 1.5rem',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.95rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            border: 'none',
            cursor:
              hasUnavailableItems || isLoading || subtotalAmount === 0 ? 'not-allowed' : 'pointer',
            opacity: hasUnavailableItems || isLoading || subtotalAmount === 0 ? 0.6 : 1,
            transition: 'transform 150ms ease, opacity 150ms ease',
          }}
        >
          {isLoading ? 'Recalculating...' : 'Proceed to Checkout →'}
        </button>
      ) : (
        <Link
          href={hasUnavailableItems || subtotalAmount === 0 ? '#' : checkoutHref}
          style={{
            display: 'block',
            width: '100%',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            textAlign: 'center',
            padding: '0.95rem 1.5rem',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.95rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            pointerEvents: hasUnavailableItems || subtotalAmount === 0 ? 'none' : 'auto',
            opacity: hasUnavailableItems || subtotalAmount === 0 ? 0.6 : 1,
            boxSizing: 'border-box',
          }}
        >
          Proceed to Checkout →
        </Link>
      )}

      {/* Atelier Trust Badges */}
      <div
        style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          fontSize: '0.78rem',
          color: '#64748b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🛡️</span>
          <span>Solid .925 Sterling Silver Guarantee (Kathmandu Hallmark)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>✈️</span>
          <span>Direct Insured Air Courier with DHL Tracking</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>📦</span>
          <span>Handcrafted wooden heirloom box &amp; polishing kit included</span>
        </div>
      </div>
    </div>
  );
}
