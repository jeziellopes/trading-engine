import type { TradingLayoutTrade } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface RecentTradesTableProps {
  trades: TradingLayoutTrade[];
}

const BOT_NAMES: Record<string, string> = { "bot-1": "Grid BTC", "bot-2": "DCA ETH" };

export function RecentTradesTable({ trades }: RecentTradesTableProps) {
  return (
    <div className="overflow-y-auto max-h-[200px]">
      <table className="w-full text-xs font-mono tabular-nums">
        <thead className="sticky top-0 bg-card border-b border-border">
          <tr className="text-muted-foreground text-left">
            {["Time", "Side", "Price (USDT)", "Amount (BTC)", "Total (USDT)", "P&L"].map((h, i) => (
              <th key={h} className={cn("px-3 py-1.5 font-medium", i >= 2 && "text-right")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => (
            <tr
              key={`${t.time}-${t.price}`}
              className="border-b border-border/40 hover:bg-muted/30 transition-colors"
            >
              <td className="px-3 py-1 text-muted-foreground">{t.time}</td>
              <td
                className={cn(
                  "px-3 py-1 uppercase font-semibold",
                  t.side === "buy" ? "text-trading-bid" : "text-trading-ask",
                )}
              >
                {t.side}
              </td>
              <td
                className={cn(
                  "px-3 py-1 text-right",
                  t.side === "buy" ? "text-trading-bid" : "text-trading-ask",
                )}
              >
                {t.price.toLocaleString("en-US", { minimumFractionDigits: 1 })}
              </td>
              <td className="px-3 py-1 text-right text-muted-foreground">{t.qty.toFixed(3)}</td>
              <td className="px-3 py-1 text-right text-muted-foreground">
                {t.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </td>
              <td
                className={cn(
                  "px-3 py-1 text-right font-semibold",
                  t.pnl >= 0 ? "text-trading-profit" : "text-trading-loss",
                )}
              >
                {t.pnl >= 0 ? "+" : ""}
                {t.pnl.toFixed(1)}
                {t.botId && (
                  <span className="ml-1 text-[9px] px-1 rounded font-mono bg-trading-bid-muted text-trading-bid">
                    {BOT_NAMES[t.botId] ?? t.botId}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
