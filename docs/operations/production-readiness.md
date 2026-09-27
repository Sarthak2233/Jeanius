# Production Readiness Checklist — Jeanius Launch Standard

This checklist governs the launch requirements for the **Jeanius** artisanal handmade raw denim ecommerce platform and workshop operations portal. Every category must be certified before live traffic or financial transactions are enabled.

---

## 1. Database & Persistence Layer

- [ ] **Automated Backups & PITR:**
  - Supabase Point-in-Time Recovery (PITR) enabled with a minimum 7-day retention window.
  - Daily automated logical database dumps verified and stored in off-site encrypted object storage.
- [ ] **Connection Pooling (Supavisor):**
  - Next.js Server Actions and Route Handlers connect via transaction-mode connection pooling (port `6543`) to prevent connection exhaustion during limited drop traffic spikes.
  - Session-mode connection (port `5432`) reserved exclusively for `drizzle-kit` migration scripts.
- [ ] **Constraint & Index Verification:**
  - Foreign key indices created on all junction and lookup columns (`order_items.order_id`, `drop_reservations.drop_id`, `production_stages.order_id`).
  - Check constraints active for physical tailoring limits (Inseam: 26–36 inches; Waist: 28–42 inches).
- [ ] **Migration Safety:**
  - Forward-only, zero-downtime migration protocol validated; all migrations tested against a staging database before applying to production.

---

## 2. Dual-Rail Payment Gateways & Reconciliation

- [ ] **International Gateway (Stripe):**
  - Live API keys securely provisioned via environment variables (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).
  - Stripe Apple Pay and Google Pay domain verification completed.
  - 3D Secure 2 (SCA) authentication verified for EU/UK/global transactions.
- [ ] **Nepal Domestic Gateway (eSewa / Khalti / Fonepay):**
  - Merchant credentials configured for live production environment.
  - HMAC-SHA256 signature verification enabled and tested on IPN callback endpoints.
  - Fallback QR / manual bank transfer workflow operational for local walk-in orders.
- [ ] **Idempotency & Fraud Controls:**
  - Webhook handlers enforce idempotency keys on payment events to prevent duplicate order generation or double-charging.
  - Payment intent timeouts configured (15 minutes expiration for uncompleted checkout sessions).
- [ ] **Financial Ledger:**
  - Every successful transaction generates an immutable ledger record containing transaction reference, payment rail, exchange rate, and fee breakdown.

---

## 3. Workshop Production Operations (Order-Made Engine)

- [ ] **Craftsman Workshop Portal (`apps/admin`):**
  - Role-Based Access Control (RBAC) enforced; workshop craftsmen restricted to production stage advancement.
  - Real-time stage progression validated across all 8 pipeline milestones:
    `Queued` → `Cutting` → `Sewing` → `Washing` → `Hardware` → `QC` → `Ready` → `Shipped`.
- [ ] **Garment Identification:**
  - Printable QR/barcode routing tags generated for each custom order bundle upon entering `Cutting`.
  - Inseam length, waist measurement, and custom monogram instructions rendered clearly on the workshop production ticket.
- [ ] **Customer Notifications:**
  - Automated transactional emails / notifications triggered when garments advance to key milestones (`Cutting Started`, `Quality Control Passed`, `Shipped with Tracking`).

---

## 4. Drop Concurrency & Inventory Protection

- [ ] **Drop Reservation Locking:**
  - Atomic stock decrement with 10-minute hold reservations during checkout to prevent overselling on limited-edition fabric drops (e.g. 50-pair Japanese selvedge runs).
  - Background cleanup task / cron job to release expired uncompleted drop reservations back to public stock.
- [ ] **Rate Limiting:**
  - Cloudflare / edge rate limiting applied to checkout submission and drop claim endpoints.

---

## 5. Global Logistics & Export Compliance

- [ ] **International Freight (DHL Express / FedEx):**
  - Automated generation of Commercial Invoice for Nepal Customs export declaration (Harmonized System HS Code `6203.42` for men's denim trousers).
  - Webhook integration for real-time tracking number ingestion and status updates.
- [ ] **Domestic Courier:**
  - Local courier integration for Kathmandu valley delivery and domestic air cargo for regional Nepal destinations.
- [ ] **Customs & Duties Transparency:**
  - Clear checkout disclosure stating whether international shipping is DDU (Delivered Duty Unpaid) or DDP (Delivered Duty Paid).

---

## 6. Performance, Edge & Visual Aesthetics

- [ ] **High-Resolution Asset Optimization:**
  - Next.js Image optimization (`next/image`) configured with WebP/AVIF formatting for rich selvedge texture close-ups.
  - Static CDN caching headers (`Cache-Control: public, max-age=31536000, immutable`) for fonts and compiled assets.
- [ ] **Core Web Vitals Targets:**
  - Largest Contentful Paint (LCP) < 1.5s on 4G mobile connections globally.
  - Cumulative Layout Shift (CLS) < 0.05.
  - First Input Delay (FID) / Interaction to Next Paint (INP) < 100ms.

---

## 7. Security, Observability & Error Monitoring

- [ ] **Exception Tracking (Sentry):**
  - Sentry initialized on both `apps/storefront` and `apps/admin` with source maps enabled for release tracking.
- [ ] **HTTP Security Headers:**
  - Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), X-Frame-Options (`DENY`), and X-Content-Type-Options (`nosniff`) active.
- [ ] **Synthetic Health Monitoring:**
  - Uptime monitor pinging `/api/health` every 60 seconds with alerting to the engineering on-call channel.
- [ ] **Zero Secrets in Code:**
  - Audit verifies that no API secrets or private keys exist in version control or client bundles.
