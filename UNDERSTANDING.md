# Architectural Breakdown — Project 925 (Kathmandu Workshop)

This document provides the canonical architectural breakdown of the authentication, authorization, guest checkout, customer drop access, and member co-commissioning models for **Project 925** (.925 Sterling Silver Artisan Jewellery, Kathmandu Workshop only).

---

### 1. How Authentication, Authorization & Actor Role Assignment Work

The system implements a decoupled, defense-in-depth architecture across three layers:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Identity & Session Layer (Supabase SSR GoTrue)                      │
│    Cookie Segregation: 'sb-storefront-auth-token' vs 'sb-admin-auth-token'
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. Canonical Profile & Role (Database: users_profile table)            │
│    Role: 'GUEST' | 'CUSTOMER' | 'MEMBER' | 'JEWELLER' | 'ADMIN' ...    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 3. Application Use Cases & Edge Middleware Guards                      │
│    assertAuthenticated() | assertActorHasRole() | canActorAccessLevel() │
└────────────────────────────────────────────────────────────────────────┘
```

#### A. Identity & Registration Flow
- **Sign-Up:** In [SignUpUseCase](file:///home/sarakb/projects/Jeanius/packages/application/src/auth/sign-up.use-case.ts), when a user registers:
  1. An identity is created in Supabase Auth via [IAuthGateway.signUp](file:///home/sarakb/projects/Jeanius/packages/application/src/auth/auth-gateway.port.ts).
  2. A synchronized record is immediately created in the PostgreSQL [users_profile](file:///home/sarakb/projects/Jeanius/packages/database/src/schema/auth-profile.ts) table with `role: 'CUSTOMER'` (the default starting role).
  3. A `USER_REGISTERED` domain event is written to `outbox_events`.
- **Sign-In & Role Resolution:** In [LoginUseCase](file:///home/sarakb/projects/Jeanius/packages/application/src/auth/login.use-case.ts), the user's canonical role is fetched directly from `users_profile.role`, preventing client-side metadata tampering.

#### B. Storefront vs. Admin Cookie Isolation
To prevent session crosstalk between customer shopping and administrative atelier work:
- Storefront requests use **`sb-storefront-auth-token`** (enforced in [apps/storefront/lib/supabase/middleware.ts](file:///home/sarakb/projects/Jeanius/apps/storefront/lib/supabase/middleware.ts)).
- Admin workbench requests use **`sb-admin-auth-token`** (enforced in [apps/admin/lib/supabase/middleware.ts](file:///home/sarakb/projects/Jeanius/apps/admin/lib/supabase/middleware.ts)).

#### C. Authorization Guards & Access Levels
In [@jeanius/domain](file:///home/sarakb/projects/Jeanius/packages/domain/src/index.ts) and [auth-guards.ts](file:///home/sarakb/projects/Jeanius/packages/application/src/auth/auth-guards.ts), four access tiers exist:
```typescript
export type AccessLevel = 'PUBLIC' | 'AUTHENTICATED' | 'MEMBER' | 'ADMIN';

export function canActorAccessLevel(actorRole: ActorRole, requiredLevel: AccessLevel): boolean {
  if (requiredLevel === 'PUBLIC') return true;
  if (requiredLevel === 'AUTHENTICATED') return actorRole !== 'GUEST';
  if (requiredLevel === 'MEMBER') return actorRole === 'MEMBER' || actorRole === 'ADMIN';
  if (requiredLevel === 'ADMIN') return actorRole === 'ADMIN';
  return false;
}
```

---

### 2. Can a Guest Who Has Not Signed In Make an Order-Made Purchase?

**Yes, absolutely.**

#### Why This Is Designed This Way:
1. **Domain Aggregate Definition:** In the [Order](file:///home/sarakb/projects/Jeanius/packages/domain/src/order/order.entity.ts) aggregate root and the [orders](file:///home/sarakb/projects/Jeanius/packages/database/src/schema/order.ts) database table:
   - `customerId?: CustomerId` is **optional and nullable** (`references usersProfile.id ON DELETE SET NULL`).
   - `customerEmail: string` is the **only required identifier**.
2. **Checkout Contract:** [CreateCheckoutSchema](file:///home/sarakb/projects/Jeanius/packages/contracts/src/index.ts) requires `cartId`, `customerEmail`, and `shippingAddress`. It does not require an active `userId`.
3. **High-Consideration Commercial Reality:** Order-Made (OM) jewellery pieces require entering bespoke sizing specifications (US ring size, wide shank compensator, wrist gap, patina finish, custom engraving). Forcing an upfront registration wall before the checkout button creates severe checkout abandonment.
4. **Post-Purchase Conversion:** An unauthenticated guest configures their piece, checks out with their email, and the order confirmation screen invites them:
   > *"We received your bespoke bench ticket. Create a password to save your ring and wrist measurements in your personal sizing vault and track your piece across casting and bench finishing in the Kathmandu Workshop."*

---

### 3. Guest vs. Customer vs. Member & The TOGETHER Model

| Persona | Authentication Status | Access Boundaries | Primary Purpose |
| :--- | :--- | :--- | :--- |
| **Guest (`GUEST`)** | Anonymous (No account / Not logged in) | Public catalog (`/shop` [OM]), `/about`, `/sizing`, `/contact`. **Locked out of `/drop`**. | Exploring the brand manifesto, configuring bespoke pieces, and placing guest orders. |
| **Customer (`CUSTOMER`)** | Authenticated (Registered account) | Everything Guests have + **Full access to `/drop`** (ready-to-ship small batches), `/account` sizing vault, and live order tracking. | Active client with a saved jewellery sizing profile and purchase history. |
| **Member (`MEMBER`)** | Authenticated VIP Collector / Patron | Everything Customers have + **Priority Drop early access (1–24h lead)**, private archival gallery, and the **TOGETHER** community co-commissioning layer. | Long-term brand patron ("Artisan Silver Guild"). |

#### How the TOGETHER Model Comes Into Play
In [apps/storefront/app/together/page.tsx](file:///home/sarakb/projects/Jeanius/apps/storefront/app/together/page.tsx), **TOGETHER** represents the collective co-creation and permanence layer:
1. **Collective Metal Casting Commits:** Rare ancient Newar talisman dies and complex investment flasks require dedicated furnace melts. In the TOGETHER model, vetted Members pool pledges to commission limited casting runs at the Kathmandu Workshop.
2. **Community Patina Archive:** A living diary where collectors submit photos of their silver oxidation contrast and hand-buffed patina wear over years.
3. **Lifetime Workshop Care:** Members gain direct intake for complimentary ultrasonic cleaning, chemical oxidization re-darkening, and silver reshaping in the Kathmandu Workshop.

---

### 4. How Members Are Provisioned, Onboarded & What Features to Expose

To protect brand prestige and prevent drop-scalping, Member status is earned or granted intentionally.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        PROVISIONING CHANNELS                           │
├───────────────────────┬────────────────────────┬───────────────────────┤
│ 1. Earned Spend       │ 2. Atelier Invite Code │ 3. Admin Workbench    │
│    (2+ OM orders or   │    (Physical card or   │    (Manual upgrade in │
│    cumulative spend)  │     curated invite)    │     apps/admin)       │
└───────────────────────┴────────────────────────┴───────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         ONBOARDING EXPERIENCE                          │
│ • Gold Star Badge (★) activated across Desktop & Mobile headers       │
│ • "Artisan Silver Guild" Atelier Passport in /account                  │
│ • Direct Concierge channel with Kathmandu Master Metalsmith            │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                            EXPOSED FEATURES                            │
│ 1. Advance Drop Window: 1–24 hr early purchase priority on /drop       │
│ 2. TOGETHER Co-Commissioning: Pledge on rare silver casting dies       │
│ 3. Member Archival Lounge (/member): 1-of-1 prototypes & private vault │
│ 4. Complimentary Workshop Servicing: Free ultrasonic & patina upkeep   │
└────────────────────────────────────────────────────────────────────────┘
```

#### A. Provisioning Strategy (3 Pillars)
1. **Automated Patronage (Spend/Order Threshold):**
   - An event handler listening to `OrderPaidEvent`: when an authenticated `CUSTOMER` completes **2 or more bespoke OM orders** (or lifetime spend exceeds ~$500–$600 USD), the system automatically updates their record in `users_profile` to `role: 'MEMBER'`.
2. **Atelier Invitation Codes (`/invite` or `/vip`):**
   - Physical cards enclosed in bespoke wooden presentation boxes containing single-use cryptographic invite tokens that immediately promote an account to `MEMBER`.
3. **Manual Studio Promotion (`apps/admin`):**
   - Studio managers in `apps/admin` can promote high-value clients directly from the Workshop workbench.

#### B. Onboarding Experience
- **Atelier Passport Activation:** Upon promotion, the user receives an atelier notification and an amber star (`★`) appears next to their profile in [desktop-header.tsx](file:///home/sarakb/projects/Jeanius/apps/storefront/components/desktop-header.tsx) and [account-state.tsx](file:///home/sarakb/projects/Jeanius/apps/storefront/components/account-state.tsx).
- **Measurement Archival Lock:** Their bespoke jewellery sizing profile (US ring mandrel diameter, wide shank compensator, wrist gap) is saved permanently as their personal atelier template.

#### C. Features Exposed to Members
1. **Advance Drop Window (Early Access Countdown):**
   - When a numbered drop goes live, `MEMBER`s get exclusive purchasing privileges for the first 1 to 24 hours. The public `/drop` displays a locked countdown for standard customers until the VIP window concludes.
2. **TOGETHER Co-Commissioning Vault:**
   - Ability to view upcoming rare metal castings and pledge on limited runs before workshop casting begins.
3. **Gated Member Archival Salon (`/member` or `/together`):**
   - Access to unreleased atelier prototypes, studio journals from the Kathmandu Workshop, and one-of-a-kind archive pieces.
4. **Complimentary Lifetime Workshop Care:**
   - Dedicated repair intake form with complimentary round-trip shipping for ultrasonic silver cleaning, hallmark re-striking, and oxidization refresh.

---

### Summary of System Distinctions

```text
┌──────────────────┬───────────────────┬───────────────────┬────────────────────────────────────────┐
│ Persona / Role   │ Authentication    │ Catalog Access    │ Privileges & Commerce Capabilities     │
├──────────────────┼───────────────────┼───────────────────┼────────────────────────────────────────┤
│ **GUEST**        │ None (Anonymous)  │ Public `/shop` OM │ • Customize & order bespoke pieces     │
│                  │                   │ (Locked `/drop`)  │ • Guest checkout (Email + Address)     │
├──────────────────┼───────────────────┼───────────────────┼────────────────────────────────────────┤
│ **CUSTOMER**     │ Authenticated     │ Public `/shop` OM │ • Full access to numbered `/drop` batch│
│                  │ (`users_profile`) │ + Full `/drop`    │ • Personal Jewellery Sizing Vault      │
│                  │                   │                   │ • Order tracking across 8 bench stages │
├──────────────────┼───────────────────┼───────────────────┼────────────────────────────────────────┤
│ **MEMBER**       │ Authenticated VIP │ Everything +      │ • 1–24h early access window on drops   │
│                  │ (Tiered Patron)   │ Private `/member` │ • TOGETHER silver co-commissioning     │
│                  │                   │ & Archival Salon  │ • Complimentary lifetime repairs       │
│                  │                   │                   │   (ultrasonic cleaning, patina upkeep) │
└──────────────────┴───────────────────┴───────────────────┴────────────────────────────────────────┘
```
