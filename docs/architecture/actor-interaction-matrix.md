# Actor Interaction & Interface Matrix — Jeanius & Jewl

This specification defines the complete interaction model, user surfaces, operational ergonomics, and access boundaries for all 8 canonical actors defined in [`packages/domain/src/index.ts`](file:///home/sarakb/projects/Jeanius/packages/domain/src/index.ts) and [PRODUCT-CONTRACT.md](file:///home/sarakb/projects/Jeanius/docs/product/PRODUCT-CONTRACT.md).

---

## 1. Actor Architecture Map

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               apps/storefront (Next.js)                                │
├───────────────────────┬─────────────────────────────────┬──────────────────────────────┤
│       1. GUEST        │           2. CUSTOMER           │          3. MEMBER           │
│   (Public Catalog)    │ (Auth, Orders & Dual Profiling) │  (Gated Selvedge & Jewellery)│
└───────────────────────┴─────────────────────────────────┴──────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                  apps/admin (Next.js)                                  │
├───────────────────────┬─────────────────────────────────┬──────────────────────────────┤
│       4. TAILOR       │           5. JEWELLER           │        6. FULFILLMENT        │
│   (Denim Workshop)    │       (Silversmith Bench)       │  (Pack, Waybill & Customs)   │
├───────────────────────┴─────────────────────────────────┴──────────────────────────────┤
│                                       7. SUPPORT                                       │
│                      (Customer Care, Order Adjustments & Inquiries)                    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                        8. ADMIN                                        │
│          (Full Atelier Control, Financials, Catalog, Staff Roles & Drop Policy)        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Comprehensive Actor Profiles & Interactions

### 1. `GUEST` (Anonymous Public Shopper)
* **Application Surface:** `apps/storefront` (Public routes: `/`, `/catalog`, `/products/[handle]`, `/cart`, `/checkout`)
* **Ergonomics:** Responsive Mobile/Desktop web. Fast LCP < 1.2s, smooth micro-interactions.
* **Core Interactions:**
  * Configures bespoke denim specifications (Fit, Waist, Inseam length, Hardware finish, Monogramming text) and artisan jewellery (Ring size, Mandrel mm, Metal alloy, Patina finish) in the Product Configurator.
  * Adds configurations to client-side ephemeral cart managed via Zustand with cookie session persistence.
  * Enters international shipping address and initiates checkout.
* **Security & Boundary Rules:**
  * Cannot finalize orders without providing and validating an email address.
  * Cannot view restricted `TOGETHER` member drops (receives 404 or redirect to login).
  * Cannot access `/account/*` or view historical orders.

---

### 2. `CUSTOMER` (Authenticated Buyer)
* **Application Surface:** `apps/storefront` (Routes: `/account`, `/account/orders`, `/account/orders/[id]`, `/account/profile`)
* **Ergonomics:** Mobile-first customer portal with rich typography and artisanal atelier aesthetic.
* **Core Interactions:**
  * **Saved Dual-Craft Sizing Profile:** Stores denim waist, inseam, preferred silhouette, hem allowance, as well as jewellery ring size, mandrel measurement, wrist circumference, and preferred metal alloy/finish to prefill configurators automatically.
  * **Visual 8-Stage OM Denim & Jewellery Tracker:** Interactive visual timeline tracking physical craft progress in Kathmandu (`Cutting/Casting` → `Sewing/Setting` → `Washing/Patina` → `Hardware/Polishing` → `QC` → `Ready` → `Shipped`).
  * **Pre-Production 24h Cancellation:** Self-service 1-click cancellation button enabled within 24 hours of payment **if and only if** the item has not crossed the Point of No Return (`CUTTING` for denim, `CASTING` for jewellery).
  * **Invoice & Document Downloads:** Downloads official Commercial Invoices, courier tracking links, and digital authenticity certificates.
* **Security & Boundary Rules:**
  * Row-Level Security (RLS) restricts database queries strictly to rows where `customer_id == auth.uid()`.
  * Forbidden from viewing internal workshop notes, craftsman delay logs, or operational margins.

---

### 3. `MEMBER` (VIP Collector & Community Insider)
* **Application Surface:** `apps/storefront` (Routes: `/member/lounge`, `/member/archive`, `/member/drops`)
* **Ergonomics:** Dark-mode luxury editorial aesthetic, countdown clocks, macro-photography of selvedge weave and hand-engraved precious metals.
* **Core Interactions:**
  * **Gated Capsule Drops (`TOGETHER`):** Accesses deadstock vintage Japanese denim runs, hand-carved sterling silver rings, and numbered collector pieces invisible to the public catalog.
  * **Early Drop Reservation Window:** 1-hour early-access checkout window before public drop launches.
  * **Community Patina & Fading Archive:** Can upload patina progression photos (denim fades and silver oxidation) and explore documented archives.
* **Security & Boundary Rules:**
  * Next.js Server Components enforce session validation (`role == 'MEMBER'`). Member-only product metadata, images, and prices are strictly omitted from unauthenticated HTML payloads.

---

### 4. `TAILOR` (Denim Workshop Craftsman)
* **Application Surface:** `apps/admin/workshop/tailor`
* **Ergonomics:** Tablet/iPad touchscreen kiosk mode in the Kathmandu garment workshop. High contrast for bright overhead shop lighting, large touch targets (suitable for craft aprons and gloved hands), zero cluttered business menus.
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
  * Restricted entirely to `/admin/workshop/tailor/*`. Attempting to access jewellery bench (`/admin/workshop/jeweller`), financials, or settings returns `403 Forbidden`.

---

### 5. `JEWELLER` (Metalsmith Bench Craftsman)
* **Application Surface:** `apps/admin/workshop/jeweller`
* **Ergonomics:** Tablet/iPad touchscreen kiosk mode at the Kathmandu silversmith bench. High contrast, large touch targets, simplified job trays.
* **Core Interactions:**
  * **Bench-Ticket Station:** Displays exact jewellery casting and finishing parameters:
    - Order #, Customer Reference (First name only)
    - Precious Metal Lot ID (e.g. `Lot #MS-AG-01`, .925 Sterling Silver casting grain)
    - Specifications: Ring size (US 9 / 19.0mm mandrel), Metal alloy, Patina treatment, Custom hallmark/engraving text
  * **Job Tray Stage Progression:** Metalsmith scans physical tray QR code or taps stage buttons:
    `Queued` → `Casting` → `Setting` → `Patina` → `Polishing` → `QC` → `Ready`.
  * **Delay & Defect Logging:** One-tap defect logging with jewellery-specific reasons (`Casting Porosity`, `Sizing Rework`, `Inclusion Defect`, `Stone Fracture`).
* **Security & Boundary Rules:**
  * **Strict Financial Redaction:** Jeweller accounts have zero access to customer credit card tokens, purchase prices, profit margins, or refund tools.
  * Restricted entirely to `/admin/workshop/jeweller/*`. Attempting to access denim tailoring (`/admin/workshop/tailor`), financials, or settings returns `403 Forbidden`.

---

### 6. `FULFILLMENT` (Warehouse & Packing Clerk)
* **Application Surface:** `apps/admin/fulfillment`
* **Ergonomics:** Desktop packing station with barcode scanner, label printer, and weighing scale integration.
* **Core Interactions:**
  * **Pick & Pack Queue:** Real-time list of dispatchable items (ready-to-ship DROP items and OM pieces that just received Workshop QC approval).
  * **Dual-Vertical Protective Packaging:**
    - Denim: Packed in dustproof natural canvas bags with cedar rings.
    - Jewellery: Packed in custom velvet/wooden presentation boxes with polishing cloths and authenticity cards.
  * **Multi-Package Split Dispatch:** Consolidates DROP accessories into Package 1 (24h dispatch) and pairs OM garments/jewellery into Package 2 when handcrafting completes.
  * **Automated Waybill & Customs Generation:**
    - Generates DHL Express / Aramex international shipping labels.
    - Prints official Nepal Customs Commercial Invoice (Harmonized Tariff Code `6203.42` for denim trousers, `7113.11` for silver jewellery, DDU/DDP export declaration).
  * **Parcel Weight Verification:** Scans barcode, enters verified packed weight, and marks package `SHIPPED`.
* **Security & Boundary Rules:**
  * Cannot alter garment patterns, jewellery specs, change product pricing, or modify crafting stages.

---

### 7. `SUPPORT` (Customer Care Specialist)
* **Application Surface:** `apps/admin/support`
* **Ergonomics:** Desktop dual-pane ticket and customer lookup interface.
* **Core Interactions:**
  * **Order Lookup & Timeline Inspection:** Searches orders by customer email, name, or transaction ID. Inspects live OM production stage across both tailoring and jewellery benches.
  * **Pre-Production Adjustments:** Can edit delivery address or adjust sizing (inseam or ring size) **only while the job is in `QUEUED` stage** (prior to `CUTTING` for denim, `CASTING` for jewellery).
  * **DROP Return Claims Desk:** Reviews return requests submitted within the 5-day inspection window, reviews uploaded customer photos, and issues return waybills.
  * **Custom Atelier Inquiry Desk:** Reviews bespoke denim and jewellery requests, drafts artisan quotes, and sends invoices.
* **Security & Boundary Rules:**
  * Cannot execute raw SQL migrations or access platform API keys.
  * Financial refunds require secondary Admin escalation if exceeding standard policy limits.

---

### 8. `ADMIN` (Founder & Operations Director)
* **Application Surface:** `apps/admin` (Full root access)
* **Ergonomics:** Complete operational dashboard with analytics, inventory controls, and financial reconciliation.
* **Core Interactions:**
  * Full catalog and scheduling management for both denim and jewellery collections.
  * Fabric bolt inventory allocation (yards/shrinkage) and precious metal stock allocation (grams/alloys/lots).
  * `ProductionPolicy` lead-time rules and workshop holiday calendar controls.
  * Payment gateway reconciliation (Stripe international + eSewa/Khalti domestic NPR).
  * Staff account provisioning and role assignments (`TAILOR`, `JEWELLER`, `FULFILLMENT`, `SUPPORT`).
  * Double-entry financial ledger auditing.
* **Security & Boundary Rules:**
  * Multi-Factor Authentication (MFA) required on all administrative accounts.
  * All privileged administrative mutations recorded in immutable `audit_logs`.

---

## 3. Actor-to-Capability Matrix

| Capability | GUEST | CUSTOMER | MEMBER | TAILOR | JEWELLER | FULFILLMENT | SUPPORT | ADMIN |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Browse Public Catalog & Lookbooks | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Configure Bespoke Denim (Fit/Waist/Inseam) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Configure Handcrafted Jewellery (Size/Alloy)| ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Place Order / Checkout | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Save Dual-Craft Sizing Profile | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Interactive 8-Stage OM Tracker | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 1-Click Pre-Production 24h Cancellation | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Access TOGETHER Gated Drops (Denim & Gems) | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| View Cut-Ticket & Continuous Bolt ID | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| View Bench-Ticket & Metal Lot ID | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Advance Denim Craft Stages (Cutting→QC) | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Advance Jewellery Craft Stages (Casting→QC) | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Log Workshop Delay / Material Defect | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Generate DHL Waybills & Nepal Customs Docs | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Package & Dispatch Multi-Split Shipments | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Edit Address / Sizing (Pre-Point-of-Return) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Review DROP 5-Day Return Claims | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Financial Ledger & Price Management | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage Staff Accounts & Role Grants | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
