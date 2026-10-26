'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PriceDisplay } from '../../../components/price-display';
import {
  confirmBankTransferAction,
  simulateBankSettlementAction,
} from '../../../actions/payment.actions';

export interface BankSimulationViewProps {
  readonly paymentId: string;
  readonly orderId: string;
  readonly orderNumber: string;
  readonly amountUsd: number;
  readonly amountNpr: number;
  readonly currency: string;
  readonly initialVoucherRef: string;
  readonly bankInstructions: {
    readonly bankName: string;
    readonly swiftCode?: string;
    readonly beneficiaryName: string;
    readonly accountNumber: string;
    readonly branch: string;
    readonly notes: string;
  };
}

export function BankSimulationView({
  paymentId,
  orderId,
  orderNumber,
  amountUsd,
  amountNpr,
  currency,
  initialVoucherRef,
  bankInstructions,
}: BankSimulationViewProps) {
  const router = useRouter();

  const [voucherReference, setVoucherReference] = useState(initialVoucherRef);
  const [slipNotes, setSlipNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // QA simulation state
  const [qaStatus, setQaStatus] = useState<string | null>(null);
  const [qaLoading, setQaLoading] = useState(false);

  const handleCopyVoucher = () => {
    navigator.clipboard.writeText(voucherReference);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSubmitTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherReference.trim()) {
      setErrorMessage('Bank voucher reference code is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await confirmBankTransferAction({
      paymentId,
      voucherReference: voucherReference.trim(),
      notes: slipNotes.trim() || undefined,
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      router.push(res.data.confirmationUrl);
      return;
    }

    setErrorMessage(res.error?.message ?? 'Failed to confirm bank transfer. Please retry.');
  };

  const handleQaSimulate = async (action: 'SETTLE' | 'FAIL' | 'REFUND') => {
    setQaLoading(true);
    setQaStatus(null);

    const res = await simulateBankSettlementAction({
      paymentId,
      action,
      reason: `Manual test simulation: ${action}`,
    });

    setQaLoading(false);

    if (res.success && res.data) {
      setQaStatus(res.data.message);
      return;
    }

    setQaStatus(res.error?.message ?? 'QA action failed');
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Simulation Badge */}
      <div className="mb-6 flex items-center justify-between rounded-lg border border-amber-300/80 bg-amber-50/80 px-4 py-2.5 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-semibold uppercase tracking-wider">Passable Bank Simulation</span>
          <span className="hidden sm:inline">— Testing & Made-to-Order Bench Seam</span>
        </div>
        <span className="font-mono text-[11px] opacity-75">Status: PENDING on submission</span>
      </div>

      <div className="text-center sm:text-left">
        <h1 className="font-serif text-2xl font-medium tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-100">
          Kathmandu Workshop Bank Wire
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Transfer instructions for Order{' '}
          <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-200">
            {orderNumber}
          </span>
          . Please cite your reference upon wire transfer.
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4 text-xs text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
        >
          {errorMessage}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Wire Details & Dual Currency */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-xl border border-neutral-200/80 bg-white/80 p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
            <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-500">
              Transfer Amount Due (Dual Currency — {currency} Base)
            </h2>
            <div className="mt-3 flex flex-wrap items-baseline gap-6">
              <div>
                <span className="text-xs text-neutral-500">International Settlement:</span>
                <p className="font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  <PriceDisplay amount={amountUsd} currency="USD" />
                </p>
              </div>
              <div className="border-l border-neutral-200 pl-6 dark:border-neutral-800">
                <span className="text-xs text-neutral-500">Nepal Domestic Equivalent:</span>
                <p className="font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  <PriceDisplay amount={amountNpr} currency="NPR" />
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-neutral-200/60 pt-4 dark:border-neutral-800">
              <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                Beneficiary Banking Coordinates
              </h3>
              <dl className="mt-3 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Bank Name:</dt>
                  <dd className="font-medium text-neutral-900 dark:text-neutral-200">
                    {bankInstructions.bankName}
                  </dd>
                </div>
                {bankInstructions.swiftCode && (
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">SWIFT / BIC:</dt>
                    <dd className="font-mono font-medium text-neutral-900 dark:text-neutral-200">
                      {bankInstructions.swiftCode}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Beneficiary:</dt>
                  <dd className="font-medium text-neutral-900 dark:text-neutral-200">
                    {bankInstructions.beneficiaryName}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Account Number:</dt>
                  <dd className="font-mono font-semibold text-neutral-900 dark:text-neutral-200">
                    {bankInstructions.accountNumber}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Branch:</dt>
                  <dd className="text-neutral-700 dark:text-neutral-300">
                    {bankInstructions.branch}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-[11px] leading-relaxed text-neutral-500">
                {bankInstructions.notes}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Confirmation Submission Form */}
        <div className="space-y-6 lg:col-span-5">
          <form
            onSubmit={handleSubmitTransfer}
            className="rounded-xl border border-neutral-200/80 bg-white/80 p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50"
          >
            <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-500">
              Record Bank Voucher Reference
            </h2>
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
              Provide or verify your wire transfer reference code to link with your atelier order.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="voucherReference"
                    className="block text-xs font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    Voucher Reference Code
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyVoucher}
                    className="text-[11px] font-mono text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                  >
                    {isCopied ? 'Copied ✓' : 'Copy Code'}
                  </button>
                </div>
                <input
                  id="voucherReference"
                  type="text"
                  value={voucherReference}
                  onChange={(e) => setVoucherReference(e.target.value)}
                  required
                  className="mt-1.5 block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 font-mono text-sm text-neutral-900 transition focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div>
                <label
                  htmlFor="slipNotes"
                  className="block text-xs font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Transfer Notes / Remarks (Optional)
                </label>
                <textarea
                  id="slipNotes"
                  rows={3}
                  value={slipNotes}
                  onChange={(e) => setSlipNotes(e.target.value)}
                  placeholder="e.g. Wire initiated via Standard Chartered online banking"
                  className="mt-1.5 block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 transition focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition duration-200 active:scale-[0.98] hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
              >
                {isSubmitting ? 'Recording Transfer...' : 'Submit Bank Transfer to Atelier'}
              </button>
              <p className="mt-2 text-center text-[11px] text-neutral-500">
                Payment status will remain PENDING until bank clearance.
              </p>
            </div>
          </form>

          {/* QA Verification Controls */}
          <details className="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4 text-xs dark:border-neutral-800 dark:bg-neutral-900/30">
            <summary className="cursor-pointer font-mono font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200">
              QA Test Controls (State 14 Verification)
            </summary>
            <div className="mt-3 space-y-2 border-t border-neutral-200/60 pt-3 dark:border-neutral-800">
              <p className="text-[11px] text-neutral-500">
                Simulate post-pending state transitions for QA audit without leaving test portal:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  disabled={qaLoading}
                  onClick={() => handleQaSimulate('SETTLE')}
                  className="rounded border border-emerald-600 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-950/60 dark:text-emerald-300"
                >
                  Simulate Settlement (PAID)
                </button>
                <button
                  type="button"
                  disabled={qaLoading}
                  onClick={() => handleQaSimulate('FAIL')}
                  className="rounded border border-red-600 bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-800 hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/60 dark:text-red-300"
                >
                  Simulate Rejection (FAILED)
                </button>
                <button
                  type="button"
                  disabled={qaLoading}
                  onClick={() => handleQaSimulate('REFUND')}
                  className="rounded border border-neutral-600 bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-800 hover:bg-neutral-200 disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  Simulate Refund
                </button>
              </div>
              {qaStatus && (
                <p className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                  {qaStatus}
                </p>
              )}
            </div>
          </details>

          <div className="text-center">
            <Link
              href={`/checkout/confirmation?orderId=${orderId}&orderNumber=${orderNumber}`}
              className="text-xs text-neutral-500 hover:underline"
            >
              Skip directly to order confirmation →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
