# PROJECT 925 — SYSTEM ARCHITECTURE OVERVIEW

## 1. Monorepo Structure

```text
jeanius/
├── apps/
│   ├── storefront/                 # Customer-facing Next.js App (Public, Customer, Member)
│   └── admin/                      # Operations & Kathmandu Workshop Next.js App (Jeweller, Admin)
│
├── packages/
│   ├── domain/                     # Pure TypeScript DDD entities & value objects
│   ├── application/                # Use cases, application services & ports (ICategoryRepository, etc.)
│   ├── database/                   # Supabase PostgreSQL + Drizzle ORM
│   ├── contracts/                  # Zod validation schemas & shared contracts
│   ├── integrations/               # Payment Orchestrator & external adapters
│   ├── config/                     # Typed environment validation
│   ├── observability/              # Structured logging & correlation tracking
│   └── testing/                    # Test fixtures & domain factories
│
├── infrastructure/
│   └── supabase/                   # Local Supabase config, migrations, seed
│
└── docs/                           # Architecture, ADRs, Product Specs, Runbooks
```

## 2. Layering & Inversion of Control

```text
apps/storefront & apps/admin
       │
       ▼ (Server Actions / Route Handlers)
packages/application (Use cases, Ports)
       │
       ▼
packages/domain (Entities, Value Objects)
       ▲
       │
packages/database (Repositories implementing Ports) & packages/integrations (Gateways)
```

1. **Domain:** Has zero dependencies. Contains core .925 sterling silver artisan jewellery logic (OM/DROP models, Category, ProductionPolicy, Money, Address).
2. **Application:** Orchestrates business operations and defines repository and gateway interfaces (Ports).
3. **Database & Integrations:** Implement application ports (Adapters).
4. **Apps:** Consume `application` use-cases via Server Actions and Route Handlers. Zustand stores manage client-side UI states.
