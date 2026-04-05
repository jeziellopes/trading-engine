import { create } from "zustand";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TradingTab = "book" | "trades" | "depth";

interface UIState {
  /** Active tab in the trading view. Source of truth is the URL search param;
   *  this store caches it for deep-tree components that can't reach the router. */
  activeTab: TradingTab;
  /** Number of order book depth levels to display. */
  levels: number;
}

interface UIActions {
  setActiveTab(tab: TradingTab): void;
  setLevels(levels: number): void;
  /** Sync store from router search params (called by the symbol route on mount). */
  syncFromSearch(tab: TradingTab, levels: number): void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useUIStore = create<UIState & UIActions>((set) => ({
  activeTab: "book",
  levels: 20,

  setActiveTab(tab) {
    set({ activeTab: tab });
  },

  setLevels(levels) {
    set({ levels });
  },

  syncFromSearch(tab, levels) {
    set({ activeTab: tab, levels });
  },
}));
