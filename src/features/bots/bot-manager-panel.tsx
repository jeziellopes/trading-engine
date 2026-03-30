import { BotCard } from "./bot-card";
import type { BotInstance, BotStatus } from "./types";

interface BotManagerPanelProps {
  bots: BotInstance[];
  onStatusChange: (id: string, status: BotStatus) => void;
}

export function BotManagerPanel({ bots, onStatusChange }: BotManagerPanelProps) {
  const runningCount = bots.filter((b) => b.status === "running").length;
  const totalPnl = bots.reduce((sum, b) => sum + b.realizedPnl + b.unrealizedPnl, 0);
  const totalTrades = bots.reduce((sum, b) => sum + b.tradeCount, 0);
  const totalWins = bots.reduce((sum, b) => sum + b.winCount, 0);
  const winRate = totalTrades > 0 ? ((totalWins / totalTrades) * 100).toFixed(0) : "0";

  return (
    <div>
      {/* Aggregate stats header */}
      <div className="px-3 pt-2 pb-1.5">
        <p className="text-[10px] font-mono text-muted-foreground">
          {runningCount} running ·{" "}
          <span
            style={{
              color: totalPnl >= 0 ? "var(--trading-profit)" : "var(--trading-loss)",
            }}
          >
            {totalPnl >= 0 ? "+" : ""}
            {totalPnl.toFixed(2)} total P&L
          </span>{" "}
          · {winRate}% win rate
        </p>
      </div>

      {/* Bot list */}
      <div className="space-y-2 px-3 pb-3">
        {bots.map((bot) => (
          <BotCard key={bot.id} bot={bot} onStatusChange={onStatusChange} />
        ))}
      </div>
    </div>
  );
}
