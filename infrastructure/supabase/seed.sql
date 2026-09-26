-- Seed data for local Supabase development
-- Provides initial development product and sample admin user

INSERT INTO public.products (id, slug, title, description, base_price_amount, base_price_currency, commerce_model, category, is_published)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'lot-001-straight-selvedge',
  'Lot 001 — Straight Selvedge Raw Denim',
  '14oz Japanese Kurabo raw selvedge denim, hand-cut and crafted.',
  28000,
  'USD',
  'OM',
  'BOTTOMS',
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, options, additional_price_amount, inventory_count, is_available)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'LOT001-RAW-32-34',
  '{"fit": "Straight", "waist": "32", "inseam": "34"}',
  0,
  0,
  true
) ON CONFLICT (id) DO NOTHING;
