-- Seed data for local Supabase development (Project 925 Kathmandu Atelier)
-- Formally separated Order-Made artisan pieces and Drop inventory batches (JN-053)

-- 1. Workshop & Customer Users
INSERT INTO public.users_profile (id, email, full_name, role, phone, jewellery_preferences)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'admin@jeanius.co', 'Project 925 Kathmandu Atelier Admin', 'ADMIN', '+977-1-4200001', NULL),
  ('c0000000-0000-0000-0000-000000000003', 'metalsmith@jeanius.co', 'Bikash Shakya — Master Silversmith', 'JEWELLER', '+977-9800000003', NULL),
  ('c0000000-0000-0000-0000-000000000004', 'logistics@jeanius.co', 'Kiran Shrestha — TIA Export & Fulfillment Lead', 'FULFILLMENT', '+977-9800000004', NULL),
  ('c0000000-0000-0000-0000-000000000005', 'care@jeanius.co', 'Sita Tuladhar — Concierge & Client Care', 'SUPPORT', '+977-9800000005', NULL),
  ('c0000000-0000-0000-0000-000000000006', 'shopper@example.com', 'Alex Chen — Silver Collector', 'CUSTOMER', '+1-415-555-0199', '{"rings":{"comfortFit":true,"ringSizeUs":"US 10","dominantHand":"RIGHT","ringMandrelMm":19.8,"preferredFinger":"MIDDLE","insideDiameterMm":19.8,"insideCircumferenceMm":62.1},"metals":{"preferredAlloy":"STERLING_SILVER_925","preferredFinish":"OXIDIZED_PATINA"},"wrists":{"cuffGapMm":28,"braceletFit":"COMFORT","wristBreadthMm":60,"wristThicknessMm":42,"wristCircumferenceInches":6.75},"necklaces":{"chainStyle":"ROPE","preferredChainLengthInches":22},"ringSizeUs":"US 10","ringMandrelMm":19.8,"preferredAlloy":"STERLING_SILVER_925","preferredFinish":"OXIDIZED_PATINA","wristCircumferenceInches":6.75}'::jsonb),
  ('c0000000-0000-0000-0000-000000000007', 'vip@example.com', 'Elena Rostova — Guild VIP Patron', 'MEMBER', '+1-212-555-0188', '{"rings":{"comfortFit":true,"ringSizeUs":"US 7.5","dominantHand":"LEFT","ringMandrelMm":17.7,"preferredFinger":"RING","insideDiameterMm":17.7,"insideCircumferenceMm":55.6},"metals":{"preferredAlloy":"STERLING_SILVER_925","preferredFinish":"HIGH_POLISH"},"wrists":{"cuffGapMm":25,"braceletFit":"SNUG","wristBreadthMm":54,"wristThicknessMm":38,"wristCircumferenceInches":6},"necklaces":{"chainStyle":"CABLE","preferredChainLengthInches":18},"ringSizeUs":"US 7.5","ringMandrelMm":17.7,"preferredAlloy":"STERLING_SILVER_925","preferredFinish":"HIGH_POLISH","wristCircumferenceInches":6}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  jewellery_preferences = EXCLUDED.jewellery_preferences;

-- 2. Dynamic Categories (Project 925 Canonical)
INSERT INTO public.categories (id, slug, name, description, sort_order, is_active)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'rings', 'Rings', 'Hand-forged and lost-wax cast solid .925 sterling silver rings.', 1, true),
  ('b0000000-0000-0000-0000-000000000002', 'bracelets-cuffs', 'Bracelets & Cuffs', 'Solid .925 sterling silver cuffs and articulated link bracelets.', 2, true),
  ('b0000000-0000-0000-0000-000000000003', 'necklaces-pendants', 'Necklaces & Pendants', 'Symbolic Kathmandu amulets, talismans, and repoussé pendants.', 3, true),
  ('b0000000-0000-0000-0000-000000000004', 'earrings', 'Earrings', 'Sculptural and faceted architectural .925 sterling silver earrings.', 4, true),
  ('b0000000-0000-0000-0000-000000000005', 'chains-links', 'Chains & Links', 'Heavy gauge hand-assembled solid silver chains and clasps.', 5, true),
  ('b0000000-0000-0000-0000-000000000006', 'artefacts', 'Artefacts & Silverware', 'Rare artisan vessel objects, silver slides, and sacred workshop commissions.', 6, true)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- 2.5 Precious Metal Stocks (Kathmandu Workshop Reserve)
INSERT INTO public.metal_stocks (id, metal_alloy, purity, lot_number, initial_weight_grams, remaining_weight_grams, supplier, status)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'STERLING_SILVER_925', 0.925, 'MS-AG-01', 5000.00, 5000.00, 'Rio Grande', 'ACTIVE'),
  ('e0000000-0000-0000-0000-000000000002', 'SOLID_BRASS', 1.000, 'MS-BR-01', 10000.00, 10000.00, 'Rio Grande', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 3. Core Catalog Products
INSERT INTO public.products (id, slug, title, description, base_price_amount, base_price_currency, commerce_model, category, status, lead_time_days_min, lead_time_days_max, input_specifications, price_rules)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'lot-r01-vajra-signet-ring', 'Lot R01 — Vajra Signet Ring', 'Solid .925 sterling silver signet ring with hand-chiseled sacred Vajra thunderbolt emblem. Lost-wax vacuum cast in our Kathmandu workshop.', 26000, 'USD', 'OM', 'rings', 'PUBLISHED', 7, 14, '{"patina":{"allowedFinishes":[{"code":"OXIDIZED_CHARCOAL","label":"Oxidized Charcoal Patina","isDefault":true,"description":"Deep sulfur chemical oxidation recessed in hand-carved relief","priceDeltaAmount":0},{"code":"BRUSHED_MATTE","label":"Brushed Matte Studio Finish","description":"Tactile satin directional brushing across high silver planes","priceDeltaAmount":0},{"code":"MIRROR_POLISH","label":"Mirror High Polish","description":"High rouge buffed brilliant reflection","priceDeltaAmount":0}]},"ringSize":{"stepUs":0.25,"maxSizeUs":16,"minSizeUs":3,"defaultSizeUs":10,"wideShankOffsetAllowed":true},"engraving":{"allowed":true,"maxCharacters":20,"priceDeltaAmount":0},"metalPurity":".925 Sterling Silver"}'::jsonb, '[]'::jsonb),
  ('a0000000-0000-0000-0000-000000000002', 'lot-r02-naga-bone-band', 'Lot R02 — Naga Serpent Bone Band', 'Heavy articulated .925 sterling silver band inspired by Newar mythological serpent architecture. Deep sulfur liver oxidation with polished relief.', 22000, 'USD', 'OM', 'rings', 'PUBLISHED', 7, 14, '{"patina":{"allowedFinishes":[{"code":"OXIDIZED_CHARCOAL","label":"Oxidized Charcoal Patina","isDefault":true,"description":"Deep sulfur chemical oxidation recessed in hand-carved relief","priceDeltaAmount":0},{"code":"BRUSHED_MATTE","label":"Brushed Matte Studio Finish","description":"Tactile satin directional brushing across high silver planes","priceDeltaAmount":0},{"code":"MIRROR_POLISH","label":"Mirror High Polish","description":"High rouge buffed brilliant reflection","priceDeltaAmount":0}]},"ringSize":{"stepUs":0.25,"maxSizeUs":16,"minSizeUs":3,"defaultSizeUs":10,"wideShankOffsetAllowed":true},"engraving":{"allowed":true,"maxCharacters":20,"priceDeltaAmount":0},"metalPurity":".925 Sterling Silver"}'::jsonb, '[]'::jsonb),
  ('a0000000-0000-0000-0000-000000000003', 'lot-r03-patina-skull-band', 'Lot R03 — Memento Mori Patina Ring', 'Substantial 28-gram solid .925 sterling silver skull band. Directional brush finish, blackened recessed crevices. Limited artisan bench commission.', 29000, 'USD', 'OM', 'rings', 'PUBLISHED', 7, 14, '{"patina":{"allowedFinishes":[{"code":"OXIDIZED_CHARCOAL","label":"Oxidized Charcoal Patina","isDefault":true,"description":"Deep sulfur chemical oxidation recessed in hand-carved relief","priceDeltaAmount":0},{"code":"BRUSHED_MATTE","label":"Brushed Matte Studio Finish","description":"Tactile satin directional brushing across high silver planes","priceDeltaAmount":0},{"code":"MIRROR_POLISH","label":"Mirror High Polish","description":"High rouge buffed brilliant reflection","priceDeltaAmount":0}]},"ringSize":{"stepUs":0.25,"maxSizeUs":16,"minSizeUs":3,"defaultSizeUs":10,"wideShankOffsetAllowed":true},"engraving":{"allowed":true,"maxCharacters":20,"priceDeltaAmount":0},"metalPurity":".925 Sterling Silver"}'::jsonb, '[]'::jsonb),
  ('a0000000-0000-0000-0000-000000000004', 'lot-c01-garuda-heavy-cuff', 'Lot C01 — Garuda Wing Heavy Cuff', 'Open architecture solid .925 sterling silver cuff bracelet featuring hand-carved Garuda plumage motifs. Forged and calibrated by hand in Kathmandu.', 42000, 'USD', 'OM', 'bracelets-cuffs', 'PUBLISHED', 7, 14, '{"patina":{"allowedFinishes":[{"code":"OXIDIZED_CHARCOAL","label":"Oxidized Charcoal Patina","isDefault":true,"description":"Deep sulfur chemical oxidation recessed in hand-carved relief","priceDeltaAmount":0},{"code":"BRUSHED_MATTE","label":"Brushed Matte Studio Finish","description":"Tactile satin directional brushing across high silver planes","priceDeltaAmount":0},{"code":"MIRROR_POLISH","label":"Mirror High Polish","description":"High rouge buffed brilliant reflection","priceDeltaAmount":0}]},"engraving":{"allowed":true,"maxCharacters":20,"priceDeltaAmount":0},"wristSize":{"gapMm":25,"maxCircumferenceInches":8.5,"minCircumferenceInches":5.5,"defaultCircumferenceInches":6.75},"metalPurity":".925 Sterling Silver"}'::jsonb, '[]'::jsonb),
  ('a0000000-0000-0000-0000-000000000005', 'lot-c02-hammered-torque-cuff', 'Lot C02 — Hand-Hammered Torque Cuff', 'Raw mechanical torque cuff forged from 8mm square .925 silver stock. Mirror beveled terminals with anvil-hammered texture along the spine.', 34000, 'USD', 'OM', 'bracelets-cuffs', 'PUBLISHED', 7, 14, '{"patina":{"allowedFinishes":[{"code":"OXIDIZED_CHARCOAL","label":"Oxidized Charcoal Patina","isDefault":true,"description":"Deep sulfur chemical oxidation recessed in hand-carved relief","priceDeltaAmount":0},{"code":"BRUSHED_MATTE","label":"Brushed Matte Studio Finish","description":"Tactile satin directional brushing across high silver planes","priceDeltaAmount":0},{"code":"MIRROR_POLISH","label":"Mirror High Polish","description":"High rouge buffed brilliant reflection","priceDeltaAmount":0}]},"engraving":{"allowed":true,"maxCharacters":20,"priceDeltaAmount":0},"wristSize":{"gapMm":25,"maxCircumferenceInches":8.5,"minCircumferenceInches":5.5,"defaultCircumferenceInches":6.75},"metalPurity":".925 Sterling Silver"}'::jsonb, '[]'::jsonb),
  ('a0000000-0000-0000-0000-000000000006', 'lot-n01-dorje-amulet-pendant', 'Lot N01 — Dorje Protector Amulet Pendant', 'Sacred ritual Dorje lost-wax cast in pure .925 sterling silver. Includes oxidized sterling silver wheat link chain with custom S-clasp.', 31000, 'USD', 'OM', 'necklaces-pendants', 'PUBLISHED', 7, 14, '{"patina":{"allowedFinishes":[{"code":"OXIDIZED_CHARCOAL","label":"Oxidized Charcoal Patina","isDefault":true,"description":"Deep sulfur chemical oxidation recessed in hand-carved relief","priceDeltaAmount":0},{"code":"BRUSHED_MATTE","label":"Brushed Matte Studio Finish","description":"Tactile satin directional brushing across high silver planes","priceDeltaAmount":0},{"code":"MIRROR_POLISH","label":"Mirror High Polish","description":"High rouge buffed brilliant reflection","priceDeltaAmount":0}]},"engraving":{"allowed":true,"maxCharacters":20,"priceDeltaAmount":0},"chainLength":{"allowCustomInches":false,"defaultLengthInches":22,"standardLengthsInches":[18,20,22,24,26,28]},"metalPurity":".925 Sterling Silver"}'::jsonb, '[{"reason":"Heavy silver bullion surcharge for 24\"+ lengths","inputKey":"chainLengthInches","condition":"GREATER_THAN","threshold":22,"surchargeAmount":3000}]'::jsonb),
  ('a0000000-0000-0000-0000-000000000007', 'lot-n02-lotus-seal-medallion', 'Lot N02 — Repoussé Lotus Seal Medallion', 'Double-sided high-relief Kathmandu repoussé medallion in hallmarked .925 silver. Scheduled artisan drop.', 28000, 'USD', 'OM', 'necklaces-pendants', 'SCHEDULED', 7, 14, '{"patina":{"allowedFinishes":[{"code":"OXIDIZED_CHARCOAL","label":"Oxidized Charcoal Patina","isDefault":true,"description":"Deep sulfur chemical oxidation recessed in hand-carved relief","priceDeltaAmount":0},{"code":"BRUSHED_MATTE","label":"Brushed Matte Studio Finish","description":"Tactile satin directional brushing across high silver planes","priceDeltaAmount":0},{"code":"MIRROR_POLISH","label":"Mirror High Polish","description":"High rouge buffed brilliant reflection","priceDeltaAmount":0}]},"engraving":{"allowed":true,"maxCharacters":20,"priceDeltaAmount":0},"chainLength":{"allowCustomInches":false,"defaultLengthInches":22,"standardLengthsInches":[18,20,22,24,26,28]},"metalPurity":".925 Sterling Silver"}'::jsonb, '[{"reason":"Heavy silver bullion surcharge for 24\"+ lengths","inputKey":"chainLengthInches","condition":"GREATER_THAN","threshold":22,"surchargeAmount":3000}]'::jsonb),
  ('a0000000-0000-0000-0000-000000000008', 'lot-e01-architectural-silver-hoops', 'Lot E01 — Faceted Architectural Hoops', 'Pair of sculpted geometric clicker hoops in satin-brushed .925 sterling silver. Engineered with hidden tension hinge mechanics.', 19000, 'USD', 'DROP', 'earrings', 'PUBLISHED', 1, 2, NULL, '[]'::jsonb),
  ('a0000000-0000-0000-0000-000000000009', 'lot-ch01-heavy-anchor-chain', 'Lot CH01 — Hand-Assembled Heavy Anchor Chain', 'Over 110 grams of solid .925 sterling silver. Individually sawed, soldered, and hand-filed nautical anchor links with hand-turned swivel clip.', 48000, 'USD', 'OM', 'chains-links', 'PUBLISHED', 7, 14, '{"patina":{"allowedFinishes":[{"code":"OXIDIZED_CHARCOAL","label":"Oxidized Charcoal Patina","isDefault":true,"description":"Deep sulfur chemical oxidation recessed in hand-carved relief","priceDeltaAmount":0},{"code":"BRUSHED_MATTE","label":"Brushed Matte Studio Finish","description":"Tactile satin directional brushing across high silver planes","priceDeltaAmount":0},{"code":"MIRROR_POLISH","label":"Mirror High Polish","description":"High rouge buffed brilliant reflection","priceDeltaAmount":0}]},"engraving":{"allowed":true,"maxCharacters":20,"priceDeltaAmount":0},"chainLength":{"allowCustomInches":false,"defaultLengthInches":22,"standardLengthsInches":[18,20,22,24,26,28]},"metalPurity":".925 Sterling Silver"}'::jsonb, '[{"reason":"Heavy silver bullion surcharge for 24\"+ lengths","inputKey":"chainLengthInches","condition":"GREATER_THAN","threshold":22,"surchargeAmount":3000}]'::jsonb),
  ('a0000000-0000-0000-0000-000000000010', 'lot-a01-ritual-silver-chalice', 'Lot A01 — Solid Silver Ritual Vessel Chalice', 'Masterwork ceremonial vessel hand-raised from pure .925 sterling silver sheet by Kathmandu valley silversmiths. Archive drop edition.', 75000, 'USD', 'DROP', 'artefacts', 'PUBLISHED', 1, 2, NULL, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  base_price_amount = EXCLUDED.base_price_amount,
  base_price_currency = EXCLUDED.base_price_currency,
  commerce_model = EXCLUDED.commerce_model,
  category = EXCLUDED.category,
  status = EXCLUDED.status,
  lead_time_days_min = EXCLUDED.lead_time_days_min,
  lead_time_days_max = EXCLUDED.lead_time_days_max,
  input_specifications = EXCLUDED.input_specifications,
  price_rules = EXCLUDED.price_rules;

-- 4. Order-Made Products (JN-053)
INSERT INTO public.order_made_products (id, product_id, slug, title, description, base_price_amount, base_price_currency, category, lead_time_days_min, lead_time_days_max, input_specifications, price_rules, status)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'lot-r01-vajra-signet-ring', 'Lot R01 — Vajra Signet Ring', 'Solid .925 sterling silver signet ring with hand-chiseled sacred Vajra thunderbolt emblem. Lost-wax vacuum cast in our Kathmandu workshop.', 26000, 'USD', 'rings', 7, 14, '{"patina":{"allowedFinishes":[{"code":"OXIDIZED_CHARCOAL","label":"Oxidized Charcoal Patina","isDefault":true,"description":"Deep sulfur chemical oxidation recessed in hand-carved relief","priceDeltaAmount":0},{"code":"BRUSHED_MATTE","label":"Brushed Matte Studio Finish","description":"Tactile satin directional brushing across high silver planes","priceDeltaAmount":0},{"code":"MIRROR_POLISH","label":"Mirror High Polish","description":"High rouge buffed brilliant reflection","priceDeltaAmount":0}]},"ringSize":{"stepUs":0.25,"maxSizeUs":16,"minSizeUs":3,"defaultSizeUs":10,"wideShankOffsetAllowed":true},"engraving":{"allowed":true,"maxCharacters":20,"priceDeltaAmount":0},"metalPurity":".925 Sterling Silver"}'::jsonb, '[]'::jsonb, 'PUBLISHED'),
  ('a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'lot-r02-naga-bone-band', 'Lot R02 — Naga Serpent Bone Band', 'Heavy articulated .925 sterling silver band inspired by Newar mythological serpent architecture. Deep sulfur liver oxidation with polished relief.', 22000, 'USD', 'rings', 7, 14, '{"patina":{"allowedFinishes":[{"code":"OXIDIZED_CHARCOAL","label":"Oxidized Charcoal Patina","isDefault":true,"description":"Deep sulfur chemical oxidation recessed in hand-carved relief","priceDeltaAmount":0},{"code":"BRUSHED_MATTE","label":"Brushed Matte Studio Finish","description":"Tactile satin directional brushing across high silver planes","priceDeltaAmount":0},{"code":"MIRROR_POLISH","label":"Mirror High Polish","description":"High rouge buffed brilliant reflection","priceDeltaAmount":0}]},"ringSize":{"stepUs":0.25,"maxSizeUs":16,"minSizeUs":3,"defaultSizeUs":10,"wideShankOffsetAllowed":true},"engraving":{"allowed":true,"maxCharacters":20,"priceDeltaAmount":0},"metalPurity":".925 Sterling Silver"}'::jsonb, '[]'::jsonb, 'PUBLISHED'),
  ('a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'lot-r03-patina-skull-band', 'Lot R03 — Memento Mori Patina Ring', 'Substantial 28-gram solid .925 sterling silver skull band. Directional brush finish, blackened recessed crevices. Limited artisan bench commission.', 29000, 'USD', 'rings', 7, 14, '{"patina":{"allowedFinishes":[{"code":"OXIDIZED_CHARCOAL","label":"Oxidized Charcoal Patina","isDefault":true,"description":"Deep sulfur chemical oxidation recessed in hand-carved relief","priceDeltaAmount":0},{"code":"BRUSHED_MATTE","label":"Brushed Matte Studio Finish","description":"Tactile satin directional brushing across high silver planes","priceDeltaAmount":0},{"code":"MIRROR_POLISH","label":"Mirror High Polish","description":"High rouge buffed brilliant reflection","priceDeltaAmount":0}]},"ringSize":{"stepUs":0.25,"maxSizeUs":16,"minSizeUs":3,"defaultSizeUs":10,"wideShankOffsetAllowed":true},"engraving":{"allowed":true,"maxCharacters":20,"priceDeltaAmount":0},"metalPurity":".925 Sterling Silver"}'::jsonb, '[]'::jsonb, 'PUBLISHED'),
  ('a0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'lot-c01-garuda-heavy-cuff', 'Lot C01 — Garuda Wing Heavy Cuff', 'Open architecture solid .925 sterling silver cuff bracelet featuring hand-carved Garuda plumage motifs. Forged and calibrated by hand in Kathmandu.', 42000, 'USD', 'bracelets-cuffs', 7, 14, '{"patina":{"allowedFinishes":[{"code":"OXIDIZED_CHARCOAL","label":"Oxidized Charcoal Patina","isDefault":true,"description":"Deep sulfur chemical oxidation recessed in hand-carved relief","priceDeltaAmount":0},{"code":"BRUSHED_MATTE","label":"Brushed Matte Studio Finish","description":"Tactile satin directional brushing across high silver planes","priceDeltaAmount":0},{"code":"MIRROR_POLISH","label":"Mirror High Polish","description":"High rouge buffed brilliant reflection","priceDeltaAmount":0}]},"engraving":{"allowed":true,"maxCharacters":20,"priceDeltaAmount":0},"wristSize":{"gapMm":25,"maxCircumferenceInches":8.5,"minCircumferenceInches":5.5,"defaultCircumferenceInches":6.75},"metalPurity":".925 Sterling Silver"}'::jsonb, '[]'::jsonb, 'PUBLISHED'),
  ('a0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', 'lot-c02-hammered-torque-cuff', 'Lot C02 — Hand-Hammered Torque Cuff', 'Raw mechanical torque cuff forged from 8mm square .925 silver stock. Mirror beveled terminals with anvil-hammered texture along the spine.', 34000, 'USD', 'bracelets-cuffs', 7, 14, '{"patina":{"allowedFinishes":[{"code":"OXIDIZED_CHARCOAL","label":"Oxidized Charcoal Patina","isDefault":true,"description":"Deep sulfur chemical oxidation recessed in hand-carved relief","priceDeltaAmount":0},{"code":"BRUSHED_MATTE","label":"Brushed Matte Studio Finish","description":"Tactile satin directional brushing across high silver planes","priceDeltaAmount":0},{"code":"MIRROR_POLISH","label":"Mirror High Polish","description":"High rouge buffed brilliant reflection","priceDeltaAmount":0}]},"engraving":{"allowed":true,"maxCharacters":20,"priceDeltaAmount":0},"wristSize":{"gapMm":25,"maxCircumferenceInches":8.5,"minCircumferenceInches":5.5,"defaultCircumferenceInches":6.75},"metalPurity":".925 Sterling Silver"}'::jsonb, '[]'::jsonb, 'PUBLISHED'),
  ('a0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000006', 'lot-n01-dorje-amulet-pendant', 'Lot N01 — Dorje Protector Amulet Pendant', 'Sacred ritual Dorje lost-wax cast in pure .925 sterling silver. Includes oxidized sterling silver wheat link chain with custom S-clasp.', 31000, 'USD', 'necklaces-pendants', 7, 14, '{"patina":{"allowedFinishes":[{"code":"OXIDIZED_CHARCOAL","label":"Oxidized Charcoal Patina","isDefault":true,"description":"Deep sulfur chemical oxidation recessed in hand-carved relief","priceDeltaAmount":0},{"code":"BRUSHED_MATTE","label":"Brushed Matte Studio Finish","description":"Tactile satin directional brushing across high silver planes","priceDeltaAmount":0},{"code":"MIRROR_POLISH","label":"Mirror High Polish","description":"High rouge buffed brilliant reflection","priceDeltaAmount":0}]},"engraving":{"allowed":true,"maxCharacters":20,"priceDeltaAmount":0},"chainLength":{"allowCustomInches":false,"defaultLengthInches":22,"standardLengthsInches":[18,20,22,24,26,28]},"metalPurity":".925 Sterling Silver"}'::jsonb, '[{"reason":"Heavy silver bullion surcharge for 24\"+ lengths","inputKey":"chainLengthInches","condition":"GREATER_THAN","threshold":22,"surchargeAmount":3000}]'::jsonb, 'PUBLISHED'),
  ('a0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000007', 'lot-n02-lotus-seal-medallion', 'Lot N02 — Repoussé Lotus Seal Medallion', 'Double-sided high-relief Kathmandu repoussé medallion in hallmarked .925 silver. Scheduled artisan drop.', 28000, 'USD', 'necklaces-pendants', 7, 14, '{"patina":{"allowedFinishes":[{"code":"OXIDIZED_CHARCOAL","label":"Oxidized Charcoal Patina","isDefault":true,"description":"Deep sulfur chemical oxidation recessed in hand-carved relief","priceDeltaAmount":0},{"code":"BRUSHED_MATTE","label":"Brushed Matte Studio Finish","description":"Tactile satin directional brushing across high silver planes","priceDeltaAmount":0},{"code":"MIRROR_POLISH","label":"Mirror High Polish","description":"High rouge buffed brilliant reflection","priceDeltaAmount":0}]},"engraving":{"allowed":true,"maxCharacters":20,"priceDeltaAmount":0},"chainLength":{"allowCustomInches":false,"defaultLengthInches":22,"standardLengthsInches":[18,20,22,24,26,28]},"metalPurity":".925 Sterling Silver"}'::jsonb, '[{"reason":"Heavy silver bullion surcharge for 24\"+ lengths","inputKey":"chainLengthInches","condition":"GREATER_THAN","threshold":22,"surchargeAmount":3000}]'::jsonb, 'SCHEDULED'),
  ('a0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000009', 'lot-ch01-heavy-anchor-chain', 'Lot CH01 — Hand-Assembled Heavy Anchor Chain', 'Over 110 grams of solid .925 sterling silver. Individually sawed, soldered, and hand-filed nautical anchor links with hand-turned swivel clip.', 48000, 'USD', 'chains-links', 7, 14, '{"patina":{"allowedFinishes":[{"code":"OXIDIZED_CHARCOAL","label":"Oxidized Charcoal Patina","isDefault":true,"description":"Deep sulfur chemical oxidation recessed in hand-carved relief","priceDeltaAmount":0},{"code":"BRUSHED_MATTE","label":"Brushed Matte Studio Finish","description":"Tactile satin directional brushing across high silver planes","priceDeltaAmount":0},{"code":"MIRROR_POLISH","label":"Mirror High Polish","description":"High rouge buffed brilliant reflection","priceDeltaAmount":0}]},"engraving":{"allowed":true,"maxCharacters":20,"priceDeltaAmount":0},"chainLength":{"allowCustomInches":false,"defaultLengthInches":22,"standardLengthsInches":[18,20,22,24,26,28]},"metalPurity":".925 Sterling Silver"}'::jsonb, '[{"reason":"Heavy silver bullion surcharge for 24\"+ lengths","inputKey":"chainLengthInches","condition":"GREATER_THAN","threshold":22,"surchargeAmount":3000}]'::jsonb, 'PUBLISHED')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  base_price_amount = EXCLUDED.base_price_amount,
  lead_time_days_min = EXCLUDED.lead_time_days_min,
  lead_time_days_max = EXCLUDED.lead_time_days_max,
  input_specifications = EXCLUDED.input_specifications,
  price_rules = EXCLUDED.price_rules,
  status = EXCLUDED.status;

-- 5. Drop Products & Drop Variants (JN-053)
INSERT INTO public.drop_products (id, product_id, slug, title, description, base_price_amount, base_price_currency, category, drop_batch_number, total_batch_quantity, status)
VALUES
  ('d0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000008', 'lot-e01-architectural-silver-hoops', 'Lot E01 — Faceted Architectural Hoops', 'Pair of sculpted geometric clicker hoops in satin-brushed .925 sterling silver.', 19000, 'USD', 'earrings', 1, 25, 'PUBLISHED'),
  ('d0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000010', 'lot-a01-ritual-silver-chalice', 'Lot A01 — Solid Silver Ritual Vessel Chalice', 'Masterwork ceremonial vessel hand-raised from pure .925 sterling silver sheet by Kathmandu valley silversmiths.', 75000, 'USD', 'artefacts', 1, 5, 'PUBLISHED')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  base_price_amount = EXCLUDED.base_price_amount,
  total_batch_quantity = EXCLUDED.total_batch_quantity,
  status = EXCLUDED.status;

INSERT INTO public.drop_variants (id, drop_product_id, sku, attributes, additional_price_amount, additional_price_currency, inventory_count, status)
VALUES
  ('d1000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000008', 'P925-DROP-E01-18MM-SAT', '{"finish":"satin_matte","hoop_diameter":"18mm"}'::jsonb, 0, 'USD', 8, 'AVAILABLE'),
  ('d1000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000008', 'P925-DROP-E01-24MM-SAT', '{"finish":"satin_matte","hoop_diameter":"24mm"}'::jsonb, 3000, 'USD', 4, 'AVAILABLE'),
  ('d1000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000010', 'P925-DROP-A01-RELIEF', '{"finish":"chiseled_relief"}'::jsonb, 0, 'USD', 2, 'AVAILABLE')
ON CONFLICT (id) DO UPDATE SET
  attributes = EXCLUDED.attributes,
  additional_price_amount = EXCLUDED.additional_price_amount,
  inventory_count = EXCLUDED.inventory_count,
  status = EXCLUDED.status;

-- 6. Limited Compatibility Product Variants (for DROP products only)
INSERT INTO public.product_variants (id, product_id, sku, options, additional_price_amount, inventory_count, status)
VALUES
  ('b0000000-0000-0000-0000-000000000041', 'a0000000-0000-0000-0000-000000000008', 'P925-E01-18MM-SAT', '{"finish":"satin_matte","hoop_diameter":"dia_18mm"}', 0, 8, 'AVAILABLE'),
  ('b0000000-0000-0000-0000-000000000042', 'a0000000-0000-0000-0000-000000000008', 'P925-E01-24MM-SAT', '{"finish":"satin_matte","hoop_diameter":"dia_24mm"}', 3000, 4, 'AVAILABLE'),
  ('b0000000-0000-0000-0000-000000000062', 'a0000000-0000-0000-0000-000000000010', 'P925-A01-REL', '{"finish":"chiseled_relief"}', 0, 2, 'AVAILABLE')
ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  options = EXCLUDED.options,
  additional_price_amount = EXCLUDED.additional_price_amount,
  inventory_count = EXCLUDED.inventory_count,
  status = EXCLUDED.status;

-- 7. Editorial Content Pages (Kathmandu Workshop Only)
INSERT INTO public.content_pages (id, slug, title, content_markdown, meta_description, is_published, published_at)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'kathmandu-atelier', 'Inside the Project 925', '# Handcrafted in the Himalayas

All piece at Project 925, hand-cast sterling silver signet rings—is crafted by master artisans in our Kathmandu atelier.

### The Sacred Rhythm of the Loom & Forge
In the heart of Kathmandu, our artisans merge time-honoured Himalayan metalcraft with Japanese vintage denim tailoring. We do not mass-produce; we build heirloom garments and talismanic silver designed to wear in, develop character, and last generations.', 'Explore handmade raw denim and artisan jewellery crafted in Kathmandu, Nepal.', true, now()),
  ('10000000-0000-0000-0000-000000000003', 'sizing', 'Project 925 Precision Sizing Studio', '# Master Mandrel & Sizing Guide

Because our jewellery is cast and forged in solid, heavy .925 sterling silver, precise anatomical measurements ensure an immaculate fit for life.

## Part 01 · Solid Silver Ring Mandrel
Ring sizes must accommodate your knuckle volume. Measure during afternoon hours when finger volume is baseline.
- **Wide Shank Compensation:** For rings with band widths of 8mm or wider (e.g. Lot R01 Vajra Signet), we recommend adding +0.5 US size to avoid constriction.
- **Comfort Fit:** Rounded inner bands slide over knuckles smoothly; flat inner profiles fit with firmer grip.
- **Mandrel Diameters:**
  - US 8 = 18.1 mm inside diameter
  - US 9 = 18.9 mm inside diameter
  - US 10 = 19.8 mm inside diameter
  - US 11 = 20.6 mm inside diameter
  - US 12 = 21.4 mm inside diameter

## Part 02 · Heavy Cuff & Bracelet Fit
Open cuffs should slide onto the wrist from the soft side of the arm (1–2 inches above the wrist bone), not forced over the top.
- **Cuff Gap:** Maintain a 1.0" to 1.25" gap allowance for effortless slip-on.
- **Wrist Circumference:**
  - Small: 6.0" – 6.5"
  - Medium: 6.5" – 7.25"
  - Large: 7.25" – 8.0"

## Part 03 · Chain Drape Sizing
- **20-inch (50cm):** Rests just below the collarbone; ideal for smaller medallions.
- **24-inch (60cm):** Rests mid-chest; standard for heavy talismans and Dorje amulets.', 'Comprehensive guide to measuring solid .925 sterling silver rings, cuff wrist breadth, and chain drape lengths.', true, now()),
  ('10000000-0000-0000-0000-000000000002', 'about', 'Project 925 — The Kathmandu Silver Atelier', '# Project 925: Ancient Metalsmithing in the Kathmandu Valley

Project 925 is a single-craft artisan atelier based exclusively in Kathmandu, Nepal. We work in exactly one medium: hallmarked .925 sterling silver, hand-cast and hand-forged through generations of Newar lost-wax and repoussé traditions.

## Chapter 01 · The Kathmandu Silversmithing Bench
Deep in Kathmandu, our metalsmiths melt, pour, chase, and polish raw .925 sterling silver. There is no automated assembly line or flash electroplating: one artisan guides each ring, cuff, or pendant from raw wax carving to final bench hallmark.

Our silver is deliberately alive. We reject rhodium synthetic coatings so each piece breathes, oxidizes, and develops an intensely personal dark charcoal patina unique to its wearer.

## Chapter 02 · The Order-Made (OM) Protocol
1. **Commission Lock:** Your sizing specifications (ring mandrel mm, wrist gap, or chain drape) are confirmed directly with our silversmiths.
2. **Lost-Wax Investment & Pour:** A custom wax model is sculpted, invested, and cast in liquid .925 silver inside our vacuum casting furnace. **Casting is our Point of No Return.**
3. **Chiseling & Hand Patina:** The piece is cleaned, filed, hand-textured, and treated with mineral sulfur bath before receiving its final satin relief brush.
4. **Customs & Dispatch:** Hallmarked with the Kathmandu workshop stamp, certified with Nepal Customs HS Code 7113.11.0000, and dispatched via Tribhuvan International Airport (TIA-KTM).', 'Origins of Project 925, our Kathmandu silversmithing bench, lost-wax casting, and Order-Made artisan jewellery.', true, now()),
  ('10000000-0000-0000-0000-000000000004', 'guide', 'Project 925 Craft & Care Guide', '# Sterling Silver Maintenance & Patina Cultivation

True solid .925 sterling silver improves with wear. Here are the atelier rituals for cultivating and caring for your pieces.

## Silver Oxidation & Natural Patina
Solid .925 sterling silver naturally reacts with oxygen and ambient sulfur in the air:
- **Depth in Recesses:** We deliberately encourage the accumulation of deep shadows in sculpted crevices while raised surfaces stay radiant through natural skin contact.
- **Avoid Chemical Dips:** Liquid chemical silver dips destroy deliberate atelier oxidation. Never submerge your piece in commercial silver dip.
- **Atelier Polishing:** Use the untreated dense cotton cloth included in your canvas pouch across high-relief surfaces only.', 'Essential rituals for preserving, polishing, and cultivating natural oxidized patina on .925 sterling silver.', true, now()),
  ('10000000-0000-0000-0000-000000000005', 'contact', 'Kathmandu Workshop Concierge & Atelier Inquiries', '# Studio Consultations & Inquiries

Direct communication with our silversmiths and workshop staff in Kathmandu. We respond to sizing inquiries, custom commissions, and workshop visits within 24 business hours.

### Workshop Location
- **Kathmandu Silversmithing & Lost-Wax Atelier:** Kathmandu Workshop, Nepal (Mon–Fri: 10:00 – 18:00 NPT)

### Direct Digital Channels
- **General & Sizing Inquiries:** concierge@project925.co
- **Bespoke Commissions:** bespoke@project925.co
- **Repairs & Restorations:** workshop@project925.co', 'Contact the Project 925 master silversmiths and atelier concierge in Kathmandu for bespoke inquiries.', true, now()),
  ('10000000-0000-0000-0000-000000000006', 'returns', 'Bespoke Metalsmithing Policy & Covenant', '# Returns, Adjustments & Lifetime Craft Covenant

Because every Order-Made (OM) commission is individually cast from liquid .925 silver to your exact mandrel measurements, custom pieces cannot be returned for change of mind once pouring begins. We stand behind our metalsmithing with a lifetime covenant.

## The Atelier Guarantee
- **Complimentary Sizing Tuning:** Every custom ring includes one complimentary resizing (+/- 1 US size) within 60 days of delivery.
- **Lifetime Ultrasonic Cleansing & Refinishing:** Return your piece anytime for professional workshop cleaning and surface repolishing.
- **Structural Integrity:** If a weld, link, or bezel fails under ordinary wear, our Kathmandu workshop will repair it free of charge.', 'Details on our Order-Made jewellery covenant, sizing adjustments, and lifetime craft warranty.', true, now()),
  ('10000000-0000-0000-0000-000000000007', 'terms', 'Terms of Service & Atelier Contract', '# Commercial Terms & Commission Covenant

By placing an Order-Made or Limited Drop commission with Project 925, you agree to the craft covenants outlined herein.

## 1. Bespoke Manufacturing Timeline
Order-Made commissions require 10 to 18 business days of bench assembly prior to dispatch.

## 2. Point of No Return
Once molten .925 sterling silver is poured into the investment mold at the CASTING stage, the commission is locked and non-refundable.

## 3. Customs & Export Compliance
All pieces are crafted in Nepal and exported under Nepal Customs HS Code 7113.11.0000 from Tribhuvan International Airport (TIA-KTM). Deliveries may be subject to local import inspection in the destination country.', 'Official commercial terms, metalsmithing timelines, and export protocols for Project 925 clients.', true, now()),
  ('10000000-0000-0000-0000-000000000008', 'privacy', 'Atelier Vault Privacy & Security Policy', '# Atelier Vault Privacy & Sizing Security

Your anatomical measurements and sizing specifications belong strictly to you.

## 1. Vault Sizing Security
Sizing specifications stored in your Atelier Vault (mandrels, wrist breadth, drape) are encrypted and used solely to calibrate casting trees and mandrels during production. We never sell or transfer personal data.

## 2. Zero Trackers
Our storefront operates without third-party advertising trackers. Analytics are privacy-respecting and self-hosted.', 'Our commitment to protecting your sizing measurements, privacy, and personal data.', true, now())
ON CONFLICT (id) DO NOTHING;

-- 8. Announcements
INSERT INTO public.announcements (id, title, message, type, start_date, end_date, priority)
VALUES
  ('20000000-0000-0000-0000-000000000001', 'Lot 002 Capsule Drop', 'Limited release: Only 45 pairs of 15.5oz Kuroki Mills Deep Indigo Selvedge available worldwide.', 'PROMO', now(), now() + interval '30 days', 10),
  ('20000000-0000-0000-0000-000000000002', 'Kathmandu Cutting Bench Queue', 'Bespoke jeans cutting queue is currently operating at 14–18 business days. Each piece is chainstitched individually.', 'INFO', now(), now() + interval '30 days', 5)
ON CONFLICT (id) DO NOTHING;
