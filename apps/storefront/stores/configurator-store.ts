import { create } from 'zustand';

export interface ConfiguratorState {
  // State
  readonly basePriceAmount: number;
  readonly unitPriceAmount: number;
  readonly unitPriceCurrency: string;
  readonly selectedOptions: Record<string, string>;
  readonly customSpecifications: Record<string, string | number | boolean>;
  readonly quantity: number;
  readonly activeSku: string | null;
  readonly activeVariantId: string | null;
  readonly isAvailable: boolean;
  readonly inventoryCount: number;
  readonly isResolving: boolean;
  readonly validationErrors: readonly string[];
  readonly vaultDefaults: Record<string, string>;
  readonly productSlug: string | null;

  // Actions
  readonly initProduct: (
    basePriceAmount: number,
    basePriceCurrency?: string,
    initialOptions?: Record<string, string>,
    vaultDefaults?: Record<string, string>,
    productSlug?: string,
  ) => void;
  readonly setOption: (code: string, value: string) => void;
  readonly setCustomSpecification: (key: string, value: string | number | boolean) => void;
  readonly setQuantity: (quantity: number) => void;
  readonly setResolvedVariant: (data: {
    readonly variantId?: string;
    readonly sku: string;
    readonly unitPriceAmount: number;
    readonly unitPriceCurrency?: string;
    readonly isAvailable: boolean;
    readonly inventoryCount: number;
    readonly selectedOptions?: Record<string, string>;
  }) => void;
  readonly setVaultDefaults: (defaults: Record<string, string>) => void;
  readonly applyVaultDefaults: () => void;
  readonly setValidationErrors: (errors: readonly string[]) => void;
  readonly setIsResolving: (isResolving: boolean) => void;
  readonly resetConfiguration: () => void;
}

export const useConfiguratorStore = create<ConfiguratorState>((set) => ({
  basePriceAmount: 0,
  unitPriceAmount: 0,
  unitPriceCurrency: 'USD',
  selectedOptions: {},
  customSpecifications: {},
  quantity: 1,
  activeSku: null,
  activeVariantId: null,
  isAvailable: true,
  inventoryCount: 99,
  isResolving: false,
  validationErrors: [],
  vaultDefaults: {},
  productSlug: null,

  initProduct: (
    basePriceAmount,
    basePriceCurrency = 'USD',
    initialOptions = {},
    vaultDefaults = {},
    productSlug,
  ) =>
    set({
      basePriceAmount,
      unitPriceAmount: basePriceAmount,
      unitPriceCurrency: basePriceCurrency,
      selectedOptions: { ...initialOptions },
      customSpecifications: {},
      quantity: 1,
      activeSku: null,
      activeVariantId: null,
      isAvailable: true,
      inventoryCount: 99,
      isResolving: false,
      validationErrors: [],
      vaultDefaults: { ...vaultDefaults },
      productSlug: productSlug ?? null,
    }),

  setOption: (code, value) =>
    set((state) => ({
      selectedOptions: {
        ...state.selectedOptions,
        [code]: value,
      },
      validationErrors: [],
    })),

  setCustomSpecification: (key, value) =>
    set((state) => ({
      customSpecifications: {
        ...state.customSpecifications,
        [key]: value,
      },
      validationErrors: [],
    })),

  setQuantity: (quantity) => set({ quantity: Math.min(10, Math.max(1, quantity)) }),

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

  setVaultDefaults: (defaults) => set({ vaultDefaults: { ...defaults } }),

  applyVaultDefaults: () =>
    set((state) => ({
      selectedOptions: {
        ...state.vaultDefaults,
        ...state.selectedOptions,
      },
      validationErrors: [],
    })),

  setValidationErrors: (errors) => set({ validationErrors: [...errors] }),

  setIsResolving: (isResolving) => set({ isResolving }),

  resetConfiguration: () =>
    set((state) => ({
      selectedOptions: {},
      customSpecifications: {},
      quantity: 1,
      unitPriceAmount: state.basePriceAmount,
      activeSku: null,
      activeVariantId: null,
      isAvailable: true,
      inventoryCount: 99,
      isResolving: false,
      validationErrors: [],
    })),
}));

// ============================================================================
// Fine-Grained Performance Selectors (JN-202)
// ============================================================================

export const selectConfiguredOptions = (state: ConfiguratorState): Record<string, string> =>
  state.selectedOptions;

export const selectConfiguredCustomSpecifications = (
  state: ConfiguratorState,
): Record<string, string | number | boolean> => state.customSpecifications;

export const selectConfiguredUnitPrice = (state: ConfiguratorState): number =>
  state.unitPriceAmount;

export const selectConfiguredCurrency = (state: ConfiguratorState): string =>
  state.unitPriceCurrency;

export const selectConfiguredQuantity = (state: ConfiguratorState): number => state.quantity;

export const selectConfiguredSku = (state: ConfiguratorState): string | null => state.activeSku;

export const selectConfiguredVariantId = (state: ConfiguratorState): string | null =>
  state.activeVariantId;

export const selectIsConfigValid = (state: ConfiguratorState): boolean =>
  state.validationErrors.length === 0;

export const selectIsConfigAvailable = (state: ConfiguratorState): boolean => state.isAvailable;

export const selectConfiguratorValidationErrors = (state: ConfiguratorState): readonly string[] =>
  state.validationErrors;

export const selectIsConfigResolving = (state: ConfiguratorState): boolean => state.isResolving;
