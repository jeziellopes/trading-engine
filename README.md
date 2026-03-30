# Trading Engine

I'm building a real-time trading terminal simulator as a portfolio project to demonstrate React 19.2, Vite 8, Zustand, and WebSocket data handling with live Binance market data — rendered at 60fps with zero manual memoization.

> **Status: Active development.** Core UI and design system are complete. WebSocket data layer in progress.

## What I'm Building

A cyberpunk-themed crypto trading dashboard that mirrors the architecture of a real exchange frontend:

- **Live order book** — bid/ask depth levels with depth bars, spread display, real-time tick animation
- **Simulated order entry** — market and limit orders against live Binance prices
- **Portfolio tracker** — balances, open positions, unrealized PnL, trade history
- **Draggable dashboard** — panels resize and reorder via `react-grid-layout`, layout persisted to localStorage
- **Design system** — five cyberpunk themes × three modes with WCAG contrast enforcement

The UI is static/paper-trading only — no real money, no API keys, no backend. The `MarketDataSource` and `OrderGateway` interfaces are designed for a real backend swap.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19.2 + Vite 8 (Rolldown + Oxc) |
| Router | TanStack Router (file-based, typed params) |
| State | Zustand (streaming) + TanStack Query (snapshots) |
| Forms | React Hook Form + Zod |
| Dashboard | react-grid-layout 2.x (draggable + resizable panels) |
| Styling | Tailwind CSS 4 + CVA + CSS custom properties |
| Compiler | React Compiler 1.0 (zero manual memoization) |
| Testing | Vitest + React Testing Library |
| Linting | Biome + ESLint (React Compiler rules) |
| Runtime | Node.js 22 |

## Quick Start

```bash
# Requires Node.js 22+ and pnpm
git clone <repo-url>
cd trading-engine
pnpm install
pnpm dev        # http://localhost:5173
```

```bash
pnpm build      # production build → dist/
pnpm test       # run all tests
pnpm lint       # Biome + ESLint
pnpm contrast   # WCAG contrast audit (195 pairs)
pnpm tokens     # regenerate design-tokens.ts from tokens.css
```

## Architecture

Ports & Adapters (Hexagonal), adapted for a client-only React SPA.

```
Binance REST ──► Snapshot ──┐
                             ├──► Zustand Store ──► React UI
Binance WS ──► Stream ───────┘
```

**Dependency direction:** Presentation → Application → Domain ← Infrastructure

```
src/
├── domain/       # Types, interfaces (ports), pure logic. Zero external imports.
├── infra/        # Adapters: BinanceDataSource, LocalFillEngine
├── stores/       # Zustand stores (orchestrate domain + adapters)
├── features/     # Feature modules: order-book, order-entry, portfolio
├── ui/           # Design system primitives: DepthBar, inputs, layout
├── routes/       # TanStack Router file-based routes
└── lib/          # Config, constants, utilities
```

## Design System

Five cyberpunk themes (`soft`, `night-city`, `ghost`, `matrix`, `vapor`) × three modes (`dark`, `light`, `vibrant`). Three-layer CSS architecture:

```
Layer 1 — [data-theme="x"]               ← palette (--t-* private vars)
Layer 2 — [data-theme="x"][data-mode="y"] ← surface system
Layer 3 — :root                          ← fonts + durations only
```

Browse the live gallery at `/design-system` — includes a theme/mode switcher, WCAG contrast audit table (195 pairs, all passing), and component showcase.

## Roadmap

| Priority | Feature | Status |
|----------|---------|--------|
| P0 | Design system + token architecture | ✅ Done |
| P0 | Order book UI components | ✅ Done |
| P0 | Dashboard layout (react-grid-layout) | ✅ Done |
| P0 | WebSocket data layer (Binance) | 🔄 In progress |
| P0 | Symbol routing with typed params | 🔄 In progress |
| P1 | Simulated order entry (fills at live price) | 📋 Spec ready |
| P1 | Portfolio tracker with live PnL | 📋 Spec ready |
| P2 | Depth chart (Lightweight Charts) | ⏳ Stretch |
| P2 | Matching engine visualizer | ⏳ Stretch |

See [`ROADMAP.md`](ROADMAP.md) for architectural trade-offs and implementation rationale.

## Key Patterns

- **React Compiler** — no `useMemo`/`useCallback`/`React.memo` anywhere
- **`useEffectEvent`** — WebSocket handlers read latest state without re-subscribing
- **`<Activity>`** — hidden tabs deferred, zero render cost when inactive
- **Frame batching** — high-frequency WS updates batched per `requestAnimationFrame`
- **Granular selectors** — components subscribe to Zustand slices, not whole store
- **Zod boundaries** — all Binance messages validated before entering the store

## Docs

- [`ROADMAP.md`](ROADMAP.md) — Priority tiers, trade-offs, implementation order
- [`SPECS.md`](SPECS.md) — Spec index with dependency graph
- [`docs/PRD.md`](docs/PRD.md) — Product requirements and user flows
- [`specs/architecture.spec.md`](specs/architecture.spec.md) — Hexagonal architecture detail
- [`specs/tech-stack.spec.md`](specs/tech-stack.spec.md) — Stack rationale
