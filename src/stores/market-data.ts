import { create } from "zustand";
import { applyDepthUpdate, bookFromSnapshot } from "@/domain/market-data/book-sync";
import type { MarketDataSource } from "@/domain/market-data/MarketDataSource";
import type {
  NormalizedDepthUpdate,
  NormalizedSnapshot,
  NormalizedTrade,
} from "@/domain/market-data/normalized";
import type { ConnectionStatus, OrderBook } from "@/domain/market-data/types";
import { RING_BUFFER_SIZE } from "@/lib/constants";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface MarketDataState {
  orderBook: OrderBook | null;
  trades: NormalizedTrade[];
  connectionStatus: ConnectionStatus;
  symbol: string | null;
}

interface MarketDataActions {
  /** Initialise the store for a symbol — connects the data source and fetches snapshot. */
  initMarketData(source: MarketDataSource, symbol: string): Promise<void>;
  /** Disconnect and clean up. */
  teardown(source: MarketDataSource): void;
}

// ---------------------------------------------------------------------------
// RAF-batched depth update queue (AC-7)
// Updates are queued and flushed at most once per animation frame.
// ---------------------------------------------------------------------------

let pendingUpdates: NormalizedDepthUpdate[] = [];
let rafHandle: number | null = null;

function flushDepthUpdates(): void {
  rafHandle = null;
  if (pendingUpdates.length === 0) return;
  const batch = pendingUpdates;
  pendingUpdates = [];

  useMarketDataStore.setState((state) => {
    if (state.orderBook === null) return state;
    let book = state.orderBook;
    for (const update of batch) {
      book = applyDepthUpdate(book, update);
    }
    return { orderBook: book };
  });
}

function scheduleDepthUpdate(update: NormalizedDepthUpdate): void {
  pendingUpdates.push(update);
  if (rafHandle === null) {
    rafHandle = requestAnimationFrame(flushDepthUpdates);
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useMarketDataStore = create<MarketDataState & MarketDataActions>((set) => ({
  orderBook: null,
  trades: [],
  connectionStatus: "disconnected",
  symbol: null,

  async initMarketData(source, symbol) {
    // Register callbacks first so buffering starts immediately.
    source.onStatusChange((status) => {
      set({ connectionStatus: status });
    });

    source.onDepthUpdate((update) => {
      scheduleDepthUpdate(update);
    });

    source.onTrade((trade) => {
      set((state) => ({
        trades: [trade, ...state.trades].slice(0, RING_BUFFER_SIZE),
      }));
    });

    set({ symbol, connectionStatus: "reconnecting" });

    // AC-1: connect (starts buffering) then immediately fetch snapshot
    source.connect(symbol);
    const snapshot: NormalizedSnapshot = await source.getSnapshot(symbol);

    set({
      orderBook: bookFromSnapshot(snapshot),
      connectionStatus: "connected",
    });
  },

  teardown(source) {
    source.disconnect();
    // Cancel any pending RAF batch
    if (rafHandle !== null) {
      cancelAnimationFrame(rafHandle);
      rafHandle = null;
      pendingUpdates = [];
    }
    set({
      orderBook: null,
      trades: [],
      connectionStatus: "disconnected",
      symbol: null,
    });
  },
}));

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

/** Raw Map-based order book for consumer transformation. */
export function useOrderBook(): OrderBook | null {
  return useMarketDataStore((s) => s.orderBook);
}

/** Last N trades (ring buffer of RING_BUFFER_SIZE, AC-9). */
export function useTrades(): NormalizedTrade[] {
  return useMarketDataStore((s) => s.trades);
}

export function useConnectionStatus(): ConnectionStatus {
  return useMarketDataStore((s) => s.connectionStatus);
}
