# Order Book UI

## Overview

Real-time order book visualization with depth chart, trades feed, and spread indicator. This is the primary showcase feature — it demonstrates high-frequency rendering performance using React 19 primitives, Zustand granular selectors, and Lightweight Charts for depth visualization.

## Architecture

```
market-data store (Zustand)
        │
        ├──► useOrderBookBids() ──► BidTable (top N levels)
        ├──► useOrderBookAsks() ──► AskTable (top N levels)
        ├──► useSpread()        ──► SpreadBar
        ├──► useTrades()        ──► TradesFeed (last 100)
        └──► useDepthChart()    ──► DepthChart (Lightweight Charts)

Layout:
┌─────────────┬──────────────┐
│  Ask Table   │              │
│─────────────│  Depth Chart │
│  Spread Bar  │              │
│─────────────│              │
│  Bid Table   │              │
├─────────────┴──────────────┤
│        Trades Feed          │
└─────────────────────────────┘
```

## Module Breakdown

### `features/order-book/BidTable.tsx`
- Renders top N bid levels (price, quantity, cumulative total)
- Horizontal bar background showing relative depth per level
- Green color coding, sorted highest price first
- Only re-renders when bid data changes (Zustand selector equality)

### `features/order-book/AskTable.tsx`
- Renders top N ask levels (price, quantity, cumulative total)
- Red color coding, sorted lowest price first
- Mirror layout of BidTable

### `features/order-book/SpreadBar.tsx`
- Shows current spread (absolute and percentage)
- Positioned between asks and bids
- Displays last trade price with directional indicator (up/down tick)

### `features/order-book/DepthChart.tsx`
- Area chart showing cumulative bid/ask depth
- Built with Lightweight Charts (lightweight-charts library)
- Updates on animation frame, not on every store change
- Shows price impact visualization: "if you market buy X BTC, you'd sweep to price Y"

### `features/order-book/TradesFeed.tsx`
- Scrolling list of recent trades (last 100 from ring buffer)
- Columns: time, price, quantity, side (buy/sell color)
- New trades animate in at the top
- Virtualized if performance requires it

### `ui/DepthBar.tsx`
- Reusable horizontal bar component for showing relative depth
- Takes `value` and `max` props, renders proportional filled background
- Used by both BidTable and AskTable

## Data Models

```typescript
interface OrderBookLevel {
  price: string;
  quantity: string;
  total: string;     // cumulative quantity
  percent: number;   // quantity relative to max visible level (for bar width)
}

interface SpreadData {
  absolute: string;  // best ask - best bid
  percentage: string;
  lastPrice: string;
  lastPriceTick: 'up' | 'down' | 'neutral';
}

interface TradeRow {
  id: number;
  time: string;      // HH:MM:SS.mmm
  price: string;
  quantity: string;
  isBuyerMaker: boolean;
}

interface DepthChartPoint {
  price: number;
  cumulativeQuantity: number;
}
```

## API Contracts

### Internal (consumed from market-data store)
- `useOrderBookBids(limit?: number)` → `OrderBookLevel[]`
- `useOrderBookAsks(limit?: number)` → `OrderBookLevel[]`
- `useSpread()` → `SpreadData`
- `useTrades()` → `TradeRow[]`
- `useDepthChartData()` → `{ bids: DepthChartPoint[], asks: DepthChartPoint[] }`

### Props
- `OrderBook` component: `{ levels?: number }` (default 20)
- `TradesFeed` component: `{ maxTrades?: number }` (default 100)

## Edge Cases

1. **Empty book on first load** — show skeleton/loading state until snapshot arrives
2. **Spread is zero or negative** — display "0.00" spread, do not show negative
3. **Extremely wide spread** — cap depth chart zoom to reasonable range, don't stretch to outliers
4. **Price levels flicker** — debounce visual updates; a level removed and re-added within one frame should not flash
5. **Trades arrive faster than render** — batch into single frame update, never drop trades from the buffer
6. **Very large quantities** — format with abbreviations (1.2M, 3.5K) to prevent column overflow
7. **Symbol switch** — show loading skeleton immediately, don't show stale data from previous symbol

## Error Scenarios

| Scenario | Response |
|---|---|
| Store returns empty bids/asks | Show "Waiting for data..." placeholder |
| Connection status is `reconnecting` | Show subtle reconnecting banner above the book |
| Connection status is `disconnected` | Dim the book, overlay "Disconnected" message |
| Lightweight Charts fails to initialize | Fallback to simple table-based depth display |

## Dependencies

- `specs/websocket-data-layer.spec.md` — consumes market-data Zustand store
- Lightweight Charts — depth chart rendering
- React 19 — transitions, memoization
- CVA — component variant styling

## Acceptance Criteria

1. Given the market-data store has a populated order book, when the OrderBook component renders, then it displays the top 20 bid and ask levels with price, quantity, and cumulative total columns.
2. Given bid levels are displayed, when a price level's quantity changes in the store, then only that row re-renders — not the entire table (verifiable via React DevTools profiler or render counter).
3. Given the order book is rendered, when the spread is calculated, then the SpreadBar shows the absolute spread and percentage between best bid and best ask.
4. Given trade events are in the store, when the TradesFeed renders, then it shows trades in reverse chronological order with time (HH:MM:SS), price, quantity, and buy/sell color coding.
5. Given the depth chart is rendered, when order book data updates, then the chart shows cumulative bid depth (green area, left) and ask depth (red area, right) with price on the x-axis.
6. Given no data has loaded yet, when the OrderBook component mounts, then it shows a skeleton loading state — not an empty table or error.
7. Given the connection status is `reconnecting`, when the UI renders, then a visible banner indicates the connection is being restored, and the last-known book data remains visible (not cleared).
8. Given the user switches symbols, when the new symbol is selected, then the order book immediately shows a loading state and does not flash stale data from the previous symbol.
9. Given bid and ask levels, when depth bars are rendered, then each bar's width is proportional to its quantity relative to the largest visible quantity.
10. Given high-frequency updates (>10/sec), when the store batches them, then the order book UI maintains 60fps without dropped frames on a mid-range device.
