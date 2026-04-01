export type BotStrategy = "grid" | "dca" | "rsi" | "macd";
export type BotStatus = "running" | "paused" | "stopped";

export interface BotInstance {
  id: string;
  name: string;
  strategy: BotStrategy;
  symbol: string;
  status: BotStatus;
  startedAt: number; // unix ms
  // Performance
  unrealizedPnl: number;
  realizedPnl: number;
  tradeCount: number;
  winCount: number;
  // Current position (if holding)
  entryPrice?: number;
  currentPrice?: number;
  // P&L sparkline history (last 10 data points)
  pnlHistory: number[];
}

export interface BotTrade {
  id: string;
  side: "buy" | "sell";
  price: number;
  qty: number;
  pnl: number;
  executedAt: number; // unix ms
}
