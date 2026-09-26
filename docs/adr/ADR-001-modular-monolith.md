# ADR-001: Modular Monolith Architecture

## Status
Accepted

## Context
Jeanius is a handmade denim brand based in Nepal, selling high-craft raw selvedge denim globally. The platform requires a customer-facing storefront and an operational workshop portal for managing the OM (Order-Made) production queue (Cutting, Sewing, Washing, Hardware, QC, Ready, Shipped).

## Decision
We adopt a Domain-Driven Design (DDD) Modular Monolith within a Turborepo + pnpm monorepo.
- `packages/domain`: Pure TypeScript business entities and domain rules.
- `packages/application`: Application services and port interfaces.
- `packages/database`: Drizzle ORM implementation of data access.
- `packages/integrations`: Provider adapters.
- `apps/storefront` & `apps/admin`: Next.js frontends.

We explicitly reject premature microservices to avoid network complexity, distributed transactions, and deployment friction.
