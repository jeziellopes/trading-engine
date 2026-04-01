import { lazy, Suspense, useState } from "react";
import type { Layout, ResponsiveLayouts } from "@/features/trading/trading-grid";

const TradingGrid = lazy(() => import("@/features/trading/trading-grid"));
import { Link } from "@tanstack/react-router";
import { OrderBook } from "@/features/order-book/order-book";
import type { OrderFormData } from "@/features/order-entry/order-form";
import { OrderForm } from "@/features/order-entry/order-form";
import { BotManagerPanel } from "@/features/bots/bot-manager-panel";
import {
  MOCK_BASE_BTC,
  MOCK_BOTS,
  MOCK_CANDLE_MAX,
  MOCK_CANDLE_MIN,
  MOCK_CANDLE_RANGE,
  MOCK_CANDLES,
  MOCK_CHANGE_PCT,
  MOCK_ORDER_BOOK_STATE,
  MOCK_PORTFOLIO_SUMMARY,
  MOCK_TRADING_TRADES,
} from "@/lib/mock-data";
import type { BotInstance, BotStatus } from "@/features/bots/types";
import { ErrorBoundary } from "@/ui/error-boundary";
import { CandleChart } from "@/features/chart/candle-chart";
import { toast } from "sonner";


interface TradingLayoutProps {
  symbol: string;
}


// ── Panel wrapper ──────────────────────────────────────────────────────────────

interface PanelProps {
  title: string;
  children: React.ReactNode;
  /** Disable inner scroll — use for chart panels that must fill height */
  noScroll?: boolean;
  /** Extra content rendered inline in the header (e.g. timeframe tabs) */
  headerExtra?: React.ReactNode;
}

function Panel({ title, children, noScroll = false, headerExtra }: PanelProps) {
  return (
    <div className="bg-card rounded-md border border-border flex flex-col h-full overflow-hidden">
      <div className="px-3 py-2 border-b border-border shrink-0 cursor-move flex items-center justify-between gap-2">
        <h2 className="text-xs font-cypher font-semibold tracking-wide uppercase text-muted-foreground select-none">
          {title}
        </h2>
        {headerExtra}
      </div>
      <div
        className={`flex-1 min-h-0 ${noScroll ? "flex flex-col overflow-hidden" : "overflow-y-auto"}`}
      >
        {children}
      </div>
    </div>
  );
}

// ── Grid layout config ─────────────────────────────────────────────────────────

const LAYOUT_KEY = "trading-grid-layout-v3";

const DEFAULT_LAYOUTS = {
  lg: [
    { i: "book", x: 0, y: 0, w: 3, h: 8 },
    { i: "chart", x: 3, y: 0, w: 6, h: 8 },
    { i: "order", x: 9, y: 0, w: 3, h: 5 },
    { i: "portfolio", x: 9, y: 5, w: 3, h: 3 },
    { i: "bots", x: 0, y: 8, w: 12, h: 5 },
    { i: "trades", x: 0, y: 13, w: 12, h: 4 },
  ],
  md: [
    { i: "book", x: 0, y: 0, w: 3, h: 8 },
    { i: "chart", x: 3, y: 0, w: 7, h: 8 },
    { i: "order", x: 0, y: 8, w: 5, h: 5 },
    { i: "portfolio", x: 5, y: 8, w: 5, h: 3 },
    { i: "bots", x: 0, y: 13, w: 10, h: 5 },
    { i: "trades", x: 0, y: 18, w: 10, h: 4 },
  ],
};

function loadLayouts(): ResponsiveLayouts<string> {
  try {
    const saved = localStorage.getItem(LAYOUT_KEY);
    return saved ? (JSON.parse(saved) as ResponsiveLayouts<string>) : DEFAULT_LAYOUTS;
  } catch {
    return DEFAULT_LAYOUTS;
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

export function TradingLayout({ symbol }: TradingLayoutProps) {
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [layouts, setLayouts] = useState<ResponsiveLayouts<string>>(loadLayouts);
  const [bots, setBots] = useState<BotInstance[]>(MOCK_BOTS);

  const handleOrderSubmit = async (data: OrderFormData) => {
    setOrderSubmitting(true);
    try {
      // Stub: replace with await submitOrder(data) when fill engine is wired
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          // Real implementation may reject — this stub always resolves
          void reject; // suppress unused-variable lint
          resolve();
        }, 600);
      });
      const side = data.side === "buy" ? "Buy" : "Sell";
      const orderType = data.type === "limit" ? "Limit" : "Market";
      toast.success(`${side} ${orderType} order placed`, {
        description: `${data.quantity} @ ${data.type === "market" ? "market price" : data.price}`,
      });
    } catch (err) {
      const description = err instanceof Error ? err.message : "Please try again.";
      toast.error("Order failed", { description });
    } finally {
      setOrderSubmitting(false);
    }
  };

  const handleBotStatusChange = (id: string, status: BotStatus) => {
    setBots((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  const handleLayoutChange = (_layout: Layout, allLayouts: Partial<Record<string, Layout>>) => {
    setLayouts(allLayouts as ResponsiveLayouts<string>);
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(allLayouts));
  };

  const isPositive = MOCK_CHANGE_PCT >= 0;
  const [activeTimeframe, setActiveTimeframe] = useState("15m");

  return (
    <ErrorBoundary>
    <div className="w-full px-3 pb-3 flex flex-col gap-0">
      {/* ── Ticker header ───────────────────────────────── */}
      <div className="flex items-center gap-6 py-2 border-b border-border mb-2">
        <span className="font-cypher text-base font-bold" style={{ color: "var(--primary)" }}>
          {symbol}
        </span>
        <span
          className="font-mono text-xl tabular-nums font-semibold"
          style={{ color: "var(--trading-tick-up)" }}
        >
          {MOCK_BASE_BTC.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
        <span
          className="font-mono text-xs tabular-nums px-1.5 py-0.5 rounded"
          style={{
            color: isPositive ? "var(--trading-profit)" : "var(--trading-loss)",
            backgroundColor: isPositive ? "var(--trading-bid-muted)" : "var(--trading-ask-muted)",
          }}
        >
          {isPositive ? "+" : ""}{Math.abs(MOCK_CHANGE_PCT).toFixed(2)}%
        </span>
        <div className="flex gap-5 text-xs font-mono tabular-nums text-muted-foreground ml-2">
          <span>
            O <span className="text-foreground">66,420.00</span>
          </span>
          <span>
            H <span className="text-foreground">68,240.00</span>
          </span>
          <span>
            L <span className="text-foreground">65,920.00</span>
          </span>
          <span>
            Vol <span className="text-foreground">24,831 BTC</span>
          </span>
        </div>
      </div>

      {/* ── Draggable grid ──────────────────────────────── */}
      <Suspense fallback={<div className="w-full h-[600px] grid grid-cols-12 gap-2 p-3">{[...Array(6)].map((_, i) => <div key={i} className="col-span-4 h-[200px] rounded-md bg-muted animate-pulse" />)}</div>}>
      <TradingGrid
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
        cols={{ lg: 12, md: 10, sm: 6 }}
        rowHeight={60}
        margin={[8, 8]}
        draggableHandle=".cursor-move"
        onLayoutChange={handleLayoutChange}
      >
        <div key="book">
          <ErrorBoundary>
          <Panel title="Order Book">
            <OrderBook state={MOCK_ORDER_BOOK_STATE} />
          </Panel>
          </ErrorBoundary>
        </div>

        <div key="chart">
          <Panel
            title="Price Chart"
            noScroll
            headerExtra={
              <div className="flex items-center gap-1">
                {["1m", "5m", "15m", "1h", "4h", "1d"].map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setActiveTimeframe(tf)}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors"
                    style={
                      tf === activeTimeframe
                        ? {
                            color: "var(--primary)",
                            backgroundColor: "var(--trading-bid-muted)",
                          }
                        : { color: "var(--color-muted-foreground)" }
                    }
                  >
                    {tf}
                  </button>
                ))}
              </div>
            }
          >
            <div className="flex-1 p-2 min-h-0">
              <CandleChart />
            </div>
          </Panel>
        </div>

        <div key="order">
          <ErrorBoundary>
          <Panel title="Place Order">
            <div className="p-3">
              <OrderForm symbol={symbol} onSubmit={handleOrderSubmit} isLoading={orderSubmitting} />
            </div>
          </Panel>
          </ErrorBoundary>
        </div>

        <div key="portfolio">
          <ErrorBoundary>
          <Panel title="Portfolio">
            <div className="p-3 grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <p className="text-[10px] uppercase font-medium text-muted-foreground mb-0.5">
                  Total Balance
                </p>
                <p className="text-sm font-mono tabular-nums font-semibold">
                  $
                  {MOCK_PORTFOLIO_SUMMARY.totalBalance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-medium text-muted-foreground mb-0.5">
                  Investments
                </p>
                <p className="text-sm font-mono tabular-nums font-semibold">
                  $
                  {MOCK_PORTFOLIO_SUMMARY.investments.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-medium text-muted-foreground mb-0.5">
                  Daily Profit
                </p>
                <p
                  className="text-sm font-mono tabular-nums font-semibold"
                  style={{ color: "var(--trading-profit)" }}
                >
                  +${MOCK_PORTFOLIO_SUMMARY.dailyProfit.toFixed(2)}{" "}
                  <span className="text-xs opacity-70">
                    +{MOCK_PORTFOLIO_SUMMARY.dailyProfitPct}%
                  </span>
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-medium text-muted-foreground mb-0.5">
                  Total PnL
                </p>
                <p
                  className="text-sm font-mono tabular-nums font-semibold"
                  style={{ color: "var(--trading-profit)" }}
                >
                  +${MOCK_PORTFOLIO_SUMMARY.totalPnL.toFixed(2)}{" "}
                  <span className="text-xs opacity-70">+{MOCK_PORTFOLIO_SUMMARY.totalPnLPct}%</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-medium text-muted-foreground mb-0.5">
                  Bot P&L
                </p>
                <p
                  className="text-sm font-mono tabular-nums font-semibold"
                  style={{ color: "var(--trading-profit)" }}
                >
                  +${bots.reduce((sum, b) => sum + b.realizedPnl + b.unrealizedPnl, 0).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="px-3 pb-2">
              <Link
                to="/portfolio"
                className="text-[11px] font-medium"
                style={{ color: "var(--primary)" }}
              >
                View full portfolio →
              </Link>
            </div>
          </Panel>
          </ErrorBoundary>
        </div>

        <div key="bots">
          <ErrorBoundary>
          <Panel title="Bots">
            <BotManagerPanel bots={bots} onStatusChange={handleBotStatusChange} />
          </Panel>
          </ErrorBoundary>
        </div>

        <div key="trades">
          <Panel title="Recent Trades">
            <div className="overflow-y-auto" style={{ maxHeight: "200px" }}>
              <table className="w-full text-xs font-mono tabular-nums">
                <thead className="sticky top-0 bg-card border-b border-border">
                  <tr className="text-muted-foreground text-left">
                    <th className="px-3 py-1.5 font-medium">Time</th>
                    <th className="px-3 py-1.5 font-medium">Side</th>
                    <th className="px-3 py-1.5 font-medium text-right">Price (USDT)</th>
                    <th className="px-3 py-1.5 font-medium text-right">Amount (BTC)</th>
                    <th className="px-3 py-1.5 font-medium text-right">Total (USDT)</th>
                    <th className="px-3 py-1.5 font-medium text-right">P&amp;L</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TRADING_TRADES.map((t) => (
                    <tr
                      key={`${t.time}-${t.price}`}
                      className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-3 py-1 text-muted-foreground">{t.time}</td>
                      <td
                        className="px-3 py-1 uppercase font-semibold"
                        style={{
                          color: t.side === "buy" ? "var(--trading-bid)" : "var(--trading-ask)",
                        }}
                      >
                        {t.side}
                      </td>
                      <td
                        className="px-3 py-1 text-right"
                        style={{
                          color: t.side === "buy" ? "var(--trading-bid)" : "var(--trading-ask)",
                        }}
                      >
                        {t.price.toLocaleString("en-US", { minimumFractionDigits: 1 })}
                      </td>
                      <td className="px-3 py-1 text-right text-muted-foreground">
                        {t.qty.toFixed(3)}
                      </td>
                      <td className="px-3 py-1 text-right text-muted-foreground">
                        {t.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td
                        className="px-3 py-1 text-right font-semibold"
                        style={{
                          color: t.pnl >= 0 ? "var(--trading-profit)" : "var(--trading-loss)",
                        }}
                      >
                        {t.pnl >= 0 ? "+" : ""}
                        {t.pnl.toFixed(1)}
                        {t.botId && (
                          <span
                            className="ml-1 text-[9px] px-1 rounded font-mono"
                            style={{
                              backgroundColor: "var(--trading-bid-muted)",
                              color: "var(--trading-bid)",
                            }}
                          >
                            {t.botId === "bot-1" ? "Grid BTC" : t.botId === "bot-2" ? "DCA ETH" : t.botId}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </TradingGrid>
      </Suspense>
    </div>
    </ErrorBoundary>
  );
}
