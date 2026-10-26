import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getOrderConfirmationAction } from '../../../actions/checkout.actions';
import { PriceDisplay } from '../../../components/price-display';

export const metadata: Metadata = {
  title: 'Order Confirmed | Jeanius & Jewl Atelier',
  description: 'Your order has been recorded in the Kathmandu Workshop production queue.',
};

interface ConfirmationPageProps {
  readonly searchParams: Promise<{
    readonly orderId?: string;
    readonly orderNumber?: string;
  }>;
}

export default async function OrderConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const params = await searchParams;
  const orderId = params.orderId;
  const orderNumber = params.orderNumber ?? 'JNS-CONFIRMED';

  let orderDetails = null;
  if (orderId) {
    const res = await getOrderConfirmationAction(orderId);
    if (res.success && res.data) {
      orderDetails = res.data;
    }
  }

  const isPendingPayment =
    orderDetails?.paymentStatus === 'PENDING' || orderDetails?.paymentStatus === 'INITIATED';

  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
      {/* Handcrafted Seal / Status Icon */}
      {isPendingPayment ? (
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          ⏳
        </div>
      ) : (
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          ✓
        </div>
      )}

      <h1 className="mt-6 font-serif text-3xl font-medium tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-100">
        {isPendingPayment ? 'Atelier Commission Recorded' : 'Atelier Order Confirmed'}
      </h1>
      <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
        {isPendingPayment
          ? 'Thank you for commissioning Project 925. Your bench ticket is recorded awaiting bank wire clearance.'
          : 'Thank you for commissioning Project 925. Your order has been allocated to the Kathmandu bench atelier.'}
      </p>

      {/* Order Badge Card */}
      <div className="mt-8 rounded-xl border border-neutral-200/80 bg-white/80 p-6 text-left shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-neutral-200/60 pb-4 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
              Order Reference
            </span>
            <p className="font-mono text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {orderDetails?.orderNumber ?? orderNumber}
            </p>
          </div>

          <div className="flex flex-wrap items-baseline gap-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                Payment Status
              </span>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    isPendingPayment ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                  }`}
                />
                <span
                  className={`font-mono text-xs font-semibold uppercase tracking-wider ${
                    isPendingPayment
                      ? 'text-amber-700 dark:text-amber-300'
                      : 'text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {isPendingPayment ? 'PENDING VERIFICATION' : 'SETTLED & PAID'}
                </span>
              </div>
            </div>

            {orderDetails && (
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                  Total
                </span>
                <p className="font-mono text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  <PriceDisplay
                    amount={orderDetails.totalAmount}
                    currency={orderDetails.currency}
                  />
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bank Voucher Notice for PENDING payment */}
        {isPendingPayment && (
          <div className="mt-5 rounded-lg border border-amber-200/70 bg-amber-50/60 p-4 text-xs dark:border-amber-900/40 dark:bg-amber-950/20">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-amber-900 dark:text-amber-200">
                Bank Transfer Voucher Recorded
              </span>
              {orderDetails?.voucherReference && (
                <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                  {orderDetails.voucherReference}
                </span>
              )}
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-amber-800 dark:text-amber-300/80">
              Our Kathmandu banking desk will verify wire clearance against your voucher reference.
              Your piece will advance to bench fabrication immediately once settled.
            </p>
            {orderId && (
              <div className="mt-2">
                <Link
                  href={`/checkout/bank-sim?orderId=${orderId}&orderNumber=${orderDetails?.orderNumber ?? orderNumber}`}
                  className="text-[11px] font-medium text-amber-900 underline hover:text-amber-700 dark:text-amber-200"
                >
                  Review or update wire reference in Bank Portal →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Timeline breakdown */}
        <div className="mt-6">
          <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-500">
            Fulfillment Journey
          </h3>
          <ol className="mt-4 space-y-4 border-l border-neutral-200 pl-4 text-xs dark:border-neutral-800">
            <li className="relative">
              <span
                className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ${
                  isPendingPayment ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                {isPendingPayment ? 'Awaiting Bank Clearance' : 'Commercial Payment Secured'}
              </p>
              <p className="text-neutral-500">
                {isPendingPayment
                  ? 'Wire transfer submitted with voucher code; order specification frozen.'
                  : 'Commercial payment secured; specification frozen.'}
              </p>
            </li>
            <li className="relative">
              <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                Workshop Bench Fabrication (7–14 days)
              </p>
              <p className="text-neutral-500">
                Casting, sizing mandrel calibration, liver of sulfur patina, and QC inspection.
              </p>
            </li>
            <li className="relative">
              <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                DHL Worldwide Express Dispatch (2–4 days)
              </p>
              <p className="text-neutral-500">
                Departing Kathmandu with civil export customs declaration (HS 6203.42).
              </p>
            </li>
          </ol>
        </div>

        {orderDetails?.shippingAddress && (
          <div className="mt-6 border-t border-neutral-200/60 pt-4 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
            <span className="font-medium text-neutral-900 dark:text-neutral-200">
              Delivery Destination:
            </span>{' '}
            {orderDetails.shippingAddress.fullName}, {orderDetails.shippingAddress.addressLine1},{' '}
            {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.country}
          </div>
        )}
      </div>

      <div className="mt-10 flex justify-center gap-4">
        <Link
          href="/shop"
          className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900"
        >
          Return to Atelier
        </Link>
        <Link
          href="/account"
          className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-6 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
        >
          View Account Orders
        </Link>
      </div>
    </main>
  );
}
