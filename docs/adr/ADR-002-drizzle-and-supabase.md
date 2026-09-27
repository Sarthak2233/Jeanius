# ADR-002: Supabase PostgreSQL + Drizzle ORM

## Status
Accepted

## Deciders
Jeanius Core Engineering Team

## Date
2026-09-27

---

## Context and Problem Statement
Jeanius requires an enterprise-grade relational database to support:
1. Strict relational integrity (orders linked to drops, items, customers, production stages, and ledger transactions).
2. Row-Level Security (RLS) for multi-tenant customer isolation and workshop craftsman access control.
3. Serverless compute compatibility with sub-millisecond cold starts and connection pooling.
4. Complete TypeScript type safety between the SQL schema and application query results without code generation bloat.

---

## Decision Drivers
- **Serverless Performance:** Cold starts in serverless runtimes (Next.js serverless functions, edge runtimes) must remain minimal (< 50ms).
- **SQL Control & Predictability:** The engineering team needs full transparency into SQL queries and migrations without hidden ORM abstraction penalties.
- **Relational Integrity:** Foreign keys, check constraints (e.g. inseam bounds 26–36", waist 28–42"), and atomic transactions (`BEGIN...COMMIT`) must be guaranteed at the database level.
- **Migration Determinism:** Migrations must be version-controlled, declarative, and inspectable in plain SQL.

---

## Considered Options
1. **Prisma ORM with Managed PostgreSQL:** Popular ORM with rich schema language, but relies on a separate Rust query engine binary resulting in heavy cold starts (~300–800ms) in serverless environments.
2. **TypeORM / MikroORM:** Heavy decorator-based ORMs with complex metadata reflection and stateful identity maps ill-suited for serverless runtimes.
3. **Supabase PostgreSQL + Drizzle ORM:** Managed PostgreSQL with Supavisor connection pooling and pgvector support, paired with Drizzle ORM—a lightweight TypeScript-first query builder that compiles to pure SQL with zero engine overhead.

---

## Decision Outcome
Chosen option: **Option 3 — Supabase PostgreSQL + Drizzle ORM**.

### Implementation Details
- **Location:** All database schemas, relations, migrations, and repository implementations are isolated in `packages/database`.
- **Drizzle Kit:** Schema migrations are generated as plain SQL files in `packages/database/drizzle/` via `pnpm --filter @jeanius/database db:generate` and applied via `db:migrate`.
- **Supavisor Pooling:** Application connects via transaction mode connection pooler for serverless queries, and direct session connection for migrations.
- **Repository Isolation:** Drizzle queries are wrapped inside repository implementations (e.g. `DrizzleOrderRepository`) that implement `IOrderRepository` from `packages/application`. The rest of the codebase never imports `drizzle-orm` directly.

---

## Consequences

### Positive
- **Near-Zero Cold Starts:** Drizzle is pure TypeScript with zero binary dependencies, eliminating serverless cold-start penalties.
- **Strict Invariant Enforcement:** Foreign keys, enums, and check constraints match domain value objects.
- **Schema-as-Code:** Table definitions are standard TypeScript objects providing type-safe autocomplete and query building.
- **Supabase Ecosystem:** Native support for auth, storage (for high-resolution garment imagery), and pgvector (for semantic product search).

### Negative & Mitigations
- *Trade-off:* Drizzle requires developers to understand SQL semantics and relational joins better than magic ORMs.
- *Mitigation:* This aligns with our engineering standard: explicit, predictable, and performant SQL is preferred over opaque abstractions.

---

## Architectural & Code Verification
- Monorepo package: `packages/database`
- Schema directory: `packages/database/src/schema/`
- Reference: [ADR-001 Modular Monolith](file:///home/sarakb/projects/Jeanius/docs/adr/ADR-001-modular-monolith.md)
