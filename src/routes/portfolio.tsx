import { createFileRoute, Link } from "@tanstack/react-router";
import { BalanceDisplay } from "@/features/portfolio/balance-display";
import { PositionCard } from "@/features/portfolio/position-card";

export const Route = createFileRoute("/portfolio")({
  component: RouteComponent,
});

const BASE_BTC = 67843.5;
const BASE_ETH = 3263.4;

const mockState = {
  totalBalance: 10_423.7,
  availableBalance: 4_328.5,
  unrealizedPnL: 416.1,
  positions: [
    {
      symbol: "BTCUSDT",
      quantity: 0.083,
      entryPrice: 62_540.0,
      markPrice: BASE_BTC,
      unrealizedPnL: 441.0,
      unrealizedPnLPercent: 0.85,
    },
    {
      symbol: "ETHUSDT",
      quantity: 1.5,
      entryPrice: 3_280.0,
      markPrice: BASE_ETH,
      unrealizedPnL: -24.9,
      unrealizedPnLPercent: -0.51,
    },
  ],
};

interface TradeHistory {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  price: number;
  qty: number;
  total: number;
  time: string;
}

const mockTrades: TradeHistory[] = [
  {
    id: "1",
    symbol: "BTCUSDT",
    side: "buy",
    price: 62_540.0,
    qty: 0.083,
    total: 5_190.82,
    time: "2026-03-28 09:14",
  },
  {
    id: "2",
    symbol: "ETHUSDT",
    side: "buy",
    price: 3_280.0,
    qty: 1.5,
    total: 4_920.0,
    time: "2026-03-27 14:33",
  },
  {
    id: "3",
    symbol: "BTCUSDT",
    side: "sell",
    price: 65_100.0,
    qty: 0.05,
    total: 3_255.0,
    time: "2026-03-25 11:07",
  },
  {
    id: "4",
    symbol: "SOLUSDT",
    side: "buy",
    price: 148.4,
    qty: 10,
    total: 1_484.0,
    time: "2026-03-22 16:50",
  },
  {
    id: "5",
    symbol: "SOLUSDT",
    side: "sell",
    price: 155.2,
    qty: 10,
    total: 1_552.0,
    time: "2026-03-24 08:21",
  },
];

function RouteComponent() {
  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-8 space-y-8">
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
            totalBalance={mockState.totalBalance}
            availableBalance={mockState.availableBalance}
            unrealizedPnL={mockState.unrealizedPnL}
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Open Positions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {mockState.positions.map((pos) => (
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
                <th className="px-4 py-2.5 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {mockTrades.map((t) => (
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
                  <td className="px-4 py-2 text-right text-muted-foreground">{t.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
