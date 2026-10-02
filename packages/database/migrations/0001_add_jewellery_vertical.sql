CREATE TABLE "metal_allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metal_stock_id" uuid NOT NULL,
	"order_line_id" uuid NOT NULL,
	"grams_allocated" numeric(6, 2) NOT NULL,
	"allocated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "metal_stocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metal_alloy" text NOT NULL,
	"purity" numeric(4, 3) NOT NULL,
	"lot_number" text NOT NULL,
	"initial_weight_grams" numeric(8, 2) NOT NULL,
	"remaining_weight_grams" numeric(8, 2) NOT NULL,
	"supplier" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "metal_stocks_lot_number_unique" UNIQUE("lot_number")
);
--> statement-breakpoint
ALTER TABLE "cart_lines" ADD COLUMN "custom_specifications" jsonb;--> statement-breakpoint
ALTER TABLE "order_lines" ADD COLUMN "custom_specifications" jsonb;--> statement-breakpoint
ALTER TABLE "order_lines" ADD COLUMN "allocated_metal_stock_id" uuid;--> statement-breakpoint
ALTER TABLE "production_jobs" ADD COLUMN "craft_ticket" jsonb;--> statement-breakpoint
ALTER TABLE "custom_order_requests" ADD COLUMN "desired_metal_alloy" text;--> statement-breakpoint
ALTER TABLE "custom_order_requests" ADD COLUMN "custom_specifications" jsonb;--> statement-breakpoint
ALTER TABLE "metal_allocations" ADD CONSTRAINT "metal_allocations_metal_stock_id_metal_stocks_id_fk" FOREIGN KEY ("metal_stock_id") REFERENCES "public"."metal_stocks"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_allocated_metal_stock_id_metal_stocks_id_fk" FOREIGN KEY ("allocated_metal_stock_id") REFERENCES "public"."metal_stocks"("id") ON DELETE set null ON UPDATE no action;