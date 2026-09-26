# ADR-005: Decoupled Payment Orchestrator Architecture

## Status
Accepted

## Context
Jeanius is operating from Nepal while targeting both domestic and international markets. The platform cannot hard-code a single payment provider into its checkout or order domain.

## Decision
We implement a provider-independent `PaymentOrchestrator` in `packages/integrations`:
- Implements `IPaymentGateway` defined in `packages/application`.
- Dispatches to dedicated adapters:
  - International rail: Stripe (credit/debit cards).
  - Nepal domestic rail: eSewa / Khalti / Fonepay.
- The order domain deals only with generic `PaymentIntent` and `PaymentStatus` abstractions, ensuring zero provider lock-in.
