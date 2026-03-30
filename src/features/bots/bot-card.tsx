import { Card, CardContent, CardHeader } from "@/ui/card";
import { Button } from "@/ui/button";
import { BotSparkline } from "./bot-sparkline";
import type { BotInstance, BotStatus } from "./types";

interface BotCardProps {
  bot: BotInstance;
  onStatusChange: (id: string, status: BotStatus) => void;
}

function relativeTime(startedAt: number): string {
  const diffMs = Date.now() - startedAt;
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHr = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDay >= 1) return `${diffDay}d ago`;
  if (diffHr >= 1) return `${diffHr}h ago`;
  return `${diffMin}m ago`;
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

export function BotCard({ bot, onStatusChange }: BotCardProps) {
  const winRate =
    bot.tradeCount > 0 ? ((bot.winCount / bot.tradeCount) * 100).toFixed(0) : "0";

  const positionPct =
    bot.entryPrice && bot.currentPrice
      ? (((bot.currentPrice - bot.entryPrice) / bot.entryPrice) * 100).toFixed(2)
      : null;

  return (
    <Card className="gap-2 p-2.5">
      {/* Header row */}
      <CardHeader className="items-center gap-2 flex-wrap">
        <span className="font-cypher font-semibold text-sm flex-1">{bot.name}</span>
        <span
          className="rounded-full px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wide"
          style={{ backgroundColor: "var(--color-muted)", color: "var(--color-muted-foreground)" }}
        >
          {bot.strategy}
        </span>
        <span
          className="rounded-full px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wide font-semibold"
          style={{ backgroundColor: statusBg(bot.status), color: statusColor(bot.status) }}
        >
          {bot.status}
        </span>
      </CardHeader>

      {/* Stats row */}
      <CardContent>
        <div className="grid grid-cols-4 gap-1 text-center">
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">
              Realized
            </p>
            <p
              className="font-mono tabular-nums text-xs font-semibold"
              style={{
                color:
                  bot.realizedPnl >= 0 ? "var(--trading-profit)" : "var(--trading-loss)",
              }}
            >
              {bot.realizedPnl >= 0 ? "+" : ""}
              {bot.realizedPnl.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">
              Unrealized
            </p>
            <p
              className="font-mono tabular-nums text-xs font-semibold"
              style={{
                color:
                  bot.unrealizedPnl >= 0 ? "var(--trading-profit)" : "var(--trading-loss)",
              }}
            >
              {bot.unrealizedPnl >= 0 ? "+" : ""}
              {bot.unrealizedPnl.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">
              Trades
            </p>
            <p className="font-mono tabular-nums text-xs">{bot.tradeCount}</p>
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">
              Win Rate
            </p>
            <p className="font-mono tabular-nums text-xs">{winRate}%</p>
          </div>
        </div>

        {/* Position row */}
        {bot.entryPrice != null && bot.currentPrice != null && (
          <p className="text-xs font-mono text-muted-foreground mt-1.5">
            Entry:{" "}
            {bot.entryPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })} →{" "}
            {bot.currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            {positionPct != null && (
              <span
                style={{
                  color:
                    Number(positionPct) >= 0 ? "var(--trading-profit)" : "var(--trading-loss)",
                }}
              >
                {" "}
                ({Number(positionPct) >= 0 ? "+" : ""}
                {positionPct}%)
              </span>
            )}
          </p>
        )}
      </CardContent>

      {/* Bottom row: sparkline + actions */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <BotSparkline data={bot.pnlHistory} />
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-1">
            {bot.status === "running" && (
              <>
                <Button
                  intent="ghost"
                  size="xs"
                  onClick={() => onStatusChange(bot.id, "paused")}
                >
                  Pause
                </Button>
                <Button
                  intent="danger"
                  size="xs"
                  onClick={() => onStatusChange(bot.id, "stopped")}
                >
                  Stop
                </Button>
              </>
            )}
            {bot.status === "paused" && (
              <>
                <Button
                  intent="primary"
                  size="xs"
                  onClick={() => onStatusChange(bot.id, "running")}
                >
                  Run
                </Button>
                <Button
                  intent="danger"
                  size="xs"
                  onClick={() => onStatusChange(bot.id, "stopped")}
                >
                  Stop
                </Button>
              </>
            )}
            {bot.status === "stopped" && (
              <Button
                intent="primary"
                size="xs"
                onClick={() => onStatusChange(bot.id, "running")}
              >
                Run
              </Button>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">{relativeTime(bot.startedAt)}</p>
        </div>
      </div>
    </Card>
  );
}
