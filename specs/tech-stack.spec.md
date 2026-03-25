# Tech Stack Reference

Detailed breakdown of each technology choice, the specific features we leverage, and why they matter for a real-time trading engine UI.

---

## Vite 8 (Rolldown + Oxc)

**What it is:** Next-generation bundler powered by Rust-native Rolldown (replacing esbuild/Rollup) and the Oxc toolchain (parser, transformer, linter — all in Rust).

### Features We Leverage

| Feature | How We Use It | Why It Matters |
|---|---|---|
| **Rolldown bundling** | Replaces the dual esbuild (dev) / Rollup (prod) split from Vite 5-7. Single bundler for both modes. | Identical behavior in dev and prod — no more "works in dev, breaks in build" bugs. |
| **Oxc transformer** | Handles TypeScript stripping, JSX transform, and syntax lowering at Rust speed. | Near-instant HMR — critical when iterating on high-frequency UI updates. |
| **Native CSS handling** | CSS Modules and design token imports without PostCSS overhead for basic transforms. | Faster style iteration for the order book's color-coded depth levels. |
| **Chunk splitting** | Automatic code splitting by route (`/symbol/:ticker`, `/portfolio`). Lightweight Charts and Recharts isolated to their own chunks. | Initial load only includes the active route. Depth chart library doesn't block order book render. |
| **Environment API** | `import.meta.env` with typed env vars for WebSocket URLs and feature flags. | Switch between Binance endpoints (production vs testnet) without code changes. |
| **SSR-ready architecture** | Vite 8 SSR pipeline with streaming support. | Not using SSR initially, but the project structure supports it — demonstrates awareness for interviews. |

### What We Don't Use (and Why)

- **SSR rendering** — This is a client-heavy real-time app. SSR adds complexity with no SEO benefit for a trading dashboard.
- **Vite plugin ecosystem** — Minimal plugins. Oxc replaces most Babel/SWC plugins. Fewer moving parts.

---

## React 19 + 19.2

**What it is:** React 19.x with async-first primitives, new hooks for optimistic UI and effect events, the `<Activity />` component for pre-rendering, and React Compiler 1.0 for automatic memoization.

### React 19 — Core Features We Leverage

| Feature | How We Use It | Why It Matters |
|---|---|---|
| **`useOptimistic`** | Order entry shows fills immediately before the fill engine confirms. Balance updates appear instant. | Simulated orders feel snappy. Demonstrates the hook's rollback semantics if a limit order is rejected. |
| **`useTransition`** (async Actions) | Symbol switching wraps the route change in a transition — keeps the current book visible while the new symbol loads. | No blank screen flash between symbols. The old book stays interactive until the new one is ready. |
| **`useActionState`** | Order entry form: wraps submit action, returns `[error, submitAction, isPending]`. Replaces manual `useState` + `useTransition` pairs for form error/pending state. | Single hook manages the full form lifecycle: pending → success/error → reset. |
| **`useFormStatus`** | Design system submit button reads parent form's pending state without prop drilling. `const { pending } = useFormStatus()` inside `<SubmitButton>`. | Pairs with CVA button variants — `disabled` and loading states derived from form context automatically. |
| **`use()` hook** | Read async data (symbol metadata, initial snapshot) directly in render without `useEffect` + loading state boilerplate. Can be called conditionally (after early returns). | Cleaner data loading in route components. Pairs naturally with TanStack Router loaders. Replaces `useContext` with conditional support. |
| **Automatic batching** | Multiple `setState` calls from a single WebSocket message handler batch into one render. | 50 depth updates from one WS frame = 1 React render, not 50. |
| **`ref` as prop** | Pass refs directly to components without `forwardRef` wrapper. | Cleaner component APIs for chart containers and virtualized lists. `forwardRef` is no longer needed anywhere. |
| **Ref cleanup functions** | Chart containers return cleanup from ref callback: `ref={(el) => { chart = createChart(el); return () => chart.remove(); }}` | Replaces `useEffect` cleanup for DOM-bindable libraries (Lightweight Charts). Cleanup is tied to the ref lifecycle, not the component lifecycle. |
| **`useDeferredValue` with initial** | Depth chart data deferred with empty initial: `useDeferredValue(depthData, [])`. Shows empty chart immediately, fills when ready. | Prevents heavy depth recalculation from blocking the order book's first render. |
| **Improved `Suspense`** | Suspense boundaries with proper fallback sequencing. Nested boundaries for granular loading states. Pre-warming of suspended sibling trees. | Order book skeleton loads independently from depth chart skeleton. Each section resolves when ready. |
| **`<Context>` as provider** | `<ThemeContext value="dark">` instead of `<ThemeContext.Provider value="dark">`. | Cleaner JSX. `Context.Provider` will be deprecated in a future version. |
| **Document metadata** | `<title>{symbol} — Trading Engine</title>` rendered directly in route components. `<meta>` tags hoisted to `<head>` automatically. | No `react-helmet` dependency. Dynamic page titles per symbol route. |
| **Resource preloading** | `preconnect('wss://stream.binance.com')` and `prefetchDNS('https://api.binance.com')` called from the data layer init. | Browser starts DNS/TLS handshake before the WebSocket connection is opened. Reduces first-data latency. |

### React 19.2 — New Features We Leverage

| Feature | How We Use It | Why It Matters |
|---|---|---|
| **`<Activity />`** | Pre-render hidden tabs (depth chart, trades feed) while the user views the order book. `<Activity mode={activeTab === 'depth' ? 'visible' : 'hidden'}>`. Preserves form state in order entry when switching tabs. | Hidden activities defer updates until idle — saves render budget for the active panel. State preserved without unmounting. Navigating to a pre-rendered tab is instant. |
| **`useEffectEvent`** | WebSocket reconnect handler reads latest `symbol` and `connectionConfig` without re-running the connection effect. Theme changes don't trigger WS reconnect. | Solves the "stale closure in effects" problem. The WS effect depends only on `roomId`-equivalent (symbol), while callbacks read latest state via effect events. |
| **Performance Tracks** | Chrome DevTools shows custom "Scheduler" and "Components" tracks during profiling — reveals React priority levels and component render timing. | Directly profiles our 60fps order book path. Shows whether WS updates run at "blocking" or "transition" priority. Identifies which components re-render on each frame. |
| **`useId` prefix (`_r_`)** | Generated IDs are valid CSS selectors and `view-transition-name` values. | Depth bar elements with stable IDs usable in CSS transitions without escaping. |
| **Batched Suspense reveals** | SSR Suspense boundaries reveal together instead of one-by-one. | If we add SSR later, the order book + trades + depth chart reveal as a cohesive unit, not a staggered cascade. |

### React Compiler 1.0 — Enabled (Not "Future")

The React Compiler has shipped as `babel-plugin-react-compiler` v1.0. We enable it at build time.

| Feature | How We Use It | Why It Matters |
|---|---|---|
| **Automatic memoization** | Compiler memoizes all components and hooks at build time. No manual `useMemo`, `useCallback`, or `React.memo`. | The entire order book render path — BidTable, AskTable, SpreadBar, DepthChart — is automatically memoized. Zero developer overhead. |
| **Conditional memoization** | Compiler memoizes code after early returns — impossible to express with `useMemo`. | Components that guard on `connectionStatus` or empty data can still memoize their main render path. |
| **Optional chain tracking** | `order?.price?.display` tracked as a memoization dependency. | Fewer unnecessary re-renders in components reading nested order data. |
| **Compiler ESLint rules** | `set-state-in-render`, `set-state-in-effect`, `refs` rules via `eslint-plugin-react-hooks@latest`. | Catches bugs before they hit the real-time render path. `setState` during render = render loop in a 60fps book. |

**Configuration (Vite 8):**
```js
// vite.config.ts
import react from '@vitejs/plugin-react';

export default {
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
};
```

**ESLint (flat config):**
```js
// eslint.config.js
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  reactHooks.configs['flat/recommended'],
]);
```

### Performance Strategy with React 19.2 + Compiler

```
WebSocket frame arrives (N depth updates)
    │
    ▼
Zustand batch update (single store mutation)
    │
    ▼
React automatic batching (single render cycle)
    │
    ▼
React Compiler (automatic memoization — zero manual useMemo/useCallback)
    │
    ▼
Granular selectors (only subscribed components re-render)
    │
    ▼
useTransition for heavy updates (symbol switch doesn't block input)
    │
    ▼
<Activity mode="hidden"> (inactive tabs deferred, zero render cost)
    │
    ▼
useEffectEvent (WS handlers read latest state without re-subscribing)
```

### Features We Deliberately Skip

| Feature | Why |
|---|---|
| Server Components / Server Actions | Client-only SPA — no server. |
| `cacheSignal` | RSC-only API. |
| Partial Pre-rendering / `resume` | SSR/SSG architecture — not applicable. |
| Custom Elements | Not using web components. |
| Stylesheet `precedence` management | Using CSS Modules + design tokens — React-managed stylesheets add complexity without benefit here. |

---

## TanStack Router

**What it is:** Fully type-safe router with first-class support for loaders, search params, and route context.

### Features We Leverage

| Feature | How We Use It | Why It Matters |
|---|---|---|
| **Typed route params** | `$ticker` param is typed as `string` — the loader validates and narrows it to `SymbolMeta`. | No runtime `as` casts. Invalid tickers caught at the loader level, not in component render. |
| **Search param schemas (Zod)** | `?tab=book&levels=20` validated and typed via Zod integration. Defaults applied automatically. | Shareable URLs with validated state. `levels=abc` falls back to default, doesn't crash. |
| **Route loaders** | Each route pre-fetches data before render. Symbol route validates ticker + triggers data layer. | No waterfall: data fetching starts before the component mounts. |
| **Pending UI** | Built-in pending states during navigation transitions. | Pairs with `useTransition` — show a loading indicator in the nav while the new symbol loads. |
| **Route context** | Share typed data (symbol metadata, connection status) down the route tree without prop drilling or separate context. | Components below `/symbol/$ticker` access `SymbolMeta` via route context — fully typed. |
| **File-based route generation** | Routes defined by file structure in `routes/`. Type-safe `Link` components generated automatically. | `<Link to="/symbol/$ticker" params={{ ticker: 'ETHUSDT' }}>` — typo in route path is a type error. |
| **Devtools** | TanStack Router Devtools show active routes, params, search, loaders, and cache state. | Fast debugging of routing issues during development. |

### Route Tree

```
routes/
├── __root.tsx          → Layout, nav, connection banner
├── index.tsx           → Redirect to /symbol/BTCUSDT
├── symbol/
│   └── $ticker.tsx     → Order book + trades + depth (loader validates ticker)
└── portfolio.tsx       → P1: simulated portfolio view
```

---

## Zustand

**What it is:** Minimal state management with a focus on granular subscriptions and zero boilerplate.

### Features We Leverage

| Feature | How We Use It | Why It Matters |
|---|---|---|
| **Granular selectors** | `useOrderBook(s => s.bids)` — component only re-renders when bids change, not when asks or trades change. | The order book has 3+ independent data streams updating simultaneously. Without selector granularity, every update re-renders everything. |
| **Slices pattern** | Separate slices for `marketData`, `portfolio`, `ui`. Each slice has its own actions and selectors. | Keeps store organized as it grows. Market data slice can be replaced without touching portfolio logic. |
| **`subscribeWithSelector`** | Subscribe to specific store changes outside React (e.g., the fill engine watches price changes to trigger limit order fills). | Fill engine runs as a store subscriber, not inside a React component. No unnecessary renders from fill logic. |
| **Transient updates** | For very high-frequency data (trade-by-trade), update the store without triggering React re-renders, then flush on animation frame. | Order book can ingest 100+ updates/sec while the UI renders at 60fps. |
| **No providers** | Zustand stores are module-level singletons. No `<Provider>` wrapper, no context nesting. | Simpler component tree. Stores accessible from anywhere — including non-React code like the WebSocket client. |
| **`immer` middleware (optional)** | Immutable updates with mutable syntax for complex nested state (portfolio with orders, balances, history). | Cleaner reducer-style updates without spread hell: `state.balances.USDT = newValue`. |
| **Devtools middleware** | Redux DevTools integration for inspecting state changes in real time. | See every order book update, every fill, every balance change — invaluable for debugging real-time flows. |

### Store Architecture

```
stores/
├── market-data.ts    → Order book, trades, connection status
│                       Updated by: WebSocket client
│                       Read by: Order book UI, depth chart, fill engine
│
├── portfolio.ts      → Balances, open orders, filled orders, PnL
│                       Updated by: Fill engine, order form
│                       Read by: Order entry, portfolio view, nav balance
│
└── ui.ts             → Active tab, theme, visible levels
                        Updated by: User interaction, router sync
                        Read by: Layout components
```

---

## React Hook Form + Zod

**What it is:** Performant form library with uncontrolled inputs + schema-based validation.

### Features We Leverage

| Feature | How We Use It | Why It Matters |
|---|---|---|
| **Uncontrolled inputs** | Order form fields don't trigger React re-renders on every keystroke. | While the order book updates 60 times/sec, the form stays isolated — typing doesn't stutter. |
| **Zod resolver** | `zodResolver(orderSchema)` validates the entire form against a Zod schema on submit. | Same schema validates form input and can validate API payloads — single source of truth for order shape. |
| **Field-level errors** | Validation errors displayed inline next to the specific field that failed. | "Insufficient balance" appears next to the quantity field, not as a generic toast. |
| **`watch` with selector** | `watch('type')` reactively shows/hides the price field based on market vs limit selection. | Only the conditional UI re-renders, not the entire form. |
| **`handleSubmit` + async** | Submit handler is async — can `await` fill engine confirmation before resetting form. | Natural flow: validate → submit → await fill → show confirmation → reset. |

---

## Lightweight Charts

**What it is:** TradingView's open-source charting library. Small bundle (~40KB), WebGL-accelerated, built for financial data.

### Features We Leverage

| Feature | How We Use It | Why It Matters |
|---|---|---|
| **Area series** | Bid depth (green) and ask depth (red) as filled area charts. | Standard exchange-style depth visualization that interviewers immediately recognize. |
| **Real-time updates** | `series.update()` pushes new data points without redrawing the entire chart. | Depth chart updates at 60fps alongside the order book with no jank. |
| **Crosshair + tooltip** | Hover to see exact price and cumulative quantity at any depth level. | "If you market buy X BTC, you'd sweep to price Y" — price impact visualization. |
| **Lightweight bundle** | ~40KB gzipped. Loads as a separate chunk via Vite code splitting. | Doesn't block initial order book render. Chart appears after the core UI is interactive. |
| **WebGL rendering** | GPU-accelerated canvas rendering for smooth animations. | Handles thousands of data points without DOM overhead. |

---

## Recharts

**What it is:** Composable React charting library built on D3. Declarative API with React component composition.

### Features We Leverage

| Feature | How We Use It | Why It Matters |
|---|---|---|
| **Composable API** | Build PnL charts, balance history, and trade distribution with React components (`<LineChart>`, `<BarChart>`). | Natural fit for React — charts are components with props, not imperative API calls. |
| **Responsive container** | `<ResponsiveContainer>` adapts charts to panel size without manual resize handlers. | Dashboard panels resize cleanly on different viewports. |
| **Portfolio visualizations** | Balance over time, PnL waterfall, trade volume by hour. | P1 feature — adds visual depth to the portfolio simulator. |

### Why Both Chart Libraries?

| Library | Use Case | Reason |
|---|---|---|
| Lightweight Charts | Order book depth, candlestick (if added) | Purpose-built for financial data. WebGL. Real-time perf. |
| Recharts | Portfolio analytics, PnL, static charts | Better for declarative, compositional React charts. Less real-time pressure. |

---

## TypeScript (Strict Mode)

### Configuration We Enforce

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

| Setting | What It Catches | Where It Matters |
|---|---|---|
| `strict: true` | Null/undefined access, implicit any, unreachable code | WebSocket message parsing — every field must be validated |
| `noUncheckedIndexedAccess` | `Map.get()` returns `T \| undefined`, not `T` | Order book lookups: `bids.get(price)` forces null check |
| `exactOptionalPropertyTypes` | `undefined` vs missing property distinction | Search params: `?tab=undefined` is different from no `tab` param |

### End-to-End Type Safety Chain

```
Binance WS message (unknown)
    → Zod parse → typed DepthUpdate
        → Zustand store (typed slices)
            → selector return type (typed)
                → component props (typed)
                    → TanStack Router params (typed)
                        → URL (string, but validated by Zod on entry)
```

No `any`. No `as` casts. Every boundary is validated.

---

## Design System (CVA + Tokens)

**CVA (Class Variance Authority):** Type-safe component variants without runtime CSS-in-JS overhead.

### Features We Leverage

| Feature | How We Use It | Why It Matters |
|---|---|---|
| **Variant definitions** | `button({ intent: 'buy' \| 'sell', size: 'sm' \| 'md' })` | Order entry buttons with type-safe variant props. |
| **Design tokens** | CSS custom properties for colors, spacing, typography. | Consistent bid/ask coloring across order book, depth chart, and trades feed. |
| **Zero runtime** | Variants resolve to class strings at build time (with Tailwind or plain CSS). | No style recalculation during high-frequency order book updates. |

### Token Examples

```css
:root {
  --color-bid: #0ecb81;      /* green — buy side */
  --color-ask: #f6465d;      /* red — sell side */
  --color-spread: #848e9c;   /* neutral — spread bar */
  --depth-bar-opacity: 0.15; /* order book depth background */
}
```

---

## Stack Synergy Map

How the technologies reinforce each other in this specific project:

```
Vite 8 (Rolldown)
  └─► instant HMR ─► fast iteration on real-time UI
  └─► chunk splitting ─► Lightweight Charts loads separately
  └─► babel plugin ─► React Compiler integration

React 19.2
  └─► useOptimistic ─► instant order feedback
  └─► useTransition ─► smooth symbol switching
  └─► useEffectEvent ─► WS handlers read latest state without re-subscribing
  └─► <Activity> ─► pre-render hidden tabs, zero render cost when inactive
  └─► useActionState ─► form error/pending lifecycle in one hook
  └─► auto batching ─► single render per WS frame
  │    └─► pairs with Zustand selectors for minimal re-renders
  └─► ref cleanup ─► chart instance lifecycle tied to DOM ref
  └─► <Context> as provider ─► cleaner JSX, no .Provider wrapper
  └─► preconnect() ─► browser starts WS handshake early

React Compiler 1.0
  └─► auto memoization ─► zero useMemo/useCallback in codebase
  └─► conditional memo ─► works after early returns (connection guards)
  └─► ESLint rules ─► catches setState-in-render before it ships

TanStack Router
  └─► typed loaders ─► data ready before render
  └─► search params (Zod) ─► shareable UI state
       └─► same Zod used by order form validation

Zustand
  └─► granular selectors ─► only affected components update
  └─► subscribeWithSelector ─► fill engine outside React
  └─► no provider ─► accessible from WS client (non-React)

RHF + Zod
  └─► uncontrolled inputs ─► form doesn't re-render on WS updates
  └─► useFormStatus ─► submit button reads form state from context
  └─► Zod schema ─► shared with router search params

Lightweight Charts
  └─► WebGL ─► handles real-time depth at 60fps
  └─► small bundle ─► code-split, doesn't block initial load
  └─► ref cleanup ─► chart.remove() via React 19 ref return

TypeScript strict
  └─► end-to-end types ─► WS message → store → UI → URL, no gaps
```
