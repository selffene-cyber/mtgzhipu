import { create } from 'zustand';

interface AppState {
  // UI State
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  currentPortal: 'public' | 'admin' | 'sales' | 'ops';
  
  // Filters
  catalogFilters: {
    brand?: string;
    model?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    region?: string;
    transmission?: string;
    fuelType?: string;
  };
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setCurrentPortal: (portal: 'public' | 'admin' | 'sales' | 'ops') => void;
  setCatalogFilters: (filters: Partial<AppState['catalogFilters']>) => void;
  resetCatalogFilters: () => void;
}

const defaultFilters = {};

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  currentPortal: 'public',
  catalogFilters: defaultFilters,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  setCurrentPortal: (portal) => set({ currentPortal: portal }),
  setCatalogFilters: (filters) => set((state) => ({ 
    catalogFilters: { ...state.catalogFilters, ...filters } 
  })),
  resetCatalogFilters: () => set({ catalogFilters: defaultFilters }),
}));
