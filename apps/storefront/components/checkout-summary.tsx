import React from 'react';
import type { CartItemDto } from '@jeanius/contracts';
import { PriceDisplay } from './price-display';

export interface CheckoutSummaryProps {
  readonly items: readonly CartItemDto[];
  readonly subtotalAmount: number;
  readonly shippingCostAmount: number;
  readonly currency?: string;
  readonly isFreeShipping?: boolean;
  readonly courierName?: string;
}

export function CheckoutSummary({
  items,
  subtotalAmount,
  shippingCostAmount,
  currency = 'USD',
  isFreeShipping = false,
  courierName = 'DHL Worldwide Express',
}: CheckoutSummaryProps) {
  const totalAmount = subtotalAmount + shippingCostAmount;

  return (
    <div className="rounded-xl border border-neutral-200/90 bg-white/90 p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
      <h3 className="font-serif text-lg font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
        Atelier Order Summary
      </h3>
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        Review piece specifications before confirming production.
      </p>

      {/* Item Line List */}
      <ul className="mt-6 divide-y divide-neutral-200/60 dark:divide-neutral-800" role="list">
        {items.map((item) => (
          <li key={item.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider ${
                      item.commerceModel === 'OM'
                        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                        : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}
                  >
                    {item.commerceModel === 'OM' ? 'Order-Made' : 'DROP'}
                  </span>
                  <span className="truncate font-medium text-neutral-900 dark:text-neutral-100">
                    {item.title}
                  </span>
                </div>

                {/* Configuration Options */}
                {Object.keys(item.selectedOptions).length > 0 && (
                  <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {Object.entries(item.selectedOptions)
                      .map(([key, val]) => `${key}: ${val}`)
                      .join(' · ')}
                  </p>
                )}

                {/* Bespoke Specifications */}
                {item.customSpecifications && (
                  <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-neutral-600 dark:text-neutral-400">
                    {Object.entries(item.customSpecifications).map(([k, v]) => (
                      <span
                        key={k}
                        className="rounded border border-neutral-200 px-1.5 py-0.5 font-mono dark:border-neutral-800"
                      >
                        {k}: {String(v)}
                      </span>
                    ))}
                  </div>
                )}

                <p className="mt-1 text-xs text-neutral-500">
                  Qty: {item.quantity} ×{' '}
                  <PriceDisplay amount={item.unitPriceAmount} currency={item.unitPriceCurrency} />
                </p>
              </div>

              <div className="shrink-0 text-right font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100">
                <PriceDisplay
                  amount={item.unitPriceAmount * item.quantity}
                  currency={item.unitPriceCurrency}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Financial Breakdown */}
      <div className="mt-6 space-y-3 border-t border-neutral-200/80 pt-5 text-sm dark:border-neutral-800">
        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
          <span>Bag Subtotal</span>
          <span className="font-mono text-neutral-900 dark:text-neutral-100">
            <PriceDisplay amount={subtotalAmount} currency={currency} />
          </span>
        </div>

        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
          <div>
            <span>Shipping & Courier</span>
            <p className="text-[11px] text-neutral-500">{courierName}</p>
          </div>
          <span className="font-mono text-neutral-900 dark:text-neutral-100">
            {isFreeShipping || shippingCostAmount === 0 ? (
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Complimentary
              </span>
            ) : (
              <PriceDisplay amount={shippingCostAmount} currency={currency} />
            )}
          </span>
        </div>

        <div className="flex items-baseline justify-between border-t border-neutral-200 pt-3 text-base font-medium text-neutral-900 dark:border-neutral-800 dark:text-neutral-100">
          <span>Total</span>
          <span className="font-mono text-lg font-bold">
            <PriceDisplay amount={totalAmount} currency={currency} />
          </span>
        </div>
      </div>
    </div>
  );
}
