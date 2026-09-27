# Actor Interaction & Interface Matrix — Jeanius

This specification defines the complete interaction model, user surfaces, operational ergonomics, and access boundaries for all 7 canonical actors defined in [`packages/domain/src/index.ts`](file:///home/sarakb/projects/Jeanius/packages/domain/src/index.ts) and [PRODUCT-CONTRACT.md](file:///home/sarakb/projects/Jeanius/docs/product/PRODUCT-CONTRACT.md).

---

## 1. Actor Architecture Map

```
┌────────────────────────────────────────────────────────────────────────┐
│                        apps/storefront (Next.js)                       │
├────────────────────┬─────────────────────────────┬─────────────────────┤
│      1. GUEST      │         2. CUSTOMER         │      3. MEMBER      │
│  (Public Catalog)  │  (Auth, Orders & Tailoring) │  (Gated Selvedge)   │
└────────────────────┴─────────────────────────────┴─────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                          apps/admin (Next.js)                          │
├────────────────────┬─────────────────────────────┬─────────────────────┤
│     4. TAILOR      │       5. FULFILLMENT        │     6. SUPPORT      │
│  (Workshop Floor)  │   (Pack, Waybill & Courier) │ (Orders & Tickets)  │
├────────────────────┴─────────────────────────────┴─────────────────────┤
│                               7. ADMIN                                 │
│           (Full Business Control, Financials, Catalog & Drop Policy)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Comprehensive Actor Profiles & Interactions

### 1. `GUEST` (Anonymous Public Shopper)
* **Application Surface:** `apps/storefront` (Public routes: `/`, `/catalog`, `/products/[handle]`, `/cart`, `/checkout`)
* **Ergonomics:** Responsive Mobile/Desktop web. Fast LCP < 1.2s, smooth micro-interactions.
* **Core Interactions:**
  * Configures bespoke denim specifications (Fit, Waist, Inseam length, Hardware finish, Monogramming text) in the Product Configurator.
  * Adds configurations to client-side ephemeral cart managed via Zustand with cookie session persistence.
  * Enters international shipping address and initiates checkout.
* **Security & Boundary Rules:**
  * Cannot finalize orders without providing and validating an email address.
  * Cannot view restricted `TOGETHER` member drops (receives 404 or redirect to login).
  * Cannot access `/account/*` or view historical orders.

---

### 2. `CUSTOMER` (Authenticated Buyer)
* **Application Surface:** `apps/storefront` (Routes: `/account`, `/account/orders`, `/account/orders/[id]`, `/account/profile`)
* **Ergonomics:** Mobile-first customer portal with rich typography and artisanal denim aesthetic.
* **Core Interactions:**
  * **Saved Sizing Profile:** Stores waist, inseam, preferred silhouette, and hem allowance to prefill the configurator automatically on subsequent visits.
  * **Visual 8-Stage OM Denim Tracker:** Interactive visual timeline tracking physical garment progress in the Kathmandu workshop (`Cutting` → `Sewing` → `Washing` → `Hardware` → `QC` → `Ready` → `Shipped`).
  * **Pre-Cutting 24h Cancellation:** Self-service 1-click cancellation button enabled within 24 hours of payment **if and only if** the garment has not entered the `CUTTING` stage.
  * **Invoice & Document Downloads:** Downloads official Commercial Invoices, courier tracking links, and digital denim craftsmanship certificates.
* **Security & Boundary Rules:**
  * Row-Level Security (RLS) restricts database queries strictly to rows where `customer_id == auth.uid()`.
  * Forbidden from viewing internal workshop notes, craftsman delay logs, or operational margins.

---

### 3. `MEMBER` (VIP Collector & Community Insider)
* **Application Surface:** `apps/storefront` (Routes: `/member/lounge`, `/member/archive`, `/member/drops`)
* **Ergonomics:** Dark-mode luxury editorial aesthetic, countdown clocks, exclusive fabric macro-photography.
* **Core Interactions:**
  * **Gated Capsule Drops (`TOGETHER`):** Accesses deadstock vintage Japanese denim runs and numbered collector pieces invisible to the public catalog.
  * **Early Drop Reservation Window:** 1-hour early-access checkout window before public drop launches.
  * **Community Denim Fading Archive:** Can upload patina progression photos and explore documented fade histories of aged Jeanius denim.
* **Security & Boundary Rules:**
  * Next.js Server Components enforce session validation (`role == 'MEMBER'`). Member-only product metadata, images, and prices are strictly omitted from unauthenticated HTML payloads.

---

### 4. `TAILOR` (Workshop Craftsman)
* **Application Surface:** `apps/admin/workshop/tailor`
* **Ergonomics:** Tablet/iPad touchscreen kiosk mode in the Kathmandu workshop. High contrast for bright overhead shop lighting, large touch targets (suitable for craft aprons and gloved hands), zero cluttered business menus.
* **Core Interactions:**
  * **Cut-Ticket Station:** Displays exact physical garment cut parameters:
    - Order #, Customer Reference (First name only)
    - Fabric Bolt ID (e.g. `Bolt #KB-042`, Kurabo 14oz Raw)
    - Pattern measurements: Waist 32.5", Inseam 33.25", Thread color, Hardware alloy
  * **QR / Barcode Stage Progression:** Craftsman scans garment physical tag or taps large stage advancement buttons:
    `Queued` → `Cutting` → `Sewing` → `Washing` → `Hardware` → `QC` → `Ready`.
  * **Delay & Defect Logging:** One-tap delay logging with standardized reasons (`Fabric Weave Flaw`, `Machine Maintenance`, `Thread Breakage`, `Re-cut Panel`).
* **Security & Boundary Rules:**
  * **Strict Financial Redaction:** Tailor accounts have zero access to customer credit card numbers, payment processor tokens, order purchase prices, profit margins, or refund tools.
  * Restricted entirely to `/admin/workshop/*`. Attempting to access `/admin/financials` or `/admin/settings` returns `403 Forbidden`.

---

### 5. `FULFILLMENT` (Warehouse & Packing Clerk)
* **Application Surface:** `apps/admin/fulfillment`
* **Ergonomics:** Desktop packing station with barcode scanner, label printer, and weighing scale integration.
* **Core Interactions:**
  * **Pick & Pack Queue:** Real-time list of dispatchable items (ready-to-ship DROP jeans and OM garments that just received Workshop QC approval).
  * **Multi-Package Split Dispatch:** Consolidates DROP accessories into Package 1 (24h dispatch) and pairs OM garments into Package 2 when tailoring completes.
  * **Automated Waybill & Customs Generation:**
    - Generates DHL Express / Aramex international shipping labels.
    - Prints official Nepal Customs Commercial Invoice (Harmonized Tariff Code `6203.42` for men's denim trousers, DDU/DDP export declaration).
  * **Parcel Weight Verification:** Scans barcode, enters verified packed weight, and marks package `SHIPPED`.
* **Security & Boundary Rules:**
  * Cannot alter garment patterns, change product pricing, or modify tailoring stages.

---

### 6. `SUPPORT` (Customer Care Specialist)
* **Application Surface:** `apps/admin/support`
* **Ergonomics:** Desktop dual-pane ticket and customer lookup interface.
* **Core Interactions:**
  * **Order Lookup & Timeline Inspection:** Searches orders by customer email, name, or transaction ID. Inspects live OM production stage and tracking numbers.
  * **Pre-Cutting Address / Measurement Corrections:** Can edit delivery address or adjust inseam length **only while the job is in `QUEUED` stage**. (Once in `CUTTING`, measurement fields are permanently locked).
  * **DROP Return Claims Desk:** Reviews return requests submitted within the 5-day inspection window, reviews uploaded customer photos, and issues return waybills.
  * **Custom-Order Inquiry Review:** Reviews bespoke atelier inquiries, drafts tailor quotes, and sends payment links to customers.
* **Security & Boundary Rules:**
  * Cannot execute raw SQL migrations or access platform API keys.
  * Financial refunds require secondary Admin escalation if exceeding standard policy limits.

---

### 7. `ADMIN` (Founder & Operations Director)
* **Application Surface:** `apps/admin` (Full root access)
* **Ergonomics:** Complete operational dashboard with analytics, inventory controls, and financial reconciliation.
* **Core Interactions:**
  * Full catalog and scheduling management.
  * Fabric bolt inventory allocation and mill batch management.
  * `ProductionPolicy` lead-time rules and workshop holiday calendar controls.
  * Payment gateway reconciliation (Stripe international + eSewa/Khalti domestic NPR).
  * Staff account provisioning and role assignments (`TAILOR`, `FULFILLMENT`, `SUPPORT`).
  * Double-entry financial ledger auditing.
* **Security & Boundary Rules:**
  * Multi-Factor Authentication (MFA) required on all administrative accounts.
  * All privileged administrative mutations recorded in immutable `audit_logs`.

---

## 3. Actor-to-Capability Matrix

| Capability | GUEST | CUSTOMER | MEMBER | TAILOR | FULFILLMENT | SUPPORT | ADMIN |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Browse Public Catalog & Lookbooks | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Configure Bespoke Denim (Fit/Waist/Inseam) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Place Order / Checkout | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Save Measurement Profile | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Interactive 8-Stage OM Tracker | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| 1-Click Pre-Cutting 24h Cancellation | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Access TOGETHER Gated Drops | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| View Cut-Ticket & Continuous Bolt ID | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Advance Workshop Craft Stages (Cutting→QC)| ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Log Workshop Delay / Fabric Defect | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Generate DHL Waybills & Nepal Customs Docs| ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Package & Dispatch Multi-Split Shipments | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Edit Shipping Address (Pre-Cut Only) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Review DROP 5-Day Return Claims | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Financial Ledger & Price Management | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage Staff Accounts & Role Grants | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
