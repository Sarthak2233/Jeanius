-- Seed data for local Supabase development
-- Provides initial development products, fabric bolts, workshop profiles, and editorial content

-- 1. Workshop & Customer Users
INSERT INTO public.users_profile (id, email, full_name, role, phone)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'admin@jeanius.co', 'Jeanius & Jewl Atelier Admin', 'ADMIN', '+977-1-4200001'),
  ('c0000000-0000-0000-0000-000000000002', 'mastercutter@jeanius.co', 'Pasang Master Cutter (Denim)', 'TAILOR', '+977-9800000002'),
  ('c0000000-0000-0000-0000-000000000003', 'logistics@jeanius.co', 'Kiran Fulfillment Lead', 'FULFILLMENT', '+977-9800000003'),
  ('c0000000-0000-0000-0000-000000000004', 'shopper@example.com', 'Alex Raw Denim Collector', 'CUSTOMER', '+1-415-555-0199'),
  ('c0000000-0000-0000-0000-000000000005', 'metalsmith@jeanius.co', 'Bikash Master Jeweller (Metalsmith)', 'TAILOR', '+977-9800000005')
ON CONFLICT (id) DO NOTHING;

-- 2. Selvedge Fabric Rolls (Physical Inventory)
INSERT INTO public.fabric_bolts (id, mill_name, fabric_code, weight_oz, initial_length_yards, remaining_length_yards, status)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Kurabo Mills Japan', 'KB-14-RAW', 14.00, 100.00, 100.00, 'ACTIVE'),
  ('d0000000-0000-0000-0000-000000000002', 'Kuroki Mills Japan', 'KK-155-IND', 15.50, 85.00, 85.00, 'ACTIVE'),
  ('d0000000-0000-0000-0000-000000000003', 'Kaihara Mills Japan', 'KH-145-VIN', 14.50, 60.00, 60.00, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 2.5 Precious Metal Stocks (Physical Inventory)
INSERT INTO public.metal_stocks (id, metal_alloy, purity, lot_number, initial_weight_grams, remaining_weight_grams, supplier, status)
VALUES
  ('ms000000-0000-0000-0000-000000000001', 'STERLING_SILVER_925', 0.925, 'MS-AG-01', 5000.00, 5000.00, 'Rio Grande', 'ACTIVE'),
  ('ms000000-0000-0000-0000-000000000002', 'SOLID_BRASS', 1.000, 'MS-BR-01', 10000.00, 10000.00, 'Rio Grande', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 3. Core Catalog Products
INSERT INTO public.products (id, slug, title, description, base_price_amount, base_price_currency, commerce_model, category, status)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'lot-001-straight-selvedge',
    'Lot 001 — Straight Selvedge Raw Denim',
    '14oz Japanese Kurabo raw selvedge denim. High rise, straight leg, solid copper hardware, hand-cut in our Kathmandu workshop.',
    28000,
    'USD',
    'OM',
    'BOTTOMS',
    'PUBLISHED'
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'lot-002-slim-tapered-deep-indigo',
    'Lot 002 — Slim Tapered Deep Indigo Selvedge',
    '15.5oz Kuroki Mills heavyweight deep indigo selvedge. Medium-high rise, tailored slim taper, vintage pink selvedge ID.',
    31000,
    'USD',
    'DROP',
    'BOTTOMS',
    'PUBLISHED'
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'type-ii-selvedge-trucker-jacket',
    'Type II Selvedge Denim Jacket',
    '14.5oz Kaihara Mills natural indigo selvedge jacket with front knife pleats, selvedge interior placket, and custom iron buttons.',
    36000,
    'USD',
    'OM',
    'TOPS',
    'PUBLISHED'
  ),
  (
    'a0000000-0000-0000-0000-000000000004',
    'selvedge-canvas-field-bag',
    'Selvedge Canvas Field Bag',
    '16oz Kurabo duck canvas paired with heavy selvedge denim trim and full-grain vegetable-tanned leather straps.',
    12000,
    'USD',
    'DROP',
    'ACCESSORIES',
    'PUBLISHED'
  ),
  (
    'a0000000-0000-0000-0000-000000000005',
    'lot-j01-sterling-signet-ring',
    'Lot J01 — .925 Sterling Silver Signet Ring',
    'Solid .925 sterling silver signet ring with hand-chiseled crest. Made to order at our Kathmandu jewellery bench.',
    22000,
    'USD',
    'OM',
    'JEWELLERY',
    'PUBLISHED'
  )
ON CONFLICT (id) DO NOTHING;

-- 4. Product Options
INSERT INTO public.product_options (id, product_id, name, code, position, is_required)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Waist Size', 'waist', 1, true),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Inseam Length', 'inseam', 2, true),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Thread Color', 'thread_color', 3, true),
  ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005', 'Ring Size', 'ring_size', 1, true),
  ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', 'Finish', 'finish', 2, true)
ON CONFLICT (id) DO NOTHING;

-- 5. Option Values
INSERT INTO public.option_values (id, option_id, code, label, price_delta_amount, position)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', '30', '30"', 0, 1),
  ('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', '32', '32"', 0, 2),
  ('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', '34', '34"', 0, 3),
  ('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000002', '32', '32"', 0, 1),
  ('f0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000002', '34', '34"', 0, 2),
  ('f0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000003', 'ochre', 'Golden Ochre', 0, 1),
  ('f0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000003', 'tobacco', 'Classic Tobacco', 0, 2),
  ('f0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000004', 'US8', 'US 8 (18.1mm)', 0, 1),
  ('f0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000004', 'US10', 'US 10 (19.8mm)', 0, 2),
  ('f0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000005', 'OXIDIZED', 'Oxidized Vintage Patina', 0, 1),
  ('f0000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000005', 'HIGH_POLISH', 'High Mirror Polish', 1500, 2)
ON CONFLICT (id) DO NOTHING;

-- 6. Product Variants
INSERT INTO public.product_variants (id, product_id, sku, options, additional_price_amount, inventory_count, status)
VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'LOT001-RAW-30-32',
    '{"waist": "30", "inseam": "32", "thread_color": "ochre"}',
    0,
    15,
    'AVAILABLE'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'LOT001-RAW-32-34',
    '{"waist": "32", "inseam": "34", "thread_color": "ochre"}',
    0,
    20,
    'AVAILABLE'
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000002',
    'LOT002-SLIM-32-34',
    '{"waist": "32", "inseam": "34"}',
    0,
    12,
    'AVAILABLE'
  ),
  (
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000005',
    'LOTJ01-SILVER-US8-OXIDIZED',
    '{"ring_size": "US8", "finish": "OXIDIZED"}',
    0,
    10,
    'AVAILABLE'
  ),
  (
    'b0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000005',
    'LOTJ01-SILVER-US10-OXIDIZED',
    '{"ring_size": "US10", "finish": "OXIDIZED"}',
    0,
    10,
    'AVAILABLE'
  )
ON CONFLICT (id) DO NOTHING;

-- 7. Content Pages
INSERT INTO public.content_pages (id, slug, title, content_markdown, meta_description, is_published, published_at)
VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'kathmandu-workshop',
    'Inside the Kathmandu Workshop',
    '# Handcrafted in the Himalayas\n\nEvery pair of Jeanius selvedge jeans is cut and sewn by hand in our Kathmandu workshop using vintage Union Special sewing machines and Japanese shuttle-loom selvedge denim.',
    'Explore the artisan craftsmanship behind Jeanius bespoke denim in Kathmandu.',
    true,
    now()
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'raw-denim-care-guide',
    'The Raw Selvedge Denim Care Guide',
    '# Caring for Raw Selvedge Denim\n\nRaw denim builds character over time. Wear often, wash rarely, and cold soak with mild detergent when necessary.',
    'A master artisan guide on washing, breaking in, and repairing raw selvedge denim.',
    true,
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- 8. Announcements
INSERT INTO public.announcements (id, title, message, type, start_date, end_date, priority)
VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    'Lot 002 Capsule Drop',
    'Limited release: Only 45 pairs of 15.5oz Kuroki Mills Deep Indigo Selvedge available worldwide.',
    'PROMO',
    now(),
    now() + interval '30 days',
    10
  )
ON CONFLICT (id) DO NOTHING;
