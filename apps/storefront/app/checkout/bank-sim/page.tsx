import React from 'react';
import type { Metadata } from 'next';
import { getBankSessionDetailsAction } from '../../../actions/payment.actions';
import { BankSimulationView } from './bank-simulation-view';

export const metadata: Metadata = {
  title: 'Simulated Bank Portal | Kathmandu Atelier Wire',
  description: 'Passable simulated bank wire transfer portal for atelier checkout verification.',
};

interface BankSimPageProps {
  readonly searchParams: Promise<{
    readonly orderId?: string;
    readonly paymentId?: string;
    readonly orderNumber?: string;
    readonly amount?: string;
    readonly currency?: string;
    readonly ref?: string;
  }>;
}

export default async function BankSimPage({ searchParams }: BankSimPageProps) {
  const params = await searchParams;
  const lookupId = params.paymentId || params.orderId || '';

  let sessionDetails = null;
  if (lookupId) {
    const res = await getBankSessionDetailsAction(lookupId);
    if (res.success && res.data) {
      sessionDetails = res.data;
    }
  }

  const fallbackAmount = Number.parseInt(params.amount ?? '45000', 10);
  const fallbackCurrency = params.currency ?? 'USD';
  const initialVoucherRef =
    sessionDetails?.voucherReference ??
    params.ref ??
    `TXN-BNK-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <BankSimulationView
      paymentId={sessionDetails?.paymentId ?? params.paymentId ?? params.orderId ?? 'sim-pay-id'}
      orderId={sessionDetails?.orderId ?? params.orderId ?? 'sim-ord-id'}
      orderNumber={sessionDetails?.orderNumber ?? params.orderNumber ?? 'JNS-SIMULATED'}
      amountUsd={sessionDetails?.amountUsd ?? fallbackAmount}
      amountNpr={sessionDetails?.amountNpr ?? Math.round(fallbackAmount * 1.35)}
      currency={sessionDetails?.currency ?? fallbackCurrency}
      initialVoucherRef={initialVoucherRef}
      bankInstructions={
        sessionDetails?.bankInstructions ?? {
          bankName: 'Himalayan Bank Limited',
          swiftCode: 'HIMANPKA',
          beneficiaryName: 'Jeanius Atelier Pvt. Ltd.',
          accountNumber: '01908823410012',
          branch: 'Kathmandu International Banking Branch',
          notes:
            'International SWIFT wire transfer. Atelier bench queue activates upon wire clearance.',
        }
      }
    />
  );
}
