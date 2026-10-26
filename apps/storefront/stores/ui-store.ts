import { create } from 'zustand';

export interface UiState {
  // State
  readonly isSearchOpen: boolean;
  readonly isMobileNavOpen: boolean;
  readonly isAnnouncementDismissed: boolean;
  readonly activeModalId: string | null;

  // Actions
  readonly openSearch: () => void;
  readonly closeSearch: () => void;
  readonly toggleSearch: () => void;
  readonly openMobileNav: () => void;
  readonly closeMobileNav: () => void;
  readonly toggleMobileNav: () => void;
  readonly dismissAnnouncement: () => void;
  readonly resetAnnouncement: () => void;
  readonly openModal: (modalId: string) => void;
  readonly closeModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSearchOpen: false,
  isMobileNavOpen: false,
  isAnnouncementDismissed: false,
  activeModalId: null,

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),

  openMobileNav: () => set({ isMobileNavOpen: true }),
  closeMobileNav: () => set({ isMobileNavOpen: false }),
  toggleMobileNav: () => set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),

  dismissAnnouncement: () => set({ isAnnouncementDismissed: true }),
  resetAnnouncement: () => set({ isAnnouncementDismissed: false }),

  openModal: (modalId) => set({ activeModalId: modalId }),
  closeModal: () => set({ activeModalId: null }),
}));

// ============================================================================
// Fine-Grained Performance Selectors (JN-202)
// ============================================================================

export const selectIsSearchOpen = (state: UiState): boolean => state.isSearchOpen;

export const selectIsMobileNavOpen = (state: UiState): boolean => state.isMobileNavOpen;

export const selectIsAnnouncementDismissed = (state: UiState): boolean =>
  state.isAnnouncementDismissed;

export const selectActiveModalId = (state: UiState): string | null => state.activeModalId;
