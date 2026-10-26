# Actor Interaction & Interface Matrix — Project 925

This specification defines the complete interaction model, user surfaces, operational ergonomics, and access boundaries for all canonical actors in **Project 925** (.925 Sterling Silver Artisan Jewellery, Kathmandu Workshop only).

---

## 1. Actor Architecture Map

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               apps/storefront (Next.js)                                │
├───────────────────────┬─────────────────────────────────┬──────────────────────────────┤
│       1. GUEST        │           2. CUSTOMER           │          3. MEMBER           │
│   (Public Catalog)    │ (Auth, Orders & Sizing Vault)   │  (Gated Silver Releases)     │
└───────────────────────┴─────────────────────────────────┴──────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                  apps/admin (Next.js)                                  │
├───────────────────────┬─────────────────────────────────┬──────────────────────────────┤
│      4. JEWELLER      │         5. FULFILLMENT          │          6. SUPPORT          │
│   (Kathmandu Bench)   │    (Pack, Waybill & Customs)    │    (Concierge & Inquiries)   │
├───────────────────────┴─────────────────────────────────┴──────────────────────────────┤
│                                        7. ADMIN                                        │
│     (Full Atelier Control, Financials, Dynamic Categories, Staff Roles & Drop Policy)  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Comprehensive Actor Profiles & Interactions

### 1. `GUEST` (Anonymous Public Shopper)
* **Application Surface:** `apps/storefront` (Public routes: `/`, `/shop`, `/shop/[slug]`, `/sizing`, `/about`, `/cart`)
* **Ergonomics:** Responsive Mobile/Desktop web. Fast LCP < 1.2s, smooth micro-interactions.
* **Core Interactions:**
  * Configures bespoke .925 sterling silver specifications (US Ring Size 3–16 in quarter increments, Wide Shank Compensator, Wrist Circumference & Gap, Chain Drape Length, Alloy accents, Surface Patina, and inside-band engraving) in the Product Configurator.
  * Adds configurations to client-side ephemeral cart managed via Zustand with cookie session persistence.
  * Enters international shipping address and initiates checkout.
* **Security & Boundary Rules:**
  * Cannot finalize orders without providing and validating an email address.
  * Cannot view restricted `TOGETHER` member drops (receives 404 or redirect to login).
  * Cannot access `/account/*` or view historical orders.

---

### 2. `CUSTOMER` (Authenticated Buyer)
* **Application Surface:** `apps/storefront` (Routes: `/account`, `/account/orders`, `/shop`, `/drop`)
* **Ergonomics:** Mobile-first customer portal with rich typography and artisanal atelier aesthetic.
* **Core Interactions:**
  * **Saved Jewellery Sizing Vault:** Stores verified US ring size, mandrel measurement, wide shank compensator (+0.5 size), wrist gap, chain length, and preferred patina finish to prefill configurators automatically.
  * **Visual 8-Stage OM Bench Tracker:** Interactive visual timeline tracking physical craft progress in Kathmandu (`Queued` → `Casting` → `Setting` → `Patina` → `Polishing` → `QC` → `Ready` → `Shipped`).
  * **Pre-Production 24h Cancellation:** Self-service 1-click cancellation button enabled within 24 hours of payment **if and only if** the item has not crossed the Point of No Return (`CASTING`).
  * **Invoice & Document Downloads:** Downloads official Commercial Invoices (HS Code 7113.11), courier tracking links, and digital authenticity certificates.
* **Security & Boundary Rules:**
  * Row-Level Security (RLS) restricts database queries strictly to rows where `customer_id == auth.uid()`.
  * Forbidden from viewing internal workshop notes, craftsman delay logs, or operational margins.

---

### 3. `MEMBER` (VIP Collector & Community Insider)
* **Application Surface:** `apps/storefront` (Routes: `/together`, `/member`, `/drop`)
* **Ergonomics:** Dark-mode luxury editorial aesthetic, countdown clocks, macro-photography of silver textures and hand-engraved motifs.
* **Core Interactions:**
  * **Gated Capsule Drops (`TOGETHER`):** Accesses rare talisman casting runs, hand-carved signet rings, and numbered collector pieces invisible to the public catalog.
  * **Early Drop Reservation Window:** 1–24 hour early-access checkout window before public drop launches.
  * **Community Patina Archive:** Can upload patina progression photos (silver oxidation contrast and buffed wear) and explore documented archives.
* **Security & Boundary Rules:**
  * Next.js Server Components enforce session validation (`role == 'MEMBER'`). Member-only product metadata, images, and prices are strictly omitted from unauthenticated HTML payloads.

---

### 4. `JEWELLER` (Kathmandu Bench Craftsman)
* **Application Surface:** `apps/admin/workshop/jeweller`
* **Ergonomics:** Tablet/iPad touchscreen kiosk mode at the Kathmandu silversmith bench. High contrast, large touch targets, simplified job trays.
* **Core Interactions:**
  * **Bench-Ticket Station:** Displays exact jewellery casting and finishing parameters:
    - Order #, Customer Reference (First name only)
    - Precious Metal Lot ID (e.g. `Lot #MS-AG-01`, .925 Sterling Silver casting grain)
    - Specifications: Ring size (US 9 / 19.0mm mandrel), Wide Shank (+0.5 size), Metal alloy, Patina treatment, Custom hallmark/engraving text
  * **Job Tray Stage Progression:** Metalsmith scans physical tray QR code or taps stage buttons:
    `Queued` → `Casting` → `Setting` → `Patina` → `Polishing` → `QC` → `Ready`.
  * **Delay & Defect Logging:** One-tap defect logging with jewellery-specific reasons (`Casting Porosity`, `Sizing Rework`, `Inclusion Defect`, `Mold Crack`).
* **Security & Boundary Rules:**
  * **Strict Financial Redaction:** Jeweller accounts have zero access to customer credit card tokens, purchase prices, profit margins, or refund tools.
  * Restricted entirely to `/admin/workshop/jeweller/*`. Attempting to access financials or settings returns `403 Forbidden`.

---

### 5. `FULFILLMENT` (Warehouse & Packing Clerk)
* **Application Surface:** `apps/admin/fulfillment`
* **Ergonomics:** Desktop packing station with barcode scanner, label printer, and weighing scale integration.
* **Core Interactions:**
  * **Pick & Pack Queue:** Real-time list of dispatchable items (ready-to-ship DROP items and OM pieces that just received Workshop QC approval).
  * **Protective Presentation Packaging:** Packed in custom solid wooden presentation boxes with velvet pouches, silver polishing cloths, and authenticity cards.
  * **Multi-Package Split Dispatch:** Consolidates DROP pieces into Package 1 (24h dispatch) and pairs OM custom jewellery into Package 2 when bench crafting completes.
  * **Automated Waybill & Customs Generation:**
    - Generates DHL Express / Aramex international shipping labels.
    - Prints official Nepal Customs Commercial Invoice (Harmonized Tariff Code `7113.11` for silver jewellery, DDU/DDP export declaration).
  * **Parcel Weight Verification:** Scans barcode, enters verified packed weight, and marks package `SHIPPED`.
* **Security & Boundary Rules:**
  * Cannot alter jewellery specs, change product pricing, or modify crafting stages.

---

### 6. `SUPPORT` (Customer Care Specialist)
* **Application Surface:** `apps/admin/support`
* **Ergonomics:** Desktop dual-pane ticket and customer lookup interface.
* **Core Interactions:**
  * **Order Lookup & Timeline Inspection:** Searches orders by customer email, name, or transaction ID. Inspects live OM production stage at the jewellery bench.
  * **Pre-Production Adjustments:** Can edit delivery address or adjust ring size/mandrel **only while the job is in `QUEUED` stage** (prior to `CASTING`).
  * **DROP Return Claims Desk:** Reviews return requests submitted within the 5-day inspection window, reviews uploaded customer photos, and issues return waybills.
  * **Custom Atelier Inquiry Desk:** Reviews bespoke silver requests, drafts artisan quotes, and sends invoices.
* **Security & Boundary Rules:**
  * Cannot execute raw SQL migrations or access platform API keys.
  * Financial refunds require secondary Admin escalation if exceeding standard policy limits.

---

### 7. `ADMIN` (Founder & Operations Director)
* **Application Surface:** `apps/admin` (Full root access)
* **Ergonomics:** Complete operational dashboard with analytics, inventory controls, and financial reconciliation.
* **Core Interactions:**
  * Full catalog and scheduling management for .925 sterling silver collections.
  * Dynamic category management in `/categories` (create, edit, reorder, toggle visibility).
  * Precious metal stock allocation (casting grain grams/alloys/lots).
  * `ProductionPolicy` lead-time rules and workshop holiday calendar controls.
  * Payment gateway reconciliation (Stripe international + eSewa/Khalti domestic NPR).
  * Staff account provisioning and role assignments (`JEWELLER`, `FULFILLMENT`, `SUPPORT`).
* **Security & Boundary Rules:**
  * Multi-Factor Authentication (MFA) required on all administrative accounts.
  * All privileged administrative mutations recorded in immutable `audit_logs`.

---

## 3. Actor-to-Capability Matrix

| Capability | GUEST | CUSTOMER | MEMBER | JEWELLER | FULFILLMENT | SUPPORT | ADMIN |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Browse Public Catalog & Lookbooks | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Configure Handcrafted Jewellery (Size/Alloy/Finish)| ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Place Order / Checkout | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Save Jewellery Sizing Profile | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Interactive 8-Stage OM Bench Tracker | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| 1-Click Pre-Production 24h Cancellation | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Access TOGETHER Gated Drops | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| View Bench-Ticket & Metal Lot ID | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Advance Jewellery Bench Stages (Casting→QC) | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Log Workshop Delay / Casting Defect | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Generate DHL Waybills & Nepal Customs Docs (HS 7113.11) | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Package & Dispatch Multi-Split Shipments | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Edit Address / Sizing (Pre-Casting) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Review DROP 5-Day Return Claims | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage Dynamic Categories (`/categories`) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Financial Ledger & Price Management | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage Staff Accounts & Role Grants | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
