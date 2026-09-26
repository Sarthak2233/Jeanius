# ADR-004: Next.js Server Boundary & API Strategy

## Status
Accepted

## Context
Deciding whether to build a separate Express/Hono backend microservice (`services/api`) or rely on Next.js App Router server capabilities.

## Decision
We reject an independent `services/api` server. We use Next.js Server Actions and Route Handlers directly within `apps/storefront` and `apps/admin` as the application execution runtime.
- Server Actions handle form submissions and mutations (Add to Cart, Submit Checkout, Update Production Stage).
- Route Handlers handle external webhooks (e.g. `/api/webhooks/stripe`, `/api/webhooks/esewa`).
- Supabase Edge Functions are utilized only if an isolated external boundary or third-party trigger is needed.
- All server endpoints delegate immediately to `packages/application` use cases to maintain testability and separation of concerns.
