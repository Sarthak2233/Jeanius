# ADR-001: Modular Monolith Architecture

## Status
Accepted

## Deciders
Jeanius Core Engineering Team

## Date
2026-09-27

---

## Context and Problem Statement
Jeanius is an artisanal handmade raw denim brand based in Kathmandu, Nepal, operating both a direct-to-consumer international ecommerce storefront and an internal workshop management portal. The platform must manage:
1. Limited-edition drops and raw denim garment catalog.
2. Made-to-order custom inseam/waist tailoring and Order-Made (OM) production queues across 8 distinct craft stages.
3. Multi-currency checkout, dual-rail payments (Stripe internationally, Nepal digital wallets domestically), and global logistics.

A key architectural question was whether to adopt an independent microservice architecture (e.g. separate catalog service, cart service, order service, production service, auth service) or a unified modular monolith.

---

## Decision Drivers
- **Domain Purity:** Business logic for artisanal denim crafting and complex state transitions must remain decoupled from specific delivery mechanisms and database drivers.
- **Operational Simplicity:** A lean engineering team operating from Nepal should not bear the operational overhead of managing distributed service clusters, service meshes, distributed tracing, network latency, and distributed two-phase transactions.
- **Type Safety & Velocity:** End-to-end TypeScript type sharing between domain invariants, database queries, and frontend UI components.
- **Clear Boundaries:** Enforce strict encapsulation between domains so modules can be extracted later if scale requires it.

---

## Considered Options
1. **Microservices Architecture:** Independent deployable services (NestJS/Go/Hono) communicating via HTTP/gRPC/Kafka.
2. **Traditional Monolith:** A single Next.js or Node.js codebase where UI, database queries, and business logic are intermingled in route handlers.
3. **Modular Monolith (DDD within Turborepo):** A single repository organized into strictly bounded packages (`packages/domain`, `packages/application`, `packages/database`, `packages/integrations`, `packages/contracts`, `packages/ui`) consumed by runtime frontends (`apps/storefront`, `apps/admin`).

---

## Decision Outcome
Chosen option: **Option 3 — Modular Monolith (DDD within Turborepo)**.

### Architectural Structure
- **`packages/domain`:** Pure TypeScript business entities, domain events, validation schemas, and invariants. Zero framework, ORM, or database dependencies.
- **`packages/application`:** Use case orchestrators, command/query handlers, and abstract port interfaces (e.g., `IOrderRepository`, `IPaymentGateway`).
- **`packages/database`:** Drizzle ORM data models, migrations, and concrete repository implementations of application ports.
- **`packages/integrations`:** Provider adapters (Stripe, eSewa, DHL, SendGrid) implementing application ports.
- **`packages/contracts`:** Shared API schemas, DTOs, and RPC type definitions.
- **`apps/storefront` & `apps/admin`:** Next.js App Router applications providing UI and executing Server Actions.

```
┌────────────────────────────────────────────────────────┐
│               apps/storefront  &  apps/admin           │ (Next.js App Router)
└───────────────────────────┬────────────────────────────┘
                            │ (calls use cases)
┌───────────────────────────▼────────────────────────────┐
│                  packages/application                  │ (Use Cases & Ports)
└─────────────┬───────────────────────────┬──────────────┘
              │ (pure business models)    │ (implements ports)
┌─────────────▼─────────────┐ ┌───────────▼──────────────┐
│      packages/domain      │ │ packages/database &      │
│  (Pure TS - 0 dependencies)│ │ packages/integrations    │
└───────────────────────────┘ └──────────────────────────┘
```

---

## Consequences

### Positive
- **No Distributed Overhead:** In-process method calls eliminate network latency, serialization serialization costs, and distributed consensus bugs.
- **Strict Domain Protection:** Domain logic can be unit-tested without databases, servers, or external mocks.
- **Atomic Refactoring:** Renaming or updating domain models propagates compiler errors instantly across the entire codebase.
- **Turbo Caching:** Turborepo ensures unchanged packages are cached during builds and typechecks.

### Negative & Mitigations
- *Risk:* Risk of developers accidentally bypassing boundaries and querying the database directly in UI components.
- *Mitigation:* Enforced in CI via `./scripts/verify-monorepo.sh`, lint rules, and architectural boundary definitions in `docs/architecture/domain-map.md`.

---

## Architectural & Code Verification
- Monorepo package: `packages/domain`, `packages/application`, `packages/database`
- Diagram: [Architecture Component Layers](file:///home/sarakb/projects/Jeanius/docs/assets/diagrams/architecture-component-layers.svg)
- Reference: [Domain Map](file:///home/sarakb/projects/Jeanius/docs/architecture/domain-map.md)
