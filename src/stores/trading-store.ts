import { create } from "zustand";
import type { BotInstance } from "@/features/bots/types";
import {
  MOCK_BOTS,
  MOCK_ORDER_BOOK_STATE,
  MOCK_PORTFOLIO_STATE,
  MOCK_PORTFOLIO_SUMMARY,
} from "@/lib/mock-data";

interface TradingState {
  orderBook: typeof MOCK_ORDER_BOOK_STATE;
  portfolio: typeof MOCK_PORTFOLIO_STATE;
  portfolioSummary: typeof MOCK_PORTFOLIO_SUMMARY;
  bots: BotInstance[];
  setBotStatus: (id: string, status: BotInstance["status"]) => void;
}

export const useTradingStore = create<TradingState>((set) => ({
  orderBook: MOCK_ORDER_BOOK_STATE,
  portfolio: MOCK_PORTFOLIO_STATE,
  portfolioSummary: MOCK_PORTFOLIO_SUMMARY,
  bots: MOCK_BOTS,
  setBotStatus: (id, status) =>
    set((state) => ({
      bots: state.bots.map((b) => (b.id === id ? { ...b, status } : b)),
    })),
}));
