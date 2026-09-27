# Testing Requirements & Strategy Rules (JN-056)

This rule establishes the test pyramid, coverage requirements, and execution standards across the Jeanius monorepo.

---

## 1. The Jeanius Test Pyramid

```
          / \
         / E2E \       Critical Path (Checkout, 8-Stage OM Flow)
        /-------\
       /  Integ  \     Use Cases, Repository Ports, Webhooks
      /-----------\
     /    Unit     \   Domain Entities, Value Objects, Pricing Formulas
    /---------------\
```

---

## 2. Testing Levels & Requirements

### 1. Domain Unit Tests (`packages/domain`)
- **Coverage Target:** 100% test coverage on pure calculation logic and state machines.
- **Mandatory Test Cases:**
  - Price calculations (minor unit integers, rounding, tax/VAT calculations).
  - Inseam/waist tailoring formulas and pattern tolerance boundaries.
  - Finite State Machine transitions: Verify every permitted transition succeeds; verify invalid transitions throw specific `InvalidStateTransitionError`s.
  - Fabric bolt continuous yardage allocation logic (no splitting across bolts).

### 2. Application Integration Tests (`packages/application`)
- **Focus:** Testing Use Cases (`CreateOrderUseCase`, `ProcessPaymentWebhookUseCase`) using mock in-memory repositories.
- **Mandatory Test Cases:**
  - Idempotency verification: Calling webhook twice does not duplicate order side-effects.
  - Two-phase inventory hold: Reservation claims, commitments, and expired releases.
  - Transactional Outbox: Confirm domain events are staged upon entity mutation.

### 3. End-to-End Tests (`apps/storefront` & `apps/admin`)
- **Focus:** User journeys using Playwright / browser automation:
  - Guest customer configurator → cart → checkout submission.
  - Tailor login → cut ticket inspection → QR scan stage advance.
  - Fulfillment clerk dispatch and tracking generation.

---

## 3. Test File Location & Naming
- Colocate unit tests with source files:
  - Source: `packages/domain/src/order/order.entity.ts`
  - Test: `packages/domain/src/order/order.entity.test.ts`
- Integration tests in `test/` directory within respective packages.
