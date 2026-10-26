import React from 'react';

export interface CheckoutPolicyNoticeProps {
  readonly hasOmItems: boolean;
  readonly hasDropItems: boolean;
  readonly isMilitary?: boolean;
}

/**
 * Atelier Policy Disclosures (JN-228, JN-230, JN-231).
 * Clear separation of Order-Made artisan lead times vs DROP unworn return windows.
 */
export function CheckoutPolicyNotice({
  hasOmItems,
  hasDropItems,
  isMilitary,
}: CheckoutPolicyNoticeProps) {
  return (
    <aside
      aria-label="Atelier Policies & Shipping Disclosures"
      className="space-y-4 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-5 text-sm dark:border-neutral-800 dark:bg-neutral-900/40"
    >
      {/* APO / FPO Military Restriction Guard (JN-228) */}
      {isMilitary && (
        <div className="rounded-lg border border-amber-300 bg-amber-50/90 p-4 text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <span className="text-base" aria-hidden="true">
              ⚠️
            </span>
            <div>
              <p className="font-medium tracking-tight">Physical Civilian Address Required</p>
              <p className="mt-1 text-xs leading-relaxed opacity-90">
                International express couriers departing Nepal cannot deliver to APO/FPO/DPO
                military addresses. Please provide a civilian physical street address for customs
                clearance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* OM Artisan Production Lead Time (JN-230) */}
      {hasOmItems && (
        <div className="flex items-start gap-3">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-mono text-white dark:bg-neutral-100 dark:text-neutral-900"
            aria-hidden="true"
          >
            OM
          </span>
          <div>
            <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
              Order-Made Handcrafting Timeline
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
              Each bespoke piece is individually cast, stone-set, liver-of-sulfur patinated, and
              hand-buffed at our Kathmandu metalsmith workshop. Bench fabrication requires{' '}
              <strong className="text-neutral-900 dark:text-neutral-200">
                7 to 14 business days
              </strong>{' '}
              prior to DHL Worldwide Express courier dispatch (2–4 business days).
            </p>
          </div>
        </div>
      )}

      {/* DROP Unworn Inspection Policy (JN-231) */}
      {hasDropItems && (
        <div className="flex items-start gap-3 border-t border-neutral-200/60 pt-4 dark:border-neutral-800">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-mono text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
            aria-hidden="true"
          >
            RTW
          </span>
          <div>
            <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
              DROP Return & Inspection Policy
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
              Ready-to-wear archival drops ship within 1–2 business days. Items may be returned
              within{' '}
              <strong className="text-neutral-900 dark:text-neutral-200">5 calendar days</strong> of
              delivery, strictly provided that tamper-evident security tags remain intact and pieces
              are unworn in original wooden presentation boxes.
            </p>
          </div>
        </div>
      )}

      {/* Bespoke OM Final Sale Disclosure */}
      {hasOmItems && (
        <p className="border-t border-neutral-200/60 pt-3 text-[11px] leading-relaxed text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          <em>Note:</em> Bespoke Order-Made jewellery and custom-tailored selvedge denim crafted to
          individual client mandrel measurements are non-returnable once casting commences.
        </p>
      )}
    </aside>
  );
}
