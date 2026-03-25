# WebSocket Data Layer

## Overview

Real-time market data ingestion from Binance public WebSocket and REST APIs. This is the foundation layer — every other feature depends on it. It manages connection lifecycle, state synchronization, and exposes normalized data to the UI through Zustand stores.

## Architecture

```
Binance REST API ──► Initial Snapshot ──┐
                                        ├──► Order Book Store (Zustand)
Binance WebSocket ──► Stream Events ────┘         │
        │                                         ├──► Depth selectors
        │                                         ├──► Trades selectors
        │                                         └──► Connection status selector
        │
        └──► Reconnect Manager
                 │
                 ├──► Detect disconnect
                 ├──► Show status banner
                 ├──► Re-fetch REST snapshot
                 └──► Resubscribe stream
```

## Module Breakdown

### `core/ws-client.ts`
- Opens and manages WebSocket connections to Binance streams
- Handles ping/pong keep-alive (Binance drops idle connections after 24h)
- Emits typed events: `depth`, `trade`, `disconnect`, `reconnect`
- Supports subscribing to multiple streams per connection

### `core/snapshot.ts`
- Fetches initial L2 order book snapshot via REST (`/api/v3/depth`)
- Returns normalized `{ bids: Map<price, qty>, asks: Map<price, qty>, lastUpdateId }`
- Used on first load and after every reconnect

### `core/book-sync.ts`
- Merges incremental depth updates into the snapshot
- Applies Binance sequencing rules: discard events where `u <= lastUpdateId`
- First valid event must have `U <= lastUpdateId + 1` and `u >= lastUpdateId + 1`
- Removes price levels where quantity is `0`

### `stores/market-data.ts`
- Zustand store with slices: `orderBook`, `trades`, `connectionStatus`
- Granular selectors for bids, asks, spread, last trade, connection state
- Batches rapid WebSocket updates to limit re-renders (requestAnimationFrame or manual throttle)

### `core/reconnect.ts`
- Detects WebSocket `close` and `error` events
- Implements exponential backoff: 1s → 2s → 4s → 8s → max 30s
- On reconnect: discards stale book state → fetches fresh snapshot → resubscribes stream
- Exposes `connectionStatus: 'connected' | 'reconnecting' | 'disconnected'` to the store

## Data Models

```typescript
interface DepthSnapshot {
  lastUpdateId: number;
  bids: [string, string][]; // [price, quantity]
  asks: [string, string][];
}

interface DepthUpdate {
  e: 'depthUpdate';
  E: number;        // event time
  s: string;        // symbol
  U: number;        // first update ID
  u: number;        // final update ID
  b: [string, string][]; // bid deltas
  a: [string, string][]; // ask deltas
}

interface TradeEvent {
  e: 'trade';
  E: number;        // event time
  s: string;        // symbol
  t: number;        // trade ID
  p: string;        // price
  q: string;        // quantity
  T: number;        // trade time
  m: boolean;       // is buyer maker
}

interface OrderBook {
  bids: Map<string, string>; // price → quantity
  asks: Map<string, string>;
  lastUpdateId: number;
  lastEventTime: number;
}

type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';
```

## API Contracts

### Binance REST (consumed)
- `GET /api/v3/depth?symbol=BTCUSDT&limit=1000` → `DepthSnapshot`

### Binance WebSocket (consumed)
- `wss://stream.binance.com:9443/ws/btcusdt@depth` → `DepthUpdate` events
- `wss://stream.binance.com:9443/ws/btcusdt@trade` → `TradeEvent` events

### Internal (exposed to UI)
- `useOrderBook()` → `{ bids, asks, spread, lastUpdateId }`
- `useTrades()` → `TradeEvent[]` (last N trades, ring buffer)
- `useConnectionStatus()` → `ConnectionStatus`

## Edge Cases

1. **Stream arrives before snapshot completes** — buffer events, apply after snapshot, discard stale events by `lastUpdateId`
2. **Snapshot request fails** — retry with backoff, show loading state, do not connect stream until snapshot succeeds
3. **Symbol switch mid-stream** — unsubscribe previous, discard buffered events, fetch new snapshot, subscribe new symbol
4. **Rapid price level churn** — Map-based book handles `0`-quantity removals without array scanning
5. **Browser tab hidden** — WebSocket stays open but UI updates can be paused (requestAnimationFrame naturally stops)
6. **Multiple quick reconnects** — debounce reconnect attempts, only the latest snapshot wins

## Error Scenarios

| Scenario | Response |
|---|---|
| REST snapshot 429 (rate limit) | Backoff retry, show "Loading market data..." |
| REST snapshot network error | Retry with exponential backoff (max 3 attempts), then show error state |
| WebSocket `close` event | Trigger reconnect manager |
| WebSocket `error` event | Log error, trigger reconnect manager |
| Malformed WebSocket message | Log and skip, do not crash the store |
| Binance maintenance (503) | Show "Exchange unavailable" banner, retry every 30s |

## DataSource Interface (Backend Integration Boundary)

All market data flows through this interface. The current implementation is `BinanceDataSource` (direct browser WebSocket). A future backend would implement the same interface, routing through a relay server or OMS gateway.

```typescript
interface MarketDataSource {
  // Connection lifecycle
  connect(symbol: string): void;
  disconnect(): void;
  onStatusChange(cb: (status: ConnectionStatus) => void): void;

  // Order book
  getSnapshot(symbol: string): Promise<NormalizedSnapshot>;
  onDepthUpdate(cb: (update: NormalizedDepthUpdate) => void): void;

  // Trades
  onTrade(cb: (trade: NormalizedTrade) => void): void;
}

// Normalized types — exchange-agnostic
interface NormalizedSnapshot {
  bids: [string, string][];   // [price, quantity]
  asks: [string, string][];
  sequenceId: number;         // maps to Binance lastUpdateId, or backend sequence
}

interface NormalizedDepthUpdate {
  bids: [string, string][];
  asks: [string, string][];
  firstSequenceId: number;
  lastSequenceId: number;
}

interface NormalizedTrade {
  id: string;
  price: string;
  quantity: string;
  time: number;
  isBuyerMaker: boolean;
}
```

**Current implementation:** `BinanceDataSource` connects directly to `wss://stream.binance.com`, parses Binance wire format via Zod, and normalizes into the types above.

**Backend swap:** Replace with `RelayDataSource` that connects to your own WebSocket server. The server handles exchange connections, rate limits, authentication, and multi-client fan-out. The store and UI code remain untouched.

**What stays the same:** `stores/market-data.ts` consumes `MarketDataSource` — it never knows which exchange or relay it's talking to.

**What changes:** Only the `core/` module that implements `MarketDataSource`. Book sync logic (`sequenceId` validation) may differ per source but the interface guarantees the fields exist.

## Dependencies

- None (this is the foundation layer)
- Zustand (state management)
- Native WebSocket API (no library needed)

## Acceptance Criteria

1. Given the app loads for the first time, when the WebSocket data layer initializes, then it fetches a REST depth snapshot before subscribing to the WebSocket stream, and the order book displays the snapshot within 2 seconds.
2. Given a valid depth snapshot is loaded, when incremental depth updates arrive via WebSocket, then the order book merges updates correctly — adding new levels, updating quantities, and removing levels with quantity `0`.
3. Given incremental updates arrive, when an update has `u <= lastUpdateId` from the snapshot, then that update is discarded without modifying the book.
4. Given the WebSocket connection drops, when the client detects the disconnect, then `connectionStatus` changes to `'reconnecting'`, stale book state is discarded, a fresh REST snapshot is fetched, and the stream is resubscribed.
5. Given reconnection attempts fail, when backoff reaches the maximum (30s), then the client retries every 30s and `connectionStatus` remains `'reconnecting'`.
6. Given the connection is restored after a disconnect, when the new snapshot and stream are established, then `connectionStatus` changes to `'connected'` and the book reflects current market state.
7. Given high-frequency depth updates (>10/sec), when the store receives batched updates, then the UI re-renders at most once per animation frame — not once per WebSocket message.
8. Given the user switches symbols, when the new symbol is selected, then the previous stream is unsubscribed, buffered events are discarded, a new snapshot is fetched, and the new stream is subscribed.
9. Given trade events arrive via WebSocket, when processed by the store, then the last 100 trades are retained in a ring buffer and exposed via `useTrades()`.
10. Given a malformed WebSocket message is received, when the parser encounters it, then the message is logged and skipped without crashing the application or corrupting the store.
