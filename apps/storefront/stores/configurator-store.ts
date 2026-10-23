import { create } from 'zustand';

export interface ConfiguratorState {
  basePriceAmount: number;
  selectedOptions: Record<string, string>;
  quantity: number;
  unitPriceAmount: number;
  unitPriceCurrency: string;
  activeSku: string | null;
  activeVariantId: string | null;
  isAvailable: boolean;
  inventoryCount: number;
  isResolving: boolean;
  validationErrors: string[];
  vaultDefaults: Record<string, string>;

  setOption: (code: string, value: string) => void;
  setQuantity: (quantity: number) => void;
  initProduct: (
    basePriceAmount: number,
    basePriceCurrency: string,
    initialOptions?: Record<string, string>,
  ) => void;
  setResolvedVariant: (data: {
    variantId?: string;
    sku: string;
    unitPriceAmount: number;
    unitPriceCurrency?: string;
    isAvailable: boolean;
    inventoryCount: number;
    selectedOptions?: Record<string, string>;
  }) => void;
  setVaultDefaults: (defaults: Record<string, string>) => void;
  setValidationErrors: (errors: string[]) => void;
  resetConfiguration: () => void;
}

export const useConfiguratorStore = create<ConfiguratorState>((set) => ({
  basePriceAmount: 0,
  selectedOptions: {},
  quantity: 1,
  unitPriceAmount: 0,
  unitPriceCurrency: 'USD',
  activeSku: null,
  activeVariantId: null,
  isAvailable: true,
  inventoryCount: 99,
  isResolving: false,
  validationErrors: [],
  vaultDefaults: {},

  setOption: (code, value) =>
    set((state) => ({
      selectedOptions: {
        ...state.selectedOptions,
        [code]: value,
      },
      validationErrors: [],
    })),

  setQuantity: (quantity) => set({ quantity: Math.max(1, quantity) }),

  initProduct: (basePriceAmount, basePriceCurrency = 'USD', initialOptions = {}) =>
    set({
      basePriceAmount,
      selectedOptions: { ...initialOptions },
      quantity: 1,
      unitPriceAmount: basePriceAmount,
      unitPriceCurrency: basePriceCurrency,
      activeSku: null,
      activeVariantId: null,
      isAvailable: true,
      inventoryCount: 99,
      isResolving: false,
      validationErrors: [],
      vaultDefaults: {},
    }),

  setResolvedVariant: (data) =>
    set((state) => ({
      activeSku: data.sku,
      activeVariantId: data.variantId ?? null,
      unitPriceAmount: data.unitPriceAmount,
      unitPriceCurrency: data.unitPriceCurrency ?? state.unitPriceCurrency,
      isAvailable: data.isAvailable,
      inventoryCount: data.inventoryCount,
      isResolving: false,
    })),

  setVaultDefaults: (defaults) => set({ vaultDefaults: defaults }),

  setValidationErrors: (errors) => set({ validationErrors: errors }),

  resetConfiguration: () =>
    set({
      selectedOptions: {},
      quantity: 1,
      unitPriceAmount: 0,
      unitPriceCurrency: 'USD',
      activeSku: null,
      activeVariantId: null,
      isAvailable: true,
      inventoryCount: 99,
      isResolving: false,
      validationErrors: [],
      vaultDefaults: {},
    }),
}));
