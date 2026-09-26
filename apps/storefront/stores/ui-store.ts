import { create } from 'zustand';

interface UiState {
  isSearchOpen: boolean;
  isMobileNavOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleMobileNav: () => void;
  closeMobileNav: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSearchOpen: false,
  isMobileNavOpen: false,
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleMobileNav: () => set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),
  closeMobileNav: () => set({ isMobileNavOpen: false }),
}));
