import { lazy, Suspense, useRef, useState } from "react";
import { toast } from "sonner";
import { BotManagerPanel } from "@/features/bots/bot-manager-panel";
import type { BotStatus } from "@/features/bots/types";
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
  MOCK_CHANGE_PCT,
  MOCK_ORDER_BOOK_STATE,
  MOCK_PORTFOLIO_SUMMARY,
  MOCK_TRADING_TRADES,
} from "@/lib/mock-data";
import { useTradingStore } from "@/stores/trading-store";
import { Button } from "@/ui/button";
import { ErrorBoundary } from "@/ui/error-boundary";
import { Panel } from "@/ui/panel";

const TradingGrid = lazy(() => import("@/features/trading/trading-grid"));

interface TradingLayoutProps {
  symbol: string;
}

const LAYOUT_KEY = "trading-grid-layout-v5";
const DEFAULT_LAYOUTS = {
  // ≥1920px — ultrawide: chart | book | order form (Binance-style)
  xxl: [
    { i: "chart",     x: 0, y: 0,  w: 7, h: 10 },
    { i: "book",      x: 7, y: 0,  w: 2, h: 10 },
    { i: "order",     x: 9, y: 0,  w: 3, h: 6  },
    { i: "portfolio", x: 9, y: 6,  w: 3, h: 4  },
    { i: "bots",      x: 0, y: 10, w: 7, h: 5  },
    { i: "trades",    x: 7, y: 10, w: 5, h: 5  },
  ],
  // ≥1440px — full-screen: chart | book | order form
  xl: [
    { i: "chart",     x: 0, y: 0,  w: 7, h: 10 },
    { i: "book",      x: 7, y: 0,  w: 2, h: 10 },
    { i: "order",     x: 9, y: 0,  w: 3, h: 6  },
    { i: "portfolio", x: 9, y: 6,  w: 3, h: 4  },
    { i: "bots",      x: 0, y: 10, w: 7, h: 5  },
    { i: "trades",    x: 7, y: 10, w: 5, h: 5  },
  ],
  // ≥1200px — 3/4-screen: chart | book | order form
  lg: [
    { i: "chart",     x: 0, y: 0, w: 6, h: 8 },
    { i: "book",      x: 6, y: 0, w: 3, h: 8 },
    { i: "order",     x: 9, y: 0, w: 3, h: 5 },
    { i: "portfolio", x: 9, y: 5, w: 3, h: 3 },
    { i: "bots",      x: 0, y: 8, w: 7, h: 5 },
    { i: "trades",    x: 7, y: 8, w: 5, h: 5 },
  ],
  // ≥996px — laptop: chart | book / order form | portfolio stacked below
  md: [
    { i: "chart",     x: 0, y: 0,  w: 6, h: 8 },
    { i: "book",      x: 6, y: 0,  w: 4, h: 8 },
    { i: "order",     x: 0, y: 8,  w: 6, h: 5 },
    { i: "portfolio", x: 6, y: 8,  w: 4, h: 5 },
    { i: "bots",      x: 0, y: 13, w: 6, h: 5 },
    { i: "trades",    x: 6, y: 13, w: 4, h: 5 },
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
  const bots = useTradingStore((s) => s.bots);
  const setBotStatus = useTradingStore((s) => s.setBotStatus);
  const [activeTimeframe, setActiveTimeframe] = useState("15m");
  // Only persist layouts when the user explicitly drags or resizes a panel.
  // onLayoutChange also fires on mount — we must not overwrite the stored
  // layout with the default on the first render.
  const userModifiedRef = useRef(false);

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
    const next = allLayouts as ResponsiveLayouts<string>;
    setLayouts(next);
    if (userModifiedRef.current) {
      localStorage.setItem(LAYOUT_KEY, JSON.stringify(next));
    }
  };

  const handleUserInteractionStart = () => {
    userModifiedRef.current = true;
  };

  const botPnl = bots.reduce((sum, b) => sum + b.realizedPnl + b.unrealizedPnl, 0);
  const timeframeTabs = (
    <div className="flex items-center gap-1">
      {["1m", "5m", "15m", "1h", "4h", "1d"].map((tf) => (
        <Button
          key={tf}
          intent="ghost"
          size="xs"
          type="button"
          onClick={() => setActiveTimeframe(tf)}
          className={`font-mono text-[10px] px-1.5 py-0.5 ${tf === activeTimeframe ? "text-primary bg-trading-bid-muted" : "text-muted-foreground"}`}
        >
          {tf}
        </Button>
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
            breakpoints={{ xxl: 1920, xl: 1440, lg: 1200, md: 996, sm: 768 }}
            cols={{ xxl: 12, xl: 12, lg: 12, md: 10, sm: 6 }}
            rowHeight={60}
            margin={[8, 8]}
            draggableHandle=".cursor-move"
            onLayoutChange={handleLayoutChange}
            onDragStart={handleUserInteractionStart}
            onResizeStart={handleUserInteractionStart}
          >
            <div key="book">
              <ErrorBoundary>
                <Panel title="Order Book">
                  <Panel.Content noScroll>
                    <OrderBook state={MOCK_ORDER_BOOK_STATE} />
                  </Panel.Content>
                </Panel>
              </ErrorBoundary>
            </div>
            <div key="chart">
              <Panel title="Price Chart">
                <Panel.Header extra={timeframeTabs} />
                <Panel.Content noScroll>
                  <div className="flex-1 p-2 min-h-0">
                    <CandleChart />
                  </div>
                </Panel.Content>
              </Panel>
            </div>
            <div key="order">
              <ErrorBoundary>
                <Panel title="Place Order">
                  <Panel.Content>
                    <div className="p-3">
                      <OrderForm
                        symbol={symbol}
                        onSubmit={handleOrderSubmit}
                        isLoading={orderSubmitting}
                      />
                    </div>
                  </Panel.Content>
                </Panel>
              </ErrorBoundary>
            </div>
            <div key="portfolio">
              <ErrorBoundary>
                <Panel title="Portfolio">
                  <Panel.Content>
                    <PortfolioSummaryWidget {...MOCK_PORTFOLIO_SUMMARY} botPnl={botPnl} />
                  </Panel.Content>
                </Panel>
              </ErrorBoundary>
            </div>
            <div key="bots">
              <ErrorBoundary>
                <Panel title="Bots">
                  <Panel.Content>
                    <BotManagerPanel
                      bots={bots}
                      onStatusChange={(id: string, s: BotStatus) => setBotStatus(id, s)}
                    />
                  </Panel.Content>
                </Panel>
              </ErrorBoundary>
            </div>
            <div key="trades">
              <Panel title="Recent Trades">
                <Panel.Content>
                  <RecentTradesTable trades={MOCK_TRADING_TRADES} />
                </Panel.Content>
              </Panel>
            </div>
          </TradingGrid>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
