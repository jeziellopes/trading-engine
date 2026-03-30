import type { BotInstance } from "./types";

export const MOCK_BOTS: BotInstance[] = [
  {
    id: "bot-1",
    name: "Grid BTC #1",
    strategy: "grid",
    symbol: "BTCUSDT",
    status: "running",
    startedAt: Date.now() - 1000 * 60 * 60 * 3, // 3h ago
    unrealizedPnl: 84.2,
    realizedPnl: 218.5,
    tradeCount: 47,
    winCount: 33,
    entryPrice: 67200,
    currentPrice: 67843.5,
    pnlHistory: [0, 45, 38, 82, 110, 95, 148, 190, 210, 302.7],
  },
  {
    id: "bot-2",
    name: "DCA ETH #1",
    strategy: "dca",
    symbol: "ETHUSDT",
    status: "paused",
    startedAt: Date.now() - 1000 * 60 * 60 * 24, // 1d ago
    unrealizedPnl: -23.4,
    realizedPnl: 156.8,
    tradeCount: 12,
    winCount: 8,
    entryPrice: 3310,
    currentPrice: 3263.4,
    pnlHistory: [0, 30, 65, 120, 90, 110, 130, 115, 125, 133.4],
  },
  {
    id: "bot-3",
    name: "RSI SOL #1",
    strategy: "rsi",
    symbol: "SOLUSDT",
    status: "stopped",
    startedAt: Date.now() - 1000 * 60 * 60 * 48, // 2d ago
    unrealizedPnl: 0,
    realizedPnl: -41.3,
    tradeCount: 8,
    winCount: 3,
    pnlHistory: [0, 20, -5, 15, -20, -30, -15, -35, -41.3, -41.3],
  },
];
