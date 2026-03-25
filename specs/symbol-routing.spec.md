# Symbol Routing

## Overview

Type-safe routing with TanStack Router enabling navigation between trading pairs (e.g., `/symbol/BTCUSDT`, `/symbol/ETHUSDT`). Routes use loaders for data prefetching and search params for UI state persistence. This feature demonstrates typed route trees, loader patterns, and seamless symbol switching without data corruption.

## Architecture

```
URL: /symbol/:ticker?tab=book&levels=20
         │              │
         ▼              ▼
   Route Param     Search Params
         │              │
         ▼              ▼
   Route Loader    UI State (Zustand)
         │
         ├──► Validate ticker exists
         ├──► Trigger symbol switch in market-data store
         └──► Return loader data (symbol metadata)

Route Tree:
/                    → Home (market overview / redirect)
/symbol/:ticker      → Symbol detail (order book + trades + depth)
/portfolio           → Portfolio simulator (P1)
```

## Module Breakdown

### `routes/__root.tsx`
- Root layout with navigation header
- Connection status indicator (from market-data store)
- Error boundary wrapping all child routes

### `routes/index.tsx`
- Landing page: list of available symbols or redirect to default (`/symbol/BTCUSDT`)
- Minimal — serves as entry point

### `routes/symbol/$ticker.tsx`
- Main trading view for a specific symbol
- Route param: `ticker` (validated against known symbols)
- Search params: `tab` (book | trades | depth), `levels` (number)
- Loader: validates ticker, triggers symbol switch, returns metadata
- Renders OrderBook, TradesFeed, DepthChart based on active tab

### `core/symbols.ts`
- Static list of supported symbols (initially just `BTCUSDT`, extensible)
- Validation function: `isValidSymbol(ticker: string): boolean`
- Symbol metadata: display name, base asset, quote asset, decimal precision

### `stores/ui.ts`
- Zustand slice for UI-only state that mirrors search params
- Active tab, visible depth levels, user preferences
- Synced bidirectionally with TanStack Router search params

## Data Models

```typescript
interface SymbolMeta {
  symbol: string;        // "BTCUSDT"
  baseAsset: string;     // "BTC"
  quoteAsset: string;    // "USDT"
  pricePrecision: number; // 2
  qtyPrecision: number;   // 5
}

interface SymbolSearchParams {
  tab?: 'book' | 'trades' | 'depth';
  levels?: number;
}

const supportedSymbols: SymbolMeta[] = [
  { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT', pricePrecision: 2, qtyPrecision: 5 },
  { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT', pricePrecision: 2, qtyPrecision: 4 },
];
```

## API Contracts

### Route Definitions (TanStack Router)
- `Route('/symbol/$ticker')` — param `ticker: string`, validated by loader
- Search params schema (Zod): `{ tab: z.enum(['book','trades','depth']).optional(), levels: z.number().optional() }`

### Loader
- Input: `{ params: { ticker: string }, search: SymbolSearchParams }`
- Returns: `SymbolMeta` if valid
- Throws: `notFound()` if ticker is not in supported symbols

### Internal
- `useSymbol()` → current `SymbolMeta` from route context
- `useSymbolSearch()` → typed search params with defaults

## Edge Cases

1. **Unknown ticker in URL** — loader throws `notFound()`, TanStack Router renders 404 component
2. **Ticker case sensitivity** — normalize to uppercase in loader (`btcusdt` → `BTCUSDT`)
3. **Invalid search params** — Zod schema provides defaults (`tab: 'book'`, `levels: 20`)
4. **Back/forward navigation** — search params and symbol restore correctly from history
5. **Direct URL access** — deep linking to `/symbol/ETHUSDT?tab=depth` works on first load
6. **Rapid symbol switching** — previous symbol's data is discarded before new symbol loads (no cross-contamination)

## Error Scenarios

| Scenario | Response |
|---|---|
| Invalid ticker param | Loader throws `notFound()` → 404 page with "Symbol not found" |
| Loader fails (unexpected) | Error boundary catches, shows retry option |
| Symbol switch during active stream | Previous stream unsubscribed, new stream initialized (handled by data layer) |

## Dependencies

- `specs/websocket-data-layer.spec.md` — symbol switch triggers stream resubscribe
- TanStack Router — route tree, loaders, search params
- Zod — search param validation

## Acceptance Criteria

1. Given the route `/symbol/BTCUSDT` is accessed, when the loader runs, then it validates the ticker, returns `SymbolMeta` for BTCUSDT, and the trading view renders with BTCUSDT data.
2. Given an invalid ticker like `/symbol/FAKECOIN`, when the loader runs, then it throws a not-found error and the router renders a 404 page.
3. Given a lowercase ticker like `/symbol/btcusdt`, when the loader runs, then it normalizes to `BTCUSDT` and renders correctly.
4. Given the URL `/symbol/BTCUSDT?tab=depth&levels=50`, when the page loads, then the depth chart tab is active and 50 levels are displayed.
5. Given no search params are provided, when the page loads, then defaults are applied: `tab='book'` and `levels=20`.
6. Given the user navigates from `/symbol/BTCUSDT` to `/symbol/ETHUSDT`, when the transition occurs, then the WebSocket data layer switches symbols and the UI shows a loading state until the new data arrives — no BTCUSDT data is shown on the ETHUSDT page.
7. Given the user clicks browser back after switching symbols, when the previous route is restored, then the correct symbol and search params are restored from history.
8. Given the root route `/` is accessed, when the page loads, then the user is redirected to `/symbol/BTCUSDT` (default symbol).
9. Given an error boundary is in place, when the loader throws an unexpected error, then the error boundary renders a fallback UI with a retry action.
