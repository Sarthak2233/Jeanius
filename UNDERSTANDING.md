Here is the comprehensive architectural breakdown addressing each of your questions based on the active codebase, database schemas, and project specifications.

---

### 1. How Authentication, Authorization & Actor Role Assignment Work Now

The system implements a decoupled, defense-in-depth architecture across three layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Identity & Session Layer (Supabase SSR GoTrue)                      │
│    Cookie Segregation: 'sb-storefront-auth-token' vs 'sb-admin-auth-token'
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. Canonical Profile & Role (Database: users_profile table)            │
│    Role: 'GUEST' | 'CUSTOMER' | 'MEMBER' | 'TAILOR' | 'JEWELLER' ...   │
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
  2. A synchronized record is immediately created in the PostgreSQL [users_profile](file:///home/sarakb/projects/Jeanius/packages/database/src/schema/auth-profile.ts#L14-L32) table with `role: 'CUSTOMER'` (the default starting role).
  3. A `USER_REGISTERED` domain event is written to `outbox_events`.
- **Sign-In & Role Resolution:** In [LoginUseCase](file:///home/sarakb/projects/Jeanius/packages/application/src/auth/login.use-case.ts#L27-L32), the user's canonical role is fetched directly from `users_profile.role`, preventing client-side metadata tampering.

#### B. Storefront vs. Admin Cookie Isolation
To prevent session crosstalk between customer shopping and administrative atelier work:
- Storefront requests use **`sb-storefront-auth-token`** (enforced in [apps/storefront/lib/supabase/middleware.ts](file:///home/sarakb/projects/Jeanius/apps/storefront/lib/supabase/middleware.ts#L5)).
- Admin workbench requests use **`sb-admin-auth-token`** (enforced in [apps/admin/lib/supabase/middleware.ts](file:///home/sarakb/projects/Jeanius/apps/admin/lib/supabase/middleware.ts#L5)).

#### C. Authorization Guards & Access Levels
In [@jeanius/domain](file:///home/sarakb/projects/Jeanius/packages/domain/src/index.ts#L159-L168) and [auth-guards.ts](file:///home/sarakb/projects/Jeanius/packages/application/src/auth/auth-guards.ts), four access tiers exist:
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
1. **Domain Aggregate Definition:** In the [Order](file:///home/sarakb/projects/Jeanius/packages/domain/src/order/order.entity.ts#L25-L41) aggregate root and the [orders](file:///home/sarakb/projects/Jeanius/packages/database/src/schema/order.ts#L33-L34) database table:
   - `customerId?: CustomerId` is **optional and nullable** (`references usersProfile.id ON DELETE SET NULL`).
   - `customerEmail: string` is the **only required identifier**.
2. **Checkout Contract:** [CreateCheckoutSchema](file:///home/sarakb/projects/Jeanius/packages/contracts/src/index.ts#L72-L76) requires `cartId`, `customerEmail`, and `shippingAddress`. It does not require an active `userId`.
3. **High-Consideration Commercial Reality:** Order-Made (OM) garments require entering extensive tailoring specs (waist, inseam, knee, seat, selvedge shrinkage allowances). Forcing an upfront registration wall before the checkout button creates massive checkout abandonment.
4. **Post-Purchase Conversion:** An unauthenticated guest configures their garment, checks out with their email, and the order confirmation screen invites them:
   > *"We received your bespoke cut ticket. Create a password to save your measurements in your personal sizing vault and track your garment across cutting and sewing in Kathmandu."*

---

### 3. Guest vs. Customer vs. Member & The TOGETHER Model

| Persona | Authentication Status | Access Boundaries | Primary Purpose |
| :--- | :--- | :--- | :--- |
| **Guest (`GUEST`)** | Anonymous (No account / Not logged in) | Public catalog (`/shop` [OM]), `/about`, `/sizing`, `/contact`. **Locked out of `/drop`**. | Exploring the brand manifesto, configuring bespoke pieces, and placing guest orders. |
| **Customer (`CUSTOMER`)** | Authenticated (Registered account) | Everything Guests have + **Full access to `/drop`** (ready-to-ship small batches), `/account` sizing vault, and live order tracking. | Active client with a saved measurement profile and purchase history. |
| **Member (`MEMBER`)** | Authenticated VIP Collector / Patron | Everything Customers have + **Priority Drop early access (1–24h lead)**, private archival gallery, and the **TOGETHER** community co-commissioning layer. | Long-term brand patron ("Selvedge & Jewellery Society"). |

#### How the TOGETHER Model Comes Into Play
In [Production_Implementation.md (State 21)](file:///home/sarakb/projects/Jeanius/Production_Implementation.md#L657) and [apps/storefront/app/together/page.tsx](file:///home/sarakb/projects/Jeanius/apps/storefront/app/together/page.tsx), **TOGETHER** represents the collective co-creation and permanence layer:
1. **Collective Deadstock Bolt Commissioning:** Rare vintage mill runs (e.g. vintage Kurabo or Kuroki 16oz raw selvedge) require high minimum bolt yardage. In the TOGETHER model, vetted Members pool commitments to fund a dedicated fabric run with Kathmandu master cutters.
2. **Community Patina Archive:** A living diary where collectors submit photos of their 1-year, 3-year, and 5-year selvedge fades and silver oxidations.
3. **Lifetime Workshop Care:** Members gain direct intake for complimentary Union Special chainstitch re-hemming, sashiko mending, and ultrasonic silver servicing in Kathmandu and Seoul.

---

### 4. How Members Should Be Provisioned, Onboarded & What Features to Expose

To protect brand prestige and prevent drop-scalping, Member status should be earned or granted intentionally.

```
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
│ • "Selvedge & Jewellery Society" Atelier Passport in /account          │
│ • Direct Concierge channel with Kathmandu Master Tailor                │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                            EXPOSED FEATURES                            │
│ 1. Advance Drop Window: 1–24 hr early purchase priority on /drop       │
│ 2. TOGETHER Co-Commissioning: Pledge on rare deadstock mill rolls      │
│ 3. Member Archival Lounge (/member): 1-of-1 samples & private vault    │
│ 4. Complimentary Workshop Servicing: Free chainstitch & silver repairs │
└────────────────────────────────────────────────────────────────────────┘
```

#### A. Provisioning Strategy (3 Pillars)
1. **Automated Patronage (Spend/Order Threshold):**
   - An event handler listening to `OrderPaidEvent`: when an authenticated `CUSTOMER` completes **2 or more bespoke OM orders** (or lifetime spend exceeds ~$500–$600 USD), the system automatically updates their record in [users_profile](file:///home/sarakb/projects/Jeanius/packages/database/src/schema/auth-profile.ts) to `role: 'MEMBER'` and creates a record in [memberships](file:///home/sarakb/projects/Jeanius/packages/database/src/schema/content.ts#L63-L84) (`tier: 'SELVEDGE_SOCIETY'`).
2. **Atelier Invitation Codes (`/invite` or `/vip`):**
   - Physical cards enclosed in bespoke order packages or issued directly by the atelier containing single-use cryptographic invite tokens that immediately promote an account to `MEMBER`.
3. **Manual Studio Promotion (`apps/admin`):**
   - Studio managers in `apps/admin` can promote high-value clients directly from the Workshop / Customer Management table.

#### B. Onboarding Experience
- **Atelier Passport Activation:** Upon promotion, the user receives an atelier notification and an amber star (`★`) appears next to their profile in [desktop-header.tsx](file:///home/sarakb/projects/Jeanius/apps/storefront/components/desktop-header.tsx#L163) and [account-state.tsx](file:///home/sarakb/projects/Jeanius/apps/storefront/components/account-state.tsx#L68).
- **Measurement Archival Lock:** Their bespoke tailoring profile (Points A–Q) and ring mandrel measurements are saved permanently as their personal atelier cutting template.

#### C. Features Exposed to Members
1. **Advance Drop Window (Early Access Countdown):**
   - When a numbered drop goes live, `MEMBER`s get exclusive purchasing privileges for the first 1 to 24 hours. The public `/drop` displays a locked countdown for standard customers until the VIP window concludes ([JN-333](file:///home/sarakb/projects/Jeanius/Production_Implementation.md#L669)).
2. **TOGETHER Co-Commissioning Vault:**
   - Ability to view upcoming fabric rolls from Kurabo and Kuroki Mills and commit to small group runs before fabric cutting commences.
3. **Gated Member Archival Salon (`/member` or `/together/lounge`):**
   - Access to unreleased atelier prototypes, studio journals from Kathmandu and Seoul, and one-of-a-kind deadstock archive garments ([JN-329](file:///home/sarakb/projects/Jeanius/Production_Implementation.md#L665)).
4. **Complimentary Lifetime Workshop Care:**
   - Dedicated repair intake form with complimentary round-trip shipping for Union Special chainstitch re-hemming, sashiko mending,

Ran command: `git status --short`
Ran command: `./scripts/verify-monorepo.sh`

I have launched `./scripts/verify-monorepo.sh` to confirm the entire monorepo builds, typechecks, and passes all test suites cleanly. I will report the outcome once it finishes.

The previous response was cut short by a streaming connection drop. Here is the complete conclusion and summary of the distinctions across authentication, roles, guest ordering, customer drop access, and the member co-commissioning model.

---

### Summary of System Distinctions

```
┌──────────────────┬───────────────────┬───────────────────┬────────────────────────────────────────┐
│ Persona / Role   │ Authentication    │ Catalog Access    │ Privileges & Commerce Capabilities     │
├──────────────────┼───────────────────┼───────────────────┼────────────────────────────────────────┤
│ **GUEST**        │ None (Anonymous)  │ Public `/shop` OM │ • Customize & order bespoke pieces     │
│                  │                   │ (Locked `/drop`)  │ • Guest checkout (Email + Address)     │
├──────────────────┼───────────────────┼───────────────────┼────────────────────────────────────────┤
│ **CUSTOMER**     │ Authenticated     │ Public `/shop` OM │ • Full access to numbered `/drop` batch│
│                  │ (`users_profile`) │ + Full `/drop`    │ • Personal Sizing Vault (Points A–Q)   │
│                  │                   │                   │ • Order tracking across workshop stages│
├──────────────────┼───────────────────┼───────────────────┼────────────────────────────────────────┤
│ **MEMBER**       │ Authenticated VIP │ Everything +      │ • 1–24h early access window on drops   │
│                  │ (Tiered Patron)   │ Private `/member` │ • TOGETHER deadstock co-commissioning  │
│                  │                   │ & Archival Salon  │ • Complimentary lifetime repairs (hem, │
│                  │                   │                   │   sashiko mending, silver polish)      │
└──────────────────┴───────────────────┴───────────────────┴────────────────────────────────────────┘
```

---

### Direct Answers to Your Questions

#### 1. How Authentication, Authorization & Role Assignment Work Now
* **Authentication Boundary:** Driven by Supabase SSR with strict cookie segregation:
  * Storefront shoppers use [`sb-storefront-auth-token`](file:///home/sarakb/projects/Jeanius/apps/storefront/lib/supabase/middleware.ts#L5).
  * Atelier workshop staff use [`sb-admin-auth-token`](file:///home/sarakb/projects/Jeanius/apps/admin/lib/supabase/middleware.ts#L5).
* **Role Storage & Resolution:** Roles are persisted in the PostgreSQL [users_profile](file:///home/sarakb/projects/Jeanius/packages/database/src/schema/auth-profile.ts#L14-L32) table (`role: text enum`). During [LoginUseCase](file:///home/sarakb/projects/Jeanius/packages/application/src/auth/login.use-case.ts#L27-L32) and SSR session hydration, the database role takes canonical precedence over JWT claims to prevent client-side elevation.
* **Role Hierarchy:** Standard actor roles are `'GUEST'`, `'CUSTOMER'`, `'MEMBER'`, `'TAILOR'`, `'JEWELLER'`, `'FULFILLMENT'`, `'SUPPORT'`, and `'ADMIN'`. Access is validated at the application port layer via [auth-guards.ts](file:///home/sarakb/projects/Jeanius/packages/application/src/auth/auth-guards.ts) (`assertAuthenticated`, `assertActorHasRole`, `canActorAccessLevel`).

#### 2. Can a Guest Who Has Not Signed In Make an Order-Made (OM) Purchase?
* **Yes.** In [Order](file:///home/sarakb/projects/Jeanius/packages/domain/src/order/order.entity.ts#L28) and the [orders](file:///home/sarakb/projects/Jeanius/packages/database/src/schema/order.ts#L33-L34) database table, `customerId` is optional and nullable (`references users_profile.id ON DELETE SET NULL`). Only `customerEmail` is strictly required.
* **Contract:** [CreateCheckoutSchema](file:///home/sarakb/projects/Jeanius/packages/contracts/src/index.ts#L72-L76) validates `cartId`, `customerEmail`, and `shippingAddress`.
* **Rationale:** Bespoke denim and jewellery require extensive measurement configuration (inseam, waist, ring diameter). Forcing account creation before ordering increases drop-off. Once an order is confirmed, the guest is prompted to set a password to save their measurements in their personal sizing vault.

#### 3. Customer vs. Member & The TOGETHER Model
* **Guest:** Unauthenticated visitor. Can browse `/shop` and order bespoke OM items. Sees the locked badge on `/drop`.
* **Customer (`CUSTOMER`):** Registered and signed in. Unlocks the `/drop` vault to purchase ready-to-ship numbered pieces, access their sizing vault, and view production timelines.
* **Member (`MEMBER`):** Long-term atelier patrons ("Selvedge & Jewellery Society") who unlock VIP privileges.
* **The TOGETHER Model (`apps/storefront/app/together`):**
  * **Community Co-Commissioning:** Rare deadstock fabric rolls from Kurabo and Kuroki Mills require minimum yardage commitments. Members pool pledges to fund dedicated bolt runs in Kathmandu before pattern cutting begins.
  * **Living Patina Archive:** A community gallery where collectors document high-contrast indigo fading, honeycomb whiskering, and oxidized silver patina over years of wear.
  * **Sustainability Through Permanence:** Access to complimentary lifetime atelier mending (Union Special 43200G chainstitch hemming, darning, and ultrasonic jewellery reshaping).

#### 4. How Members Should Be Provisioned, Onboarded & What Features to Expose
* **Provisioning (3 Channels):**
  1. *Automated Spend Milestone:* When an authenticated customer completes 2+ bespoke OM orders or exceeds a lifetime spend threshold, an event listener on `OrderPaidEvent` promotes `users_profile.role` to `'MEMBER'` and creates an entry in [memberships](file:///home/sarakb/projects/Jeanius/packages/database/src/schema/content.ts#L63-L84).
  2. *Cryptographic Atelier Invite:* Physical invitation tokens enclosed in completed garment packages (or sent to VIP patrons) redeemed at `/invite` or `/vip`.
  3. *Admin Workbench:* Studio managers in `apps/admin` can promote high-value clients directly from the Workshop workbench.
* **Onboarding:**
  * Collector profile receives the amber star (`★`) badge in the header and account badge.
  * Personal measurement profile (Points A through Q, ring mandrel diameter) is locked as an active atelier cutting template.
* **Exposed Member Features:**
  1. **Advance Drop Window:** 1–24 hour early purchase priority on numbered drops before general customer release ([JN-333](file:///home/sarakb/projects/Jeanius/Production_Implementation.md#L669)).
  2. **Gated Member Lounge (`/member` or `/together/lounge`):** Access to private prototype releases, deadstock fabric reserves, and studio journals ([JN-329](file:///home/sarakb/projects/Jeanius/Production_Implementation.md#L665)).
  3. **Direct Bespoke Studio Intake:** Expedited communication with the Kathmandu Master Cutter and Seoul Metalsmith for custom commissions.
  4. **Complimentary Workshop Servicing:** Free round-trip shipping for garment repairs and silver maintenance.

---

### Current Monorepo Status
* **Verification:** `./scripts/verify-monorepo.sh` passed cleanly with **0 errors** across all workspaces, typechecking, linting, and 88 storefront unit tests.

Would you like to proceed with implementing any specific part of this flow (e.g., the member early-access countdown window for `/drop` or the gated Member Lounge under `/member`)?
