# Trading Engine

Real-time trading engine simulator with live Binance market data, built with React 19.2, Vite 8, and the React Compiler.

## What This Is

A portfolio project demonstrating high-frequency UI rendering with modern React. Live WebSocket streams from Binance power a real-time order book, depth chart, and trades feed — rendered at 60fps with zero manual memoization.

## Features

- **Live Order Book** — Real-time bid/ask depth from Binance WebSocket streams
- **Depth Chart** — Cumulative depth visualization with Lightweight Charts (WebGL)
- **Trades Feed** — Live trade stream with ring buffer (last 100 trades)
- **Symbol Routing** — Type-safe routes with TanStack Router (`/symbol/BTCUSDT`)
- **Simulated Order Entry** — Paper trading with optimistic UI and Zod validation
- **Portfolio Tracker** — Virtual balances, PnL, and trade history

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 22 |
| Framework | React 19.2 |
| Bundler | Vite 8 (Rolldown + Oxc) |
| Compiler | React Compiler 1.0 |
| Router | TanStack Router |
| Server State | TanStack Query (snapshots, metadata) |
| Streaming State | Zustand (order book, trades, portfolio) |
| Forms | React Hook Form + Zod |
| Virtualization | TanStack Virtual (order book, trades feed) |
| Charts | Lightweight Charts + Recharts |
| Styling | Tailwind CSS 4 + CVA + Design Tokens |
| TypeScript | Strict mode |
| Linting | Biome + ESLint (React Compiler rules only) |
| Testing | Vitest + React Testing Library |

## Quick Start

```bash
nvm use
pnpm install
pnpm dev
```

## Commands

```bash
pnpm dev          # Start dev server
pnpm test         # Run tests
pnpm lint         # Lint
pnpm build        # Production build → dist/
pnpm preview      # Preview production build
```

## Architecture

Client-only SPA. No backend. Binance public WebSocket streams feed a Zustand store; React components subscribe via granular selectors.

```
Binance REST ──► Snapshot ──┐
                            ├──► Zustand Store ──► React UI
Binance WS   ──► Stream ───┘
```

```
src/
├── domain/      # Types, interfaces (ports), pure logic — zero external imports
├── infra/       # Adapters (BinanceDataSource, LocalFillEngine)
├── stores/      # Zustand stores (application layer)
├── features/    # Feature modules (order-book, order-entry, portfolio)
├── ui/          # Design system primitives
├── routes/      # TanStack Router file-based routes
└── lib/         # Config, constants, utilities
```

## React 19.2 Features Demonstrated

- **React Compiler** — zero `useMemo`/`useCallback`/`React.memo` in the entire codebase
- **`<Activity>`** — hidden tabs pre-rendered with deferred updates
- **`useEffectEvent`** — WebSocket handlers read latest state without re-subscribing
- **`useOptimistic`** — instant order fill feedback with automatic rollback
- **`useActionState`** — form lifecycle (pending/error/success) in a single hook
- **`use()`** — conditional context reads and Suspense-compatible promises
- **Ref cleanup functions** — chart instances destroyed via ref return
- **Performance Tracks** — custom Chrome DevTools profiling tracks

## Data Sources

All data comes from Binance public endpoints (no API key required):

| Stream | Endpoint |
|--------|----------|
| Depth | `wss://stream.binance.com:9443/ws/{symbol}@depth` |
| Trades | `wss://stream.binance.com:9443/ws/{symbol}@trade` |
| Snapshot | `https://api.binance.com/api/v3/depth?symbol={SYMBOL}&limit=1000` |

## Performance

The order book receives 10-50 WebSocket updates per second. The render pipeline:

1. WebSocket frame → Zustand batch update (single mutation)
2. React automatic batching (single render cycle)
3. React Compiler (automatic memoization at build time)
4. Granular selectors (only affected rows re-render)
5. TanStack Virtual (only visible rows in DOM — order book + trades)
6. `<Activity>` (hidden tabs = zero render cost)
7. `requestAnimationFrame` batching (visual updates capped at 60fps)

## Backend Integration

The frontend is designed for future backend integration without rewrites. Two interfaces define the swap boundaries:

- **`MarketDataSource`** — swap `BinanceDataSource` (browser → Binance) for `RelayDataSource` (browser → your server → Binance)
- **`OrderGateway`** — swap `LocalFillEngine` (client-side) for `OmsGateway` (REST/WS to your OMS)

See [`specs/integration-boundaries.spec.md`](specs/integration-boundaries.spec.md) for migration paths.

## Documentation

| Document | Purpose |
|----------|---------|
| [`docs/PRD.md`](docs/PRD.md) | Business context, user flows, quality criteria |
| [`ROADMAP.md`](ROADMAP.md) | Priority tiers (P0/P1/P2), trade-offs, risks |
| [`SPECS.md`](SPECS.md) | Spec index with dependency graph |
| [`specs/tech-stack.spec.md`](specs/tech-stack.spec.md) | Stack choices and feature rationale |
| [`CLAUDE.md`](CLAUDE.md) | Development conventions and agent routing |
| [`design-system.json`](design-system.json) | Design tokens (colors, typography, spacing) |

## License

MIT
