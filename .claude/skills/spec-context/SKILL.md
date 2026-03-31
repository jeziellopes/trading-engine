---
name: spec-context
description: >
  Required-reading loader for feature implementation. Loads the relevant spec,
  architecture constraints, and design system rules as required context before
  any implementation begins. Use before implementing any feature, writing tests,
  or reviewing code.
---

# Spec Context Loader

This skill provides the required-reading bundle for feature implementation in this project. It ensures no code is written without first understanding the spec, architecture boundaries, and design system rules that govern the area being changed.

## When to Use

Invoke this skill at the **start of any implementation session** — before writing a line of code, before planning a PR, before reviewing a PR.

Trigger phrases:
- "implement issue #N"
- "build the X feature"
- "start working on X"
- Any code change in `src/features/`, `src/routes/`, `src/stores/`, `src/infra/`, `src/domain/`, `src/ui/`

## Step 1 — Identify the Feature Domain

Map the feature/issue to a domain using this table:

| Keyword in issue/task | Domain | Primary spec |
|---|---|---|
| websocket, ws, stream, depth, trade feed, market data | **market-data** | `specs/websocket-data-layer.spec.md` |
| symbol, route, URL, navigation, params, loader | **routing** | `specs/symbol-routing.spec.md` |
| order book, bid, ask, spread, depth chart | **order-book** | `specs/order-book-ui.spec.md` |
| order form, order entry, fill, broker, limit, market | **order-entry** | `specs/simulated-order-entry.spec.md` |
| bot, strategy, grid, DCA, RSI, params, engine | **strategy** | `specs/strategy-engine.spec.md` |
| token, theme, color, component, CVA, design system | **design-system** | `specs/design-system.spec.md` |

If the task spans multiple domains, load all relevant specs.

## Step 2 — Load Required Reading

Always read **all three** of the following:

### A. Feature spec (domain-specific)

```
Read: specs/<domain>.spec.md
Focus: Acceptance Criteria section — list every AC number and its description
       Data Models section — understand the shape of data
       API Contracts / Module Breakdown — understand what interfaces are expected
```

### B. Architecture constraints (always required)

```
Read: specs/architecture.spec.md
Focus: § Layer Boundaries — what can import what
       § Dependency Direction diagram
       § Domain Model — entity definitions
Key rules to extract and hold in context:
  - domain/ has ZERO external imports
  - infra/ imports domain only
  - features/ has no cross-feature imports
  - stores/ is the only layer that bridges infra + domain
```

### C. Design system rules (required for any UI change)

```
Read: specs/design-system.spec.md
Focus: § Token Usage Rules — which tokens to use where
       § Component Shape Rules — CVA patterns, compound components
       § @theme inline requirements
Key rules to extract and hold in context:
  - Never use text-green-* / text-red-* → use trading token vars
  - Never use bg-[color:var(--x)] syntax → use @theme inline classes
  - Never use bg-ds-gray-* → use bg-card
  - Dynamic widths → inline style prop only
```

## Step 3 — Confirm Pre-Implementation Checklist

Before writing code, confirm:

- [ ] I know which spec ACs this implementation must satisfy (list them)
- [ ] I know which layers my changes will touch and have verified no dependency violations
- [ ] If touching UI: I know which DS tokens apply and which are forbidden
- [ ] I know the data model shape for entities involved
- [ ] I have checked `SPECS.md` for any upstream dependencies (implement in order)

## Step 4 — Reference During Implementation

Keep this information active during implementation:

**ACs to satisfy:** (fill in from spec)
```
AC-N: [description]
AC-N: [description]
```

**Layer boundaries for this task:**
```
Changes in: [list layers]
May import from: [list allowed imports]
Must NOT import from: [list forbidden imports]
```

**DS tokens for this task:**
```
Color tokens: [list applicable --trading-* vars]
Background: bg-card (not bg-ds-gray-*)
Typography: tabular-nums font-mono for prices
```

## Step 5 — Hand Off Note

When implementation is complete, document:

```
Spec ACs satisfied: AC-N, AC-N, AC-N from specs/<domain>.spec.md
Architecture layer(s) touched: [list]
DS token rules followed: [confirm]
```

This documentation goes in the PR body so `sentinel` can verify spec coverage.

## Quick Reference: Implementation Order

Per `SPECS.md`, features depend on each other. Never implement a higher layer before its dependency:

```
1. websocket-data-layer  ──► foundation (must be first)
2. symbol-routing         ──► depends on (1)
3. order-book-ui          ──► depends on (1)
4. simulated-order-entry  ──► depends on (1) + (2)
5. strategy-engine        ──► depends on (4) + (1)
```

Cross-cutting (can be done at any time):
- `design-system` — independent of data layer
