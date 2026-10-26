# Project 925 — FULL PRODUCT SPECIFICATION

**Document Version:** 2.0.0  
**Status:** Product / Engineering Specification  
**Atelier Location:** Kathmandu Workshop Only (Kathmandu, Nepal)  
**Vertical:** .925 Sterling Silver Artisan Jewellery  

---

## 1. Executive Summary

**Project 925** is an international direct-to-consumer jewellery atelier originating strictly from the **Kathmandu Workshop** in Nepal. The atelier is dedicated entirely to handcrafted .925 sterling silver artisan jewellery, uniting ancient Newar repoussé motifs, lost-wax investment casting, and heavy brutalist signet silhouettes.

The primary commercial model is **OM (Order-Made)**: a customer selects a jewellery piece and customizes exact physical specifications (Ring Size US 3–16 in quarter increments, Wide Shank Compensator, Cuff Wrist Circumference and Gap, Chain Drape Length, Alloy accents, Surface Patina, and inside-band engraving). Following payment confirmation, bespoke casting and hand-finishing commence at the Kathmandu jewellery bench.

The platform also maintains a dedicated **DROP** model for small-batch, numbered, ready-to-ship physical pieces (e.g. 25 numbered talisman pendants, 15 hand-forged solid .925 cuffs), as well as a gated **TOGETHER** community co-commissioning layer.

The experience is minimal and editorial: tactile bone and dark-atelier substrates, high-contrast serif typography, generous macro-whitespace, and high-fidelity photography with zero generic ecommerce clutter.

The system combines five cohesive pillars:
1. **Brand & Content Engine:** Atelier monographs, craftsmanship origin journals, and sizing guides.
2. **Precious Metals Catalog:** Dynamic categories managed in Admin (`apps/admin/app/categories/`), OM and DROP jewellery collections.
3. **Configurable Commerce:** Ring mandrels, wide shank compensators, wrist gaps, chain drapes, and patina finishes.
4. **Member & Access Layer:** Collector passports, VIP early access windows, and protected archival releases.
5. **Workshop Operations:** 8-Stage Jewellery Bench Kanban (`apps/admin/app/workshop/jeweller/`), Bench Tickets, and international courier dispatch (HS Code 7113.11).

---

## 2. Product Goals

1. **Artisan Silver Focus:** Showcase and retail authentic Kathmandu-cast .925 sterling silver pieces globally with editorial prestige.
2. **Precision Sizing & Customization:** Provide a digital Sizing Studio (steel mandrel calibration, wide shank compensator +0.5 size, cuff wrist gap, chain drape) reducing sizing uncertainty.
3. **Transparent Atelier SLAs:** Clearly communicate made-to-order casting timelines (7–14 business days, excluding Nepali holidays) and point-of-no-return policies before payment.
4. **Dynamic Category Agility:** Empower workshop staff to create, reorder, and toggle product categories in real time via the Admin workbench without code changes.
5. **Dual Commerce Isolation:** Enforce distinct inventory and return rules between custom made-to-order pieces and ready-to-ship numbered drops.
6. **Access-Gated Community:** Safeguard member-only releases (`TOGETHER` and archival drops) via server-side authorization preventing media and pricing scraping.
7. **Kathmandu Origin Integrity:** All operations, fulfillment, and bench craftsmanship reside strictly in the Kathmandu Workshop (no external ateliers).

---

## 3. Product Scope & Exclusions

* **In Scope:**
  * Order-Made (OM) rings, pendants, cuffs, chains, bespoke signets.
  * Ready-to-Ship (DROP) numbered silver batches.
  * Dynamic category management in Admin and reactive storefront category bar.
  * Sizing Studio and customer Jewellery Sizing Vault.
  * Multi-rail payments (Stripe USD card rails + Nepal domestic eSewa/Khalti NPR rails).
  * 8-Stage OM Bench Kanban (QUEUED, CASTING, SETTING, PATINA, POLISHING, QC, READY, SHIPPED).
  * 5-day post-delivery inspection window for DROP items.
  * Customs commercial invoice generation for precious metal exports (HS Code 7113.11).
* **Explicitly Excluded:**
  * Apparel, denim, or textile manufacturing.
  * Multi-vendor third-party marketplace.
  * Unauthenticated / anonymous checkout without verified customer email.
  * Real-time 3D mesh rendering in production storefront.

---

## 4. User Types & Actors

1. **GUEST:** Unauthenticated visitor. Can browse public OM jewellery, configure sizes, calculate shipping, add to cart, and checkout with email.
2. **CUSTOMER:** Authenticated client. Accesses saved Jewellery Sizing Vault (mandrel size, cuff gap, chain drape), live order tracking, and unlocks the `/drop` catalog.
3. **MEMBER:** Vetted VIP patron. Unlocks 1–24 hour advance drop purchasing windows, the private `/together` co-commissioning salon, and archival prototype releases.
4. **JEWELLER:** Kathmandu workshop artisan. Accesses `apps/admin/app/workshop/jeweller/` to view Bench Tickets, advance jobs through the 8 bench stages, and log delay notes.
5. **FULFILLMENT:** Warehouse operator. Inspects finished pieces, packs them in wooden presentation boxes, prints waybills, and registers carrier tracking.
6. **SUPPORT:** Customer concierge. Handles address modifications pre-casting, processes approved return requests, and manages bespoke custom inquiries.
7. **ADMIN:** Operational manager. Full access to catalog, dynamic categories (`/categories`), production policies, user roles, and financial reconciliation.

---

## 5. Brand & UX Principles

1. **Editorial Restraint:** Neutral bone substrates (`#FDFBF7`) for storefront, dark slate (`#0B0F19`) for admin workbench, fine 1px borders, and generous whitespace.
2. **Photography Dominance:** Macro-detail imagery capturing chisel marks, silver grain texture, and oxidized patina.
3. **Practical Controls:** Compact, tactile buttons and option chips; no exaggerated spring bounces or rainbow gradients.
4. **Transparent Boundaries:** Point-of-no-return warning (`CASTING`) clearly communicated prior to checkout submission.
5. **Mobile Precision:** Stacked option selectors, sticky purchase bars, and 44px minimum touch targets.

---

## 6. Information Architecture & Navigation

* **Header Navigation:**
  * Brand wordmark: `PROJECT 925` (`Kathmandu Workshop only`).
  * Routes: `ABOUT / GUIDE`, `SHOP (OM)`, `DROP`, `TOGETHER`, `SIZING`, `CONTACT`.
  * Utility Tray: Search trigger (`Cmd+K`), Account state (Sign In / VIP Member pill), Cart drawer with item badge.
* **Storefront Routes:**
  * `/`: Kathmandu Atelier Manifesto, OM flagship showcase, dynamic category pills, operational notices.
  * `/shop`: Public catalog with dynamic category filtering (`/shop?category=rings`), option selectors, and product detail (`/shop/[slug]`).
  * `/drop`: Ready-to-ship numbered batches (requires authenticated `CUSTOMER` or `MEMBER`).
  * `/together`: Gated community co-commissioning salon and living silver patina gallery.
  * `/sizing`: Sizing Studio (Ring Mandrel Calibrator, Wide Shank Compensator, Cuff Wrist Gap, Chain Drape, Patina Guide).
  * `/account`: Client profile, order history, and saved Jewellery Sizing Vault.
  * `/about` & `/guide`: Craft monographs on Newar repoussé, lost-wax casting, and atelier covenants.
* **Admin Routes (`apps/admin`):**
  * `/`: Operations summary and KPI telemetry.
  * `/categories`: Dynamic category management (Add, edit, toggle active, sort order).
  * `/workshop/jeweller`: 8-Stage OM Bench Kanban.
  * `/orders`: Comprehensive order records and fulfillment management.

---

## 7. Dynamic Category Architecture

1. **Data Model:**
   * `categories`: `id`, `name`, `slug`, `description`, `sortOrder`, `isActive`, `createdAt`, `updatedAt`.
2. **Admin Operations:**
   * Authorized staff can create new categories (e.g. *Signet Rings*, *Talisman Pendants*, *Sculptural Cuffs*, *Cast Chains*).
   * Toggle visibility (`isActive`) instantly reflects in storefront queries.
   * Edit sort order to reposition category pills.
3. **Storefront Integration:**
   * `apps/storefront/components/category-bar.tsx` queries active categories directly from the database repository.
   * Filters product listings reactively via URL search parameters (`/shop?category=<slug>`).

---

## 8. Sizing Studio & Jewellery Sizing Vault

### 8.1 Sizing Studio (`/sizing`)
* **Ring Mandrel Calibrator:** Interactive conversion across US Sizes (3 to 16 in quarter increments), Inner Diameter (mm), and Inner Circumference (mm).
* **Wide Shank Compensator:** Automatic calculation adding +0.5 US size for ring bands exceeding 6mm in width.
* **Heavy Cuff Wrist Gap:** Measurement guide for wrist circumference (inches/cm) and recommended open wrist gap (1.0" to 1.5").
* **Chain Drape Visualizer:** Standard collar (18"), mid-chest (20"–22"), and heavy pendant drape (24"–28").
* **Surface Patina Guide:** High Mirror Buffed, Antiqued Sulfur Patina, Raw Cast / Brushed Matte.

### 8.2 Customer Sizing Vault (`/account`)
* Customers can store their verified ring size, wide shank preference, wrist circumference, and preferred patina finish.
* When viewing a product configurator, default options automatically autofill from their saved vault.

---

## 9. OM Manufacturing Lifecycle & Bench Kanban

Every custom jewellery piece follows eight mandatory sequential stages in the Kathmandu Workshop:

1. **STAGE 1 — QUEUED:** Bench job created upon payment verification. Precious metal grain allocated and Bench Ticket printed.
2. **STAGE 2 — CASTING:** **[POINT OF NO RETURN]** Lost-wax investment mold burnout and centrifugal silver pour. Cancellation is locked.
3. **STAGE 3 — SETTING:** Sprues excised, band trued on steel mandrel to exact US size, bezel stones seated, and custom inside-band engraving inscribed.
4. **STAGE 4 — PATINA:** Controlled chemical liver of sulfur oxidation applied to recesses.
5. **STAGE 5 — POLISHING:** Multi-stage abrasive buffing across mirror and matte compounds.
6. **STAGE 6 — QC INSPECTION:** Digital caliper verification (inner diameter tolerance ±0.1mm) and .925 hallmark stamp check.
7. **STAGE 7 — READY:** Ultrasonic bath cleaning, wrapped in tarnish-preventing paper, packaged in solid wooden atelier presentation box.
8. **STAGE 8 — SHIPPED:** Courier waybill registered and handed to international carrier.

---

## 10. DROP Inventory & Return Contract

1. **Batch Reservations:** Ready-to-ship products decrement physical inventory atomically at checkout.
2. **Two-Phase Inventory Hold:** 10-minute hold token prevents race conditions during high-demand releases.
3. **5-Day Inspection Window:** Customers have exactly 5 calendar days from the carrier-verified delivery timestamp to file a return request.
4. **Condition Standards:** Returned pieces must be pristine, scratch-free, with all hallmarks, velvet pouches, and wooden boxes intact.
5. **OM Final Sale Rule:** Custom made-to-order pieces cannot be returned once casting has begun, except in verified cases of dimensional defect (> ±0.1mm).

---

## 11. Logistics & Export Compliance

* **Origin Hub:** All orders ship strictly from Kathmandu, Nepal via DHL Express, Aramex, or EMS.
* **Customs Declaration:** Automated commercial invoices generated with Harmonized Tariff Code `7113.11` (articles of jewellery of silver).
* **Split Shipments:** Orders containing both DROP and OM items default to consolidated dispatch upon OM bench completion, with optional split-dispatch if selected.

---

## 12. Security & Data Integrity

1. **Cookie Segregation:** `sb-storefront-auth-token` for shoppers; `sb-admin-auth-token` for internal staff.
2. **Database Role Authority:** Role verification directly queries `users_profile.role` rather than unverified client tokens.
3. **Zero Metadata Leakage:** Protected member collections and prototype images are never included in public Server Component payloads or XML sitemaps.
4. **Transactional Outbox:** All domain events (`OrderPaidEvent`, `BenchJobCreatedEvent`) are persisted within the same database transaction as the state mutation.