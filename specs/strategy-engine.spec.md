# Strategy Engine — Spec

## Overview

The Strategy Engine enables automated trading decisions based on configurable, pluggable
strategies. A strategy consumes a stream of market data (OHLCV candles, order book snapshots)
and emits typed signals (`BUY`, `SELL`, `HOLD`) that the fill engine can act on. All logic is
pure and unit-testable in the domain layer — no API calls, no side effects.

This is a **paper trading** engine. No real funds are at risk. All fills go through
`LocalFillEngine`, not a live broker.

---

## Architecture

Ports & Adapters (Hexagonal), consistent with the rest of the project:

```
Binance WS stream
       │
       ▼
 BinanceDataSource (infra)  ──► marketDataStore (Zustand)
       │                              │
       │                              ▼
       │                    StrategyRunner (infra)
       │                         │  reads ITradingStrategy
       │                         │  from strategyStore
       │                         │
       │                         ▼
       │                  TradingSignal emitted
       │                         │
       │                         ▼
       │                  LocalFillEngine (infra)
       │                         │
       └──────────────────────── ▼
                           portfolioStore (Zustand)
```

**Dependency direction:** UI → stores → domain ← infra
Strategies live in `domain/strategy/` — they import nothing outside domain.

---

## Module Breakdown

### `src/domain/strategy/types.ts`

```ts
export type SignalDirection = "BUY" | "SELL" | "HOLD";

export interface TradingSignal {
  direction: SignalDirection;
  symbol: string;
  price: number;       // signal price (last close or mid)
  confidence: number;  // 0–1, strategy-defined
  reason: string;      // human-readable, e.g. "RSI crossed 30"
  timestamp: number;   // Unix ms
}

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}
```

### `src/domain/strategy/port.ts`

```ts
import type { Candle, TradingSignal } from "./types";

export interface ITradingStrategy {
  readonly id: string;
  readonly label: string;
  evaluate(candles: readonly Candle[], symbol: string): TradingSignal;
}
```

### `src/domain/strategy/strategies/ma-crossover.ts`

Moving average crossover (fast MA crosses slow MA).

- **Params:** `fastPeriod` (default 9), `slowPeriod` (default 21)
- **Signal BUY:** fast MA crosses above slow MA
- **Signal SELL:** fast MA crosses below slow MA
- **Signal HOLD:** no cross

### `src/domain/strategy/strategies/rsi.ts`

Relative Strength Index overbought/oversold.

- **Params:** `period` (default 14), `oversold` (default 30), `overbought` (default 70)
- **Signal BUY:** RSI crosses above `oversold`
- **Signal SELL:** RSI crosses below `overbought`
- **Signal HOLD:** RSI between bands

### `src/domain/strategy/strategies/grid.ts`

Grid trading — place buy/sell at fixed price intervals.

- **Params:** `gridSize` (USDT), `levels` (number of grid levels)
- **Signal BUY:** price touches a lower grid line
- **Signal SELL:** price touches an upper grid line

---

## `src/infra/strategy-runner.ts`

```ts
interface StrategyRunnerConfig {
  strategy: ITradingStrategy;
  symbol: string;
  intervalMs: number;   // minimum ms between evaluations (debounce)
  maxPositionUsdt: number;  // kill switch: max USDT per auto order
}
```

- Subscribes to `marketDataStore` for new candles
- Debounces evaluation to `intervalMs` (never react to every tick)
- Calls `strategy.evaluate(candles, symbol)`
- Passes `BUY`/`SELL` signals to `LocalFillEngine`
- Logs `HOLD` signals to `strategyStore.signalHistory`

---

## `src/stores/strategy-store.ts` (Zustand)

```ts
interface StrategyStore {
  activeStrategy: ITradingStrategy | null;
  isEnabled: boolean;
  signalHistory: TradingSignal[];   // last 100 signals, ring buffer
  setStrategy: (s: ITradingStrategy) => void;
  enable: () => void;
  disable: () => void;  // kill switch — always accessible
}
```

---

## `src/features/strategy-panel/`

UI panel for the trading terminal:

| Component | Purpose |
|-----------|---------|
| `StrategyPanel` | Root: picker + params + toggle + signal log |
| `StrategyPicker` | Dropdown to select active strategy |
| `StrategyParams` | Dynamic param inputs per strategy |
| `SignalLog` | Last 20 signals, time + direction + reason |
| `KillSwitch` | Big red "Disable" button, always visible |

---

## Kill Switch Requirements

The kill switch is **non-negotiable** regardless of environment:

- `disable()` action in the store cancels the runner immediately
- UI renders a persistent `KillSwitch` button when `isEnabled = true`
- `maxPositionUsdt` hard-caps each auto order regardless of strategy output
- Auto-trading is **disabled by default** on every page load — must be explicitly re-enabled

---

## Data Models

### Signal History (ring buffer)

```ts
const MAX_SIGNALS = 100;
// In the store reducer:
signalHistory: [newSignal, ...state.signalHistory].slice(0, MAX_SIGNALS)
```

### Candle source

Candles are derived from the WebSocket trade stream in `marketDataStore`:
- Aggregate trades into 1-minute OHLCV buckets (configurable interval)
- Minimum required candles for evaluation = `slowPeriod` (MA crossover) or `period` (RSI)

---

## Acceptance Criteria

| # | Criterion |
|---|-----------|
| AC-1 | `ITradingStrategy.evaluate()` is a pure function — same candles → same signal |
| AC-2 | MA crossover strategy emits BUY when 9-period MA crosses above 21-period MA |
| AC-3 | RSI strategy emits BUY when RSI rises through 30 (not just when below 30) |
| AC-4 | Strategy runner debounces: never evaluates more than once per `intervalMs` |
| AC-5 | `maxPositionUsdt` prevents any single auto order exceeding the configured cap |
| AC-6 | `disable()` stops the runner within one evaluation cycle |
| AC-7 | Auto-trading is disabled by default on page load |
| AC-8 | `signalHistory` never exceeds 100 entries |
| AC-9 | All three strategies have ≥90% unit test coverage in `domain/strategy/` |
| AC-10 | KillSwitch button is visible and functional whenever `isEnabled = true` |

---

## Domain Cost Estimate

| Phase | Work | Effort |
|-------|------|--------|
| Domain types + port interface | `types.ts`, `port.ts` | ~0.5 day |
| MA Crossover + RSI strategies + unit tests | 2 strategies, ~40 tests | ~3 days |
| Grid strategy + unit tests | 1 strategy, ~20 tests | ~1.5 days |
| `BinanceDataSource` + candle aggregator | WebSocket + REST | ~3 days |
| `LocalFillEngine` + `StrategyRunner` | infra adapters | ~2 days |
| Zustand stores (`market`, `strategy`) | reactive stores | ~2 days |
| `StrategyPanel` UI | picker, params, log, kill switch | ~2 days |
| **Total** | | **~2–3 weeks** |

Dependencies: P0 (WebSocket data layer) and P1 (order entry) must be complete first.
