import { create } from 'zustand';

export interface CartItem {
  readonly id: string;
  readonly productId: string;
  readonly variantId?: string;
  readonly sku: string;
  readonly title: string;
  readonly slug: string;
  readonly commerceModel?: 'OM' | 'DROP' | 'CUSTOM_ORDER' | 'PRE_ORDER';
  readonly unitPriceAmount: number;
  readonly unitPriceCurrency: string;
  readonly selectedOptions: Record<string, string>;
  readonly customSpecifications?: Record<string, number | string | boolean>;
  readonly imageUrl?: string;
  readonly quantity: number;
}

interface CartState {
  isCartDrawerOpen: boolean;
  items: CartItem[];
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalCount: () => number;
  getSubtotalAmount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  isCartDrawerOpen: false,
  items: [],
  openCartDrawer: () => set({ isCartDrawerOpen: true }),
  closeCartDrawer: () => set({ isCartDrawerOpen: false }),
  toggleCartDrawer: () => set((state) => ({ isCartDrawerOpen: !state.isCartDrawerOpen })),

  addItem: (newItem) =>
    set((state) => {
      const optionKey = Object.entries(newItem.selectedOptions ?? {})
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v}`)
        .join('|');
      const specKey = newItem.customSpecifications
        ? Object.entries(newItem.customSpecifications)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}:${v}`)
            .join('|')
        : '';
      const uniqueId = `${newItem.productId}-${newItem.sku}-${optionKey}-${specKey}`;

      const existingIndex = state.items.findIndex((item) => item.id === uniqueId);
      if (existingIndex > -1) {
        const updated = [...state.items];
        const existing = updated[existingIndex];
        if (existing) {
          updated[existingIndex] = {
            ...existing,
            quantity: existing.quantity + newItem.quantity,
          };
        }
        return { items: updated, isCartDrawerOpen: true };
      }

      return {
        items: [...state.items, { ...newItem, id: uniqueId }],
        isCartDrawerOpen: true,
      };
    }),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  updateQuantity: (id, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((item) => item.id !== id) };
      }
      return {
        items: state.items.map((item) => (item.id === id ? { ...item, quantity } : item)),
      };
    }),

  clearCart: () => set({ items: [] }),

  getTotalCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

  getSubtotalAmount: () =>
    get().items.reduce((sum, item) => sum + item.unitPriceAmount * item.quantity, 0),
}));
