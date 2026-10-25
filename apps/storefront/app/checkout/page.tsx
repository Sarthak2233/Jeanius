import React from 'react';
import type { Metadata } from 'next';
import { createClient } from '../../lib/supabase/server';
import { CheckoutView } from './checkout-view';

export const metadata: Metadata = {
  title: 'Checkout | Jeanius & Jewl Atelier',
  description: 'Complete your bespoke order from the Kathmandu silversmith and denim atelier.',
};

export default async function CheckoutPage() {
  let initialEmail = '';
  let initialName = '';

  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      initialEmail = session.user.email ?? '';
      initialName =
        (session.user.user_metadata?.full_name as string) ??
        (session.user.user_metadata?.name as string) ??
        '';
    }
  } catch {
    // Guest checkout fallback
  }

  return <CheckoutView initialEmail={initialEmail} initialName={initialName} />;
}
