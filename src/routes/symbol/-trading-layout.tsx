import { lazy, Suspense, useState } from "react";
import { toast } from "sonner";
import { CandleChart } from "@/features/chart/candle-chart";
import { OrderBook } from "@/features/order-book/order-book";
import type { OrderFormData } from "@/features/order-entry/order-form";
import { OrderForm } from "@/features/order-entry/order-form";
import { DataPanel } from "@/features/trading/data-panel";
import { PortfolioSummaryWidget } from "@/features/trading/portfolio-summary-widget";
import { TickerHeader } from "@/features/trading/ticker-header";

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
import { BREAKPOINTS, COLS, useTradingLayout } from "./-use-trading-layout";

const TradingGrid = lazy(() => import("@/features/trading/trading-grid"));

interface TradingLayoutProps {
  symbol: string;
}

export function TradingLayout({ symbol }: TradingLayoutProps) {
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const {
    layouts,
    rowHeight,
    onBreakpointChange,
    onLayoutChange,
    onResizeStop,
    onDragStart,
    onResizeStart,
  } = useTradingLayout();
  const bots = useTradingStore((s) => s.bots);
  const setBotStatus = useTradingStore((s) => s.setBotStatus);
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
        <TickerHeader price={MOCK_BASE_BTC} changePct={MOCK_CHANGE_PCT} />
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
            breakpoints={BREAKPOINTS}
            cols={COLS}
            rowHeight={rowHeight}
            margin={[8, 8]}
            draggableHandle=".cursor-move"
            onLayoutChange={onLayoutChange}
            onBreakpointChange={onBreakpointChange}
            onResizeStop={onResizeStop}
            onDragStart={onDragStart}
            onResizeStart={onResizeStart}
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
                    <CandleChart key={activeTimeframe} interval={activeTimeframe} />
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
            <div key="data">
              <ErrorBoundary>
                <DataPanel
                  bots={bots}
                  trades={MOCK_TRADING_TRADES}
                  onBotStatusChange={(id, s) => setBotStatus(id, s)}
                />
              </ErrorBoundary>
            </div>
          </TradingGrid>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
