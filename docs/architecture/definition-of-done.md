# Definition of Done (DoD) — Jeanius Engineering Standard

The **Definition of Done (DoD)** establishes the non-negotiable quality criteria that every feature, use case, refactor, or pull request must satisfy before it can be merged into `main` and promoted to production.

---

## 1. Domain & Architectural Integrity

- [ ] **Domain Purity (`packages/domain`):**
  - Contains **zero** external runtime framework or database dependencies (no React, Next.js, Drizzle, Prisma, or HTTP libraries).
  - Business entities encapsulate their state and enforce domain invariants upon creation and mutation.
  - State transitions strictly follow the lifecycles defined in [PRODUCT-CONTRACT.md](file:///home/sarakb/projects/Jeanius/docs/product/PRODUCT-CONTRACT.md).
- [ ] **Separation of Concerns:**
  - UI components and Route Handlers never execute raw SQL or direct database queries.
  - All operations route through Application Use Cases (`packages/application`).
  - Application layers depend solely on abstractions (Port interfaces); concrete implementations live in `packages/database` or `packages/integrations`.
- [ ] **Client State Isolation:**
  - Client state stores (`apps/storefront/stores/`) manage UI interactions only.
  - Zero business truth (prices, discounts, stock availability, order states) is calculated or trusted from client state.

---

## 2. Type Safety & Code Quality

- [ ] **Strict TypeScript:**
  - Strict mode enabled (`noImplicitAny`, `strictNullChecks`).
  - Zero usage of the `any` type or unjustified `@ts-ignore` / `@ts-expect-error` comments.
  - Shared schemas and DTOs defined in `packages/contracts` using Zod for runtime boundary validation.
- [ ] **Linting & Formatting:**
  - Clean lint run across all packages (`pnpm turbo run lint`).
  - Code conforms to repository prettier formatting standards.

---

## 3. Testing & Invariant Verification

- [ ] **Domain Unit Tests:**
  - 100% test coverage on domain calculation logic (e.g. inseam measurement bounds, currency conversions, pricing line items).
  - Finite state machine transition tests verifying all valid paths and asserting that invalid transitions throw domain errors.
- [ ] **Use Case Integration Tests:**
  - Critical paths (Checkout, Drop claim reservation, Workshop stage progression, Payment verification) covered with integration tests using mock repository ports.
- [ ] **Idempotency & Concurrency:**
  - External webhooks (Stripe, eSewa) test duplicate message delivery to ensure idempotent handling.
  - Limited-edition drop inventory claims test concurrent reservation limits.

---

## 4. Database & Persistence Standards

- [ ] **Declarative Schema:**
  - Table schemas, constraints, and relationships declared in `packages/database/src/schema/`.
  - Enums and check constraints match domain value objects (e.g. Waist 28–42", Inseam 26–36").
- [ ] **Versioned Migrations:**
  - Migrations generated via `drizzle-kit` as clean SQL files in `packages/database/drizzle/`.
  - Migrations are strictly forward-compatible and idempotent.
- [ ] **Row-Level Security (RLS):**
  - RLS policies enabled on all tables holding customer or sensitive operational records.

---

## 5. Security & Operational Safety

- [ ] **Secret Isolation:**
  - No secret keys (Stripe Secret Key, Supabase Service Role Key, Nepal Payment Merchant Keys) exposed in client bundles or public environment variables.
- [ ] **Payload Validation:**
  - Every Next.js Server Action and Route Handler parses incoming request data through a validated Zod schema before processing.
- [ ] **Cryptographic Verification:**
  - All payment webhooks verify HMAC signatures against raw request bodies before acknowledging receipt.

---

## 6. Documentation & Diagram Standards

- [ ] **Centralized Diagram Compliance:**
  - Any architecture, lifecycle, or sequence diagram follows the [Diagram Workflow Rule](file:///home/sarakb/projects/Jeanius/.agents/rules/diagram-workflow.md):
    - Raw source in `docs/assets/diagrams/src/<name>.mmd`.
    - Vector SVG compiled via `pnpm run diagrams:generate` to `docs/assets/diagrams/<name>.svg`.
    - Embedded with markdown image syntax accompanied by collapsible raw `.mmd` source block.
- [ ] **ADR Recording:**
  - Any major structural or architectural change is recorded in an accepted ADR under `docs/adr/`.
- [ ] **Task Tracking:**
  - [Production_Implementation.md](file:///home/sarakb/projects/Jeanius/Production_Implementation.md) updated with accurate task progress.

---

## 7. Monorepo Verification Gate

Before committing or submitting a PR:
- [ ] Run the monorepo verification script:
  ```bash
  ./scripts/verify-monorepo.sh
  ```
- [ ] All 11 workspace packages must pass both `build` and `typecheck` with **0 errors**.
