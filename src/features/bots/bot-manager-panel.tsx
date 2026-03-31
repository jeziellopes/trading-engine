import { Link } from "@tanstack/react-router";
import { ChevronRight, Pause, Play, Square } from "lucide-react";
import { BotSparkline } from "./bot-sparkline";
import type { BotInstance, BotStatus } from "./types";

interface BotManagerPanelProps {
  bots: BotInstance[];
  onStatusChange: (id: string, status: BotStatus) => void;
}

function statusColor(status: BotInstance["status"]): string {
  if (status === "running") return "var(--trading-bid)";
  if (status === "paused") return "var(--color-muted-foreground)";
  return "var(--trading-ask)";
}

function statusBg(status: BotInstance["status"]): string {
  if (status === "running") return "var(--trading-bid-muted)";
  if (status === "paused") return "var(--color-muted)";
  return "var(--trading-ask-muted)";
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

      {/* Bot table */}
      <div className="px-3 pb-3 overflow-x-auto">
        <table className="w-full text-xs" role="table">
          <thead>
            <tr>
              {["Name", "Strategy", "Symbol", "Status", "P&L", "Win%", "Sparkline", "Actions", ""].map(
                (col) => (
                  <th
                    key={col}
                    className="px-2 py-1.5 text-left text-[10px] text-muted-foreground font-normal uppercase tracking-wide"
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {bots.map((bot) => {
              const pnl = bot.realizedPnl + bot.unrealizedPnl;
              const winPct =
                bot.tradeCount > 0
                  ? `${((bot.winCount / bot.tradeCount) * 100).toFixed(0)}%`
                  : "0%";
              return (
                <tr
                  key={bot.id}
                  className="border-t border-border/40 hover:bg-muted/30 transition-colors"
                >
                  {/* Name */}
                  <td className="px-2 py-1.5">
                    <span className="font-cypher font-semibold text-xs whitespace-nowrap">
                      {bot.name}
                    </span>
                  </td>

                  {/* Strategy */}
                  <td className="px-2 py-1.5">
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wide"
                      style={{
                        backgroundColor: "var(--color-muted)",
                        color: "var(--color-muted-foreground)",
                      }}
                    >
                      {bot.strategy}
                    </span>
                  </td>

                  {/* Symbol */}
                  <td className="px-2 py-1.5 text-xs text-muted-foreground whitespace-nowrap">
                    {bot.symbol}
                  </td>

                  {/* Status */}
                  <td className="px-2 py-1.5">
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wide font-semibold"
                      style={{
                        backgroundColor: statusBg(bot.status),
                        color: statusColor(bot.status),
                      }}
                    >
                      {bot.status}
                    </span>
                  </td>

                  {/* P&L */}
                  <td className="px-2 py-1.5">
                    <span
                      className="text-xs font-mono"
                      style={{
                        color: pnl >= 0 ? "var(--trading-profit)" : "var(--trading-loss)",
                      }}
                    >
                      {pnl >= 0 ? "+" : ""}
                      {pnl.toFixed(2)}
                    </span>
                  </td>

                  {/* Win% */}
                  <td className="px-2 py-1.5 text-xs">{winPct}</td>

                  {/* Sparkline */}
                  <td className="px-2 py-1.5">
                    <BotSparkline data={bot.pnlHistory} width={48} height={20} />
                  </td>

                  {/* Actions */}
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-1">
                      {bot.status === "running" && (
                        <>
                          <button
                            className="flex items-center justify-center w-6 h-6 rounded cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Pause"
                            aria-label="Pause bot"
                            onClick={() => onStatusChange(bot.id, "paused")}
                          >
                            <Pause size={11} />
                          </button>
                          <button
                            className="flex items-center justify-center w-6 h-6 rounded cursor-pointer hover:text-foreground hover:bg-muted transition-colors"
                            style={{ color: "var(--trading-ask)" }}
                            title="Stop"
                            aria-label="Stop bot"
                            onClick={() => onStatusChange(bot.id, "stopped")}
                          >
                            <Square size={11} />
                          </button>
                        </>
                      )}
                      {bot.status === "paused" && (
                        <>
                          <button
                            className="flex items-center justify-center w-6 h-6 rounded cursor-pointer hover:text-foreground hover:bg-muted transition-colors"
                            style={{ color: "var(--trading-bid)" }}
                            title="Run"
                            aria-label="Run bot"
                            onClick={() => onStatusChange(bot.id, "running")}
                          >
                            <Play size={11} />
                          </button>
                          <button
                            className="flex items-center justify-center w-6 h-6 rounded cursor-pointer hover:text-foreground hover:bg-muted transition-colors"
                            style={{ color: "var(--trading-ask)" }}
                            title="Stop"
                            aria-label="Stop bot"
                            onClick={() => onStatusChange(bot.id, "stopped")}
                          >
                            <Square size={11} />
                          </button>
                        </>
                      )}
                      {bot.status === "stopped" && (
                        <button
                          className="flex items-center justify-center w-6 h-6 rounded cursor-pointer hover:text-foreground hover:bg-muted transition-colors"
                          style={{ color: "var(--trading-bid)" }}
                          title="Run"
                          aria-label="Run bot"
                          onClick={() => onStatusChange(bot.id, "running")}
                        >
                          <Play size={11} />
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Details link */}
                  <td className="px-2 py-1.5">
                    <Link
                      to="/bots/$botId"
                      params={{ botId: bot.id }}
                      className="flex items-center justify-center w-6 h-6 rounded cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="View details"
                    >
                      <ChevronRight size={13} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
