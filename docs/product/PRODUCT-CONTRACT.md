# JEANIUS — PRODUCT CONTRACT & SPECIFICATION

**Document Version:** 1.0.0  
**Status:** Frozen Implementation Contract  
**Scope:** Foundational Architecture Contracts (JN-001 to JN-005)

---

## 1. Product Scope Matrix (JN-001)

The scope for Jeanius is strictly defined across three tiers to guarantee focus on high-craft execution and prevent scope creep.

| Feature Area | MVP (Launch Target) | Phase 2 (Fast Follow) | Explicitly Excluded |
| :--- | :--- | :--- | :--- |
| **Catalog & Models** | • Order-Made (OM) Jeans, Jackets, Tote Bags<br/>• Small-batch Ready-to-Ship (DROP)<br/>• Dynamic OM lead-time badge | • Gated community drops (TOGETHER)<br/>• Pre-orders for upcoming fabric lots | • Multi-vendor marketplace<br/>• Digital goods / NFTs |
| **Product Configurator** | • Fit, Waist (28–36), Inseam (30–36)<br/>• Raw rinse vs One-wash selection<br/>• Hardware finishes (Brass, Silver) | • Custom chainstitch monogramming<br/>• Bespoke pocket bag artwork | • 3D real-time mesh rendering (distracting to minimalist aesthetic) |
| **Checkout & Payments** | • Single-page international address validation<br/>• Multi-rail payment (Stripe USD card rails + Nepal domestic eSewa/Khalti NPR rails)<br/>• Dynamic shipping calculation | • Split payments<br/>• Multi-currency crypto rails | • Unauthenticated / guest checkout without email confirmation |
| **Workshop & Operations** | • 8-Stage OM Production Kanban in `apps/admin`<br/>• Cut-ticket generation & fabric batch tracking<br/>• Delay recording & notes | • Automated barcode/QR label scanning<br/>• Fabric bolt waste optimization | • Heavy third-party ERP integration (SAP, Oracle) |
| **Fulfillment & Logistics** | • Manual tracking number assignment<br/>• Courier status synchronization (DHL / Aramex / EMS)<br/>• Military-base shipping rules | • Automated shipping rate API integration (EasyPost/Shippo)<br/>• Local pickup locker network | • Dropshipping from unverified third-party suppliers |
| **Customer Experience** | • Order tracking & OM timeline visualization<br/>• Editorial guide (Sizing, Denim Care, About)<br/>• Direct Instagram DM / Email support | • Verified purchase reviews with photo upload<br/>• Community denim fading gallery | • AI chatbot customer support |

---

## 2. Formalized Commerce Models (JN-002)

### A. Order-Made (OM) — Made to Order
* **Core Principle:** Jeans, jackets, and accessories cut and assembled after customer payment.
* **Inventory Behavior:** Zero finished goods inventory required. Orders lock reservations on raw fabric yardage (e.g. 2.7m of 14oz Kurabo raw selvedge denim).
* **Production Policy:** Governed dynamically by `ProductionPolicy` (default: 7–14 business days, automatically extending for official Nepal workshop holidays).
* **Cancellation & Refund Contract:**
  * **Pre-Cutting:** The customer may cancel within 24 hours of payment if the job has not entered the `CUTTING` stage (100% refund).
  * **Post-Cutting (Point of No Return):** Once the tailor draws the pattern and precision-cuts the denim panels to the customer's waist and inseam, cancellation or return is **strictly prohibited**, except in cases of proven manufacturing defect.

### B. DROP — Ready-to-Ship
* **Core Principle:** Pre-manufactured physical inventory produced in limited batches (e.g., 50 units of a limited natural indigo capsule).
* **Inventory Behavior:** Variant inventory count decrements immediately upon checkout confirmation. Once inventory hits 0, variant transitions to `SOLD_OUT`.
* **Fulfillment Window:** Dispatches from the Kathmandu warehouse within 24–48 hours.
* **Return & Refund Contract:** Customers have a 5-day inspection window from the carrier delivery timestamp. Returned goods must be unworn, with tags and selvedge ticker intact.

### C. Custom Atelier Inquiries (Bespoke)
* **Core Principle:** Personalized, non-standard denim requests (custom patch placements, specialized heavyweights > 19oz).
* **Workflow:** Non-payable inquiry submitted via storefront form → Admin reviews and issues formal quote (Price + Lead Time) → Customer accepts and pays → Converts into standard OM order.

### D. TOGETHER — Member-Only Releases
* **Core Principle:** Protected, small-batch denim releases accessible only to authenticated members or designated access pass holders.
* **Security Guardrail:** Server Components enforce authorization before serving product metadata or images, preventing media scraping.

---

## 3. Actor Model & Permissions (JN-003)

| Actor Role | Authentication | Permitted Capabilities | Prohibited Operations |
| :--- | :--- | :--- | :--- |
| **GUEST** | None (Anonymous session) | Browse public catalog, configure denim options, calculate shipping rates, add items to cart. | Cannot place orders without email, access TOGETHER drops, or view order history. |
| **CUSTOMER** | Authenticated (Email/Password) | Place orders, view personal order history, inspect live OM stage status, save shipping addresses. | Cannot view workshop boards, manipulate prices, or access internal production notes. |
| **MEMBER** | Authenticated + Member Flag | All Customer capabilities + access to restricted `TOGETHER` and archival drops. | Cannot access administrative features. |
| **TAILOR** | Authenticated + Tailor Role | Access `apps/admin` OM queue, inspect cutting tickets, advance production stages, record delay notes. | Cannot alter product prices, view customer credit card details, or issue financial refunds. |
| **FULFILLMENT** | Authenticated + Fulfillment Role | Access ready orders in `apps/admin`, package orders, generate waybills, record carrier tracking numbers. | Cannot modify product configurations or advance tailoring stages. |
| **SUPPORT** | Authenticated + Support Role | Search orders, view customer history, update shipping addresses prior to dispatch, resolve tickets. | Cannot modify database schemas or execute raw database updates. |
| **ADMIN** | Authenticated + Admin Role | Full operational control: manage catalog, configure `ProductionPolicy`, adjust stock, issue refunds. | None. |

---

## 4. Order Lifecycle State Machine (JN-004)

Every commercial transaction follows an immutable state machine:

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Customer adds item to Cart
    DRAFT --> PENDING_PAYMENT: Checkout initiated
    
    PENDING_PAYMENT --> EXPIRED: Unpaid timeout (30 min)
    PENDING_PAYMENT --> FAILED: Payment declined / abandoned
    PENDING_PAYMENT --> PAID: Payment verified via Webhook
    
    state PAID {
        [*] --> SPLIT_FULFILLMENT
        SPLIT_FULFILLMENT --> IN_PRODUCTION: Has OM line items
        SPLIT_FULFILLMENT --> READY_FOR_DISPATCH: DROP only items
        IN_PRODUCTION --> READY_FOR_DISPATCH: All OM ProductionJobs READY
    }
    
    READY_FOR_DISPATCH --> SHIPPED: Tracking number recorded
    SHIPPED --> DELIVERED: Carrier confirms delivery
    
    PAID --> CANCELLED: Pre-cutting cancellation (Full refund)
    DELIVERED --> REFUND_REQUESTED: DROP item refund request (within 5 days)
    REFUND_REQUESTED --> REFUNDED: Returned goods inspected & approved
    REFUND_REQUESTED --> DELIVERED: Refund rejected (worn/damaged)
    
    EXPIRED --> [*]
    FAILED --> [*]
    CANCELLED --> [*]
    DELIVERED --> [*]
    REFUNDED --> [*]
```

### State Definitions & Rules
1. **DRAFT:** Ephemeral cart state.
2. **PENDING_PAYMENT:** Order created with frozen line items and locked price snapshot. A payment session is active.
3. **PAID:** Payment confirmed by verified webhook. If OM lines are present, a `ProductionJob` is created for each custom line item.
4. **IN_PRODUCTION:** At least one OM line item is actively in the manufacturing queue.
5. **READY_FOR_DISPATCH:** Items inspected, pressed, and packed into branded canvas tote bags with maker certificates.
6. **SHIPPED:** Dispatched with an international tracking number (e.g. DHL Express, Aramex).
7. **DELIVERED:** Courier signals delivery to destination address.

---

## 5. OM Manufacturing Lifecycle (JN-005)

The craftsmanship pipeline is the heart of Jeanius. Every pair of custom jeans progresses through eight mandatory stages:

```mermaid
stateDiagram-v2
    [*] --> QUEUED: Order Paid (Fabric Allocated)
    
    QUEUED --> CUTTING: Pattern drafted & denim cut
    note right of CUTTING
        POINT OF NO RETURN
        Order cannot be cancelled
        after entering CUTTING.
    end note
    
    CUTTING --> SEWING: Union Special chainstitch assembly
    SEWING --> WASHING: Raw rinse / vintage settling bath
    WASHING --> HARDWARE: Copper rivets & donut buttons hammered
    HARDWARE --> QC: Measurement & tolerance inspection
    
    QC --> READY: Inspection passed (±0.25" tolerance)
    QC --> SEWING: Inspection failed (Rework required)
    
    READY --> SHIPPED: Handed over to courier with tracking
    SHIPPED --> [*]
```

### Workshop Stage Details
1. **STAGE 1 — QUEUED:** Order received. Tailor allocates raw denim roll (e.g., 14oz Japanese Kurabo selvedge) and prepares pattern cards.
2. **STAGE 2 — CUTTING:** **[POINT OF NO RETURN]** Fabric is rolled out, chalked to customer's exact waist and inseam, and precision-cut. Cancellation is locked.
3. **STAGE 3 — SEWING:** Construction using vintage Union Special chainstitch machines, flat-felled inseams, hidden back pocket rivets, and reinforced belt loops.
4. **STAGE 4 — WASHING:** Optional one-wash bath to remove sizing starch while preserving raw selvedge rigidity and vertical indigo fading potential.
5. **STAGE 5 — HARDWARE:** Solid copper burr rivets hand-hammered onto stress points; custom donut buttons pressed; vegetable-tanned leather patch branded and stitched.
6. **STAGE 6 — QC INSPECTION:** Senior artisan verifies waist, front rise, back rise, thigh, knee, and leg opening against specifications (tolerance: ±0.25").
7. **STAGE 7 — READY:** Passed garments folded, ironed, and packaged into dustproof canvas bags with signed artisan maker certificates.
8. **STAGE 8 — SHIPPED:** Tracking number registered and transit updates initiated.
