# Specifications Index

Feature specs with testable acceptance criteria. Each spec follows the SDD format: Overview, Architecture, Module Breakdown, Data Models, API Contracts, Edge Cases, Error Scenarios, Dependencies, Acceptance Criteria.

## Feature Specs

| Spec | Acceptance Criteria | Depends On | Priority |
|---|---|---|---|
| [WebSocket Data Layer](specs/websocket-data-layer.spec.md) | 10 | — | P0 |
| [Symbol Routing](specs/symbol-routing.spec.md) | 9 | WebSocket Data Layer | P0 |
| [Order Book UI](specs/order-book-ui.spec.md) | 10 | WebSocket Data Layer | P0 |
| [Simulated Order Entry](specs/simulated-order-entry.spec.md) | 10 | WebSocket Data Layer, Symbol Routing | P1 |
| [Strategy Engine](specs/strategy-engine.spec.md) | 10 | Order Entry, WebSocket Data Layer | P2 |
| [Design System](specs/design-system.spec.md) | — | — | Cross-cutting |

## Reference Specs

| Spec | Purpose |
|---|---|
| [Architecture](specs/architecture.spec.md) | Ports & Adapters pattern, layer definitions, dependency rules, domain model, extension playbook |
| [Tech Stack](specs/tech-stack.spec.md) | Stack choices, feature rationale, synergy map |
| [Integration Boundaries](specs/integration-boundaries.spec.md) | Backend swap interfaces, migration paths |

## Implementation Order

```
1. websocket-data-layer  ──► foundation
2. symbol-routing         ──► routes, loaders
3. order-book-ui          ──► primary visual
4. simulated-order-entry  ──► interaction layer
```

## SDD Workflow

```
/spec  ──► /red  ──► /green  ──► /refactor  ──► /review
```

Each spec's acceptance criteria map 1:1 to test cases in the RED phase. See `.claude/skills/sdd-tdd/SKILL.md` for the full workflow.
