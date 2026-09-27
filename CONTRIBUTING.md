# Contributing to Jeanius

Thank you for contributing to **Jeanius** — an artisanal handmade raw denim ecommerce platform and workshop operations system based in Kathmandu, Nepal, serving denim purists globally.

---

## 1. Monorepo Architecture & Principles

Jeanius is structured as a **Domain-Driven Design (DDD) Modular Monolith** managed with Turborepo and pnpm workspaces:

```text
jeanius/
├── apps/
│   ├── storefront/          # Customer-facing Next.js App Router (Public, Customer, Member)
│   └── admin/               # Internal operations portal (Tailor, Fulfillment, Support, Admin)
│
├── packages/
│   ├── domain/              # Pure TypeScript business invariants (0 external dependencies)
│   ├── application/         # Use cases and port interfaces (IOrderRepository, IPaymentGateway)
│   ├── database/            # Supabase PostgreSQL models & Drizzle ORM repository adapters
│   ├── contracts/           # Shared Zod validation schemas and API DTOs
│   ├── integrations/        # Provider adapters (Stripe, eSewa, DHL, SendGrid)
│   ├── ui/                  # Restrained raw-denim design system components and tokens
│   ├── config/              # Shared typed environment configuration
│   ├── observability/       # Structured logging, correlation IDs, and error tracking
│   └── testing/             # Shared mock factories and test utilities
```

### Architectural Guardrails
1. **Domain Purity:** `packages/domain` contains **zero** runtime framework or database dependencies.
2. **Repository Abstraction:** Application code depends exclusively on Port interfaces; Drizzle ORM is completely encapsulated within `packages/database`.
3. **No Direct Database Queries in UI:** Pages, Server Components, and Server Actions cannot import `packages/database` queries directly. Everything routes through `packages/application`.
4. **Client State Isolation:** Zustand is strictly confined to client UI interaction state (`apps/storefront/stores/`). Zero business truth, prices, or inventory checks are trusted from the browser.

---

## 2. Engineering Governance & Rules

All engineering rules are actively codified in **`.agents/rules/`** and enforced by automated linters:

| Rule File | Enforced Policy |
| :--- | :--- |
| [import-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/import-rules.md) | Enforces strict inward architectural import boundaries. |
| [domain-dependency-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/domain-dependency-rules.md) | Enforces zero external framework/IO leakage in domain models. |
| [database-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/database-rules.md) | Requires Repository pattern and Transactional Outbox pattern. |
| [client-server-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/client-server-rules.md) | Prohibits secret leakage and requires Idempotency Keys on mutations. |
| [error-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/error-rules.md) | Mandates typed `DomainError` / `ApplicationError` hierarchy. |
| [validation-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/validation-rules.md) | Requires runtime Zod validation at all external boundaries. |
| [naming-conventions.md](file:///home/sarakb/projects/Jeanius/.agents/rules/naming-conventions.md) | Mandates `kebab-case` files and canonical denim terminology. |
| [testing-requirements.md](file:///home/sarakb/projects/Jeanius/.agents/rules/testing-requirements.md) | Defines test pyramid (unit, integration, e2e requirements). |
| [migration-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/migration-rules.md) | Forward-only, zero-downtime database migration protocol. |
| [security-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/security-rules.md) | Mandates Supabase RLS and cryptographic webhook verification. |
| [observability-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/observability-rules.md) | Requires structured JSON logs with correlation trace IDs. |
| [commit-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/commit-rules.md) | Enforces Conventional Commits standard. |
| [diagram-workflow.md](file:///home/sarakb/projects/Jeanius/.agents/rules/diagram-workflow.md) | Mandates centralized vector SVG generation for all diagrams. |

---

## 3. Development Workflow & Commands

### Prerequisites
- Node.js `v22.x` or higher
- pnpm `v11.17.x` (`corepack enable pnpm` or `npm install -g pnpm`)

### Essential Commands
```bash
# Install dependencies
pnpm install

# Start local development servers (Storefront on :3000, Admin on :3001)
pnpm run dev

# Run lint checks across entire repository
pnpm run lint

# Check code formatting with Prettier
pnpm run format:check

# Auto-format all code
pnpm run format

# Run strict TypeScript compilation across all 11 packages
pnpm turbo run typecheck

# Build all applications and packages
pnpm turbo run build

# Centralized vector diagram generation (compiles .mmd to .svg)
pnpm run diagrams:generate

# Full monorepo verification (runs format, lint, typecheck, build)
./scripts/verify-monorepo.sh
```

---

## 4. Mandatory Diagram Generation Rule

Whenever you add or modify an architecture, sequence, state, or data-flow diagram:
1. Save raw Mermaid code in `docs/assets/diagrams/src/<name>.mmd`.
2. Compile into transparent vector SVG via:
   ```bash
   pnpm run diagrams:generate
   ```
3. Embed in Markdown documents as an image with an adjacent collapsible `<details>` source block:
   ```markdown
   ![Title](../assets/diagrams/<name>.svg)

   <details>
   <summary>View Raw Diagram Source (.mmd)</summary>

   ```mermaid
   ...
   ```
   </details>
   ```
4. Commit both the `.mmd` and generated `.svg` files to git.

---

## 5. Pre-PR Submission Checklist

Before submitting a Pull Request, verify:
- [ ] `./scripts/verify-monorepo.sh` runs and passes with **0 errors**.
- [ ] `pnpm run lint` passes with 0 warnings or errors.
- [ ] `pnpm run format:check` passes cleanly.
- [ ] No `any` types or loose `@ts-ignore` comments introduced.
- [ ] Commit messages follow Conventional Commits (e.g. `feat(catalog): add fabric filter (JN-XXX)`).
- [ ] [Production_Implementation.md](file:///home/sarakb/projects/Jeanius/Production_Implementation.md) is updated with accurate task progress.
