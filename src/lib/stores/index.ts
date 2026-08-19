import { create } from "zustand";

// ══════ UI Store ══════
interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  addCoffeeModalOpen: boolean;
  searchOpen: boolean;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  setAddCoffeeModal: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  addCoffeeModalOpen: false,
  searchOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  setAddCoffeeModal: (open) => set({ addCoffeeModalOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
}));
