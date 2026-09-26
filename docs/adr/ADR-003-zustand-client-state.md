# ADR-003: Zustand for Client-Side State Management

## Status
Accepted

## Context
Interactive features on `apps/storefront` (such as the product configurator selecting fit/waist/inseam, cart drawers, and ephemeral modal states) need responsive, boilerplate-free state management.

## Decision
We adopt Zustand for client-side interaction state in `apps/storefront/stores/`:
- `configurator-store.ts`: Active fit, waist, inseam, and personalization choices.
- `cart-store.ts`: Drawer toggle and local line interactions.
- `ui-store.ts`: Mobile menu and search modal visibility.

### Critical Boundary Rule
Zustand manages **client interaction state only**. It is **not** the authoritative source for:
- Product prices
- Inventory availability
- Order or production state
- Authorization rules

All commercial transactions (checkout, add to cart, payment initiation) must be verified server-side against domain models and database repositories.
