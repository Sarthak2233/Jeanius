'use client';

import React, { useState, useEffect, useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../stores';
import { CheckoutSummary } from '../../components/checkout-summary';
import { CheckoutPolicyNotice } from '../../components/checkout-policy-notice';
import {
  initiateCheckoutAction,
  validateShippingAddressAction,
} from '../../actions/checkout.actions';

export interface CheckoutViewProps {
  readonly initialEmail?: string;
  readonly initialName?: string;
}

const SUPPORTED_COUNTRIES = [
  { code: 'NP', name: 'Nepal (Domestic Express)' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'NO', name: 'Norway' },
  { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'KR', name: 'South Korea' },
];

export function CheckoutView({ initialEmail = '', initialName = '' }: CheckoutViewProps) {
  const router = useRouter();
  const idSeed = useId();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  // Flow step state: 1 = Address & Contact, 2 = Review & Confirm, 3 = Processing
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Customer contact & shipping form state
  const [formData, setFormData] = useState({
    customerEmail: initialEmail,
    fullName: initialName,
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateOrProvince: '',
    postalCode: '',
    country: 'US',
    phone: '',
  });

  // Client-generated idempotency key
  const [idempotencyKey, setIdempotencyKey] = useState('');
  useEffect(() => {
    setIdempotencyKey(`chk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  }, []);

  // Shipping calculation & address validation state
  const [shippingCost, setShippingCost] = useState(2500); // Default $25 flat international
  const [courierName, setCourierName] = useState('DHL Worldwide Express');
  const [isDeliverable, setIsDeliverable] = useState(true);
  const [isMilitary, setIsMilitary] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Review acceptance state
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [confirmedPriceChanges, setConfirmedPriceChanges] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<{ code?: string; message: string } | null>(
    null,
  );

  const subtotalAmount = items.reduce((sum, item) => sum + item.unitPriceAmount * item.quantity, 0);
  const hasOmItems = items.some((item) => item.commerceModel === 'OM');
  const hasDropItems = items.some((item) => item.commerceModel === 'DROP');

  // Trigger address validation on country or postal code change
  useEffect(() => {
    if (!formData.addressLine1 || !formData.city || !formData.postalCode) {
      return;
    }

    let isMounted = true;
    validateShippingAddressAction({
      address: formData,
      cartSubtotalCents: subtotalAmount,
      currency: 'USD',
    }).then((res) => {
      if (!isMounted) return;
      if (res.success && res.data) {
        setIsDeliverable(res.data.isDeliverable);
        setIsMilitary(res.data.isMilitary);
        setShippingCost(res.data.shippingCostAmount);
        setCourierName(res.data.courier);
        setAddressError(res.data.reason ?? null);
      } else {
        setAddressError(res.error?.message ?? 'Address validation error');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [formData.addressLine1, formData.city, formData.postalCode, formData.country, subtotalAmount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerEmail || !formData.fullName || !formData.addressLine1 || !formData.city) {
      setAddressError('Please fill in all mandatory delivery fields.');
      return;
    }
    if (!isDeliverable) {
      return;
    }
    setAddressError(null);
    setCurrentStep(2);
  };

  const handleInitiateOrder = async () => {
    setIsSubmitting(true);
    setCheckoutError(null);

    const res = await initiateCheckoutAction({
      cartId: '00000000-0000-0000-0000-000000000001', // Fallback or loaded cart id
      customerEmail: formData.customerEmail,
      shippingAddress: formData,
      idempotencyKey,
      confirmedPriceChanges,
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      clearCart();
      router.push(res.data.paymentUrl);
      return;
    }

    if (res.error) {
      setCheckoutError({
        code: res.error.code,
        message: res.error.message,
      });
      if (res.error.code === 'PRICE_DRIFT') {
        setConfirmedPriceChanges(true);
      }
    }
  };

  // Guard: Empty Bag
  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
          Your Atelier Bag is Empty
        </h1>
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          Select handcrafted jewellery or raw selvedge denim before proceeding to checkout.
        </p>
        <div className="mt-8">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900"
          >
            Explore Workshop Catalog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
      {/* Header & Steps Indicator */}
      <div className="mb-10 text-center">
        <h1 className="font-serif text-3xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
          Kathmandu Workshop Checkout
        </h1>
        <div className="mt-4 flex items-center justify-center gap-3 text-xs font-mono uppercase tracking-wider text-neutral-500">
          <span className={currentStep === 1 ? 'font-bold text-neutral-900 dark:text-white' : ''}>
            1. Delivery Address
          </span>
          <span>→</span>
          <span className={currentStep === 2 ? 'font-bold text-neutral-900 dark:text-white' : ''}>
            2. Atelier Review
          </span>
          <span>→</span>
          <span className={currentStep === 3 ? 'font-bold text-neutral-900 dark:text-white' : ''}>
            3. Confirmation
          </span>
        </div>
      </div>

      {/* Failure Recovery Error Banner (JN-239) */}
      {checkoutError && (
        <div
          role="alert"
          className="mb-8 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">Order Placement Notice</p>
              <p className="mt-1 text-xs opacity-90">{checkoutError.message}</p>
            </div>
            {checkoutError.code === 'PRICE_DRIFT' && (
              <button
                type="button"
                onClick={handleInitiateOrder}
                className="shrink-0 rounded bg-red-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-800 dark:bg-red-100 dark:text-red-900"
              >
                Accept Price & Retry
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Main Step Form / Review Area */}
        <div className="lg:col-span-7">
          {currentStep === 1 && (
            <form onSubmit={handleProceedToReview} className="space-y-6">
              <div className="rounded-xl border border-neutral-200/80 bg-white/80 p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
                <h2 className="font-serif text-xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
                  Customer & Shipping Details
                </h2>
                <p className="mt-1 text-xs text-neutral-500">
                  Required for international customs declaration (Nepal HS 6203.42).
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label
                      htmlFor={`${idSeed}-email`}
                      className="block text-xs font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      Contact Email *
                    </label>
                    <input
                      id={`${idSeed}-email`}
                      type="email"
                      name="customerEmail"
                      required
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      placeholder="client@atelier.com"
                      className="mt-1 block w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`${idSeed}-name`}
                      className="block text-xs font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      Recipient Full Name *
                    </label>
                    <input
                      id={`${idSeed}-name`}
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Jane Doe"
                      className="mt-1 block w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`${idSeed}-country`}
                        className="block text-xs font-medium text-neutral-700 dark:text-neutral-300"
                      >
                        Destination Country *
                      </label>
                      <select
                        id={`${idSeed}-country`}
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                      >
                        {SUPPORTED_COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor={`${idSeed}-phone`}
                        className="block text-xs font-medium text-neutral-700 dark:text-neutral-300"
                      >
                        Contact Phone (for Courier) *
                      </label>
                      <input
                        id={`${idSeed}-phone`}
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 555-019-2834"
                        className="mt-1 block w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor={`${idSeed}-line1`}
                      className="block text-xs font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      Physical Street Address *
                    </label>
                    <input
                      id={`${idSeed}-line1`}
                      type="text"
                      name="addressLine1"
                      required
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      placeholder="742 Evergreen Terrace (No PO / APO Boxes)"
                      className="mt-1 block w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`${idSeed}-line2`}
                      className="block text-xs font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      Apartment, Suite, Unit (Optional)
                    </label>
                    <input
                      id={`${idSeed}-line2`}
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleInputChange}
                      placeholder="Suite 4B"
                      className="mt-1 block w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label
                        htmlFor={`${idSeed}-city`}
                        className="block text-xs font-medium text-neutral-700 dark:text-neutral-300"
                      >
                        City *
                      </label>
                      <input
                        id={`${idSeed}-city`}
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Springfield"
                        className="mt-1 block w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`${idSeed}-state`}
                        className="block text-xs font-medium text-neutral-700 dark:text-neutral-300"
                      >
                        State / Province
                      </label>
                      <input
                        id={`${idSeed}-state`}
                        type="text"
                        name="stateOrProvince"
                        value={formData.stateOrProvince}
                        onChange={handleInputChange}
                        placeholder="OR"
                        className="mt-1 block w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`${idSeed}-postal`}
                        className="block text-xs font-medium text-neutral-700 dark:text-neutral-300"
                      >
                        Postal / ZIP Code *
                      </label>
                      <input
                        id={`${idSeed}-postal`}
                        type="text"
                        name="postalCode"
                        required
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="97477"
                        className="mt-1 block w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                      />
                    </div>
                  </div>
                </div>

                {addressError && (
                  <p className="mt-4 text-xs font-medium text-red-600 dark:text-red-400">
                    ⚠️ {addressError}
                  </p>
                )}

                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    disabled={!isDeliverable}
                    className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-7 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
                  >
                    Continue to Review
                  </button>
                </div>
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="rounded-xl border border-neutral-200/80 bg-white/80 p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
                <div className="flex items-center justify-between border-b border-neutral-200/70 pb-4 dark:border-neutral-800">
                  <h2 className="font-serif text-xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
                    Review Order & Deliverables
                  </h2>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-medium text-neutral-500 hover:text-neutral-900 underline dark:hover:text-neutral-200"
                  >
                    Edit Delivery Details
                  </button>
                </div>

                <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    Recipient: {formData.fullName} ({formData.customerEmail})
                  </p>
                  <p className="mt-1">
                    {formData.addressLine1}
                    {formData.addressLine2 ? `, ${formData.addressLine2}` : ''}
                  </p>
                  <p>
                    {formData.city}, {formData.stateOrProvince} {formData.postalCode},{' '}
                    {formData.country}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">Phone: {formData.phone}</p>
                </div>

                <div className="mt-6">
                  <CheckoutPolicyNotice
                    hasOmItems={hasOmItems}
                    hasDropItems={hasDropItems}
                    isMilitary={isMilitary}
                  />
                </div>

                <div className="mt-6 border-t border-neutral-200/70 pt-5 dark:border-neutral-800">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policyAccepted}
                      onChange={(e) => setPolicyAccepted(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-800"
                    />
                    <span className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
                      I have verified my bespoke specifications (US ring mandrel size / tailoring)
                      and agree to the Kathmandu Workshop terms: Order-Made pieces are final sale
                      once casting begins; DROP pieces have a 5-day inspection window.
                    </span>
                  </label>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
                  >
                    ← Back to Address
                  </button>
                  <button
                    type="button"
                    disabled={!policyAccepted || isSubmitting}
                    onClick={handleInitiateOrder}
                    className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-8 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
                  >
                    {isSubmitting ? 'Securing Production Slot...' : 'Place Order & Pay'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Column */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <CheckoutSummary
              items={items}
              subtotalAmount={subtotalAmount}
              shippingCostAmount={shippingCost}
              isFreeShipping={shippingCost === 0}
              courierName={courierName}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
