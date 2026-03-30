# trading-engine

Real-time trading engine simulator. Portfolio project demonstrating React 19.2 + Vite 8 + Zustand + WebSocket data handling with live Binance market data.

## Stack

- Runtime: Node.js 22
- Framework: React 19.2 + Vite 8 (Rolldown + Oxc)
- Router: TanStack Router (typed routes, loaders, Zod search params)
- State: Zustand (streaming/UI) + TanStack Query (server cache — snapshots, metadata)
- Forms: React Hook Form + Zod
- Dashboard: react-grid-layout 2.x (draggable + resizable panels, layout persisted to localStorage)
- Charts: Lightweight Charts (depth/financial) + Recharts (portfolio analytics)
- Virtualization: TanStack Virtual (order book levels, trades feed)
- Compiler: React Compiler 1.0 (`babel-plugin-react-compiler`)
- Styling: Tailwind CSS 4 + CVA + CSS Modules + design tokens
- TypeScript: Strict mode (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- Testing: Vitest + React Testing Library
- Linting: Biome (formatting, general rules, import sorting, boundary enforcement) + ESLint (React Compiler rules only via `eslint-plugin-react-hooks`)

## Commands

- Install: `pnpm install`
- Dev: `pnpm dev`
- Test: `pnpm test`
- Test single: `pnpm vitest run --grep <pattern>`
- Test watch: `pnpm vitest`
- Lint: `pnpm lint` (runs Biome + ESLint)
- Format: `pnpm format` (Biome)
- Check: `pnpm check` (Biome lint + format check)
- Build: `pnpm build`
- Preview: `pnpm preview`

## Architecture

Ports & Adapters (Hexagonal), adapted for a client-only React SPA. Full spec: `specs/architecture.spec.md`.

```
Binance REST API ──► Snapshot ──┐
                                ├──► Zustand Store ──► React UI
Binance WebSocket ──► Stream ───┘       │
                                        ├── market-data (bids, asks, trades, connection)
                                        ├── portfolio (balances, orders, PnL)
                                        └── ui (active tab, theme, preferences)
```

**Dependency direction:** Presentation → Application → Domain ← Infrastructure

- `src/domain/` — Types, interfaces (ports), pure domain logic. **Zero external imports.**
- `src/infra/` — Adapters implementing domain ports (BinanceDataSource, LocalFillEngine)
- `src/stores/` — Zustand stores (application layer, orchestrates domain + adapters)
- `src/features/` — Feature modules (order-book, order-entry, portfolio)
- `src/ui/` — Design system primitives (DepthBar, buttons, inputs, layout)
- `src/routes/` — TanStack Router file-based routes
- `src/lib/` — Config, constants, utilities

**Import rules:** `domain/` imports nothing · `features/` never imports `infra/` · `ui/` has no domain knowledge · features don't cross-import

## Key Patterns

- **Granular Zustand selectors** — components subscribe to slices, not whole store
- **React Compiler** — no manual `useMemo`/`useCallback`/`React.memo` anywhere
- **`useEffectEvent`** — WebSocket handlers read latest state without re-subscribing
- **`<Activity>`** — hidden tabs deferred, zero render cost when inactive
- **`useActionState` + `useFormStatus`** — form lifecycle in hooks, no prop drilling
- **Ref cleanup functions** — chart instances destroyed via ref return, not useEffect
- **Frame batching** — high-frequency WS updates batched per `requestAnimationFrame`
- **`use()` over `useContext`** — conditional context reads, Suspense-compatible promises
- **No `forwardRef`** — `ref` is a regular prop
- **No `<Context.Provider>`** — use `<Context value={...}>` directly

## React Anti-Patterns (NEVER use)

These are legacy patterns. The React 19 skill enforces replacements:

| Banned | Replacement |
|--------|-------------|
| `React.memo()` | Remove — Compiler handles it |
| `useMemo()` / `useCallback()` | Remove — Compiler handles it |
| `forwardRef()` | `ref` as a regular prop |
| `<Ctx.Provider>` | `<Ctx value={v}>` |
| `useContext()` | `use(Context)` |
| `react-helmet` | `<title>`, `<meta>` in JSX |
| Conditional render destroying state | `<Activity mode="hidden">` |
| Stale closures in effects | `useEffectEvent` |

## Data Sources

- WebSocket depth: `wss://stream.binance.com:9443/ws/{symbol}@depth`
- WebSocket trades: `wss://stream.binance.com:9443/ws/{symbol}@trade`
- REST snapshot: `https://api.binance.com/api/v3/depth?symbol={SYMBOL}&limit=1000`
- No API keys required — public endpoints only

## Observability

- Logging: `console` in dev (structured wrappers when needed)
- Metrics: Chrome DevTools Performance Tracks (React 19.2 Scheduler + Components tracks)
- Connection: `connectionStatus` in Zustand store, visible banner in UI

## Deployment

- Environment: Static SPA (Vercel, Netlify, or any static host)
- CI/CD: GitHub Actions
- Build: Vite 8 production build (`npm run build` → `dist/`)
- Secrets: `.env` only, never committed (see `docs/secrets.md`)

## Conventions

- Feature-driven directory structure (`src/features/<name>/`)
- All Binance WS messages parsed with Zod before entering the store
- Strings for prices/quantities (never floating-point math on financial values)
- Ring buffer (last 100) for trades feed — no unbounded arrays
- Reconnect path: disconnect → discard book → REST snapshot → resubscribe → validate `lastUpdateId`
- Pin exact dependency versions (`--save-exact`)
- `.nvmrc` for Node version

## Secrets

- Manager: none (.env only)
- Load locally: `source .env`
- See `docs/secrets.md` for setup instructions

## Commit Conventions

- Format: `type(scope): description` (max 72 chars)
- Types: `feat`, `fix`, `docs`, `chore`, `test`, `refactor`
- Reference issues: `Closes #N` or `Refs #N`
- Co-authored-by trailer added automatically by `gitflow` agent

## Agent Routing

Use specialized agents for these tasks — they have full context and tool access:

| Task | Agent |
|------|-------|
| Create issues, file bugs, track features | `issuer` |
| Start branch, commit, open PR | `gitflow` |
| Investigate problems, read logs | `analyst` |
| Debug crashes or errors | `debugger` |
| Review code, audit PRs | `reviewer` |
| Architecture and design decisions | `architect` |
| Write or fix tests | `tester` |
| Multi-step workflows (issue → branch → PR) | `orchestrator` |

Invoke with: `/issuer`, `/gitflow`, `/analyst`, etc.

## Design System

All UI work **MUST** follow [`src/styles/tokens.css`](src/styles/tokens.css) — it is the single source of truth for colors, typography, spacing, and component patterns.

> **After editing `tokens.css`, always run:** `pnpm tokens`
> This syncs `src/lib/design-tokens.ts` from the CSS. Never edit `design-tokens.ts` directly — it is a generated file.

### Color rules — never hardcode

| Use case | CSS variable |
|----------|-------------|
| Bid / buy levels | `var(--trading-bid)` · `var(--trading-bid-muted)` |
| Ask / sell levels | `var(--trading-ask)` · `var(--trading-ask-muted)` |
| Positive PnL | `var(--trading-profit)` |
| Negative PnL | `var(--trading-loss)` |
| Price tick up/down | `var(--trading-tick-up)` · `var(--trading-tick-down)` · `var(--trading-tick-neutral)` |
| Connection status | `var(--trading-connected)` · `var(--trading-reconnecting)` · `var(--trading-disconnected)` |

Never use Tailwind color classes (`text-green-*`, `text-red-*`, `bg-green-*`) for trading semantics — always use the CSS vars above.

### Typography rules

- All prices and quantities: `tabular-nums font-mono`
- Row-level text (order book, trades): `text-sm`
- Prominent price / last trade: `text-xl`
- Large balance / PnL readout: `text-2xl`
- Display headings: `font-cypher` (Orbitron)

### Component rules

Before building a new UI component, check the component specs in `tokens.css` and existing `src/ui/` primitives. These are fully specced — do not deviate:
`orderBookRow` · `depthBar` · `spreadBar` · `connectionBanner` · `tradeRow` · `priceDisplay`

Depth bars use `opacity-15` fill, `absolute` positioning, and **inline** `width: ${percent}%` — never a Tailwind class for dynamic widths.

### Layout

Container: `w-full max-w-7xl`. Trading layout: `grid grid-cols-[300px_1fr_300px] gap-4` (order book | chart | positions).


- Use `/spec` to generate, `/red` → `/green` → `/refactor` for TDD workflow
- Implementation order: websocket-data-layer → symbol-routing → order-book-ui → simulated-order-entry
- See `ROADMAP.md` for priority tiers (P0/P1/P2) and architectural trade-offs
