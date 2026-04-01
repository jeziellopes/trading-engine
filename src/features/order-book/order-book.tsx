import { AskTable, BidTable } from "./bid-ask-table";
import { ConnectionBanner } from "./connection-banner";
import type { PriceLevel } from "./order-book-row";
import { SpreadBar } from "./spread-bar";

interface OrderBookState {
  bids: PriceLevel[];
  asks: PriceLevel[];
  bestBid: number;
  bestAsk: number;
  lastPrice: number;
  spreadAmount: number;
  spreadPercent: number;
  connectionStatus: "connected" | "reconnecting" | "disconnected";
  lastPriceTick?: "up" | "down" | "neutral";
}

interface OrderBookProps {
  state: OrderBookState;
}

export function OrderBook({ state }: OrderBookProps) {
  return (
    <div className="flex flex-col w-full h-full font-mono text-sm">
      <ConnectionBanner status={state.connectionStatus} />

      {/* Asks — independent scroll, bottom-aligned */}
      <div data-testid="asks-container" className="flex-1 min-h-0 overflow-y-auto flex flex-col justify-end">
        <AskTable levels={state.asks} />
      </div>

      {/* Spread bar — always visible, pinned between */}
      <SpreadBar
        lastPrice={state.lastPrice}
        spreadAmount={state.spreadAmount}
        spreadPercent={state.spreadPercent}
        tickDirection={state.lastPriceTick}
      />

      {/* Bids — independent scroll */}
      <div data-testid="bids-container" className="flex-1 min-h-0 overflow-y-auto">
        <BidTable levels={state.bids} />
      </div>
    </div>
  );
}
