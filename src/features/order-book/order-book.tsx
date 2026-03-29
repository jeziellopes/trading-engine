import { ConnectionBanner } from "./connection-banner";
import { BidTable } from "./bid-ask-table";
import { AskTable } from "./bid-ask-table";
import { SpreadBar } from "./spread-bar";
import type { PriceLevel } from "./order-book-row";

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

      <div className="flex-1 overflow-y-auto">
        {/* Bids section */}
        <div className="space-y-px">
          <BidTable levels={state.bids} />
        </div>

        {/* Spread bar */}
        <SpreadBar
          bestBid={state.bestBid}
          bestAsk={state.bestAsk}
          lastPrice={state.lastPrice}
          spreadAmount={state.spreadAmount}
          spreadPercent={state.spreadPercent}
          tickDirection={state.lastPriceTick}
        />

        {/* Asks section */}
        <div className="space-y-px">
          <AskTable levels={state.asks} />
        </div>
      </div>
    </div>
  );
}
