# Integration Boundaries

## Overview

Defines the seams where a backend (OMS, relay server, persistence) would plug into the trading engine frontend. This spec does not describe the backend itself — it documents what the client owns today, what it would stop owning, and the interfaces that bridge the two.

The goal is that the frontend implementation never needs a rewrite to integrate a backend — only the modules behind these interfaces get swapped.

## Architecture: Client-Only vs Full Stack

```
TODAY (client-only):

Browser ──► Binance WS    Browser ──► Binance REST
   │                         │
   ▼                         ▼
BinanceDataSource       BinanceDataSource
   │                         │
   └────────┬────────────────┘
            ▼
    market-data store ──► UI
    portfolio store   ──► UI
    LocalFillEngine   ──► portfolio store


FUTURE (with backend):

Browser ──► Relay Server ──► Binance WS / REST
   │              │
   ▼              ▼
RelayDataSource   OmsGateway
   │              │
   └──────┬───────┘
          ▼
  market-data store ──► UI
  portfolio store   ──► UI (server-reconciled)
```

## Boundary 1: Market Data (`MarketDataSource`)

**Defined in:** `specs/websocket-data-layer.spec.md`

### What the Client Owns Today

- Direct WebSocket connection to Binance
- REST snapshot fetching
- Binance wire format parsing (Zod schemas)
- Book sync logic (sequenceId validation, level merging)
- Reconnect with exponential backoff
- Frame batching for UI updates

### What Moves to the Backend

| Responsibility | Client Today | Backend Future |
|---|---|---|
| WebSocket connection to exchange | Browser → Binance | Server → Binance |
| Rate limit management | Client retries on 429 | Server manages connection pool |
| Multi-client fan-out | N/A (single user) | Server multiplexes to N browser clients |
| Book assembly | Client merges snapshot + stream | Server delivers pre-assembled book (or client merges from relay stream) |
| Reconnect to exchange | Client handles | Server handles; client only reconnects to relay |
| Wire format parsing | Client parses Binance JSON | Server normalizes; client receives `NormalizedSnapshot`/`NormalizedDepthUpdate` |
| Multiple exchanges | Not supported | Server abstracts exchange differences behind `MarketDataSource` |

### What Stays on the Client

- `MarketDataSource` consumer code (store updates, selectors)
- Frame batching and UI render throttling
- Connection status display
- Symbol switching logic (unsubscribe/resubscribe via `MarketDataSource`)

### Relay Protocol (Suggested)

The relay server would expose a WebSocket endpoint that mirrors the `MarketDataSource` interface:

```typescript
// Client → Relay
type ClientMessage =
  | { type: 'subscribe'; symbol: string }
  | { type: 'unsubscribe'; symbol: string };

// Relay → Client
type RelayMessage =
  | { type: 'snapshot'; data: NormalizedSnapshot }
  | { type: 'depth'; data: NormalizedDepthUpdate }
  | { type: 'trade'; data: NormalizedTrade }
  | { type: 'status'; status: ConnectionStatus; reason?: string };
```

The client's `RelayDataSource` implements `MarketDataSource` by mapping these messages to the same callbacks that `BinanceDataSource` uses today. The store code is identical.

### Migration Path

1. Build `RelayDataSource` implementing `MarketDataSource`
2. Add a config flag: `VITE_DATA_SOURCE=binance|relay`
3. Factory function selects the implementation at startup
4. Remove `BinanceDataSource` when relay is stable (or keep for local dev)

---

## Boundary 2: Order Management (`OrderGateway`)

**Defined in:** `specs/simulated-order-entry.spec.md`

### What the Client Owns Today

- Order validation (Zod schema)
- `LocalFillEngine` — fills market orders at best bid/ask, monitors limit orders
- Portfolio state (balances, open orders, filled orders)
- Optimistic UI via `useOptimistic`

### What Moves to the Backend

| Responsibility | Client Today | Backend Future |
|---|---|---|
| Order validation | Client-only (Zod) | Client pre-validates, server re-validates |
| Risk checks | None | Server enforces position limits, margin, daily loss limits |
| Order matching | `LocalFillEngine` at best bid/ask | Matching engine with price-time priority, partial fills |
| Order persistence | Session-only (Zustand, lost on reload) | Database with full audit trail |
| Balance management | Client-side accounting | Server is source of truth; client shows optimistic then reconciles |
| Fill notifications | Synchronous store update | Server pushes `OrderStatusUpdate` via WebSocket |
| Order lifecycle | `new → submitted → filled` | Full lifecycle including `partially_filled`, `rejected` |

### What Stays on the Client

- Order form (RHF + Zod validation)
- Optimistic UI (`useOptimistic` shows expected state immediately)
- `OrderGateway` consumer code (submit, cancel, listen for updates)
- Portfolio display components
- PnL calculation from fill data

### Reconciliation Flow

```
User submits order
    │
    ├──► useOptimistic shows expected fill immediately
    │
    ├──► OrderGateway.submit() sends to backend
    │
    ▼
Backend processes:
    ├──► Validate (schema + business rules)
    ├──► Risk check (position limits, margin)
    ├──► Route to matching engine
    ├──► Match (full fill, partial fill, or queue)
    │
    ▼
Backend pushes OrderStatusUpdate
    │
    ├──► status: 'accepted'         → optimistic state confirmed, no UI change
    ├──► status: 'filled'           → update fillPrice, balance — useOptimistic settles
    ├──► status: 'partially_filled' → update filledQuantity, keep order open
    ├──► status: 'rejected'         → useOptimistic reverts, show rejection reason
    └──► status: 'cancelled'        → remove from open orders, restore reserved balance
```

Key principle: **the client is always optimistic, the server is always authoritative.** When they disagree, the server wins and `useOptimistic` handles the revert automatically.

### OMS Protocol (Suggested)

```typescript
// Client → OMS (REST or WebSocket)
interface OmsClientMessage {
  type: 'submit_order' | 'cancel_order';
  clientOrderId: string;  // idempotency key
  payload: OrderInput | { orderId: string };
}

// OMS → Client (WebSocket push)
interface OmsServerMessage {
  type: 'order_update';
  data: OrderStatusUpdate;
}

// REST fallback for submit/cancel
// POST /api/orders        → OrderResult
// DELETE /api/orders/:id  → CancelResult
// GET /api/orders         → Order[] (open orders)
// GET /api/orders/history → Order[] (filled/cancelled)
// GET /api/portfolio      → Portfolio
```

### Migration Path

1. Build `OmsGateway` implementing `OrderGateway`
2. Add WebSocket channel for `OrderStatusUpdate` push (can share the relay connection)
3. Backend serves initial portfolio state on connect; client hydrates store
4. Remove `LocalFillEngine` when OMS is stable (or keep for offline/demo mode)

---

## Boundary 3: Portfolio Persistence

### What the Client Owns Today

- Initial balances hardcoded: `{ USDT: "10000", BTC: "0", ETH: "0" }`
- Trade history in Zustand (lost on reload)
- PnL calculated from fill prices in memory

### What Moves to the Backend

| Responsibility | Client Today | Backend Future |
|---|---|---|
| Balance storage | Zustand (volatile) | Database (durable) |
| Trade history | In-memory array | Append-only event log |
| PnL calculation | Client derives from fills | Server calculates, client displays |
| Initial state | Hardcoded constants | Fetched from `/api/portfolio` on load |
| Multi-device sync | N/A | Server pushes balance updates to all sessions |

### What Stays on the Client

- Portfolio display components (unchanged)
- Zustand selectors (same shape, just hydrated from server instead of constants)
- Optimistic balance updates during order flow

### Hydration Flow

```
App loads
    │
    ├──► Fetch GET /api/portfolio → { balances, openOrders, filledOrders }
    │
    ├──► Hydrate portfolio store with server state
    │
    ├──► Subscribe to OMS WebSocket for live updates
    │
    └──► UI renders from store (same selectors as today)
```

### Migration Path

1. Replace hardcoded initial balances with a `fetchPortfolio()` call in the route loader
2. Store hydrates from server response instead of constants
3. Add `localStorage` as intermediate step (before full backend) for session persistence

---

## Boundary 4: Authentication (New)

Does not exist today. Required before any backend boundary is real.

### Scope

| Concern | Approach |
|---|---|
| Identity | JWT or session token from auth provider |
| Relay auth | Token sent on WebSocket handshake (`?token=...` or first message) |
| OMS auth | Bearer token on REST, token on WebSocket handshake |
| Client storage | `httpOnly` cookie (preferred) or `localStorage` (fallback) |
| Token refresh | Silent refresh before expiry; on 401, redirect to login |

### Impact on Existing Boundaries

- `MarketDataSource.connect()` — needs to pass auth token to relay
- `OrderGateway.submit()` — needs auth header/token
- Route loaders — need to check auth state before fetching portfolio
- TanStack Router — add protected route wrapper that redirects to login

### Migration Path

1. Add auth context/store (separate from market-data and portfolio)
2. Wrap `MarketDataSource` and `OrderGateway` factories to inject token
3. Add login route and auth redirect guard

---

## Interface Dependency Map

```
                    ┌─────────────────┐
                    │   Auth Provider  │
                    └────────┬────────┘
                             │ token
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
     ┌────────────┐  ┌─────────────┐  ┌──────────┐
     │ MarketData │  │  OrderGateway│  │ Portfolio │
     │   Source   │  │             │  │  Fetcher  │
     └─────┬──────┘  └──────┬──────┘  └─────┬────┘
           │                │               │
           ▼                ▼               ▼
     ┌──────────┐    ┌──────────┐    ┌──────────┐
     │ market-  │    │ portfolio│    │ portfolio│
     │ data     │    │ store    │    │ store    │
     │ store    │    │ (orders) │    │ (balance)│
     └──────────┘    └──────────┘    └──────────┘
           │                │               │
           └────────────────┼───────────────┘
                            ▼
                         React UI
                    (unchanged across all modes)
```

## Configuration Strategy

A single environment variable controls which implementations are used:

```typescript
// src/lib/config.ts
type AppMode = 'local' | 'relay';

interface AppConfig {
  mode: AppMode;
  dataSource: 'binance' | 'relay';
  orderGateway: 'local' | 'oms';
  portfolioSource: 'static' | 'api';
  relayUrl?: string;
  omsUrl?: string;
}

// VITE_APP_MODE=local  → all client-side (current behavior)
// VITE_APP_MODE=relay  → backend for data + orders + portfolio
```

Factory functions create the right implementations:

```typescript
function createDataSource(config: AppConfig): MarketDataSource {
  if (config.dataSource === 'relay') return new RelayDataSource(config.relayUrl!);
  return new BinanceDataSource();
}

function createOrderGateway(config: AppConfig): OrderGateway {
  if (config.orderGateway === 'oms') return new OmsGateway(config.omsUrl!);
  return new LocalFillEngine();
}
```

## What NOT to Build Now

These are documented for awareness, not as current work:

- **The relay server** — build it when you need multi-client or rate limit management
- **The OMS backend** — build it when you need real order persistence or matching
- **Authentication** — build it when you have a backend to protect
- **Database schema** — design it when portfolio persistence is needed

The frontend interfaces (`MarketDataSource`, `OrderGateway`) are the only deliverables. Everything else is a backend concern for a future phase.
