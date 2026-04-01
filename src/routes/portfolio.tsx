import { createFileRoute, Link } from "@tanstack/react-router";
import { ErrorBoundary } from "@/ui/error-boundary";
import { BalanceDisplay } from "@/features/portfolio/balance-display";
import { PositionCard } from "@/features/portfolio/position-card";
import { MOCK_PORTFOLIO_STATE, MOCK_PORTFOLIO_TRADES } from "@/lib/mock-data";

export const Route = createFileRoute("/portfolio")({
  component: RouteComponent,
});


function RouteComponent() {
  return (
    <ErrorBoundary>
    <div className="w-full max-w-5xl mx-auto px-6 py-8 space-y-8">
      <title>Portfolio | Trading Engine</title>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-cypher font-bold tracking-wide"
          style={{ color: "var(--primary)" }}
        >
          Portfolio
        </h1>
        <Link
          to={"/symbol/$symbol" as never}
          params={{ symbol: "BTCUSDT" } as never}
          className="text-xs font-mono px-3 py-1.5 rounded border border-border transition-colors hover:border-border/80"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          ← Back to terminal
        </Link>
      </div>

      {/* Balance + Positions */}
      <div className="grid grid-cols-[240px_1fr] gap-6">
        <div
          className="rounded-lg border border-border p-5"
          style={{ backgroundColor: "var(--color-card)" }}
        >
          <BalanceDisplay
            totalBalance={MOCK_PORTFOLIO_STATE.totalBalance}
            availableBalance={MOCK_PORTFOLIO_STATE.availableBalance}
            unrealizedPnL={MOCK_PORTFOLIO_STATE.unrealizedPnL}
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Open Positions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {MOCK_PORTFOLIO_STATE.positions.map((pos) => (
              <PositionCard key={pos.symbol} position={pos} />
            ))}
          </div>
        </div>
      </div>

      {/* Trade History */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Trade History
        </h2>
        <div
          className="rounded-lg border border-border overflow-hidden"
          style={{ backgroundColor: "var(--color-card)" }}
        >
          <table className="w-full text-xs font-mono tabular-nums">
            <thead className="border-b border-border">
              <tr className="text-muted-foreground text-left">
                <th className="px-4 py-2.5 font-medium">Symbol</th>
                <th className="px-4 py-2.5 font-medium">Side</th>
                <th className="px-4 py-2.5 font-medium text-right">Price (USDT)</th>
                <th className="px-4 py-2.5 font-medium text-right">Qty</th>
                <th className="px-4 py-2.5 font-medium text-right">Total (USDT)</th>
                <th className="px-4 py-2.5 font-medium text-right">P&amp;L</th>
                <th className="px-4 py-2.5 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PORTFOLIO_TRADES.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-2 font-cypher font-semibold">{t.symbol}</td>
                  <td
                    className="px-4 py-2 uppercase font-semibold"
                    style={{
                      color: t.side === "buy" ? "var(--trading-bid)" : "var(--trading-ask)",
                    }}
                  >
                    {t.side}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {t.price.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-2 text-right text-muted-foreground">{t.qty}</td>
                  <td className="px-4 py-2 text-right">
                    {t.total.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td
                    className="px-4 py-2 text-right font-semibold"
                    style={{ color: t.pnl >= 0 ? "var(--trading-profit)" : "var(--trading-loss)" }}
                  >
                    {t.pnl >= 0 ? "+" : ""}{t.pnl.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right text-muted-foreground">{t.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}
