import { create } from 'zustand';

interface ConfiguratorState {
  selectedOptions: Record<string, string>;
  quantity: number;
  setOption: (optionName: string, value: string) => void;
  setQuantity: (quantity: number) => void;
  resetConfiguration: () => void;
}

export const useConfiguratorStore = create<ConfiguratorState>((set) => ({
  selectedOptions: {},
  quantity: 1,
  setOption: (optionName, value) =>
    set((state) => ({
      selectedOptions: {
        ...state.selectedOptions,
        [optionName]: value,
      },
    })),
  setQuantity: (quantity) => set({ quantity: Math.max(1, quantity) }),
  resetConfiguration: () => set({ selectedOptions: {}, quantity: 1 }),
}));
