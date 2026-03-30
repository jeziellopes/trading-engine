import { useState } from "react";
import type { Layout, ResponsiveLayouts } from "react-grid-layout/legacy";
import { Responsive, WidthProvider } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import { OrderBook } from "@/features/order-book/order-book";
import type { OrderFormData } from "@/features/order-entry/order-form";
import { OrderForm } from "@/features/order-entry/order-form";
import { Portfolio } from "@/features/portfolio/portfolio";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface TradingLayoutProps {
  symbol: string;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const BASE = 67843.5;

const mockOrderBookState = {
  bids: [
    { price: 67843.5, quantity: 0.842, total: 57154.4, percent: 72 },
    { price: 67840.0, quantity: 1.205, total: 81746.4, percent: 65 },
    { price: 67836.5, quantity: 2.1, total: 142456.7, percent: 55 },
    { price: 67833.0, quantity: 0.56, total: 37986.5, percent: 48 },
    { price: 67829.0, quantity: 3.42, total: 231975.2, percent: 88 },
    { price: 67825.5, quantity: 1.875, total: 127173.2, percent: 62 },
    { price: 67821.0, quantity: 0.33, total: 22380.9, percent: 28 },
    { price: 67817.5, quantity: 4.2, total: 284833.5, percent: 100 },
    { price: 67813.0, quantity: 1.05, total: 71203.7, percent: 45 },
    { price: 67809.0, quantity: 2.68, total: 181728.1, percent: 78 },
    { price: 67804.5, quantity: 0.92, total: 62380.1, percent: 38 },
    { price: 67800.0, quantity: 5.15, total: 349170.0, percent: 95 },
  ],
  asks: [
    { price: 67846.0, quantity: 0.612, total: 41522.0, percent: 42 },
    { price: 67849.5, quantity: 1.43, total: 97024.8, percent: 58 },
    { price: 67853.0, quantity: 0.275, total: 18659.6, percent: 22 },
    { price: 67856.5, quantity: 2.8, total: 189998.2, percent: 82 },
    { price: 67860.0, quantity: 1.1, total: 74646.0, percent: 50 },
    { price: 67863.5, quantity: 0.455, total: 30877.9, percent: 32 },
    { price: 67867.0, quantity: 3.6, total: 244321.2, percent: 90 },
    { price: 67870.5, quantity: 0.89, total: 60404.8, percent: 40 },
    { price: 67874.0, quantity: 1.76, total: 119458.2, percent: 68 },
    { price: 67877.5, quantity: 0.34, total: 23078.4, percent: 25 },
    { price: 67881.0, quantity: 2.1, total: 142550.1, percent: 72 },
    { price: 67884.5, quantity: 4.8, total: 325845.6, percent: 98 },
  ],
  bestBid: 67843.5,
  bestAsk: 67846.0,
  lastPrice: BASE,
  spreadAmount: 2.5,
  spreadPercent: 0.0037,
  connectionStatus: "connected" as const,
  lastPriceTick: "up" as const,
};

const mockPortfolioState = {
  totalBalance: 10000.0,
  availableBalance: 4328.5,
  unrealizedPnL: 423.7,
  positions: [
    {
      symbol: "BTCUSDT",
      quantity: 0.083,
      entryPrice: 62540.0,
      markPrice: BASE,
      unrealizedPnL: 441.0,
      unrealizedPnLPercent: 0.85,
    },
    {
      symbol: "ETHUSDT",
      quantity: 1.5,
      entryPrice: 3280.0,
      markPrice: 3263.4,
      unrealizedPnL: -24.9,
      unrealizedPnLPercent: -0.51,
    },
  ],
};

interface Trade {
  time: string;
  price: number;
  qty: number;
  side: "buy" | "sell";
}

const mockTrades: Trade[] = [
  { time: "14:32:07", price: 67843.5, qty: 0.042, side: "buy" },
  { time: "14:32:06", price: 67841.0, qty: 0.18, side: "sell" },
  { time: "14:32:05", price: 67844.5, qty: 0.012, side: "buy" },
  { time: "14:32:04", price: 67840.0, qty: 0.56, side: "sell" },
  { time: "14:32:03", price: 67845.0, qty: 0.091, side: "buy" },
  { time: "14:32:02", price: 67842.5, qty: 0.033, side: "sell" },
  { time: "14:32:01", price: 67846.0, qty: 0.207, side: "buy" },
  { time: "14:32:00", price: 67839.5, qty: 0.115, side: "sell" },
  { time: "14:31:59", price: 67847.0, qty: 0.044, side: "buy" },
  { time: "14:31:58", price: 67838.0, qty: 0.38, side: "sell" },
  { time: "14:31:57", price: 67848.5, qty: 0.022, side: "buy" },
  { time: "14:31:56", price: 67836.5, qty: 0.095, side: "sell" },
  { time: "14:31:55", price: 67850.0, qty: 0.611, side: "buy" },
  { time: "14:31:54", price: 67835.0, qty: 0.017, side: "sell" },
  { time: "14:31:53", price: 67851.5, qty: 0.088, side: "buy" },
];

// ── Candle chart ───────────────────────────────────────────────────────────────

const CANDLES = [
  { o: 67120, h: 67480, l: 67050, c: 67390 },
  { o: 67390, h: 67620, l: 67300, c: 67580 },
  { o: 67580, h: 67710, l: 67520, c: 67490 },
  { o: 67490, h: 67550, l: 67320, c: 67350 },
  { o: 67350, h: 67400, l: 67180, c: 67220 },
  { o: 67220, h: 67680, l: 67200, c: 67650 },
  { o: 67650, h: 67820, l: 67610, c: 67780 },
  { o: 67780, h: 67900, l: 67730, c: 67860 },
  { o: 67860, h: 67940, l: 67800, c: 67844 },
];

const CANDLE_MIN = 67050;
const CANDLE_MAX = 67940;
const CANDLE_RANGE = CANDLE_MAX - CANDLE_MIN;

function pct(v: number) {
  return ((v - CANDLE_MIN) / CANDLE_RANGE) * 100;
}

function CandleChart() {
  return (
    <div className="relative w-full h-full select-none">
      <div
        className="absolute right-2 top-1 font-mono text-[9px]"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {CANDLE_MAX.toLocaleString()}
      </div>
      <div
        className="absolute right-2 bottom-1 font-mono text-[9px]"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {CANDLE_MIN.toLocaleString()}
      </div>
      {[25, 50, 75].map((y) => (
        <div
          key={y}
          className="absolute w-full border-t border-dashed"
          style={{ top: `${100 - y}%`, borderColor: "var(--color-border)" }}
        />
      ))}
      <div className="absolute inset-0 flex items-end px-6 pb-2 pt-4 gap-1">
        {CANDLES.map((c) => {
          const bull = c.c >= c.o;
          const color = bull ? "var(--trading-bid)" : "var(--trading-ask)";
          const bodyTop = Math.max(pct(c.o), pct(c.c));
          const bodyBot = Math.min(pct(c.o), pct(c.c));
          const bodyH = Math.max(bodyTop - bodyBot, 0.5);
          return (
            <div
              key={`${c.o}-${c.c}-${c.h}-${c.l}`}
              className="flex-1 relative flex flex-col items-center justify-end h-full"
            >
              <div
                className="absolute w-px"
                style={{
                  backgroundColor: color,
                  bottom: `${pct(c.l)}%`,
                  height: `${pct(c.h) - pct(c.l)}%`,
                }}
              />
              <div
                className="absolute w-3/4"
                style={{
                  backgroundColor: color,
                  opacity: bull ? 0.85 : 0.7,
                  bottom: `${bodyBot}%`,
                  height: `${bodyH}%`,
                  minHeight: 2,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Panel wrapper ──────────────────────────────────────────────────────────────

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-md border border-border flex flex-col h-full overflow-hidden">
      <div className="px-3 py-2 border-b border-border shrink-0 cursor-move">
        <h2 className="text-xs font-cypher font-semibold tracking-wide uppercase text-muted-foreground select-none">
          {title}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">{children}</div>
    </div>
  );
}

// ── Grid layout config ─────────────────────────────────────────────────────────

const LAYOUT_KEY = "trading-grid-layout-v1";

const DEFAULT_LAYOUTS = {
  lg: [
    { i: "book", x: 0, y: 0, w: 2, h: 8 },
    { i: "chart", x: 2, y: 0, w: 7, h: 8 },
    { i: "order", x: 9, y: 0, w: 3, h: 4 },
    { i: "portfolio", x: 9, y: 4, w: 3, h: 4 },
    { i: "trades", x: 0, y: 8, w: 12, h: 4 },
  ],
  md: [
    { i: "book", x: 0, y: 0, w: 3, h: 8 },
    { i: "chart", x: 3, y: 0, w: 7, h: 8 },
    { i: "order", x: 0, y: 8, w: 5, h: 4 },
    { i: "portfolio", x: 5, y: 8, w: 5, h: 4 },
    { i: "trades", x: 0, y: 12, w: 10, h: 4 },
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

  const handleOrderSubmit = async (_data: OrderFormData) => {
    setOrderSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setOrderSubmitting(false);
  };

  const handleLayoutChange = (_layout: Layout, allLayouts: Partial<Record<string, Layout>>) => {
    setLayouts(allLayouts as ResponsiveLayouts<string>);
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(allLayouts));
  };

  const isPositive = true;

  return (
    <div className="w-full px-3 pb-3 flex flex-col gap-0">
      {/* ── Ticker header ───────────────────────────────── */}
      <div className="flex items-center gap-6 py-2 border-b border-border mb-2">
        <span className="font-cypher text-base font-bold" style={{ color: "var(--t-primary)" }}>
          {symbol}
        </span>
        <span
          className="font-mono text-xl tabular-nums font-semibold"
          style={{ color: "var(--trading-tick-up)" }}
        >
          {BASE.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
        <span
          className="font-mono text-xs tabular-nums px-1.5 py-0.5 rounded"
          style={{
            color: isPositive ? "var(--trading-profit)" : "var(--trading-loss)",
            backgroundColor: isPositive ? "var(--trading-bid-muted)" : "var(--trading-ask-muted)",
          }}
        >
          {isPositive ? "+" : ""}2.34%
        </span>
        <div className="flex gap-5 text-xs font-mono tabular-nums text-muted-foreground ml-2">
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
      <ResponsiveGridLayout
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
          <Panel title="Order Book">
            <OrderBook state={mockOrderBookState} />
          </Panel>
        </div>

        <div key="chart">
          <Panel title="Price Chart">
            <div className="flex items-center gap-2 px-3 pb-1 border-b border-border">
              {["1m", "5m", "15m", "1h", "4h", "1d"].map((tf) => (
                <button
                  key={tf}
                  type="button"
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors"
                  style={
                    tf === "15m"
                      ? { color: "var(--t-primary)", backgroundColor: "var(--trading-bid-muted)" }
                      : { color: "var(--color-muted-foreground)" }
                  }
                >
                  {tf}
                </button>
              ))}
            </div>
            <div className="h-full p-2">
              <CandleChart />
            </div>
          </Panel>
        </div>

        <div key="order">
          <Panel title="Place Order">
            <div className="p-3">
              <OrderForm onSubmit={handleOrderSubmit} isLoading={orderSubmitting} />
            </div>
          </Panel>
        </div>

        <div key="portfolio">
          <Panel title="Portfolio">
            <div className="p-3">
              <Portfolio state={mockPortfolioState} />
            </div>
          </Panel>
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
                  </tr>
                </thead>
                <tbody>
                  {mockTrades.map((t) => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </ResponsiveGridLayout>
    </div>
  );
}
