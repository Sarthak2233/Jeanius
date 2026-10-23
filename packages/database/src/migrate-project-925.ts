import { queryClient } from './client';
import { createLogger } from '@jeanius/observability';

const logger = createLogger('database:migrate-project-925');

async function main() {
  logger.info('Applying Project 925 schema migrations to PostgreSQL...');

  await queryClient.unsafe(`
    -- 1. Create categories table
    CREATE TABLE IF NOT EXISTS "categories" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "slug" text NOT NULL,
      "name" text NOT NULL,
      "description" text,
      "image_url" text,
      "sort_order" integer DEFAULT 0 NOT NULL,
      "is_active" boolean DEFAULT true NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
      CONSTRAINT "categories_slug_unique" UNIQUE("slug")
    );

    -- 2. Alter products table category to text
    DO $$ BEGIN
      ALTER TABLE "products" ALTER COLUMN "category" TYPE text;
    EXCEPTION
      WHEN others THEN NULL;
    END $$;

    -- 3. Drop legacy fabric bolt tables if they exist
    DROP TABLE IF EXISTS "bolt_allocations" CASCADE;
    DROP TABLE IF EXISTS "fabric_bolts" CASCADE;

    -- 4. Enable RLS on categories
    ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;

    -- 5. RLS policies for categories
    DROP POLICY IF EXISTS "Public can view active categories" ON "categories";
    CREATE POLICY "Public can view active categories" ON "categories"
      FOR SELECT USING (is_active = true);

    DROP POLICY IF EXISTS "Admins have full access to categories" ON "categories";
    CREATE POLICY "Admins have full access to categories" ON "categories"
      FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- 6. Add OM columns to products table
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "lead_time_days_min" integer DEFAULT 7 NOT NULL;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "lead_time_days_max" integer DEFAULT 14 NOT NULL;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "input_specifications" jsonb;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "price_rules" jsonb;

    -- 7. Create order_made_products table
    CREATE TABLE IF NOT EXISTS "order_made_products" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
      "slug" text NOT NULL UNIQUE,
      "title" text NOT NULL,
      "description" text NOT NULL,
      "base_price_amount" integer NOT NULL,
      "base_price_currency" text DEFAULT 'USD' NOT NULL,
      "category" text NOT NULL,
      "lead_time_days_min" integer DEFAULT 7 NOT NULL,
      "lead_time_days_max" integer DEFAULT 14 NOT NULL,
      "input_specifications" jsonb NOT NULL,
      "price_rules" jsonb,
      "status" text DEFAULT 'PUBLISHED' NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );

    -- 8. Create drop_products table
    CREATE TABLE IF NOT EXISTS "drop_products" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
      "slug" text NOT NULL UNIQUE,
      "title" text NOT NULL,
      "description" text NOT NULL,
      "base_price_amount" integer NOT NULL,
      "base_price_currency" text DEFAULT 'USD' NOT NULL,
      "category" text NOT NULL,
      "drop_batch_number" integer,
      "total_batch_quantity" integer DEFAULT 0 NOT NULL,
      "status" text DEFAULT 'PUBLISHED' NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );

    -- 9. Create drop_variants table
    CREATE TABLE IF NOT EXISTS "drop_variants" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "drop_product_id" uuid NOT NULL REFERENCES "drop_products"("id") ON DELETE CASCADE,
      "sku" text NOT NULL UNIQUE,
      "attributes" jsonb NOT NULL,
      "additional_price_amount" integer DEFAULT 0 NOT NULL,
      "additional_price_currency" text DEFAULT 'USD' NOT NULL,
      "inventory_count" integer DEFAULT 0 NOT NULL,
      "status" text DEFAULT 'AVAILABLE' NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );

    -- 10. Update cart_lines and order_lines to support OM (nullable variant_id)
    ALTER TABLE "cart_lines" ALTER COLUMN "variant_id" DROP NOT NULL;
    ALTER TABLE "cart_lines" ADD COLUMN IF NOT EXISTS "order_made_product_id" uuid REFERENCES "order_made_products"("id") ON DELETE CASCADE;
    ALTER TABLE "cart_lines" ADD COLUMN IF NOT EXISTS "drop_variant_id" uuid REFERENCES "drop_variants"("id") ON DELETE CASCADE;

    ALTER TABLE "order_lines" ALTER COLUMN "variant_id" DROP NOT NULL;
    ALTER TABLE "order_lines" ADD COLUMN IF NOT EXISTS "order_made_product_id" uuid REFERENCES "order_made_products"("id") ON DELETE RESTRICT;
    ALTER TABLE "order_lines" ADD COLUMN IF NOT EXISTS "drop_variant_id" uuid REFERENCES "drop_variants"("id") ON DELETE RESTRICT;

    -- 11. Enable RLS on new tables
    ALTER TABLE "order_made_products" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "drop_products" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "drop_variants" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Public can view published order_made_products" ON "order_made_products";
    CREATE POLICY "Public can view published order_made_products" ON "order_made_products"
      FOR SELECT USING (status = 'PUBLISHED');

    DROP POLICY IF EXISTS "Public can view published drop_products" ON "drop_products";
    CREATE POLICY "Public can view published drop_products" ON "drop_products"
      FOR SELECT USING (status = 'PUBLISHED');

    DROP POLICY IF EXISTS "Public can view drop_variants" ON "drop_variants";
    CREATE POLICY "Public can view drop_variants" ON "drop_variants"
      FOR SELECT USING (true);
  `);

  logger.info('Project 925 schema migrations successfully applied.');
  await queryClient.end();
}

main().catch((err) => {
  logger.error('Failed to run Project 925 migration', { error: String(err) });
  process.exit(1);
});
