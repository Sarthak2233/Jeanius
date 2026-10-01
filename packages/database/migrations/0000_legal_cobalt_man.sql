CREATE TABLE "addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"full_name" text NOT NULL,
	"address_line1" text NOT NULL,
	"address_line2" text,
	"city" text NOT NULL,
	"state_or_province" text,
	"postal_code" text NOT NULL,
	"country" text DEFAULT 'NP' NOT NULL,
	"phone" text NOT NULL,
	"is_default_shipping" boolean DEFAULT false NOT NULL,
	"is_default_billing" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"role" text DEFAULT 'CUSTOMER' NOT NULL,
	"phone" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_profile_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "option_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"option_id" uuid NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"price_delta_amount" integer DEFAULT 0 NOT NULL,
	"price_delta_currency" text DEFAULT 'USD' NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"url" text NOT NULL,
	"alt_text" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"width" integer,
	"height" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"sku" text NOT NULL,
	"options" jsonb NOT NULL,
	"additional_price_amount" integer DEFAULT 0 NOT NULL,
	"additional_price_currency" text DEFAULT 'USD' NOT NULL,
	"inventory_count" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'AVAILABLE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_variants_sku_unique" UNIQUE("sku"),
	CONSTRAINT "chk_variants_inventory_count" CHECK ("product_variants"."inventory_count" >= 0),
	CONSTRAINT "chk_variants_additional_price" CHECK ("product_variants"."additional_price_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"base_price_amount" integer NOT NULL,
	"base_price_currency" text DEFAULT 'USD' NOT NULL,
	"commerce_model" text NOT NULL,
	"category" text NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"publish_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "chk_products_base_price" CHECK ("products"."base_price_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "cart_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"product_title" text NOT NULL,
	"commerce_model" text NOT NULL,
	"unit_price_amount" integer NOT NULL,
	"unit_price_currency" text DEFAULT 'USD' NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"selected_options" jsonb NOT NULL,
	"custom_tailoring_measurements" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_cart_lines_quantity" CHECK ("cart_lines"."quantity" > 0),
	CONSTRAINT "chk_cart_lines_unit_price" CHECK ("cart_lines"."unit_price_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid,
	"currency" text DEFAULT 'USD' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"product_title" text NOT NULL,
	"sku" text NOT NULL,
	"commerce_model" text NOT NULL,
	"unit_price_amount" integer NOT NULL,
	"unit_price_currency" text DEFAULT 'USD' NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"line_total_amount" integer NOT NULL,
	"line_total_currency" text DEFAULT 'USD' NOT NULL,
	"selected_options" jsonb NOT NULL,
	"custom_tailoring" jsonb,
	"allocated_bolt_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_order_lines_quantity" CHECK ("order_lines"."quantity" > 0),
	CONSTRAINT "chk_order_lines_unit_price" CHECK ("order_lines"."unit_price_amount" >= 0),
	CONSTRAINT "chk_order_lines_line_total" CHECK ("order_lines"."line_total_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"customer_id" uuid,
	"customer_email" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"payment_status" text DEFAULT 'INITIATED' NOT NULL,
	"shipping_address" jsonb NOT NULL,
	"billing_address" jsonb,
	"subtotal_amount" integer NOT NULL,
	"shipping_cost_amount" integer NOT NULL,
	"total_amount" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number"),
	CONSTRAINT "chk_orders_subtotal" CHECK ("orders"."subtotal_amount" >= 0),
	CONSTRAINT "chk_orders_shipping_cost" CHECK ("orders"."shipping_cost_amount" >= 0),
	CONSTRAINT "chk_orders_total" CHECK ("orders"."total_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "idempotency_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"scope" text NOT NULL,
	"response_status" integer,
	"response_body" jsonb,
	"locked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "idempotency_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"provider" text NOT NULL,
	"status" text DEFAULT 'INITIATED' NOT NULL,
	"transaction_id" text,
	"idempotency_key" text NOT NULL,
	"refunded_amount" integer DEFAULT 0 NOT NULL,
	"refunded_currency" text DEFAULT 'USD' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_idempotency_key_unique" UNIQUE("idempotency_key"),
	CONSTRAINT "chk_payments_amount" CHECK ("payments"."amount" >= 0),
	CONSTRAINT "chk_payments_refunded_amount" CHECK ("payments"."refunded_amount" >= 0),
	CONSTRAINT "chk_payments_refund_lte_amount" CHECK ("payments"."refunded_amount" <= "payments"."amount")
);
--> statement-breakpoint
CREATE TABLE "production_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"order_line_id" uuid NOT NULL,
	"current_stage" text DEFAULT 'QUEUED' NOT NULL,
	"target_completion_date" timestamp with time zone NOT NULL,
	"cut_ticket" jsonb,
	"assigned_artisan_id" uuid,
	"rework_count" integer DEFAULT 0 NOT NULL,
	"delay_days" integer DEFAULT 0 NOT NULL,
	"delay_reason" text,
	"notes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_production_jobs_rework" CHECK ("production_jobs"."rework_count" >= 0),
	CONSTRAINT "chk_production_jobs_delay" CHECK ("production_jobs"."delay_days" >= 0)
);
--> statement-breakpoint
CREATE TABLE "bolt_allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bolt_id" uuid NOT NULL,
	"order_line_id" uuid NOT NULL,
	"yardage_allocated" numeric(6, 2) NOT NULL,
	"allocated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_bolt_allocations_yardage" CHECK ("bolt_allocations"."yardage_allocated" > 0)
);
--> statement-breakpoint
CREATE TABLE "fabric_bolts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mill_name" text NOT NULL,
	"fabric_code" text NOT NULL,
	"weight_oz" numeric(5, 2) NOT NULL,
	"initial_length_yards" numeric(8, 2) NOT NULL,
	"remaining_length_yards" numeric(8, 2) NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fabric_bolts_fabric_code_unique" UNIQUE("fabric_code"),
	CONSTRAINT "chk_fabric_bolts_initial_length" CHECK ("fabric_bolts"."initial_length_yards" > 0),
	CONSTRAINT "chk_fabric_bolts_remaining_length" CHECK ("fabric_bolts"."remaining_length_yards" >= 0),
	CONSTRAINT "chk_fabric_bolts_weight" CHECK ("fabric_bolts"."weight_oz" > 0)
);
--> statement-breakpoint
CREATE TABLE "inventory_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"cart_id" uuid,
	"quantity" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'HELD' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_inventory_reservations_qty" CHECK ("inventory_reservations"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "shipment_packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"package_number" integer DEFAULT 1 NOT NULL,
	"carrier" text NOT NULL,
	"tracking_number" text,
	"order_line_ids" jsonb NOT NULL,
	"export_declaration" jsonb,
	"status" text DEFAULT 'PACKED' NOT NULL,
	"packed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"dispatched_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_shipment_packages_number" CHECK ("shipment_packages"."package_number" >= 1)
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"shipping_address" jsonb NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_order_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"desired_fabric_weight" text,
	"reference_image_urls" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'INQUIRY_RECEIVED' NOT NULL,
	"quoted_price_amount" integer,
	"quoted_price_currency" text DEFAULT 'USD',
	"quoted_lead_days" integer,
	"converted_order_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_custom_orders_quoted_price" CHECK ("custom_order_requests"."quoted_price_amount" IS NULL OR "custom_order_requests"."quoted_price_amount" >= 0),
	CONSTRAINT "chk_custom_orders_lead_days" CHECK ("custom_order_requests"."quoted_lead_days" IS NULL OR "custom_order_requests"."quoted_lead_days" > 0)
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"author_name" text NOT NULL,
	"question_text" text NOT NULL,
	"answers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"author_name" text NOT NULL,
	"rating" integer NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"is_verified_purchase" boolean DEFAULT false NOT NULL,
	"artisan_response" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_reviews_rating_bounds" CHECK ("reviews"."rating" >= 1 AND "reviews"."rating" <= 5)
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text DEFAULT 'INFO' NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"priority" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_announcements_dates" CHECK ("announcements"."end_date" IS NULL OR "announcements"."end_date" > "announcements"."start_date")
);
--> statement-breakpoint
CREATE TABLE "content_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"content_markdown" text NOT NULL,
	"meta_description" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"tier" text NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"benefits" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_memberships_dates" CHECK ("memberships"."end_date" IS NULL OR "memberships"."end_date" > "memberships"."start_date")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" text NOT NULL,
	"actor_role" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"payload" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_reference" text NOT NULL,
	"debit_account" text NOT NULL,
	"credit_account" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"description" text NOT NULL,
	"posted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_ledger_entries_amount" CHECK ("ledger_entries"."amount" > 0),
	CONSTRAINT "chk_ledger_entries_accounts" CHECK ("ledger_entries"."debit_account" <> "ledger_entries"."credit_account")
);
--> statement-breakpoint
CREATE TABLE "outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_name" text NOT NULL,
	"aggregate_id" text NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	CONSTRAINT "chk_outbox_events_retry_count" CHECK ("outbox_events"."retry_count" >= 0)
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option_values" ADD CONSTRAINT "option_values_option_id_product_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."product_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_options" ADD CONSTRAINT "product_options_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_lines" ADD CONSTRAINT "cart_lines_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_lines" ADD CONSTRAINT "cart_lines_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_lines" ADD CONSTRAINT "cart_lines_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_customer_id_users_profile_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_allocated_bolt_id_fabric_bolts_id_fk" FOREIGN KEY ("allocated_bolt_id") REFERENCES "public"."fabric_bolts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_users_profile_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_jobs" ADD CONSTRAINT "production_jobs_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_jobs" ADD CONSTRAINT "production_jobs_order_line_id_order_lines_id_fk" FOREIGN KEY ("order_line_id") REFERENCES "public"."order_lines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_jobs" ADD CONSTRAINT "production_jobs_assigned_artisan_id_users_profile_id_fk" FOREIGN KEY ("assigned_artisan_id") REFERENCES "public"."users_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bolt_allocations" ADD CONSTRAINT "bolt_allocations_bolt_id_fabric_bolts_id_fk" FOREIGN KEY ("bolt_id") REFERENCES "public"."fabric_bolts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_packages" ADD CONSTRAINT "shipment_packages_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_order_requests" ADD CONSTRAINT "custom_order_requests_converted_order_id_orders_id_fk" FOREIGN KEY ("converted_order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_users_profile_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_customer_id_users_profile_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_addresses_user_id" ON "addresses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_users_profile_email" ON "users_profile" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_profile_role" ON "users_profile" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_option_values_option_id" ON "option_values" USING btree ("option_id");--> statement-breakpoint
CREATE INDEX "idx_option_values_code" ON "option_values" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_product_images_product_id" ON "product_images" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_product_images_position" ON "product_images" USING btree ("position");--> statement-breakpoint
CREATE INDEX "idx_product_options_product_id" ON "product_options" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_product_options_code" ON "product_options" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_product_variants_product_id" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_product_variants_sku" ON "product_variants" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "idx_product_variants_status" ON "product_variants" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_products_slug" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_products_status" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_products_category" ON "products" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_products_commerce_model" ON "products" USING btree ("commerce_model");--> statement-breakpoint
CREATE INDEX "idx_cart_lines_cart_id" ON "cart_lines" USING btree ("cart_id");--> statement-breakpoint
CREATE INDEX "idx_cart_lines_variant_id" ON "cart_lines" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "idx_carts_customer_id" ON "carts" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_order_lines_order_id" ON "order_lines" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_lines_product_id" ON "order_lines" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_order_lines_variant_id" ON "order_lines" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "idx_order_lines_bolt_id" ON "order_lines" USING btree ("allocated_bolt_id");--> statement-breakpoint
CREATE INDEX "idx_orders_order_number" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "idx_orders_customer_id" ON "orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_orders_status" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_orders_payment_status" ON "orders" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "idx_idempotency_keys_key" ON "idempotency_keys" USING btree ("key");--> statement-breakpoint
CREATE INDEX "idx_idempotency_keys_expires_at" ON "idempotency_keys" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_payments_order_id" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_payments_idempotency_key" ON "payments" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "idx_payments_transaction_id" ON "payments" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "idx_payments_status" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_production_jobs_order_id" ON "production_jobs" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_production_jobs_order_line_id" ON "production_jobs" USING btree ("order_line_id");--> statement-breakpoint
CREATE INDEX "idx_production_jobs_stage" ON "production_jobs" USING btree ("current_stage");--> statement-breakpoint
CREATE INDEX "idx_production_jobs_artisan" ON "production_jobs" USING btree ("assigned_artisan_id");--> statement-breakpoint
CREATE INDEX "idx_production_jobs_target_date" ON "production_jobs" USING btree ("target_completion_date");--> statement-breakpoint
CREATE INDEX "idx_bolt_allocations_bolt_id" ON "bolt_allocations" USING btree ("bolt_id");--> statement-breakpoint
CREATE INDEX "idx_bolt_allocations_order_line_id" ON "bolt_allocations" USING btree ("order_line_id");--> statement-breakpoint
CREATE INDEX "idx_fabric_bolts_code" ON "fabric_bolts" USING btree ("fabric_code");--> statement-breakpoint
CREATE INDEX "idx_fabric_bolts_status" ON "fabric_bolts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_inventory_reservations_variant_status" ON "inventory_reservations" USING btree ("variant_id","status");--> statement-breakpoint
CREATE INDEX "idx_inventory_reservations_expires_at" ON "inventory_reservations" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_shipment_packages_shipment_id" ON "shipment_packages" USING btree ("shipment_id");--> statement-breakpoint
CREATE INDEX "idx_shipment_packages_tracking_number" ON "shipment_packages" USING btree ("tracking_number");--> statement-breakpoint
CREATE INDEX "idx_shipment_packages_status" ON "shipment_packages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_shipments_order_id" ON "shipments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_shipments_status" ON "shipments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_custom_orders_email" ON "custom_order_requests" USING btree ("customer_email");--> statement-breakpoint
CREATE INDEX "idx_custom_orders_status" ON "custom_order_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_custom_orders_converted_order" ON "custom_order_requests" USING btree ("converted_order_id");--> statement-breakpoint
CREATE INDEX "idx_questions_product_id" ON "questions" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_questions_is_published" ON "questions" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "idx_reviews_product_id" ON "reviews" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_reviews_customer_id" ON "reviews" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_reviews_status" ON "reviews" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_announcements_priority" ON "announcements" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_announcements_dates" ON "announcements" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "idx_content_pages_slug" ON "content_pages" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_content_pages_is_published" ON "content_pages" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "idx_memberships_customer_id" ON "memberships" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_memberships_tier" ON "memberships" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_actor_id" ON "audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_entity" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_ledger_entries_reference" ON "ledger_entries" USING btree ("transaction_reference");--> statement-breakpoint
CREATE INDEX "idx_ledger_entries_debit" ON "ledger_entries" USING btree ("debit_account");--> statement-breakpoint
CREATE INDEX "idx_ledger_entries_credit" ON "ledger_entries" USING btree ("credit_account");--> statement-breakpoint
CREATE INDEX "idx_ledger_entries_posted_at" ON "ledger_entries" USING btree ("posted_at");--> statement-breakpoint
CREATE INDEX "idx_outbox_events_status_created" ON "outbox_events" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "idx_outbox_events_aggregate_id" ON "outbox_events" USING btree ("aggregate_id");