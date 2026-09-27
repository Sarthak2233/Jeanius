# Architecture Decision Records (ADRs)

This directory maintains the permanent Architecture Decision Records for the **Jeanius** platform. An ADR captures an important architectural decision made along with its context, drivers, evaluated alternatives, and consequences.

---

## Decision Lifecycle

Every ADR transitions through standard lifecycle states:
- **`Proposed`**: Under discussion, review, or testing.
- **`Accepted`**: Approved by engineering leadership and active in codebase.
- **`Superseded`**: Replaced by a newer ADR (must link to the superseding ADR).
- **`Deprecated`**: No longer applicable or active.
- **`Rejected`**: Evaluated but deliberately not adopted.

---

## ADR Registry

| ADR | Title | Status | Date | Primary Domain / Scope |
| :--- | :--- | :--- | :--- | :--- |
| [ADR-001](file:///home/sarakb/projects/Jeanius/docs/adr/ADR-001-modular-monolith.md) | Modular Monolith Architecture | `Accepted` | 2026-09-27 | Repository Architecture, Boundaries |
| [ADR-002](file:///home/sarakb/projects/Jeanius/docs/adr/ADR-002-drizzle-and-supabase.md) | Supabase PostgreSQL + Drizzle ORM | `Accepted` | 2026-09-27 | Data Persistence, Database, Migrations |
| [ADR-003](file:///home/sarakb/projects/Jeanius/docs/adr/ADR-003-zustand-client-state.md) | Zustand for Client-Side Interaction State | `Accepted` | 2026-09-27 | Client State Management, Storefront |
| [ADR-004](file:///home/sarakb/projects/Jeanius/docs/adr/ADR-004-nextjs-server-boundary.md) | Next.js Server Boundary & API Strategy | `Accepted` | 2026-09-27 | Server Runtime, Server Actions, Route Handlers |
| [ADR-005](file:///home/sarakb/projects/Jeanius/docs/adr/ADR-005-payment-orchestrator.md) | Decoupled Payment Orchestrator Architecture | `Accepted` | 2026-09-27 | Payment Gateway, Dual Rails (Stripe / Nepal) |

---

## How to Propose a New ADR

1. Copy [`template.md`](file:///home/sarakb/projects/Jeanius/docs/adr/template.md) to `ADR-XXX-<kebab-case-title>.md` with the next incremental number.
2. Fill out Context, Decision Drivers, Considered Options, and Consequences.
3. If the decision requires a diagram, follow the mandatory [Diagram Generation Rule](file:///home/sarakb/projects/Jeanius/.agents/rules/diagram-workflow.md) (save `.mmd` in `docs/assets/diagrams/src/` and compile with `pnpm run diagrams:generate`).
4. Submit PR for review. Once approved, update the status to `Accepted` and register it in this table.
