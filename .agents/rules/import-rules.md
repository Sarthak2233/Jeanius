# Architectural Import Boundary Rules (JN-049)

This rule defines the strict dependency hierarchy and import restrictions across all packages and apps in the Jeanius monorepo.

---

## The Monorepo Dependency Direction

Dependencies flow strictly **inward toward pure business abstractions**, never outward toward frameworks or databases:

```
[apps/storefront] [apps/admin]
       │                 │
       ▼                 ▼
[packages/application] ◄─┴─► [packages/contracts]
       │
       ├─────────────────────────┐
       ▼                         ▼
[packages/domain]      [packages/database] [packages/integrations]
```

---

## Mandatory Import Constraints

### 1. `packages/domain` (Total Isolation)
- **Rule:** `packages/domain` contains zero external dependencies.
- **PROHIBITED:**
  - ❌ Cannot import from `@jeanius/database`, `@jeanius/application`, or `@jeanius/integrations`.
  - ❌ Cannot import ORMs, HTTP clients, Next.js, or React (`drizzle-orm`, `react`, `next`, `axios`, `fetch`).
  - ❌ Pure TypeScript standard library only.

### 2. `packages/application` (Use Cases & Ports)
- **Allowed:** Imports `@jeanius/domain` and `@jeanius/contracts`.
- **PROHIBITED:**
  - ❌ Cannot import `@jeanius/database` concrete repository implementations or Drizzle ORM schemas.
  - ❌ Application services must depend only on Port interfaces (e.g. `IOrderRepository`, `IPaymentGateway`).

### 3. `apps/storefront` & `apps/admin` (Next.js Delivery Boundaries)
- **Allowed:** Imports `@jeanius/application`, `@jeanius/contracts`, `@jeanius/domain`, `@jeanius/config`, `@jeanius/observability`. (All UI components and tokens are application-local per [.agents/rules/ui-architecture-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/ui-architecture-rules.md)).
- **PROHIBITED:**
  - ❌ Direct database queries: Pages, Server Components, and Route Handlers **cannot** import `packages/database` queries directly. All mutations and fetches must call use-cases in `packages/application`.
  - ❌ Client Components (`'use client'`) **cannot** import `@jeanius/database`, server actions secrets, or private environment variables.

---

## Verification
- Run `pnpm run lint` and `pnpm turbo run typecheck` to verify import boundary integrity.
