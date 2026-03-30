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

      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Asks section — highest price at top, lowest ask nearest spread */}
        <div className="flex-1 flex flex-col justify-end space-y-px">
          <AskTable levels={state.asks} />
        </div>

        {/* Spread bar */}
        <SpreadBar
          lastPrice={state.lastPrice}
          spreadAmount={state.spreadAmount}
          spreadPercent={state.spreadPercent}
          tickDirection={state.lastPriceTick}
        />

        {/* Bids section — highest bid at top, nearest spread */}
        <div className="flex-1 space-y-px">
          <BidTable levels={state.bids} />
        </div>
      </div>
    </div>
  );
}
