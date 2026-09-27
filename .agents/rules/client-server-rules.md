# Client/Server Boundary & Idempotency Rules (JN-052)

This rule defines execution boundaries, secret isolation, and mutation idempotency standards across `apps/storefront` and `apps/admin`.

---

## 1. Zero Secret Leakage in Client Bundles

- **Public vs. Private Environment Variables:**
  - Client components (`'use client'`) can only access environment variables prefixed with `NEXT_PUBLIC_` (e.g. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`).
  - Private secrets (`STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ESEWA_SECRET_KEY`, `DATABASE_URL`) must **never** be referenced in client files.
- **RSC Payload Sanitization:** React Server Components (RSC) must not serialize sensitive operational fields (wholesale cost, craftsman notes, unmasked customer PII) into the client flight JSON payload.

---

## 2. Server Actions as Thin Transport Adapters

- Next.js Server Actions (`'use server'`) serve as the entry boundary for user-triggered state mutations.
- **Strict Responsibilities:**
  1. Authenticate session / actor context (`getCustomerSession()`).
  2. Validate input parameters using Zod schemas from `packages/contracts`.
  3. Validate client `Idempotency-Key` for critical financial or reservation mutations.
  4. Immediately delegate to an Application Use Case in `packages/application`.
  5. Return a serializable result (`{ success: true, data: ... }` or `{ success: false, error: ... }`).
- **PROHIBITED:** Writing raw SQL queries, importing Drizzle, or embedding domain rules directly inside a Server Action function.

---

## 3. Mandatory Idempotency Keys on Financial Mutations

- All checkout, payment initiation, and inventory reservation mutations must accept a client-generated UUID `idempotencyKey`.
- Server Actions must check and set an active lock in the `idempotency_keys` table to prevent double-charges from network retries or accidental double-clicks.
