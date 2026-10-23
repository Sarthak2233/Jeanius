import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItemDto } from '@jeanius/contracts';

export type CartItem = CartItemDto;
export type CartItemInput = Omit<CartItem, 'id' | 'commerceModel'> & {
  commerceModel?: CartItem['commerceModel'];
};

export interface CartState {
  // State
  readonly items: CartItem[];
  readonly isCartDrawerOpen: boolean;
  readonly isLoading: boolean;
  readonly isSyncing: boolean;
  readonly isHydrated: boolean;
  readonly errorMessage: string | null;

  // Actions
  readonly openCartDrawer: () => void;
  readonly closeCartDrawer: () => void;
  readonly toggleCartDrawer: () => void;
  readonly addItem: (item: CartItemInput) => void;
  readonly removeItem: (id: string) => void;
  readonly updateQuantity: (id: string, quantity: number) => void;
  readonly clearCart: () => void;
  readonly setCartItems: (items: CartItem[]) => void;
  readonly setLoading: (isLoading: boolean) => void;
  readonly setSyncing: (isSyncing: boolean) => void;
  readonly setError: (errorMessage: string | null) => void;
  readonly setHydrated: (isHydrated: boolean) => void;
  readonly getTotalCount: () => number;
  readonly getSubtotalAmount: () => number;
}

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

function generateCartItemKey(item: CartItemInput): string {
  const optionKey = Object.entries(item.selectedOptions ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('|');

  const specKey = item.customSpecifications
    ? Object.entries(item.customSpecifications)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v}`)
        .join('|')
    : '';

  return `${item.productId}-${item.sku}-${optionKey}-${specKey}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartDrawerOpen: false,
      isLoading: false,
      isSyncing: false,
      isHydrated: false,
      errorMessage: null,

      openCartDrawer: () => set({ isCartDrawerOpen: true }),
      closeCartDrawer: () => set({ isCartDrawerOpen: false }),
      toggleCartDrawer: () => set((state) => ({ isCartDrawerOpen: !state.isCartDrawerOpen })),

      addItem: (newItem) =>
        set((state) => {
          const uniqueId = generateCartItemKey(newItem);
          const existingIndex = state.items.findIndex((item) => item.id === uniqueId);
          const sanitizedQty = Math.min(10, Math.max(1, newItem.quantity));

          if (existingIndex > -1) {
            const updated = [...state.items];
            const existing = updated[existingIndex];
            if (existing) {
              const combinedQty = Math.min(10, existing.quantity + sanitizedQty);
              updated[existingIndex] = {
                ...existing,
                quantity: combinedQty,
              };
            }
            return {
              items: updated,
              isCartDrawerOpen: true,
              errorMessage: null,
            };
          }

          const itemWithModel: CartItem = {
            ...newItem,
            commerceModel: newItem.commerceModel ?? 'OM',
            id: uniqueId,
            quantity: sanitizedQty,
          };

          return {
            items: [...state.items, itemWithModel],
            isCartDrawerOpen: true,
            errorMessage: null,
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          errorMessage: null,
        })),

      updateQuantity: (id, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.id !== id),
              errorMessage: null,
            };
          }

          const clampedQty = Math.min(10, quantity);
          return {
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity: clampedQty } : item,
            ),
            errorMessage: null,
          };
        }),

      clearCart: () => set({ items: [], errorMessage: null }),

      setCartItems: (items) => set({ items, errorMessage: null }),

      setLoading: (isLoading) => set({ isLoading }),

      setSyncing: (isSyncing) => set({ isSyncing }),

      setError: (errorMessage) => set({ errorMessage }),

      setHydrated: (isHydrated) => set({ isHydrated }),

      getTotalCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      getSubtotalAmount: () =>
        get().items.reduce((sum, item) => sum + item.unitPriceAmount * item.quantity, 0),
    }),
    {
      name: 'jeanius_cart_state_v1',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : dummyStorage,
      ),
      partialize: (state) => ({
        items: state.items,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      version: 1,
    },
  ),
);

// ============================================================================
// Fine-Grained Performance Selectors (JN-202)
// ============================================================================

export const selectCartItems = (state: CartState): readonly CartItem[] => state.items;

export const selectCartTotalCount = (state: CartState): number =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartSubtotal = (state: CartState): number =>
  state.items.reduce((sum, item) => sum + item.unitPriceAmount * item.quantity, 0);

export const selectIsCartDrawerOpen = (state: CartState): boolean => state.isCartDrawerOpen;

export const selectIsCartHydrated = (state: CartState): boolean => state.isHydrated;

export const selectCartIsLoading = (state: CartState): boolean => state.isLoading;

export const selectCartIsSyncing = (state: CartState): boolean => state.isSyncing;

export const selectCartError = (state: CartState): string | null => state.errorMessage;
