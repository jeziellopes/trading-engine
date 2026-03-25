# Simulated Order Entry

## Overview

Paper trading interface allowing users to place simulated buy/sell orders against live market prices. Orders execute instantly at the current best bid/ask (market orders) or queue at a target price (limit orders). This feature demonstrates form handling with React Hook Form + Zod validation, optimistic UI with `useOptimistic`, and client-side portfolio state management.

## Architecture

```
Order Form (RHF + Zod)
        │
        ▼
  Validate & Submit
        │
        ├──► Market Order → fill at current best bid/ask
        │                         │
        └──► Limit Order  → add to pending orders
                                  │
                                  ├──► Price watcher checks against live book
                                  └──► Fill when price crosses limit
        │
        ▼
  Portfolio Store (Zustand)
        │
        ├──► Balances (USDT, BTC, ETH)
        ├──► Open orders
        ├──► Trade history
        └──► Unrealized PnL
```

## Module Breakdown

### `features/order-entry/OrderForm.tsx`
- React Hook Form with Zod schema validation
- Fields: side (buy/sell), type (market/limit), quantity, price (limit only)
- Validates: positive numbers, sufficient balance, minimum order size
- Submit triggers optimistic UI update via `useOptimistic`

### `features/order-entry/OrderConfirmation.tsx`
- Shows optimistic order result immediately
- Displays: fill price, quantity, estimated cost/proceeds, new balance
- Reverts if fill fails (e.g., limit order at impossible price)

### `features/order-entry/OpenOrders.tsx`
- Table of pending limit orders
- Columns: side, symbol, price, quantity, status, cancel button
- Cancel removes from pending and restores reserved balance

### `features/order-entry/TradeHistory.tsx`
- List of filled orders with timestamp, side, price, quantity, PnL
- Persisted in Zustand (session only — clears on reload, which is fine for a demo)

### `stores/portfolio.ts`
- Zustand store managing simulated portfolio state
- Initial balances: 10,000 USDT, 0 BTC, 0 ETH
- Slices: `balances`, `openOrders`, `filledOrders`, `unrealizedPnl`
- Market order fills: deduct/add balance immediately
- Limit order fills: reserve balance on placement, settle on fill

### `core/fill-engine.ts`
- Executes market orders against current best bid/ask from the order book store
- Monitors limit orders against live price updates
- Fills limit buys when ask <= limit price, limit sells when bid >= limit price
- Emits fill events to portfolio store

## Data Models

```typescript
type OrderSide = 'buy' | 'sell';
type OrderType = 'market' | 'limit';

// Full order lifecycle — client implementation may skip intermediate states,
// but the type system models the complete OMS flow for future backend integration.
type OrderStatus =
  | 'new'              // created locally, not yet submitted
  | 'submitted'        // sent to gateway (client fill engine or backend OMS)
  | 'accepted'         // gateway acknowledged (backend: risk check passed)
  | 'partially_filled' // some quantity executed (backend only, client skips this)
  | 'filled'           // fully executed
  | 'cancelled'        // user cancelled
  | 'rejected';        // gateway rejected (insufficient balance, risk limit, etc.)

interface OrderInput {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: string;    // string for precision
  price?: string;      // required for limit orders
}

interface Order {
  id: string;            // crypto.randomUUID()
  clientOrderId: string; // idempotency key — same across retries
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: string;
  filledQuantity: string;  // "0" initially, partial fills update this
  price: string;           // limit price or fill price
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
  filledAt?: number;
  fillPrice?: string;      // average fill price (VWAP for partial fills)
  rejectReason?: string;   // why the gateway rejected this order
}

interface Portfolio {
  balances: Record<string, string>;  // { USDT: "10000", BTC: "0", ETH: "0" }
  openOrders: Order[];
  filledOrders: Order[];
}

// Zod schema for form validation
const orderSchema = z.object({
  symbol: z.string(),
  side: z.enum(['buy', 'sell']),
  type: z.enum(['market', 'limit']),
  quantity: z.string().refine(v => parseFloat(v) > 0, 'Must be positive'),
  price: z.string().optional().refine(
    (v, ctx) => ctx.parent.type === 'market' || (v && parseFloat(v) > 0),
    'Limit price required'
  ),
});
```

**Client implementation note:** The simulated fill engine transitions orders directly `new → submitted → filled` (market) or `new → submitted → accepted → filled` (limit). States like `partially_filled` and `rejected` exist in the type but are only exercised when a backend OMS is integrated.

## API Contracts

### Internal (exposed to UI)
- `usePortfolio()` → `Portfolio`
- `useBalance(asset: string)` → `string`
- `useOpenOrders()` → `Order[]`
- `useFilledOrders()` → `Order[]`
- `submitOrder(input: OrderInput)` → `Order` (optimistic)
- `cancelOrder(orderId: string)` → `void`

### Consumed
- `useOrderBookBids(1)` → best bid for sell market orders
- `useOrderBookAsks(1)` → best ask for buy market orders

## Edge Cases

1. **Insufficient balance** — form validation rejects before submit, shows inline error
2. **Market order with empty book** — reject with "No liquidity available" (book hasn't loaded yet)
3. **Limit order at current price** — fills immediately like a market order
4. **Rapid order submission** — debounce submit button, each order gets a unique ID
5. **Cancel already-filled order** — no-op, order is already in filledOrders
6. **Precision overflow** — truncate to symbol's `qtyPrecision` / `pricePrecision`
7. **Balance goes to exactly 0** — valid state, allow it, show "0.00" not negative

## Error Scenarios

| Scenario | Response |
|---|---|
| Form validation fails | Inline errors next to invalid fields |
| Insufficient balance | "Insufficient USDT balance" inline error |
| No market data available | Disable submit button, show "Waiting for market data" |
| Fill engine encounters stale price | Use latest available price, log warning |

## OrderGateway Interface (Backend Integration Boundary)

All order operations flow through this interface. The current implementation is `LocalFillEngine` (client-side). A future backend would implement the same interface, routing to a real OMS.

```typescript
interface OrderGateway {
  // Submit an order — returns the accepted order or a rejection
  submit(input: OrderInput): Promise<OrderResult>;

  // Cancel a pending/accepted order
  cancel(orderId: string): Promise<CancelResult>;

  // Subscribe to order status changes (fills, partial fills, rejections)
  onOrderUpdate(cb: (update: OrderStatusUpdate) => void): void;
}

type OrderResult =
  | { status: 'accepted'; order: Order }
  | { status: 'rejected'; reason: string };

type CancelResult =
  | { status: 'cancelled'; orderId: string }
  | { status: 'failed'; reason: string };  // e.g., already filled

interface OrderStatusUpdate {
  orderId: string;
  status: OrderStatus;
  filledQuantity?: string;
  fillPrice?: string;
  timestamp: number;
}
```

**Current implementation:** `LocalFillEngine` implements `OrderGateway`. Market orders fill synchronously against the best bid/ask. Limit orders are monitored via `subscribeWithSelector` on the market-data store.

**Backend swap:** Replace with `OmsGateway` that sends orders to a backend via REST/WebSocket. The backend handles risk checks, routing, matching, and pushes `OrderStatusUpdate` events back. The UI optimistic flow stays identical — `useOptimistic` shows the expected state while the gateway confirms.

**Reconciliation pattern:** When the gateway returns an `OrderStatusUpdate`, the portfolio store applies it as the source of truth. If the update contradicts the optimistic state (e.g., rejection), `useOptimistic` automatically reverts the UI. No manual reconciliation needed in the component layer.

## Dependencies

- `specs/websocket-data-layer.spec.md` — reads best bid/ask for fills
- `specs/order-book-ui.spec.md` — shares market-data store
- `specs/symbol-routing.spec.md` — symbol context for order placement
- React Hook Form — form state management
- Zod — validation schema

## Acceptance Criteria

1. Given the order form is displayed, when the user selects "buy" and "market", enters a valid quantity, and submits, then the order fills at the current best ask price, the USDT balance decreases, the BTC balance increases, and the trade appears in history.
2. Given the order form is displayed, when the user selects "sell" and "market", enters a valid quantity, and submits, then the order fills at the current best bid price, the BTC balance decreases, the USDT balance increases.
3. Given the user places a limit buy at a price below the current ask, when the ask price later drops to or below the limit price, then the order fills automatically and moves from open orders to filled orders.
4. Given the user submits an order, when the portfolio store updates, then the UI shows the new balance optimistically before the fill engine confirms — using React 19 `useOptimistic`.
5. Given the user enters a quantity exceeding their available balance, when they attempt to submit, then the form shows an inline "Insufficient balance" error and does not submit.
6. Given the user enters a negative quantity or zero, when validation runs, then the form shows "Must be positive" and does not submit.
7. Given a limit order is pending, when the user clicks "Cancel", then the order is removed from open orders and the reserved balance is restored.
8. Given the portfolio starts with 10,000 USDT and 0 BTC, when the app loads, then these initial balances are displayed correctly.
9. Given multiple orders have been filled, when the trade history renders, then all fills are listed in reverse chronological order with timestamp, side, price, quantity, and realized PnL.
10. Given the order book has not loaded yet (connection status is not `connected`), when the form renders, then the submit button is disabled with a tooltip "Waiting for market data".
