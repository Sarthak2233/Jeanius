-- Migration 0002: Enable Row Level Security (RLS) & Multi-Tenant Isolation Policies
-- State 05: JN-123, JN-125

-- 1. Enable RLS on User-Owned and Operational Tables
ALTER TABLE "users_profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "addresses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_lines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "carts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cart_lines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "custom_order_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "production_jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

-- 2. users_profile Policies
-- Customers can view and update their own profile; admins can view all profiles
CREATE POLICY "users_profile_select_own" ON "users_profile"
  FOR SELECT
  USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "users_profile_update_own" ON "users_profile"
  FOR UPDATE
  USING (auth.uid() = id);

-- 3. addresses Policies
-- Customers manage their own shipping and billing addresses
CREATE POLICY "addresses_owner_all" ON "addresses"
  FOR ALL
  USING (auth.uid() = user_id);

-- 4. orders & order_lines Policies
-- Customers can view their own orders; privileged staff (support, fulfillment, admin) can access
CREATE POLICY "orders_select_own" ON "orders"
  FOR SELECT
  USING (
    auth.uid() = customer_id OR
    EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPPORT', 'FULFILLMENT'))
  );

CREATE POLICY "order_lines_select_own" ON "order_lines"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_lines.order_id
        AND (
          orders.customer_id = auth.uid() OR
          EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPPORT', 'FULFILLMENT', 'TAILOR', 'JEWELLER'))
        )
    )
  );

-- 5. carts & cart_lines Policies
CREATE POLICY "carts_manage_own" ON "carts"
  FOR ALL
  USING (auth.uid() = customer_id);

CREATE POLICY "cart_lines_manage_own" ON "cart_lines"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_lines.cart_id
        AND carts.customer_id = auth.uid()
    )
  );

-- 6. reviews Policies
-- Public can view approved reviews; customers can author reviews
CREATE POLICY "reviews_public_read" ON "reviews"
  FOR SELECT
  USING (status = 'APPROVED' OR customer_id = auth.uid());

CREATE POLICY "reviews_customer_insert" ON "reviews"
  FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- 7. custom_order_requests Policies
-- Customers can view their inquiries; support and admin can view all
CREATE POLICY "custom_orders_select" ON "custom_order_requests"
  FOR SELECT
  USING (
    customer_email = (SELECT email FROM users_profile WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPPORT'))
  );

-- 8. production_jobs Policies
-- Artisans can only view and update jobs matching their craft or assignment
CREATE POLICY "production_jobs_artisan_access" ON "production_jobs"
  FOR SELECT
  USING (
    assigned_artisan_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role IN ('TAILOR', 'JEWELLER', 'ADMIN'))
  );

CREATE POLICY "production_jobs_artisan_update" ON "production_jobs"
  FOR UPDATE
  USING (
    assigned_artisan_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role IN ('TAILOR', 'JEWELLER', 'ADMIN'))
  );

-- 9. audit_logs Policies
-- Append-only for all operations; readable strictly by administrators
CREATE POLICY "audit_logs_append" ON "audit_logs"
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "audit_logs_admin_read" ON "audit_logs"
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role = 'ADMIN')
  );
