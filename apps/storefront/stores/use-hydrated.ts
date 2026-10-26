'use client';

import { useState, useEffect } from 'react';
import { useCartStore, selectIsCartHydrated } from './cart-store';

/**
 * Hook to verify that the cart store has hydrated from persistent browser storage.
 * Eliminates SSR-to-client hydration mismatches across Next.js boundary components.
 */
export function useCartHydrated(): boolean {
  const isStoreHydrated = useCartStore(selectIsCartHydrated);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted && isStoreHydrated;
}
