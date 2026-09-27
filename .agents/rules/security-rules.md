# Security & Data Protection Rules (JN-058)

This rule defines the authentication, authorization, secret protection, and compliance standards across the Jeanius platform.

---

## 1. Authentication & Role-Based Access Control (RBAC)

- **Supabase Auth Integration:** User identity and session validation rely on Supabase Auth JWT tokens.
- **Actor Role Verification:** Every privileged Server Action and Route Handler must verify the actor role against the [Actor Interaction Matrix](file:///home/sarakb/projects/Jeanius/docs/architecture/actor-interaction-matrix.md):
  - `TAILOR`: Restricted to workshop floor operations (`apps/admin/workshop`).
  - `FULFILLMENT`: Restricted to dispatch, packaging, and waybills (`apps/admin/fulfillment`).
  - `SUPPORT`: Restricted to customer care, order lookup, and pre-cut adjustments (`apps/admin/support`).
  - `ADMIN`: Full administrative control with mandatory Multi-Factor Authentication (MFA).

---

## 2. Row Level Security (RLS) Mandate

- **RLS Enabled by Default:** Every PostgreSQL table holding customer or operational data must have RLS enabled:
  ```sql
  ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
  ```
- **Tenant Isolation:** Customers can only read and query their own records:
  ```sql
  CREATE POLICY customer_order_policy ON orders
    FOR SELECT USING (auth.uid() = customer_id);
  ```
- **Service Role Key:** The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS and must be protected as a high-security secret, restricted strictly to server-side backend operations.

---

## 3. Webhook Cryptographic Verification

- **Never Trust Unsigned Webhooks:** Every external webhook route must verify HMAC signatures against raw request bodies before executing:
  - Stripe: `stripe.webhooks.constructEvent(rawBody, signature, secret)`
  - eSewa: HMAC-SHA256 signature calculation over the IPN payload.

---

## 4. PII & Financial Data Sanitization

- **Zero Plaintext Payment Tokens:** Credit card numbers, CVVs, and banking PINs must never touch Jeanius servers. All card collection is tokenized via Stripe Elements in the browser.
- **Log Sanitization:** Sensitive customer fields (passwords, tokens, full phone numbers, physical addresses) must be scrubbed from application logs.
