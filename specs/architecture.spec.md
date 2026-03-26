# Architecture

## Overview

This project follows **Ports & Adapters** (Hexagonal Architecture), adapted for a client-only React SPA. The pattern enforces a strict dependency direction: external concerns (Binance WebSocket, REST APIs, browser APIs) never leak into domain logic or UI components. Every external integration sits behind an interface (port) with a swappable implementation (adapter).

This is not academic architecture-astronautics — the project already requires these seams. `MarketDataSource` and `OrderGateway` exist because the project will swap `BinanceDataSource` → `RelayDataSource` and `LocalFillEngine` → `OmsGateway` without touching the rest of the codebase. Hexagonal makes that promise structurally enforceable rather than aspirational.

## Why Ports & Adapters

| Alternative Considered | Why Not |
|---|---|
| **Full DDD** (aggregates, repositories, domain events, bounded contexts) | Over-scoped for a client-only SPA with 4 features. We borrow DDD vocabulary (value objects, domain services, ports) but skip the ceremony (aggregate roots, event sourcing, saga orchestrators). |
| **Feature-Sliced Design** | Each feature would need internal `domain/`, `infra/`, `ui/` subdirectories — too granular for 4 features. We use feature modules for the presentation layer and centralize domain/infra at the app level. |
| **CQRS** | No separate read/write models needed. The stores are both the command handler (apply updates) and the query surface (selectors). Splitting them adds indirection without payoff. |
| **Clean Architecture (Uncle Bob)** | Functionally identical to Hexagonal for our scope. We use Hexagonal vocabulary (ports/adapters) because it maps directly to our `MarketDataSource`/`OrderGateway` swap story. |
| **MVC / MVVM** | React + Zustand doesn't map cleanly to these. Stores are closer to "application services" than "models" or "view-models." |

**What we borrow from DDD:** Value Objects (prices as branded strings), Domain Services (book-sync, fill-rules), Ports (interfaces at the domain boundary), Ubiquitous Language (the domain types ARE the shared vocabulary between specs, tests, and code).

## Pattern: Hexagonal for a React SPA

```
                    ┌───────────────────────────────────────┐
                    │            Presentation                │
                    │   routes/ → features/ → ui/            │
                    │   (React components, TanStack Router)  │
                    └──────────────┬────────────────────────┘
                                   │ reads state, dispatches actions
                                   ▼
                    ┌───────────────────────────────────────┐
                    │            Application                 │
                    │   stores/ (Zustand)                    │
                    │   Orchestrates domain logic + adapters │
                    └──────────┬──────────┬─────────────────┘
                               │          │
              uses interfaces  │          │  injects adapters
                               ▼          ▼
          ┌─────────────────────┐    ┌──────────────────────┐
          │       Domain        │    │    Infrastructure     │
          │  types, interfaces, │◄───│  adapters that        │
          │  pure logic         │    │  implement ports      │
          │  (ZERO dependencies)│    │  (Binance, browser)   │
          └─────────────────────┘    └──────────────────────┘
```

**Dependency direction:** Presentation → Application → Domain ← Infrastructure

The Domain layer is the center — nothing inside it imports from any other layer. Infrastructure implements Domain interfaces but is never imported directly by Presentation. The Application layer (stores) wires adapters to ports.

## Layer Definitions

### Domain (`src/domain/`)

Pure TypeScript. Zero runtime dependencies. Zero imports from any other `src/` directory.

Contains:
- **Types** — `Order`, `OrderBook`, `Portfolio`, `SymbolMeta`, `ConnectionStatus`
- **Value Objects** — Prices and quantities as string types (never `number` for financial values)
- **Ports (interfaces)** — `MarketDataSource`, `OrderGateway`
- **Domain Services** — Pure functions operating on domain types: `book-sync` (merge updates, validate sequenceId), `fill-rules` (should this order fill? at what price?)
- **Validation schemas** — Zod schemas for domain types (reused by both infra parsing and form validation)

**Test strategy:** Unit tests. Pure functions, no mocking needed. Fast, deterministic.

**Rule:** If it imports `WebSocket`, `fetch`, `zustand`, `react`, or any browser API — it does not belong here.

### Infrastructure (`src/infra/`)

Adapters that implement domain ports. All external I/O lives here.

Contains:
- **`binance/`** — `BinanceDataSource` (implements `MarketDataSource`), WebSocket client, REST snapshot fetcher, Zod schemas for Binance wire format
- **`local/`** — `LocalFillEngine` (implements `OrderGateway`), client-side fill logic
- **`reconnect.ts`** — Exponential backoff reconnect manager

**Test strategy:** Integration tests. Mock the WebSocket/fetch boundary, verify adapter behavior against the port contract.

**Rule:** Infrastructure imports from `domain/` (to implement interfaces and use types). It is never imported directly by `features/` or `routes/`.

### Application (`src/stores/`)

Zustand stores that orchestrate domain logic and infrastructure adapters. This is the "use case" layer — it knows what needs to happen (fetch snapshot, merge updates, fill order) and delegates to domain services and infrastructure adapters.

Contains:
- **`market-data.ts`** — Consumes `MarketDataSource`, maintains order book and trades state, exposes granular selectors
- **`portfolio.ts`** — Consumes `OrderGateway`, manages balances, open orders, filled orders, PnL
- **`ui.ts`** — UI-only state (active tab, theme, preferences), synced with TanStack Router search params

**Test strategy:** Integration tests with mock adapters. Verify store behavior (actions, selectors, state transitions).

**Rule:** Stores import from `domain/` (types, services) and receive `infra/` adapters via injection (factory functions in `lib/config.ts`). Stores never instantiate adapters directly.

### Presentation (`src/features/`, `src/routes/`, `src/ui/`)

React components that render state from stores and dispatch actions.

- **`features/<name>/`** — Feature modules. Each contains the components for one feature (order book, order entry, etc.). Import from `stores/` (selectors, actions) and `domain/` (types for props). Never import from `infra/`.
- **`routes/`** — TanStack Router file-based routes. Compose features into pages. Route loaders read from stores.
- **`ui/`** — Design system primitives. Zero domain knowledge — these are pure visual components (`DepthBar`, buttons, inputs, layout). Import only from `ui/` itself and CSS.

**Test strategy:** Component tests with React Testing Library. Mock stores via Zustand's testing utilities.

**Rule:** Components read state via selectors, dispatch via store actions. They never call infrastructure directly (no `fetch`, no `new WebSocket` in a component).

### Shared (`src/lib/`)

Utilities and configuration. Cross-cutting concerns that don't fit into a single layer.

- **`config.ts`** — `AppConfig`, factory functions (`createDataSource`, `createOrderGateway`), environment-driven adapter selection
- **`constants.ts`** — App-wide constants (reconnect timings, ring buffer sizes)
- **`utils.ts`** — Generic utilities (formatting, time helpers)

**Rule:** `lib/` may import from `domain/` (to reference types in config). It must not import from `stores/`, `features/`, or `routes/`.

## Directory Structure

```
src/
├── domain/
│   ├── market-data/
│   │   ├── types.ts              # OrderBook, DepthSnapshot, DepthUpdate, TradeEvent, ConnectionStatus
│   │   ├── normalized.ts         # NormalizedSnapshot, NormalizedDepthUpdate, NormalizedTrade
│   │   ├── MarketDataSource.ts   # Port interface
│   │   ├── book-sync.ts          # Pure: merge updates, validate sequenceId, remove zero-qty levels
│   │   └── schemas.ts            # Zod schemas for normalized domain types
│   ├── trading/
│   │   ├── types.ts              # Order, OrderInput, OrderSide, OrderType, OrderStatus, Portfolio
│   │   ├── OrderGateway.ts       # Port interface (submit, cancel, onOrderUpdate)
│   │   ├── fill-rules.ts         # Pure: should this limit order fill? At what price?
│   │   └── schemas.ts            # Zod schemas for order validation (shared by form + gateway)
│   └── symbols/
│       ├── types.ts              # SymbolMeta, SymbolSearchParams
│       └── registry.ts           # supportedSymbols[], isValidSymbol(), getSymbolMeta()
│
├── infra/
│   ├── binance/
│   │   ├── BinanceDataSource.ts  # Implements MarketDataSource
│   │   ├── ws-client.ts          # WebSocket connection lifecycle, ping/pong
│   │   ├── snapshot.ts           # REST /api/v3/depth fetcher
│   │   └── schemas.ts            # Zod schemas for Binance wire format (DepthUpdate, TradeEvent)
│   ├── local/
│   │   └── LocalFillEngine.ts    # Implements OrderGateway (client-side fills)
│   └── reconnect.ts              # Exponential backoff manager
│
├── stores/
│   ├── market-data.ts            # Order book, trades, connection status
│   ├── portfolio.ts              # Balances, open orders, filled orders, PnL
│   └── ui.ts                     # Active tab, theme, preferences
│
├── features/
│   ├── order-book/
│   │   ├── BidTable.tsx
│   │   ├── AskTable.tsx
│   │   ├── SpreadBar.tsx
│   │   ├── DepthChart.tsx
│   │   └── TradesFeed.tsx
│   ├── order-entry/
│   │   ├── OrderForm.tsx
│   │   ├── OrderConfirmation.tsx
│   │   ├── OpenOrders.tsx
│   │   └── TradeHistory.tsx
│   └── portfolio/
│       └── PortfolioView.tsx
│
├── ui/
│   ├── DepthBar.tsx
│   ├── PriceDisplay.tsx
│   ├── ConnectionBanner.tsx
│   └── layout/
│       └── TradingLayout.tsx
│
├── routes/
│   ├── __root.tsx
│   ├── index.tsx
│   └── symbol/
│       └── $ticker.tsx
│
└── lib/
    ├── config.ts                 # AppConfig, createDataSource(), createOrderGateway()
    ├── constants.ts              # RECONNECT_MAX_DELAY, RING_BUFFER_SIZE, etc.
    └── utils.ts                  # formatPrice(), formatQuantity(), formatTime()
```

## Dependency Rules

### Allowed Import Matrix

| Importer ↓ / Importee → | `domain/` | `infra/` | `stores/` | `features/` | `ui/` | `routes/` | `lib/` |
|---|---|---|---|---|---|---|---|
| **`domain/`** | self | **NO** | **NO** | **NO** | **NO** | **NO** | **NO** |
| **`infra/`** | YES | self | **NO** | **NO** | **NO** | **NO** | YES |
| **`stores/`** | YES | via injection | self | **NO** | **NO** | **NO** | YES |
| **`features/`** | YES (types) | **NO** | YES | self | YES | **NO** | YES |
| **`ui/`** | **NO** | **NO** | **NO** | **NO** | self | **NO** | YES |
| **`routes/`** | YES (types) | **NO** | YES | YES | YES | self | YES |
| **`lib/`** | YES (types) | **NO** | **NO** | **NO** | **NO** | **NO** | self |

### Critical Rules

1. **Domain imports nothing.** `src/domain/` has zero imports from other `src/` directories. It is the architectural center.
2. **Features never touch infra.** `src/features/` never imports from `src/infra/`. All external data flows through stores.
3. **UI has no domain knowledge.** `src/ui/` is a pure design system. It renders props — it doesn't know what an `Order` or `OrderBook` is.
4. **Stores receive adapters, they don't create them.** Factory functions in `lib/config.ts` create adapters and inject them into store initialization. Stores depend on the `MarketDataSource` interface, not `BinanceDataSource`.
5. **Features don't import other features.** Cross-feature communication goes through stores. `order-entry` reads best bid/ask from the market-data store, not from `order-book` components.

### Enforcement

Biome handles boundary enforcement via `noRestrictedImports` overrides per directory. ESLint is retained solely for React Compiler rules (`eslint-plugin-react-hooks`) — it has no role in boundary enforcement.

```jsonc
// biome.json — layer boundary enforcement (excerpted)
{
  "overrides": [
    {
      "includes": ["src/domain/**"],
      "linter": {
        "rules": {
          "nursery": {
            "noRestrictedImports": {
              "level": "error",
              "options": {
                "paths": {
                  "@/infra": "Domain must not import infrastructure",
                  "@/stores": "Domain must not import application layer",
                  "@/features": "Domain must not import presentation",
                  "@/routes": "Domain must not import routes",
                  "@/ui": "Domain must not import UI primitives"
                }
              }
            }
          }
        }
      }
    },
    {
      "includes": ["src/features/**"],
      "linter": {
        "rules": {
          "nursery": {
            "noRestrictedImports": {
              "level": "error",
              "options": {
                "paths": {
                  "@/infra": "Features must not import infrastructure. Use stores."
                }
              }
            }
          }
        }
      }
    },
    {
      "includes": ["src/ui/**"],
      "linter": {
        "rules": {
          "nursery": {
            "noRestrictedImports": {
              "level": "error",
              "options": {
                "paths": {
                  "@/domain": "UI primitives must not import domain types",
                  "@/stores": "UI primitives must not import stores",
                  "@/infra": "UI primitives must not import infrastructure"
                }
              }
            }
          }
        }
      }
    }
  ]
}
```

**Pipeline:**
```
pnpm check     → Biome lint + format check (boundaries, imports, style)
pnpm lint      → Biome check + ESLint (React Compiler rules only)
pnpm format    → Biome format --write
```

## Domain Model

### Value Objects

Immutable, identity-less types compared by value. In this project, all financial values are strings to avoid floating-point corruption.

| Value Object | Type | Why |
|---|---|---|
| `Price` | `string` | `"42156.78"` — never a `number`. String comparison and arithmetic via a decimal library. |
| `Quantity` | `string` | `"0.00150"` — precision matters. Trailing zeros are significant in trading. |
| `OrderSide` | `'buy' \| 'sell'` | Discriminated union. Exhaustive switch safety via TypeScript. |
| `OrderType` | `'market' \| 'limit'` | Discriminated union. |
| `OrderStatus` | 7-member union | Full lifecycle: `new → submitted → accepted → partially_filled → filled → cancelled → rejected`. |
| `ConnectionStatus` | `'connected' \| 'reconnecting' \| 'disconnected'` | Connection state machine. |

### Entities

Objects with identity that have a lifecycle.

| Entity | Identity | Lifecycle |
|---|---|---|
| `Order` | `id: string` (UUID) + `clientOrderId` (idempotency key) | `new → submitted → [accepted] → filled \| cancelled \| rejected` |
| `SymbolMeta` | `symbol: string` (`"BTCUSDT"`) | Static — loaded from registry, never mutated |

### Ports (Interfaces)

Contracts that the domain defines and infrastructure implements.

| Port | Defined In | Current Adapter | Future Adapter |
|---|---|---|---|
| `MarketDataSource` | `domain/market-data/MarketDataSource.ts` | `BinanceDataSource` | `RelayDataSource` |
| `OrderGateway` | `domain/trading/OrderGateway.ts` | `LocalFillEngine` | `OmsGateway` |

### Domain Services

Pure functions that operate on domain types. No side effects, no I/O.

| Service | Location | Responsibility |
|---|---|---|
| `bookSync` | `domain/market-data/book-sync.ts` | Merge depth updates into snapshot, validate sequenceId, remove zero-qty levels |
| `fillRules` | `domain/trading/fill-rules.ts` | Determine if a limit order should fill given current book state, calculate fill price |
| `symbolRegistry` | `domain/symbols/registry.ts` | Validate ticker, lookup symbol metadata, normalize case |

## Adapter Injection

Stores never instantiate adapters. A factory in `lib/config.ts` wires them:

```typescript
// lib/config.ts
import type { MarketDataSource } from '@/domain/market-data/MarketDataSource';
import type { OrderGateway } from '@/domain/trading/OrderGateway';

export type AppMode = 'local' | 'relay';

export interface AppConfig {
  mode: AppMode;
  dataSource: 'binance' | 'relay';
  orderGateway: 'local' | 'oms';
}

export function createDataSource(config: AppConfig): MarketDataSource {
  if (config.dataSource === 'relay') {
    // Lazy import — RelayDataSource only loaded when needed
    const { RelayDataSource } = await import('@/infra/relay/RelayDataSource');
    return new RelayDataSource(config.relayUrl!);
  }
  const { BinanceDataSource } = await import('@/infra/binance/BinanceDataSource');
  return new BinanceDataSource();
}

export function createOrderGateway(config: AppConfig): OrderGateway {
  if (config.orderGateway === 'oms') {
    const { OmsGateway } = await import('@/infra/oms/OmsGateway');
    return new OmsGateway(config.omsUrl!);
  }
  const { LocalFillEngine } = await import('@/infra/local/LocalFillEngine');
  return new LocalFillEngine();
}

// App entrypoint calls these and passes adapters to store initialization
```

This means adding a new exchange or backend is:
1. Write a new adapter in `infra/` implementing the existing port
2. Add a case to the factory
3. Set the environment variable

No store, feature, or component changes.

## Feature Module Structure

Every feature follows this template:

```
src/features/<name>/
├── <Name>Component.tsx       # Primary component
├── <SubComponent>.tsx        # Sub-components (if needed)
├── hooks.ts                  # Feature-specific hooks (if needed)
├── types.ts                  # Feature-local view types (derived from domain types)
└── __tests__/
    └── <Name>Component.test.tsx
```

**Allowed imports within a feature module:**
- `@/domain/*` — for types used in props and logic
- `@/stores/*` — for selectors and actions
- `@/ui/*` — for design system primitives
- `@/lib/*` — for utilities and constants
- React, third-party UI libraries (Lightweight Charts, React Hook Form)

**Not allowed:**
- Other features (`@/features/other-name/*`)
- Infrastructure (`@/infra/*`)

## Extension Playbook

How the architecture handles recruiter questions:

### "How would you add a new trading pair?"

1. Add entry to `domain/symbols/registry.ts` — symbol metadata (precision, display name)
2. Done. Everything else (routing, WebSocket subscription, order entry) is symbol-agnostic.

**No architecture changes. No new files.**

### "How would you add candlestick charts?"

1. Domain: add `CandlestickBar` type to `domain/market-data/types.ts`
2. Domain: add `onCandlestick()` callback to `MarketDataSource` port
3. Infra: implement candlestick stream in `BinanceDataSource` (Binance `@kline_1m`)
4. Store: add candlestick slice to `stores/market-data.ts`
5. Feature: create `features/candlestick-chart/` with Lightweight Charts time-series
6. Route: add tab option in `routes/symbol/$ticker.tsx`

**Follows the same layers. No cross-cutting changes.**

### "How would you connect to a real backend?"

Already documented in `specs/integration-boundaries.spec.md`:
1. Write `RelayDataSource` in `infra/relay/` (implements `MarketDataSource`)
2. Write `OmsGateway` in `infra/oms/` (implements `OrderGateway`)
3. Set `VITE_APP_MODE=relay`
4. Zero changes to stores, features, or routes.

**The architecture was designed for this swap.**

### "How would you add a second exchange?"

1. Write `KrakenDataSource` in `infra/kraken/` (implements `MarketDataSource`)
2. Add Zod schemas for Kraken wire format in `infra/kraken/schemas.ts`
3. Normalize Kraken data to `NormalizedSnapshot`/`NormalizedDepthUpdate` (same types BinanceDataSource outputs)
4. Add factory case in `lib/config.ts`

**The normalization layer in `domain/market-data/normalized.ts` is the seam. All exchanges produce the same normalized types.**

### "How would you add user authentication?"

1. Domain: add `AuthToken` type, `AuthProvider` port in `domain/auth/`
2. Infra: implement `JwtAuthProvider` in `infra/auth/`
3. Store: add `stores/auth.ts` with login state, token refresh
4. Route: add protected route guard in `routes/` (TanStack Router `beforeLoad`)
5. Inject auth token into `MarketDataSource.connect()` and `OrderGateway.submit()` via factory

**New domain, new infra, new store. Existing layers untouched.**

### "How would you add WebSocket message persistence for replay?"

1. Infra: create `MessageRecorder` adapter that wraps any `MarketDataSource` and writes messages to IndexedDB
2. Infra: create `ReplayDataSource` that reads from IndexedDB and plays back through the same `MarketDataSource` interface
3. Store/features: unchanged — they consume `MarketDataSource` regardless of source

**Decorator pattern on the port. Zero changes below.**

## Test Strategy Per Layer

| Layer | Test Type | Runner | Mocking |
|---|---|---|---|
| `domain/` | Unit | Vitest | None — pure functions |
| `infra/` | Integration | Vitest | Mock `WebSocket`, mock `fetch` |
| `stores/` | Integration | Vitest | Mock adapters (implement ports with test doubles) |
| `features/` | Component | Vitest + RTL | Mock stores via `zustand/testing` |
| `routes/` | Component + E2E | Vitest + RTL (+ Playwright for E2E) | Mock stores, test router integration |

**Test pyramid:**
- Many unit tests in `domain/` (fast, cheap, high confidence)
- Moderate integration tests in `stores/` and `infra/` (medium speed, verify wiring)
- Fewer component tests in `features/` (slower, verify rendering)
- Minimal E2E (expensive, verify critical user flows only)

## What We Deliberately Skip

| Pattern | Why We Skip It | When We'd Add It |
|---|---|---|
| **Aggregate Roots** | No complex invariants spanning multiple entities. An `Order` doesn't need to coordinate with other orders through an aggregate. | If adding a matching engine with order-book-level invariants (price-time priority, self-trade prevention). |
| **Event Sourcing** | Overkill for session-only state. We don't need audit trails or time-travel debugging (yet). | If adding trade replay, portfolio analytics over time, or regulatory audit requirements. |
| **Repository Pattern** | No persistence layer. Zustand stores ARE the in-memory repository. | If adding IndexedDB or backend database persistence — repositories would abstract the storage mechanism. |
| **Domain Events** | Store actions + selectors serve the same purpose (notify dependents of state changes) without the pub/sub ceremony. | If features need loose coupling beyond what Zustand selectors provide, or for cross-store coordination. |
| **Saga / Process Manager** | The reconnect flow is simple enough as imperative code. No long-running multi-step processes. | If adding complex workflows like "submit order → wait for risk check → wait for exchange ack → update portfolio" that span multiple async boundaries. |
| **Anti-Corruption Layer** | The Zod schemas in `infra/binance/schemas.ts` + normalization already serve this purpose. No formal ACL class needed. | If integrating with a legacy system that requires complex translation, not just schema validation. |

## Acceptance Criteria

1. Given the directory structure is created, when any file in `domain/` is inspected, then it has zero imports from `infra/`, `stores/`, `features/`, `routes/`, or `ui/`.
2. Given a feature component needs market data, when it imports, then it imports from `stores/` (selectors) and `domain/` (types) — never from `infra/`.
3. Given `VITE_APP_MODE=local`, when the app initializes, then the factory creates `BinanceDataSource` and `LocalFillEngine` without any feature or store knowing the concrete type.
4. Given a new adapter is added to `infra/`, when it implements an existing port, then zero changes are needed in `stores/`, `features/`, or `routes/`.
5. Given the ESLint config includes boundary rules, when `pnpm lint` runs, then any cross-layer import violation is reported as an error.
6. Given domain logic in `book-sync.ts`, when tested, then tests run without mocking any external dependency — pure input/output.
7. Given a new feature is added following the feature module template, when it is composed into a route, then it only imports from allowed layers (`stores/`, `domain/`, `ui/`, `lib/`).
8. Given the order gateway adapter is swapped from `LocalFillEngine` to `OmsGateway`, when the portfolio store operates, then its behavior is unchanged — it calls the same `OrderGateway` interface methods.
