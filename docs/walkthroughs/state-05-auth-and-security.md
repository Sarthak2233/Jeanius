# State 05: Supabase Auth & Security — Walkthrough & Verification

This document provides a walkthrough of the completed **State 05 — Supabase Auth & Security (JN-113 through JN-127)** for **Jeanius & Jewl**, incorporating the dual-craft atelier model (bespoke raw selvedge denim and handcrafted precious metal jewellery).

---

## 1. Architectural Highlights & Dual-Craft Pivot

State 05 establishes a secure, multi-tenant, craft-aware authentication and access control foundation:

- **8 Canonical Actors:** `GUEST`, `CUSTOMER`, `MEMBER`, `TAILOR`, `JEWELLER`, `FULFILLMENT`, `SUPPORT`, `ADMIN`.
- **Workshop Bench Isolation:**
  - `TAILOR`: Restricted to Kathmandu denim cutting tables and sewing machines (`CUTTING`, `SEWING`, `HEMMING`).
  - `JEWELLER`: Restricted to Kathmandu jewellery benches (`CASTING`, `SETTING`, `POLISHING`).
- **Dual-Craft Customer Profiles:**
  - Denim sizing: `waistInches`, `inseamInches`, `silhouette` (`STRAIGHT`, `SLIM_TAPERED`, `WIDE_LEG`), `hemAllowanceInches`.
  - Jewellery sizing: `ringSizeUs`, `ringMandrelMm`, `wristCircumferenceInches`, `preferredAlloy` (`STERLING_SILVER_925`, `SOLID_BRASS`, `GOLD_18K`), `preferredFinish` (`HIGH_POLISH`, `SATIN_MATTE`, `OXIDIZED_PATINA`).
- **Craft-Aware Point of No Return:**
  - Bottoms/Denim: Hard cancellation barrier at `CUTTING`.
  - Jewellery: Hard cancellation barrier at `CASTING`.
- **VIP Drop Membership Gating:**
  - `CheckMembershipAccessUseCase` gates private drop releases (`DROP`, `TOGETHER`) strictly to authenticated `MEMBER` and `ADMIN` actors.
- **Privileged Audit Logging & Outbox:**
  - All administrative mutations (metal inventory adjustments, role assignments, price edits) are recorded into `audit_logs` and dispatched via `outbox_events`.

---

## 2. Layer-by-Layer Implementation

### A. Domain Layer (`packages/domain`)
- **[user-profile.entity.ts](file:///home/sarakb/projects/Jeanius/packages/domain/src/user/user-profile.entity.ts):** `UserProfile` entity with dual-craft sizing preferences and helper methods (`isStaff`, `isArtisan`, `hasRole`).
- **[auth.events.ts](file:///home/sarakb/projects/Jeanius/packages/domain/src/events/auth.events.ts):** `UserRegisteredEvent`, `PasswordResetRequestedEvent`, and `StaffRoleAssignedEvent` implementing `DomainEvent`.
- **[errors/index.ts](file:///home/sarakb/projects/Jeanius/packages/domain/src/errors/index.ts):** Added `AuthServiceError` adhering to standard error hierarchy.

### B. Contracts Layer (`packages/contracts`)
- **[index.ts](file:///home/sarakb/projects/Jeanius/packages/contracts/src/index.ts):** Zod schemas and DTOs:
  - `SignUpSchema`, `LoginSchema`, `RequestPasswordResetSchema`, `ResetPasswordSchema`
  - `DenimPreferencesSchema`, `JewelleryPreferencesSchema`, `UpdateProfileSchema`
  - `CreateAddressInputSchema`

### C. Application Layer (`packages/application/src/auth/`)
- **Ports:** `IAuthGateway`, `IUserProfileRepository`, `IAddressRepository`.
- **Guard Clauses ([auth-guards.ts](file:///home/sarakb/projects/Jeanius/packages/application/src/auth/auth-guards.ts)):**
  - `assertAuthenticated(actor)`
  - `assertActorHasRole(actor, allowedRoles)`
  - `assertActorAccessLevel(actor, requiredLevel)`
  - `assertPrePointOfNoReturn(category, stage)`
- **Use Cases:**
  - `SignUpUseCase`: Auth creation + profile creation + `USER_REGISTERED` outbox event.
  - `LoginUseCase`: Password authentication + profile role resolution.
  - `LogoutUseCase`: Secure session termination.
  - `RequestPasswordResetUseCase` & `ResetPasswordUseCase`: Email recovery flow.
  - `GetSessionActorUseCase`: Session actor reconstruction for Next.js middleware.
  - `CustomerProfileUseCase`: Sizing preferences & address book management.
  - `CheckMembershipAccessUseCase`: VIP drop verification.
  - `RecordPrivilegedActionUseCase`: Administrative audit logging.

### D. Database & Persistence Layer (`packages/database`)
- **Schema ([auth-profile.ts](file:///home/sarakb/projects/Jeanius/packages/database/src/schema/auth-profile.ts)):** `users_profile` with `denim_preferences` and `jewellery_preferences` jsonb columns, plus `addresses`.
- **Repositories:**
  - `DrizzleUserProfileRepository`
  - `DrizzleAddressRepository`
  - `DrizzleAuditLogRepository`
  - `DrizzleOutboxRepository`
- **Row-Level Security Migration ([0002_enable_row_level_security.sql](file:///home/sarakb/projects/Jeanius/packages/database/migrations/0002_enable_row_level_security.sql)):**
  - Enables RLS across 10 tables: `users_profile`, `addresses`, `orders`, `order_lines`, `production_jobs`, `fabric_bolts`, `metal_stocks`, `audit_logs`, `outbox_events`, `custom_order_requests`.
  - Multi-tenant customer isolation (`auth.uid() = user_id`).
  - Tailor vs Jeweller workshop bench isolation.
  - Audit logs: append-only with `ADMIN`-only select.

### E. Integrations Layer (`packages/integrations`)
- **[supabase-auth.gateway.ts](file:///home/sarakb/projects/Jeanius/packages/integrations/src/auth/supabase-auth.gateway.ts):** Supabase GoTrue adapter implementing `IAuthGateway`, encapsulating user authentication and service-role administration.

### F. Storefront & Admin App Boundaries
- **`apps/storefront`:**
  - `lib/supabase/server.ts` & `middleware.ts` (`@supabase/ssr` server boundary)
  - `middleware.ts`: Protects `/account`, `/orders`, and gates `/drops/vip` to `MEMBER` and `ADMIN`.
  - `app/auth/callback/route.ts`: Exchange code for PKCE session.
  - `actions/auth.actions.ts`: Server Actions delegating to application use cases.
- **`apps/admin`:**
  - `lib/supabase/server.ts` & `middleware.ts` (`@supabase/ssr` server boundary)
  - `middleware.ts`: Strict staff firewall (`TAILOR`, `JEWELLER`, `FULFILLMENT`, `SUPPORT`, `ADMIN`) with workshop bench isolation (`/workshop/jeweller` vs `/workshop/tailor`).
  - `actions/admin-auth.actions.ts`: Staff authentication and privileged action logging.

---

## 3. Verification & Monorepo Health

The entire monorepo builds and typechecks cleanly with **0 errors**:

```bash
$ ./scripts/verify-monorepo.sh
1. Checking pnpm workspace consistency...
2. Checking code formatting (Prettier)...
3. Checking ESLint rules...
4. Typechecking all workspaces...
5. Running workspace unit tests...
   ✔ Money Value Object (6 tests)
   ✔ Shipment Aggregate & Split Fulfillment (2 tests)
   ✔ FabricBolt Aggregate (4 tests)
   ✔ InventoryReservation (4 tests)
   ✔ Order Aggregate Root (4 tests)
   ✔ ProductionJob Aggregate (4 tests)
   ✔ State 05: Auth & Security — Application Layer (8 tests)
   ✔ State 05: Row Level Security (RLS) Policy Specifications (5 tests)
   Total: 37 tests passing (0 failures)
6. Building production bundles...
   ✔ @jeanius/admin compiled successfully (Next.js 15.5)
   ✔ @jeanius/storefront compiled successfully (Next.js 15.5)
Monorepo verified successfully with 0 errors!
```

---

## 4. How to Start the Local Development Server

To run the local development environment for **Jeanius & Jewl**:

### Prerequisites
Ensure environment variables are configured in `.env.local` or monorepo root:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### Starting the Applications

1. **Start both Storefront and Admin concurrently via Turborepo:**
   ```bash
   pnpm run dev
   ```
   - **Storefront (Customer Atelier & Drops):** `http://localhost:3000`
   - **Admin (Workshop & Atelier Operations):** `http://localhost:3001`

2. **Or start individual apps independently:**
   - **Storefront only:**
     ```bash
     pnpm --filter @jeanius/storefront dev
     ```
   - **Admin only:**
     ```bash
     pnpm --filter @jeanius/admin dev
     ```

3. **Running Database Migrations:**
   ```bash
   pnpm --filter @jeanius/database db:migrate
   ```
