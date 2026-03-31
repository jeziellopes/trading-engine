# Design System — Spec

## Overview

The design system governs how tokens, components, and composition patterns are authored across the trading engine UI. It is a cross-cutting concern — not a user-visible feature — but its quality directly affects every other feature's velocity, consistency, and accessibility.

Three open issues target specific gaps:
- **[#11](https://github.com/jeziellopes/trading-engine/issues/11)** — Button font-weight too heavy on dark themes
- **[#13](https://github.com/jeziellopes/trading-engine/issues/13)** — `@theme` block incomplete; trading/sidebar/duration tokens not mapped
- **[#14](https://github.com/jeziellopes/trading-engine/issues/14)** — React composition patterns: boolean props, compound components, scattered mock state

---

## Architecture

The design system has three layers:

```
Layer 1: src/styles/tokens.css  (--t-* raw palette — NEVER used in components)
              │
              ▼
Layer 2: src/styles/tokens.css  (--primary, --trading-bid, etc. — semantic tokens, always used)
              │
              ▼
Layer 3: src/styles/app.css @theme inline  (maps Layer 2 vars to Tailwind utility names)
              │
              ▼
        src/ui/ components  (use Tailwind classes only — never CSS-in-JS)
              │
              ▼
        src/lib/design-tokens.ts  (generated — never edited directly, run pnpm tokens)
```

**Dependency direction:** components → Tailwind utilities → @theme → semantic tokens → raw palette

---

## Module Breakdown

### `src/styles/tokens.css`

Single source of truth for all CSS custom properties.

- **Layer 1 (palette):** `[data-theme="x"]` blocks with `--t-*` private vars (OKLCH values). One block per theme.
- **Layer 2 (semantic):** `[data-theme="x"][data-mode="y"]` and `.dark` compat blocks. Maps palette vars to semantic names (`--primary: var(--t-primary)`, `--trading-bid: var(--t-bid)`, etc.).
- **Layer 3 (global):** `:root` with fonts, durations, radii — theme-independent.

### `src/styles/app.css`

Imports Tailwind and maps CSS vars to Tailwind utility names via `@theme inline`. Must include:

```css
@theme inline {
  /* Colors */
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-destructive: var(--destructive);

  /* Trading domain tokens */
  --color-trading-bid: var(--trading-bid);
  --color-trading-bid-muted: var(--trading-bid-muted);
  --color-trading-ask: var(--trading-ask);
  --color-trading-ask-muted: var(--trading-ask-muted);
  --color-trading-profit: var(--trading-profit);
  --color-trading-loss: var(--trading-loss);
  --color-trading-tick-up: var(--trading-tick-up);
  --color-trading-tick-down: var(--trading-tick-down);
  --color-trading-tick-neutral: var(--trading-tick-neutral);
  --color-trading-connected: var(--trading-connected);
  --color-trading-reconnecting: var(--trading-reconnecting);
  --color-trading-disconnected: var(--trading-disconnected);

  /* Sidebar */
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);

  /* Durations */
  --duration-fast: 150ms;
  --duration-default: 200ms;
  --duration-medium: 300ms;
  --duration-slow: 500ms;
  --duration-xslow: 700ms;
}
```

### `src/ui/` — Component primitives

All UI primitives follow these rules:

| Rule | Detail |
|------|--------|
| CVA for variants | All visual variants defined with `cva()` from `class-variance-authority` |
| `VariantProps<>` exported | `export type ButtonProps = VariantProps<typeof buttonVariants> & React.ComponentProps<"button">` |
| No unsafe CSS-in-JS | Never `bg-[color:var(--trading-bid)]` — use `bg-trading-bid` (requires `@theme` mapping) |
| No inline `style=` for semantic colors | Use Tailwind classes; `style=` only for dynamic numeric values (e.g. depth bar widths) |
| Focus ring | `focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring` |
| Button font-weight | Base: `font-normal`. Directional (buy/sell): `font-medium`. Never `font-semibold`. |

### Composition patterns (see also issue #14)

| Anti-pattern | Replacement |
|--------------|-------------|
| Boolean props switching layout (`noScroll`, `isLoading`) | Compound sub-components (`Panel.Content`, form-owned state) |
| Monolithic component with internal sub-components | Compound pattern: `OrderBook.Asks`, `OrderBook.Bids`, `OrderBook.Spread` |
| Flat prop groups (`spreadAmount`, `spreadPercent`) | Object prop (`spread: { amount, percent }`) |
| Scattered duplicate mock state across 4 files | Single Zustand store in `src/stores/` |

---

## Acceptance Criteria

| # | Criterion | Issue |
|---|-----------|-------|
| AC-1 | `src/styles/app.css @theme inline` maps all trading domain color tokens so `bg-trading-bid`, `text-trading-ask`, `text-trading-profit`, etc. are valid Tailwind utility classes | #13 |
| AC-2 | `src/styles/app.css @theme inline` maps all sidebar tokens (`bg-sidebar`, `text-sidebar-foreground`, etc.) | #13 |
| AC-3 | `src/styles/app.css @theme inline` maps all duration tokens so `duration-fast`, `duration-default`, `duration-medium` are valid Tailwind utilities | #13 |
| AC-4 | `src/ui/button.tsx` buy/sell variants use `bg-trading-bid` / `bg-trading-ask` (not `bg-[color:var(...)]`) | #13 |
| AC-5 | `src/ui/badge.tsx` trading variants use `text-trading-bid` / `text-trading-ask` (not `text-[color:var(...)]`) | #13 |
| AC-6 | No `style={{ color: "var(--primary)" }}` or equivalent inline color style props in `src/ui/` or `src/features/` | #13 |
| AC-7 | `src/ui/button.tsx` base variant: `font-normal`. Buy/sell variants: `font-medium`. No `font-semibold` on any button | #11 |
| AC-8 | All `src/ui/` primitives export `VariantProps<typeof xyzVariants>` as their props type | #14 |
| AC-9 | `Panel` in `-trading-layout.tsx` refactored to compound sub-components; `noScroll` boolean removed from top-level API | #14 |
| AC-10 | `OrderBook` exposes compound sub-components: `OrderBook.Asks`, `OrderBook.Bids`, `OrderBook.Spread`, `OrderBook.ConnectionBanner` | #14 |
| AC-11 | `SpreadBar` props grouped into `spread: { amount, percent }` object | #14 |
| AC-12 | `BalanceDisplay` props grouped into `balance: { total, available, unrealizedPnL }` object | #14 |
| AC-13 | `pnpm tokens` regenerates `src/lib/design-tokens.ts` correctly after all `tokens.css` changes | #13 |
| AC-14 | `pnpm contrast` passes WCAG AA on all theme/mode combos after token changes | #13 |
| AC-15 | `pnpm build` and `pnpm lint` pass with no new warnings | all |

---

## Edge Cases

- Changing `@theme inline` entries that already exist may cause Tailwind to emit duplicate custom properties — use `@theme inline` (not `@theme`) to avoid this.
- `bg-trading-bid` resolves at runtime to `var(--trading-bid)`. This means it is theme-aware by default — no additional dark/light variant needed.
- The `Panel.Content noScroll` prop is a CSS layout detail, not a boolean at the top-level `Panel` API — this is acceptable because it belongs to the content layer, not the panel container.

---

## Dependencies

- No feature spec dependencies — this is cross-cutting.
- `pnpm tokens` script must run after any `tokens.css` change.
- `pnpm contrast` CI check must pass before any design-system PR is merged.

---

## Related Issues

- [#11](https://github.com/jeziellopes/trading-engine/issues/11) — Button font-weight
- [#13](https://github.com/jeziellopes/trading-engine/issues/13) — @theme completeness
- [#14](https://github.com/jeziellopes/trading-engine/issues/14) — Composition patterns
