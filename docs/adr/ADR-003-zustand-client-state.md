# ADR-003: Zustand for Client-Side Interaction State

## Status
Accepted

## Deciders
Jeanius Core Engineering Team

## Date
2026-09-27

---

## Context and Problem Statement
The customer storefront (`apps/storefront`) requires interactive, responsive client-side state management for:
1. Product Bespoke Configurator: Real-time waist, inseam length, hardware finish, thread color, and cuff styling selection.
2. Global Cart Slide-Over Drawer: Instant open/close, optimistic line item count updates, and currency switcher.
3. Interactive UI Elements: Search overlays, mobile navigation drawers, filter accordions, and toasts.

We must decide on a client-side state management library while establishing clear, unbreakable boundaries preventing client state from usurping business authority.

---

## Decision Drivers
- **Minimal Bundle Footprint:** Keeping client JavaScript as small as possible to ensure fast initial load on mobile networks globally.
- **Boilerplate-Free:** Avoid verbose reducers, action creators, and context provider wrapping trees.
- **Strict Server Authority:** Prevent client-side manipulation of prices, stock, or order states.
- **React Server Components (RSC) Compatibility:** Works seamlessly alongside Next.js Server Components without forcing client wrapping on static pages.

---

## Considered Options
1. **React Context + useReducer:** Built-in to React, but causes unnecessary re-renders across consumers and requires deep provider nesting.
2. **Redux Toolkit:** Powerful, but introduces excessive boilerplate, heavy bundle weight (~30kB+), and overkill for mostly server-rendered ecommerce.
3. **Zustand:** Tiny (~1.2kB), hook-based, external-store model with selector-based re-rendering, no context provider required.

---

## Decision Outcome
Chosen option: **Option 3 — Zustand**.

### Implementation Details
- Client stores are strictly isolated within `apps/storefront/stores/`:
  - `configurator-store.ts`: Tracks user-selected waist, inseam, hem options, and monogram text before submitting to cart.
  - `cart-drawer-store.ts`: Controls drawer open/closed state and transient UI animations.
  - `ui-store.ts`: Controls global modal, navigation drawer, and search visibility.
- Stores use selectors (e.g. `useConfiguratorStore(s => s.selectedWaist)`) to ensure components only re-render when their specific slice changes.

### Critical Architectural Boundary Rule
Zustand is strictly confined to **Client Interaction State**. It is **NEVER** the authoritative source for commercial or business truth:
- ❌ **Prohibited in Zustand:** Calculating final order price, granting discounts, validating coupon codes, checking inventory counts, or authorizing drop reservations.
- ✅ **Server Authority:** All prices, stock verification, and order creations are calculated server-side in `packages/application` and `packages/domain` via Next.js Server Actions.

---

## Consequences

### Positive
- **Ultra-Lightweight:** Negligible impact on storefront JavaScript bundle size.
- **High Performance:** Selective subscriptions prevent entire component trees from re-rendering during configuration slider changes.
- **Easy Testing:** Zustand stores are plain JavaScript objects that can be tested in isolation or reset between test cases.

### Negative & Mitigations
- *Risk:* Developers might be tempted to store cart checkout totals in Zustand and submit them directly to a payment gateway.
- *Mitigation:* The payment and checkout Server Actions reject any client-submitted monetary totals. The server recalculates totals from database product records directly.

---

## Architectural & Code Verification
- Monorepo package: `apps/storefront/stores/`
- Reference: [ADR-004 Next.js Server Boundary](file:///home/sarakb/projects/Jeanius/docs/adr/ADR-004-nextjs-server-boundary.md)
- Reference: [Domain Map](file:///home/sarakb/projects/Jeanius/docs/architecture/domain-map.md)
