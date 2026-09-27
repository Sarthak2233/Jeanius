# ADR-005: Decoupled Payment Orchestrator Architecture

## Status
Accepted

## Deciders
Jeanius Core Engineering Team

## Date
2026-09-27

---

## Context and Problem Statement
Jeanius operates from a workshop in Kathmandu, Nepal, while serving two distinct consumer markets:
1. **International Customers (Global):** Primary consumer base purchasing limited-edition raw selvedge denim, paying in USD / EUR / GBP via credit/debit cards, Apple Pay, and Google Pay.
2. **Domestic Customers (Nepal):** Local denim enthusiasts and walk-ins paying in NPR (Nepalese Rupee) via domestic mobile payment rails (eSewa, Khalti, Fonepay QR).

A single payment provider cannot serve both markets due to Nepal banking regulations and currency repatriation controls. Directly coupling the checkout flow to Stripe or eSewa would create severe code duplication, fragile branching logic, and vendor lock-in.

---

## Decision Drivers
- **Dual Rail Requirement:** Must seamlessly route between international gateways (Stripe) and domestic gateways (eSewa / Khalti / Fonepay) based on currency and shipping destination.
- **Domain Independence:** The core Order and Payment domains must remain completely agnostic of specific third-party SDKs, API payloads, or webhook signatures.
- **Idempotency & Fraud Prevention:** Eliminate double-charging risk and guarantee that payment verification is cryptographically validated via webhook/IPN signatures.
- **Auditable Reconciliation:** Ensure every transaction records ledger entries with external transaction IDs, gateway responses, and currency conversion snapshots.

---

## Considered Options
1. **Hardcoded Gateway Branching:** Direct `if (currency === 'NPR')` branching in the checkout page or route handler.
2. **Hosted Payment Platforms (e.g. Shopify Payments):** Not viable due to custom Nepal manufacturing workshop integration and local payment rail unavailability.
3. **Decoupled Payment Orchestrator:** An abstraction layer defining standard gateway ports (`IPaymentGateway`) with dedicated provider adapters in `packages/integrations` coordinated by a domain orchestrator.

---

## Decision Outcome
Chosen option: **Option 3 — Decoupled Payment Orchestrator**.

### Implementation Details
- **Port Interface (`packages/application/ports/`):**
  ```typescript
  export interface IPaymentGateway {
    readonly provider: PaymentProvider; // 'stripe' | 'esewa' | 'khalti' | 'fonepay'
    createPaymentIntent(params: CreateIntentParams): Promise<PaymentIntentResult>;
    verifyWebhookSignature(payload: string, signature: string): Promise<boolean>;
    parseWebhookEvent(payload: string): Promise<PaymentWebhookEvent>;
    refund(params: RefundParams): Promise<RefundResult>;
  }
  ```
- **Gateway Adapters (`packages/integrations/payment/`):**
  - `StripePaymentAdapter`: Interacts with Stripe API for international card payments, 3D Secure, Apple Pay, and Google Pay.
  - `EsewaPaymentAdapter`: Interacts with eSewa ePaya API and validates HMAC-SHA256 signatures for domestic NPR payments.
  - `KhaltiPaymentAdapter`: Interacts with Khalti ePayment gateway.
- **Payment Orchestrator (`packages/application/services/`):**
  - Determines appropriate gateway based on order currency (`USD` → Stripe; `NPR` → eSewa/Khalti).
  - Coordinates payment intent creation, tracks the `PaymentStatus` lifecycle, and emits `PaymentSucceededDomainEvent` upon verification.

```
                  ┌──────────────────────┐
                  │    Order Checkout    │
                  └──────────┬───────────┘
                             │
                  ┌──────────▼───────────┐
                  │ Payment Orchestrator │
                  └──────────┬───────────┘
                             │
             ┌───────────────┴───────────────┐
             │ (USD / EUR / GBP)             │ (NPR)
             ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│  StripePaymentAdapter   │     │   EsewaPaymentAdapter   │
│ (Credit Card/Apple Pay) │     │ (Nepal Digital Wallet)  │
└─────────────────────────┘     └─────────────────────────┘
```

---

## Consequences

### Positive
- **Zero Vendor Lock-In:** Swapping or adding a payment gateway (e.g. adding Khalti or PayPal) requires only implementing `IPaymentGateway` without changing the order domain.
- **Unified Domain Lifecycle:** The order lifecycle moves from `Initiated` → `Pending` → `Paid` regardless of whether Stripe or eSewa processed the transaction.
- **Isolated Testing:** The entire checkout and order lifecycle can be thoroughly unit-tested using a `MockPaymentGateway` without hitting external sandbox APIs.

### Negative & Mitigations
- *Trade-off:* Requires maintaining multiple webhook endpoints (`/api/webhooks/stripe`, `/api/webhooks/esewa`) and provider SDK dependencies.
- *Mitigation:* Webhook handlers are thin wrappers that pass raw payloads to the corresponding adapter's signature verification and event parsing methods.

---

## Architectural & Code Verification
- Port interface: `packages/application/src/ports/payment-gateway.port.ts`
- Adapters: `packages/integrations/src/payment/`
- Diagram: [Payment Lifecycle](file:///home/sarakb/projects/Jeanius/docs/assets/diagrams/payment-lifecycle.svg)
- Reference: [Product Contract Payment Lifecycle](file:///home/sarakb/projects/Jeanius/docs/product/PRODUCT-CONTRACT.md#6-payment-lifecycle)
