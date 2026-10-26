# Implementation Plan: State 14 — Payment Orchestrator & Passable Bank Rail (JN-240 → JN-258)

## Goal Description
Implement **State 14: Payment Orchestrator** ([`JN-240` → `JN-258`](file:///home/sarakb/projects/Jeanius/Production_Implementation.md#L503-L539)) using pure Domain-Driven Design and Hexagonal Architecture. 

As aligned during `/grill-me`, this implementation introduces **Bank Transfer** as the primary active payment rail configured as a **passable, executable simulated provider** for end-to-end testing and demonstration. Because official banking infrastructure and API credentials are pending selection, the orchestrator decouples the domain from any vendor specifics. The customer checkout flow safely finishes with payment status **`PENDING`** (awaiting manual/batch bank settlement), backed by dedicated testing simulation tools and a comprehensive automated test suite.

---

## Architectural Diagram

![Payment Orchestrator Architecture](../docs/assets/diagrams/payment-orchestrator-architecture.svg)

<details>
<summary>View Raw Diagram Source (.mmd)</summary>

```mermaid
flowchart TD
    classDef client fill:#1e1b4b,stroke:#818cf8,stroke-width:1.5px,color:#e0e7ff;
    classDef step fill:#14532d,stroke:#4ade80,stroke-width:1.5px,color:#dcfce7;
    classDef server fill:#18181b,stroke:#a1a1aa,stroke-width:1.5px,color:#f4f4f5;
    classDef app fill:#312e81,stroke:#a5b4fc,stroke-width:1.5px,color:#e0e7ff;
    classDef integration fill:#3730a3,stroke:#c7d2fe,stroke-width:1.5px,color:#f8fafc;
    classDef domain fill:#831843,stroke:#f472b6,stroke-width:1.5px,color:#fdf2f8;
    classDef database fill:#0f172a,stroke:#38bdf8,stroke-width:1.5px,color:#e0f2fe;

    subgraph StorefrontUI ["Storefront UI & Testing Portal (apps/storefront)"]
        CheckoutView["CheckoutView (/checkout)<br/>• Selects Bank Transfer Rail<br/>• Initiates Order & Payment Session"]:::client
        BankSimView["BankSimulationView (/checkout/bank-sim)<br/>• Displays Amount & Dual Currency (USD/NPR)<br/>• Pre-fills Mock Bank Reference (TXN-BNK-...)<br/>• Optional Custom Reference / Slip Notes<br/>• Submits Simulated Transfer"]:::client
        ConfirmationView["ConfirmationView (/checkout/confirmation)<br/>• Order Confirmed Banner<br/>• Payment Status: PENDING VERIFICATION<br/>• Displays Captured Bank Voucher Reference"]:::step
        TestingControls["Test Settlement Helper<br/>• simulateBankSettlementAction()<br/>• Simulates PENDING -> PAID or FAILED"]:::client
    end

    subgraph ServerBoundary ["Storefront Server Boundary (apps/storefront/actions/payment.actions.ts)"]
        InitPaymentAction["initiateOrderPaymentAction()<br/>• Retrieves Pending Order<br/>• Invokes PaymentOrchestrator<br/>• Returns Bank Simulation Redirect URL"]:::server
        ConfirmBankAction["confirmBankTransferAction()<br/>• Captures Voucher Code & Memo<br/>• Transitions Payment Status to PENDING<br/>• Records Financial Audit Trail"]:::server
        SimulateSettlementAction["simulateBankSettlementAction()<br/>• QA/Admin Verification Tool<br/>• Settles (PAID) or Rejects (FAILED)"]:::server
    end

    subgraph ApplicationLayer ["Application Layer (packages/application)"]
        PaymentOrchestrator["PaymentOrchestrator (JN-244)<br/>• Selects Adapter by Rail / Currency (JN-245)<br/>• USD: International Bank Wire Rail<br/>• NPR: Nepal Domestic Bank Transfer Rail<br/>• Enforces Idempotency (JN-249)"]:::app
        PaymentProviderPort["IPaymentProvider (Interface - JN-240)<br/>• initiatePayment(order, opts)<br/>• confirmTransfer(paymentId, ref)<br/>• verifyWebhook(payload, sig)<br/>• processRefund(paymentId, amount)"]:::app
        PaymentRepoPort["IPaymentRepository (Port)<br/>• findById(id)<br/>• findByOrderId(orderId)<br/>• findByIdempotencyKey(key)<br/>• save(payment, tx)"]:::app
    end

    subgraph IntegrationsLayer ["Integrations Layer (packages/integrations)"]
        SimulatedBankAdapter["SimulatedBankAdapter (Passable Bank Rail)<br/>• Implements IPaymentProvider<br/>• Generates /checkout/bank-sim URL<br/>• Captures Mock Bank Slip Reference<br/>• Resolves Passable Status: PENDING<br/>• Future Hook: Real Bank SDK Integration"]:::integration
        StripeFutureAdapter["Future Adapter (Stripe/Card Rail)"]:::integration
    end

    subgraph DomainLayer ["Domain Layer (packages/domain - Pure DDD)"]
        PaymentEntity["Payment Aggregate Root (JN-075, JN-241)<br/>• Status: INITIATED -> PENDING -> PAID<br/>• Idempotency Key Enforced<br/>• Dual Currency: Display vs Settlement (JN-252/253)<br/>• Financial Audit Ledger (JN-254)"]:::domain
        DomainEvents["Payment Domain Events<br/>• PaymentPendingEvent<br/>• PaymentSettledEvent (JN-107)<br/>• PaymentFailedEvent (JN-120)<br/>• PaymentRefundedEvent (JN-114)"]:::domain
    end

    subgraph DatabaseLayer ["Database Layer (packages/database)"]
        DrizzlePaymentRepo["DrizzlePaymentRepository (JN-051)<br/>• ACID Transaction Support<br/>• Dual Currency & Reference Persistence<br/>• Outbox Event Publishing"]:::database
        DbTables["PostgreSQL Schema<br/>• payments table (JN-100)<br/>• outbox_events table"]:::database
    end

    CheckoutView -->|1. Submit Order| InitPaymentAction
    InitPaymentAction -->|2. Delegate Payment| PaymentOrchestrator
    PaymentOrchestrator -->|3. Route to Rail| SimulatedBankAdapter
    SimulatedBankAdapter -->|4. Return Sim URL| InitPaymentAction
    InitPaymentAction -->|5. Redirect| BankSimView
    BankSimView -->|6. Confirm Transfer| ConfirmBankAction
    ConfirmBankAction -->|7. Update State to PENDING| PaymentOrchestrator
    PaymentOrchestrator -->|8. Mutate Payment| PaymentEntity
    PaymentEntity -->|9. Emit Event| DomainEvents
    PaymentOrchestrator -->|10. Persist| DrizzlePaymentRepo
    DrizzlePaymentRepo --> DbTables
    ConfirmBankAction -->|11. Redirect with PENDING| ConfirmationView
    TestingControls -->|12. QA Simulation| SimulateSettlementAction
    SimulateSettlementAction -->|13. Transition State| PaymentOrchestrator
```
</details>

---

## User Review Required

> [!IMPORTANT]
> **Key Design Decisions Aligned with User:**
> 1. **Bank Provider Only:** The active production/testing rail is configured for `BANK_TRANSFER`.
> 2. **Passable Simulated Gateway:** A lightweight mock bank portal (`/checkout/bank-sim`) allows testers to view transfer details, review the pre-filled reference code (`TXN-BNK-...`), add optional notes, and submit.
> 3. **Customer Flow Terminates at `PENDING`:** The order and payment status will remain `PENDING` on checkout completion, clearly communicating that the workshop awaits bank wire clearance before beginning silver casting.
> 4. **Dual Currency Rails (JN-252 / JN-253):** Supports USD (International SWIFT/wire) and NPR (Nepal domestic bank transfer), maintaining explicit separation between display and settlement currencies.
> 5. **Dedicated QA Settlement Helper:** A secured server action `simulateBankSettlementAction` and test suite verify transitions beyond `PENDING` (`PAID`, `FAILED`, `REFUNDED`) without polluting customer checkout.

---

## Proposed Changes Grouped by Package

### 1. Domain Layer (`packages/domain`)
- **[MODIFY] [`payment.entity.ts`](file:///home/sarakb/projects/Jeanius/packages/domain/src/payment/payment.entity.ts):**
  - Add `'BANK_TRANSFER'` to `PaymentProvider` union.
  - Add `markPending(transactionId: string, notes?: string)` method to transition `INITIATED` $\rightarrow$ `PENDING`.
  - Add `settlementAmount: Money` property to satisfy `JN-252` and `JN-253`.
  - Add `notes?: string` property for bank reference/memo tracking.
- **[MODIFY] [`domain-event.ts`](file:///home/sarakb/projects/Jeanius/packages/domain/src/events/domain-event.ts):**
  - Add `PaymentPendingEvent` domain event.
- **[NEW] [`payment.entity.test.ts`](file:///home/sarakb/projects/Jeanius/packages/domain/src/payment/payment.entity.test.ts):**
  - Unit tests verifying `Payment` transitions: `INITIATED` $\rightarrow$ `PENDING` $\rightarrow$ `PAID` $\rightarrow$ `REFUNDED` and invalid state transitions.

---

### 2. Contracts Layer (`packages/contracts`)
- **[NEW] `src/payment/payment.dto.ts`:**
  - `PaymentProviderSchema`: `'BANK_TRANSFER' | 'STRIPE' | 'ESEWA' | 'KHALTI' | 'FONEPAY'`.
  - `PaymentStatusSchema`: `'INITIATED' | 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'REFUNDED' | 'PARTIALLY_REFUNDED'`.
  - `InitiatePaymentDtoSchema` & `InitiatePaymentResultDtoSchema`.
  - `ConfirmBankTransferDtoSchema` (`paymentId`, `voucherReference`, `notes`).
  - `SimulateBankSettlementDtoSchema` (`paymentId`, `action: 'SETTLE' | 'FAIL' | 'REFUND'`, `reason`).
  - `PaymentWebhookPayloadDtoSchema` & `RefundPaymentDtoSchema`.
- **[MODIFY] `src/index.ts`:**
  - Export payment DTOs and Zod validation schemas.

---

### 3. Application Layer (`packages/application`)
- **[MODIFY] [`payment-gateway.port.ts`](file:///home/sarakb/projects/Jeanius/packages/application/src/payment/payment-gateway.port.ts):**
  - Define `IPaymentProvider` interface (`JN-240`):
    - `readonly providerId: PaymentProvider`
    - `initiatePayment(order: Order, options?: PaymentInitiateOptions): Promise<PaymentInitiationResult>`
    - `confirmTransfer(paymentId: string, reference: string, notes?: string): Promise<PaymentConfirmationResult>`
    - `verifyWebhook(payload: unknown, signature: string): Promise<WebhookVerificationResult>`
    - `processRefund(payment: Payment, amount: Money, reason: string): Promise<RefundResult>`
  - Define `IPaymentRepository` port methods: `findById`, `findByOrderId`, `findByIdempotencyKey`, `save`.
- **[NEW] `src/payment/payment-orchestrator.service.ts` (`JN-244`):**
  - Multi-rail provider registry with environment-based selection (`JN-245`).
  - Routes payments to `SimulatedBankAdapter` for `BANK_TRANSFER`.
  - Enforces payment idempotency (`JN-249`).
  - Dispatches domain events to Outbox (`PaymentPendingEvent`, `PaymentSettledEvent`, `PaymentFailedEvent`).
- **[NEW] `src/payment/reconcile-payment.service.ts` (`JN-250`, `JN-251`):**
  - Handles manual or programmatic settlement, rejection, and full/partial refund processing.
- **[NEW] `src/payment/payment.service.test.ts` (`JN-255` → `JN-258`):**
  - Unit tests for failed payment recovery, duplicate payment idempotency, and refund lifecycle.

---

### 4. Integrations Layer (`packages/integrations`)
- **[NEW] `src/payment/simulated-bank.adapter.ts` (`JN-246`, `JN-247`):**
  - Implements `IPaymentProvider`.
  - Handles both USD International Bank Wire and NPR Domestic Transfer instructions.
  - Pre-generates mock voucher codes (`TXN-BNK-${Date.now()}`).
  - Generates bank simulation URL (`/checkout/bank-sim?paymentId=...&orderNumber=...`).
  - Returns passable status `PENDING` upon transfer submission.
- **[MODIFY] [`packages/integrations/src/index.ts`](file:///home/sarakb/projects/Jeanius/packages/integrations/src/index.ts):**
  - Export `SimulatedBankAdapter` and register in `PaymentOrchestrator`.

---

### 5. Database Layer (`packages/database`)
- **[MODIFY] [`schema/payments.ts`](file:///home/sarakb/projects/Jeanius/packages/database/src/schema/payments.ts):**
  - Ensure columns exist for `notes`, `settlement_amount_cents`, `settlement_currency`, `voucher_reference`.
- **[NEW] `src/repositories/drizzle-payment.repository.ts` (`JN-051`):**
  - Implements `IPaymentRepository`.
  - Supports atomic transaction persistence with outbox events.

---

### 6. Storefront Presentation Layer (`apps/storefront`)
- **[NEW] `actions/payment.actions.ts`:**
  - `initiateOrderPaymentAction(orderId)`
  - `confirmBankTransferAction(input: ConfirmBankTransferDto)`
  - `simulateBankSettlementAction(input: SimulateBankSettlementDto)`
- **[NEW] `app/checkout/bank-sim/page.tsx` & colocated `bank-simulation-view.tsx`:**
  - Simulated Bank Portal UI with dark/ecru atelier luxury theme.
  - Displays order number, customer name, total due in USD or NPR.
  - Auto-fills bank voucher reference with option to customize.
  - Displays Kathmandu Atelier bank wire details (Bank Name, SWIFT, Account Number).
  - "Submit Bank Transfer to Atelier" button that transitions status to `PENDING` and redirects to `/checkout/confirmation`.
- **[MODIFY] `app/checkout/confirmation/page.tsx`:**
  - Renders bank transfer receipt banner:
    - **Status:** `PENDING VERIFICATION` (Yellow/amber badge)
    - **Bank Reference:** Display the captured voucher code.
    - **Workshop Notice:** Made-to-order bench queue activates immediately upon bank wire clearance.

---

## Verification Plan

### Automated Tests
1. **Domain Tests:**
   ```bash
   pnpm --filter @jeanius/domain test
   ```
   *Expected: All Payment entity state transitions pass (INITIATED $\rightarrow$ PENDING $\rightarrow$ PAID $\rightarrow$ REFUNDED).*
2. **Application & Orchestrator Tests:**
   ```bash
   pnpm --filter @jeanius/application test
   ```
   *Expected: PaymentOrchestrator rail routing, idempotency deduplication (JN-256), failed payments (JN-255), and refunds (JN-258) pass with 0 errors.*
3. **Monorepo Build & Typecheck:**
   ```bash
   ./scripts/verify-monorepo.sh
   ```
   *Expected: Clean build, typecheck, and lint across all 10 workspaces with 0 errors.*

### Manual Verification
1. Place an Order-Made or DROP item in the bag and complete `/checkout`.
2. Select **Bank Transfer** and confirm checkout $\rightarrow$ redirects to `/checkout/bank-sim`.
3. Verify `/checkout/bank-sim` displays the order details, dual currency amount (USD/NPR), and pre-filled voucher code.
4. Click **"Submit Bank Transfer to Atelier"** $\rightarrow$ redirects to `/checkout/confirmation`.
5. Verify order confirmation displays **Payment Status: PENDING VERIFICATION** with the captured bank reference.
6. Trigger `simulateBankSettlementAction` $\rightarrow$ verify payment transitions cleanly to `PAID` without breaking.
