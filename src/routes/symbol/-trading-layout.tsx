import { lazy, Suspense, useState } from "react";
import { toast } from "sonner";
import { BotManagerPanel } from "@/features/bots/bot-manager-panel";
import type { BotInstance, BotStatus } from "@/features/bots/types";
import { CandleChart } from "@/features/chart/candle-chart";
import { OrderBook } from "@/features/order-book/order-book";
import type { OrderFormData } from "@/features/order-entry/order-form";
import { OrderForm } from "@/features/order-entry/order-form";
import { RecentTradesTable } from "@/features/trades/recent-trades-table";
import { PortfolioSummaryWidget } from "@/features/trading/portfolio-summary-widget";
import { TickerHeader } from "@/features/trading/ticker-header";
import type { Layout, ResponsiveLayouts } from "@/features/trading/trading-grid";
import {
  MOCK_BASE_BTC,
  MOCK_BOTS,
  MOCK_CHANGE_PCT,
  MOCK_ORDER_BOOK_STATE,
  MOCK_PORTFOLIO_SUMMARY,
  MOCK_TRADING_TRADES,
} from "@/lib/mock-data";
import { ErrorBoundary } from "@/ui/error-boundary";
import { Panel } from "@/ui/panel";

const TradingGrid = lazy(() => import("@/features/trading/trading-grid"));

interface TradingLayoutProps {
  symbol: string;
}

const LAYOUT_KEY = "trading-grid-layout-v4";
const DEFAULT_LAYOUTS = {
  lg: [
    { i: "book", x: 0, y: 0, w: 3, h: 8 },
    { i: "chart", x: 3, y: 0, w: 6, h: 8 },
    { i: "order", x: 9, y: 3, w: 3, h: 5 },
    { i: "portfolio", x: 9, y: 0, w: 3, h: 3 },
    { i: "bots", x: 0, y: 8, w: 12, h: 5 },
    { i: "trades", x: 0, y: 13, w: 12, h: 4 },
  ],
  md: [
    { i: "book", x: 0, y: 0, w: 3, h: 8 },
    { i: "chart", x: 3, y: 0, w: 7, h: 8 },
    { i: "order", x: 5, y: 8, w: 5, h: 5 },
    { i: "portfolio", x: 0, y: 8, w: 5, h: 3 },
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

export function TradingLayout({ symbol }: TradingLayoutProps) {
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [layouts, setLayouts] = useState<ResponsiveLayouts<string>>(loadLayouts);
  const [bots, setBots] = useState<BotInstance[]>(MOCK_BOTS);
  const [activeTimeframe, setActiveTimeframe] = useState("15m");

  const handleOrderSubmit = async (data: OrderFormData) => {
    setOrderSubmitting(true);
    try {
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          void reject;
          resolve();
        }, 600);
      });
      const side = data.side === "buy" ? "Buy" : "Sell";
      const orderType = data.type === "limit" ? "Limit" : "Market";
      toast.success(`${side} ${orderType} order placed`, {
        description: `${data.quantity} @ ${data.type === "market" ? "market price" : data.price}`,
      });
    } catch (err) {
      toast.error("Order failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setOrderSubmitting(false);
    }
  };

  const handleLayoutChange = (_layout: Layout, allLayouts: Partial<Record<string, Layout>>) => {
    setLayouts(allLayouts as ResponsiveLayouts<string>);
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(allLayouts));
  };

  const botPnl = bots.reduce((sum, b) => sum + b.realizedPnl + b.unrealizedPnl, 0);
  const timeframeTabs = (
    <div className="flex items-center gap-1">
      {["1m", "5m", "15m", "1h", "4h", "1d"].map((tf) => (
        <button
          key={tf}
          type="button"
          onClick={() => setActiveTimeframe(tf)}
          className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors ${tf === activeTimeframe ? "text-primary bg-trading-bid-muted" : "text-muted-foreground"}`}
        >
          {tf}
        </button>
      ))}
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="w-full px-3 pb-3 flex flex-col gap-0">
        <TickerHeader symbol={symbol} price={MOCK_BASE_BTC} changePct={MOCK_CHANGE_PCT} />
        <Suspense
          fallback={
            <div className="w-full h-[600px] grid grid-cols-12 gap-2 p-3">
              {["a", "b", "c", "d", "e", "f"].map((id) => (
                <div key={id} className="col-span-4 h-[200px] rounded-md bg-muted animate-pulse" />
              ))}
            </div>
          }
        >
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
              <Panel title="Price Chart" noScroll headerExtra={timeframeTabs}>
                <div className="flex-1 p-2 min-h-0">
                  <CandleChart />
                </div>
              </Panel>
            </div>
            <div key="order">
              <ErrorBoundary>
                <Panel title="Place Order">
                  <div className="p-3">
                    <OrderForm
                      symbol={symbol}
                      onSubmit={handleOrderSubmit}
                      isLoading={orderSubmitting}
                    />
                  </div>
                </Panel>
              </ErrorBoundary>
            </div>
            <div key="portfolio">
              <ErrorBoundary>
                <Panel title="Portfolio">
                  <PortfolioSummaryWidget {...MOCK_PORTFOLIO_SUMMARY} botPnl={botPnl} />
                </Panel>
              </ErrorBoundary>
            </div>
            <div key="bots">
              <ErrorBoundary>
                <Panel title="Bots">
                  <BotManagerPanel
                    bots={bots}
                    onStatusChange={(id: string, s: BotStatus) =>
                      setBots((prev) => prev.map((b) => (b.id === id ? { ...b, status: s } : b)))
                    }
                  />
                </Panel>
              </ErrorBoundary>
            </div>
            <div key="trades">
              <Panel title="Recent Trades">
                <RecentTradesTable trades={MOCK_TRADING_TRADES} />
              </Panel>
            </div>
          </TradingGrid>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
