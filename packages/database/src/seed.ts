import { sql } from 'drizzle-orm';
import { createLogger } from '@jeanius/observability';
import { db } from './client';
import {
  usersProfile,
  categories,
  metalStocks,
  products,
  productImages,
  productVariants,
  orderMadeProducts,
  dropProducts,
  dropVariants,
  contentPages,
  announcements,
  atelierSettings,
} from './schema/index';

const logger = createLogger('database:seed');

export async function runDatabaseSeed() {
  logger.info('Seeding Project 925 Kathmandu Atelier database...');

  // 1. Users
  await db
    .insert(usersProfile)
    .values([
      {
        id: 'c0000000-0000-0000-0000-000000000001',
        email: 'admin@jeanius.co',
        fullName: 'Project 925 Kathmandu Atelier Admin',
        role: 'ADMIN',
        phone: '+977-1-4200001',
      },
      {
        id: 'c0000000-0000-0000-0000-000000000003',
        email: 'metalsmith@jeanius.co',
        fullName: 'Bikash Shakya — Master Silversmith',
        role: 'JEWELLER',
        phone: '+977-9800000003',
      },
      {
        id: 'c0000000-0000-0000-0000-000000000004',
        email: 'logistics@jeanius.co',
        fullName: 'Kiran Shrestha — TIA Export & Fulfillment Lead',
        role: 'FULFILLMENT',
        phone: '+977-9800000004',
      },
      {
        id: 'c0000000-0000-0000-0000-000000000005',
        email: 'care@jeanius.co',
        fullName: 'Sita Tuladhar — Concierge & Client Care',
        role: 'SUPPORT',
        phone: '+977-9800000005',
      },
      {
        id: 'c0000000-0000-0000-0000-000000000006',
        email: 'shopper@example.com',
        fullName: 'Alex Chen — Silver Collector',
        role: 'CUSTOMER',
        phone: '+1-415-555-0199',
        jewelleryPreferences: {
          rings: {
            ringSizeUs: 'US 10',
            ringMandrelMm: 19.8,
            insideDiameterMm: 19.8,
            insideCircumferenceMm: 62.1,
            comfortFit: true,
            dominantHand: 'RIGHT',
            preferredFinger: 'MIDDLE',
          },
          wrists: {
            wristCircumferenceInches: 6.75,
            wristBreadthMm: 60,
            wristThicknessMm: 42,
            cuffGapMm: 28,
            braceletFit: 'COMFORT',
          },
          necklaces: {
            preferredChainLengthInches: 22,
            chainStyle: 'ROPE',
          },
          metals: {
            preferredAlloy: 'STERLING_SILVER_925',
            preferredFinish: 'OXIDIZED_PATINA',
          },
          ringSizeUs: 'US 10',
          ringMandrelMm: 19.8,
          wristCircumferenceInches: 6.75,
          preferredAlloy: 'STERLING_SILVER_925',
          preferredFinish: 'OXIDIZED_PATINA',
        },
      },
      {
        id: 'c0000000-0000-0000-0000-000000000007',
        email: 'vip@example.com',
        fullName: 'Elena Rostova — Guild VIP Patron',
        role: 'MEMBER',
        phone: '+1-212-555-0188',
        jewelleryPreferences: {
          rings: {
            ringSizeUs: 'US 7.5',
            ringMandrelMm: 17.7,
            insideDiameterMm: 17.7,
            insideCircumferenceMm: 55.6,
            comfortFit: true,
            dominantHand: 'LEFT',
            preferredFinger: 'RING',
          },
          wrists: {
            wristCircumferenceInches: 6.0,
            wristBreadthMm: 54,
            wristThicknessMm: 38,
            cuffGapMm: 25,
            braceletFit: 'SNUG',
          },
          necklaces: {
            preferredChainLengthInches: 18,
            chainStyle: 'CABLE',
          },
          metals: {
            preferredAlloy: 'STERLING_SILVER_925',
            preferredFinish: 'HIGH_POLISH',
          },
          ringSizeUs: 'US 7.5',
          ringMandrelMm: 17.7,
          wristCircumferenceInches: 6.0,
          preferredAlloy: 'STERLING_SILVER_925',
          preferredFinish: 'HIGH_POLISH',
        },
      },
    ])
    .onConflictDoUpdate({
      target: usersProfile.id,
      set: {
        email: sql`EXCLUDED.email`,
        fullName: sql`EXCLUDED.full_name`,
        role: sql`EXCLUDED.role`,
        phone: sql`EXCLUDED.phone`,
        jewelleryPreferences: sql`EXCLUDED.jewellery_preferences`,
      },
    });

  // 2. Dynamic Categories (Project 925 Canonical)
  const initialCategories = [
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      slug: 'rings',
      name: 'Rings',
      description: 'Hand-forged and lost-wax cast solid .925 sterling silver rings.',
      sortOrder: 1,
      isActive: true,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000002',
      slug: 'bracelets-cuffs',
      name: 'Bracelets & Cuffs',
      description: 'Solid .925 sterling silver cuffs and articulated link bracelets.',
      sortOrder: 2,
      isActive: true,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000003',
      slug: 'necklaces-pendants',
      name: 'Necklaces & Pendants',
      description: 'Symbolic Kathmandu amulets, talismans, and repoussé pendants.',
      sortOrder: 3,
      isActive: true,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000004',
      slug: 'earrings',
      name: 'Earrings',
      description: 'Sculptural and faceted architectural .925 sterling silver earrings.',
      sortOrder: 4,
      isActive: true,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000005',
      slug: 'chains-links',
      name: 'Chains & Links',
      description: 'Heavy gauge hand-assembled solid silver chains and clasps.',
      sortOrder: 5,
      isActive: true,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000006',
      slug: 'artefacts',
      name: 'Artefacts & Silverware',
      description: 'Rare artisan vessel objects, silver slides, and sacred workshop commissions.',
      sortOrder: 6,
      isActive: true,
    },
  ];

  for (const cat of initialCategories) {
    await db
      .insert(categories)
      .values(cat)
      .onConflictDoUpdate({
        target: categories.id,
        set: {
          slug: cat.slug,
          name: cat.name,
          description: cat.description,
          sortOrder: cat.sortOrder,
          isActive: cat.isActive,
        },
      });
  }

  // 2.5 Metal Stocks (Kathmandu Workshop Sterling Silver Reserve)
  await db
    .insert(metalStocks)
    .values([
      {
        id: 'e0000000-0000-0000-0000-000000000001',
        metalAlloy: 'STERLING_SILVER_925',
        purity: '0.925',
        lotNumber: 'KTM-925-GRAIN-01',
        initialWeightGrams: '10000.00',
        remainingWeightGrams: '10000.00',
        supplier: 'Kathmandu Valley Bullion Guild',
        status: 'ACTIVE',
      },
      {
        id: 'e0000000-0000-0000-0000-000000000002',
        metalAlloy: 'STERLING_SILVER_925',
        purity: '0.925',
        lotNumber: 'KTM-925-INGOT-02',
        initialWeightGrams: '15000.00',
        remainingWeightGrams: '15000.00',
        supplier: 'Kathmandu Valley Bullion Guild',
        status: 'ACTIVE',
      },
    ])
    .onConflictDoNothing();

  // 3. Clean and reset product catalog for idempotent seed
  await db.delete(dropVariants);
  await db.delete(dropProducts);
  await db.delete(orderMadeProducts);
  await db.delete(productVariants);
  await db.delete(productImages);
  await db.delete(products);

  const scheduledDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days in future

  const ringInputSpecifications = {
    ringSize: {
      minSizeUs: 3,
      maxSizeUs: 16,
      defaultSizeUs: 10,
      stepUs: 0.25,
      wideShankOffsetAllowed: true,
    },
    patina: {
      allowedFinishes: [
        {
          code: 'OXIDIZED_CHARCOAL',
          label: 'Oxidized Charcoal Patina',
          description: 'Deep sulfur chemical oxidation recessed in hand-carved relief',
          priceDeltaAmount: 0,
          isDefault: true,
        },
        {
          code: 'BRUSHED_MATTE',
          label: 'Brushed Matte Studio Finish',
          description: 'Tactile satin directional brushing across high silver planes',
          priceDeltaAmount: 0,
        },
        {
          code: 'MIRROR_POLISH',
          label: 'Mirror High Polish',
          description: 'High rouge buffed brilliant reflection',
          priceDeltaAmount: 0,
        },
      ],
    },
    engraving: {
      allowed: true,
      maxCharacters: 20,
      priceDeltaAmount: 0,
    },
    metalPurity: '.925 Sterling Silver',
  };

  const cuffInputSpecifications = {
    wristSize: {
      minCircumferenceInches: 5.5,
      maxCircumferenceInches: 8.5,
      defaultCircumferenceInches: 6.75,
      gapMm: 25,
    },
    patina: {
      allowedFinishes: [
        {
          code: 'OXIDIZED_CHARCOAL',
          label: 'Oxidized Charcoal Patina',
          description: 'Deep sulfur chemical oxidation recessed in hand-carved relief',
          priceDeltaAmount: 0,
          isDefault: true,
        },
        {
          code: 'BRUSHED_MATTE',
          label: 'Brushed Matte Studio Finish',
          description: 'Tactile satin directional brushing across high silver planes',
          priceDeltaAmount: 0,
        },
        {
          code: 'MIRROR_POLISH',
          label: 'Mirror High Polish',
          description: 'High rouge buffed brilliant reflection',
          priceDeltaAmount: 0,
        },
      ],
    },
    engraving: {
      allowed: true,
      maxCharacters: 20,
      priceDeltaAmount: 0,
    },
    metalPurity: '.925 Sterling Silver',
  };

  const necklaceInputSpecifications = {
    chainLength: {
      standardLengthsInches: [18, 20, 22, 24, 26, 28],
      defaultLengthInches: 22,
      allowCustomInches: false,
    },
    patina: {
      allowedFinishes: [
        {
          code: 'OXIDIZED_CHARCOAL',
          label: 'Oxidized Charcoal Patina',
          description: 'Deep sulfur chemical oxidation recessed in hand-carved relief',
          priceDeltaAmount: 0,
          isDefault: true,
        },
        {
          code: 'BRUSHED_MATTE',
          label: 'Brushed Matte Studio Finish',
          description: 'Tactile satin directional brushing across high silver planes',
          priceDeltaAmount: 0,
        },
        {
          code: 'MIRROR_POLISH',
          label: 'Mirror High Polish',
          description: 'High rouge buffed brilliant reflection',
          priceDeltaAmount: 0,
        },
      ],
    },
    engraving: {
      allowed: true,
      maxCharacters: 20,
      priceDeltaAmount: 0,
    },
    metalPurity: '.925 Sterling Silver',
  };

  const chainPriceRules = [
    {
      inputKey: 'chainLengthInches',
      condition: 'GREATER_THAN',
      threshold: 22,
      surchargeAmount: 3000,
      reason: 'Heavy silver bullion surcharge for 24"+ lengths',
    },
  ];

  const allProducts = [
    // --- RINGS ---
    {
      id: 'a0000000-0000-0000-0000-000000000001',
      slug: 'lot-r01-vajra-signet-ring',
      title: 'Lot R01 — Vajra Signet Ring',
      description:
        'Solid .925 sterling silver signet ring with hand-chiseled sacred Vajra thunderbolt emblem. Lost-wax vacuum cast in our Kathmandu workshop.',
      basePriceAmount: 26000,
      basePriceCurrency: 'USD',
      commerceModel: 'OM' as const,
      category: 'rings',
      leadTimeDaysMin: 7,
      leadTimeDaysMax: 14,
      inputSpecifications: ringInputSpecifications,
      priceRules: [],
      status: 'PUBLISHED' as const,
    },
    {
      id: 'a0000000-0000-0000-0000-000000000002',
      slug: 'lot-r02-naga-bone-band',
      title: 'Lot R02 — Naga Serpent Bone Band',
      description:
        'Heavy articulated .925 sterling silver band inspired by Newar mythological serpent architecture. Deep sulfur liver oxidation with polished relief.',
      basePriceAmount: 22000,
      basePriceCurrency: 'USD',
      commerceModel: 'OM' as const,
      category: 'rings',
      leadTimeDaysMin: 7,
      leadTimeDaysMax: 14,
      inputSpecifications: ringInputSpecifications,
      priceRules: [],
      status: 'PUBLISHED' as const,
    },
    {
      id: 'a0000000-0000-0000-0000-000000000003',
      slug: 'lot-r03-patina-skull-band',
      title: 'Lot R03 — Memento Mori Patina Ring',
      description:
        'Substantial 28-gram solid .925 sterling silver skull band. Directional brush finish, blackened recessed crevices. Limited artisan bench commission.',
      basePriceAmount: 29000,
      basePriceCurrency: 'USD',
      commerceModel: 'OM' as const,
      category: 'rings',
      leadTimeDaysMin: 7,
      leadTimeDaysMax: 14,
      inputSpecifications: ringInputSpecifications,
      priceRules: [],
      status: 'PUBLISHED' as const,
    },

    // --- BRACELETS & CUFFS ---
    {
      id: 'a0000000-0000-0000-0000-000000000004',
      slug: 'lot-c01-garuda-heavy-cuff',
      title: 'Lot C01 — Garuda Wing Heavy Cuff',
      description:
        'Open architecture solid .925 sterling silver cuff bracelet featuring hand-carved Garuda plumage motifs. Forged and calibrated by hand in Kathmandu.',
      basePriceAmount: 42000,
      basePriceCurrency: 'USD',
      commerceModel: 'OM' as const,
      category: 'bracelets-cuffs',
      leadTimeDaysMin: 7,
      leadTimeDaysMax: 14,
      inputSpecifications: cuffInputSpecifications,
      priceRules: [],
      status: 'PUBLISHED' as const,
    },
    {
      id: 'a0000000-0000-0000-0000-000000000005',
      slug: 'lot-c02-hammered-torque-cuff',
      title: 'Lot C02 — Hand-Hammered Torque Cuff',
      description:
        'Raw mechanical torque cuff forged from 8mm square .925 silver stock. Mirror beveled terminals with anvil-hammered texture along the spine.',
      basePriceAmount: 34000,
      basePriceCurrency: 'USD',
      commerceModel: 'OM' as const,
      category: 'bracelets-cuffs',
      leadTimeDaysMin: 7,
      leadTimeDaysMax: 14,
      inputSpecifications: cuffInputSpecifications,
      priceRules: [],
      status: 'PUBLISHED' as const,
    },

    // --- NECKLACES & PENDANTS ---
    {
      id: 'a0000000-0000-0000-0000-000000000006',
      slug: 'lot-n01-dorje-amulet-pendant',
      title: 'Lot N01 — Dorje Protector Amulet Pendant',
      description:
        'Sacred ritual Dorje lost-wax cast in pure .925 sterling silver. Includes oxidized sterling silver wheat link chain with custom S-clasp.',
      basePriceAmount: 31000,
      basePriceCurrency: 'USD',
      commerceModel: 'OM' as const,
      category: 'necklaces-pendants',
      leadTimeDaysMin: 7,
      leadTimeDaysMax: 14,
      inputSpecifications: necklaceInputSpecifications,
      priceRules: chainPriceRules,
      status: 'PUBLISHED' as const,
    },
    {
      id: 'a0000000-0000-0000-0000-000000000007',
      slug: 'lot-n02-lotus-seal-medallion',
      title: 'Lot N02 — Repoussé Lotus Seal Medallion',
      description:
        'Double-sided high-relief Kathmandu repoussé medallion in hallmarked .925 silver. Scheduled artisan drop.',
      basePriceAmount: 28000,
      basePriceCurrency: 'USD',
      commerceModel: 'OM' as const,
      category: 'necklaces-pendants',
      leadTimeDaysMin: 7,
      leadTimeDaysMax: 14,
      inputSpecifications: necklaceInputSpecifications,
      priceRules: chainPriceRules,
      status: 'SCHEDULED' as const,
      publishAt: scheduledDate,
    },

    // --- EARRINGS (DROP) ---
    {
      id: 'a0000000-0000-0000-0000-000000000008',
      slug: 'lot-e01-architectural-silver-hoops',
      title: 'Lot E01 — Faceted Architectural Hoops',
      description:
        'Pair of sculpted geometric clicker hoops in satin-brushed .925 sterling silver. Engineered with hidden tension hinge mechanics.',
      basePriceAmount: 19000,
      basePriceCurrency: 'USD',
      commerceModel: 'DROP' as const,
      category: 'earrings',
      leadTimeDaysMin: 1,
      leadTimeDaysMax: 2,
      inputSpecifications: null,
      priceRules: [],
      status: 'PUBLISHED' as const,
    },

    // --- CHAINS & LINKS ---
    {
      id: 'a0000000-0000-0000-0000-000000000009',
      slug: 'lot-ch01-heavy-anchor-chain',
      title: 'Lot CH01 — Hand-Assembled Heavy Anchor Chain',
      description:
        'Over 110 grams of solid .925 sterling silver. Individually sawed, soldered, and hand-filed nautical anchor links with hand-turned swivel clip.',
      basePriceAmount: 48000,
      basePriceCurrency: 'USD',
      commerceModel: 'OM' as const,
      category: 'chains-links',
      leadTimeDaysMin: 7,
      leadTimeDaysMax: 14,
      inputSpecifications: necklaceInputSpecifications,
      priceRules: chainPriceRules,
      status: 'PUBLISHED' as const,
    },

    // --- ARTEFACTS (DROP) ---
    {
      id: 'a0000000-0000-0000-0000-000000000010',
      slug: 'lot-a01-ritual-silver-chalice',
      title: 'Lot A01 — Solid Silver Ritual Vessel Chalice',
      description:
        'Masterwork ceremonial vessel hand-raised from pure .925 sterling silver sheet by Kathmandu valley silversmiths. Archive drop edition.',
      basePriceAmount: 75000,
      basePriceCurrency: 'USD',
      commerceModel: 'DROP' as const,
      category: 'artefacts',
      leadTimeDaysMin: 1,
      leadTimeDaysMax: 2,
      inputSpecifications: null,
      priceRules: [],
      status: 'PUBLISHED' as const,
    },
  ];

  for (const product of allProducts) {
    await db
      .insert(products)
      .values({
        id: product.id,
        slug: product.slug,
        title: product.title,
        description: product.description,
        basePriceAmount: product.basePriceAmount,
        basePriceCurrency: product.basePriceCurrency,
        commerceModel: product.commerceModel,
        category: product.category,
        status: product.status,
        publishAt: 'publishAt' in product ? (product as { publishAt?: Date }).publishAt : null,
        leadTimeDaysMin: product.leadTimeDaysMin,
        leadTimeDaysMax: product.leadTimeDaysMax,
        inputSpecifications: product.inputSpecifications,
        priceRules: product.priceRules,
      })
      .onConflictDoUpdate({
        target: products.id,
        set: {
          slug: product.slug,
          title: product.title,
          description: product.description,
          basePriceAmount: product.basePriceAmount,
          basePriceCurrency: product.basePriceCurrency,
          commerceModel: product.commerceModel,
          category: product.category,
          status: product.status,
          publishAt: 'publishAt' in product ? (product as { publishAt?: Date }).publishAt : null,
          leadTimeDaysMin: product.leadTimeDaysMin,
          leadTimeDaysMax: product.leadTimeDaysMax,
          inputSpecifications: product.inputSpecifications,
          priceRules: product.priceRules,
        },
      });
  }

  // 3.5 Single Primary Product Image
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  const storageMediaUrl = `${supabaseUrl}/storage/v1/object/public/product-media`;

  const productImagesList = allProducts.map((p) => ({
    productId: p.id,
    url: `${storageMediaUrl}/products/${p.slug}/primary.png`,
    altText: `${p.title} — Handcrafted Kathmandu Workshop .925 Silver View`,
    position: 0,
    isPrimary: true,
    width: 600,
    height: 600,
  }));

  await db.insert(productImages).values(productImagesList);

  // 4. Atelier Settings (Admin-Controllable Thresholds)
  await db
    .insert(atelierSettings)
    .values([
      {
        key: 'member_om_order_threshold',
        value: 2,
        description: 'Completed OM orders required for Member drop access',
      },
    ])
    .onConflictDoNothing();

  // 6. Order-Made Products & Drop Inventory Architecture (JN-053)
  logger.info('Seeding Order-Made custom specification models and Drop batch inventories...');

  // 6.1 Order-Made Products (Continuous inputs, bench crafted, zero pre-cast variants)
  const omProductsList = allProducts.filter((p) => p.commerceModel === 'OM');
  for (const p of omProductsList) {
    await db
      .insert(orderMadeProducts)
      .values({
        id: p.id,
        productId: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        basePriceAmount: p.basePriceAmount,
        basePriceCurrency: p.basePriceCurrency,
        category: p.category,
        leadTimeDaysMin: p.leadTimeDaysMin ?? 7,
        leadTimeDaysMax: p.leadTimeDaysMax ?? 14,
        inputSpecifications: p.inputSpecifications as Record<string, unknown>,
        priceRules: (p.priceRules ?? []) as Array<Record<string, unknown>>,
        status: p.status,
      })
      .onConflictDoNothing();
  }

  // 6.2 Drop Products (Limited pre-manufactured batches)
  await db
    .insert(dropProducts)
    .values([
      {
        id: 'd0000000-0000-0000-0000-000000000008',
        productId: 'a0000000-0000-0000-0000-000000000008',
        slug: 'lot-e01-architectural-silver-hoops',
        title: 'Lot E01 — Faceted Architectural Hoops',
        description:
          'Pair of sculpted geometric clicker hoops in satin-brushed .925 sterling silver.',
        basePriceAmount: 19000,
        basePriceCurrency: 'USD',
        category: 'earrings',
        dropBatchNumber: 1,
        totalBatchQuantity: 25,
        status: 'PUBLISHED',
      },
      {
        id: 'd0000000-0000-0000-0000-000000000010',
        productId: 'a0000000-0000-0000-0000-000000000010',
        slug: 'lot-a01-ritual-silver-chalice',
        title: 'Lot A01 — Solid Silver Ritual Vessel Chalice',
        description:
          'Masterwork ceremonial vessel hand-raised from pure .925 sterling silver sheet by Kathmandu valley silversmiths.',
        basePriceAmount: 75000,
        basePriceCurrency: 'USD',
        category: 'artefacts',
        dropBatchNumber: 1,
        totalBatchQuantity: 5,
        status: 'PUBLISHED',
      },
    ])
    .onConflictDoNothing();

  // 6.3 Drop Variants (Discrete stock counters in vault)
  await db
    .insert(dropVariants)
    .values([
      {
        id: 'd1000000-0000-0000-0000-000000000001',
        dropProductId: 'd0000000-0000-0000-0000-000000000008',
        sku: 'P925-DROP-E01-18MM-SAT',
        attributes: { finish: 'satin_matte', hoop_diameter: '18mm' },
        additionalPriceAmount: 0,
        additionalPriceCurrency: 'USD',
        inventoryCount: 8,
        status: 'AVAILABLE',
      },
      {
        id: 'd1000000-0000-0000-0000-000000000002',
        dropProductId: 'd0000000-0000-0000-0000-000000000008',
        sku: 'P925-DROP-E01-24MM-SAT',
        attributes: { finish: 'satin_matte', hoop_diameter: '24mm' },
        additionalPriceAmount: 3000,
        additionalPriceCurrency: 'USD',
        inventoryCount: 4,
        status: 'AVAILABLE',
      },
      {
        id: 'd1000000-0000-0000-0000-000000000003',
        dropProductId: 'd0000000-0000-0000-0000-000000000010',
        sku: 'P925-DROP-A01-RELIEF',
        attributes: { finish: 'chiseled_relief' },
        additionalPriceAmount: 0,
        additionalPriceCurrency: 'USD',
        inventoryCount: 2,
        status: 'AVAILABLE',
      },
    ])
    .onConflictDoNothing();

  // 6.4 Limited Compatibility Product Variants (for DROP items only)
  await db
    .insert(productVariants)
    .values([
      {
        id: 'b0000000-0000-0000-0000-000000000041',
        productId: 'a0000000-0000-0000-0000-000000000008',
        sku: 'P925-E01-18MM-SAT',
        options: { hoop_diameter: 'dia_18mm', finish: 'satin_matte' },
        additionalPriceAmount: 0,
        inventoryCount: 8,
        status: 'AVAILABLE',
      },
      {
        id: 'b0000000-0000-0000-0000-000000000042',
        productId: 'a0000000-0000-0000-0000-000000000008',
        sku: 'P925-E01-24MM-SAT',
        options: { hoop_diameter: 'dia_24mm', finish: 'satin_matte' },
        additionalPriceAmount: 3000,
        inventoryCount: 4,
        status: 'AVAILABLE',
      },
      {
        id: 'b0000000-0000-0000-0000-000000000062',
        productId: 'a0000000-0000-0000-0000-000000000010',
        sku: 'P925-A01-REL',
        options: { finish: 'chiseled_relief' },
        additionalPriceAmount: 0,
        inventoryCount: 2,
        status: 'AVAILABLE',
      },
    ])
    .onConflictDoNothing();

  // 7. Editorial Content Pages (Kathmandu Workshop Only)
  await db
    .insert(contentPages)
    .values([
      {
        id: '10000000-0000-0000-0000-000000000001',
        slug: 'about',
        title: 'Project 925 — The Kathmandu Silver Atelier',
        contentMarkdown: `# Project 925: Ancient Metalsmithing in the Kathmandu Valley

Project 925 is a single-craft artisan atelier based exclusively in Kathmandu, Nepal. We work in exactly one medium: hallmarked .925 sterling silver, hand-cast and hand-forged through generations of Newar lost-wax and repoussé traditions.

## Chapter 01 · The Kathmandu Silversmithing Bench
Deep in Kathmandu, our metalsmiths melt, pour, chase, and polish raw .925 sterling silver. There is no automated assembly line or flash electroplating: one artisan guides each ring, cuff, or pendant from raw wax carving to final bench hallmark.

Our silver is deliberately alive. We reject rhodium synthetic coatings so each piece breathes, oxidizes, and develops an intensely personal dark charcoal patina unique to its wearer.

## Chapter 02 · The Order-Made (OM) Protocol
1. **Commission Lock:** Your sizing specifications (ring mandrel mm, wrist gap, or chain drape) are confirmed directly with our silversmiths.
2. **Lost-Wax Investment & Pour:** A custom wax model is sculpted, invested, and cast in liquid .925 silver inside our vacuum casting furnace. **Casting is our Point of No Return.**
3. **Chiseling & Hand Patina:** The piece is cleaned, filed, hand-textured, and treated with mineral sulfur bath before receiving its final satin relief brush.
4. **Customs & Dispatch:** Hallmarked with the Kathmandu workshop stamp, certified with Nepal Customs HS Code 7113.11.0000, and dispatched via Tribhuvan International Airport (TIA-KTM).`,
        metaDescription:
          'Origins of Project 925, our Kathmandu silversmithing bench, lost-wax casting, and Order-Made artisan jewellery.',
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        id: '10000000-0000-0000-0000-000000000003',
        slug: 'sizing',
        title: 'Project 925 Precision Sizing Studio',
        contentMarkdown: `# Master Mandrel & Sizing Guide

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
- **24-inch (60cm):** Rests mid-chest; standard for heavy talismans and Dorje amulets.`,
        metaDescription:
          'Comprehensive guide to measuring solid .925 sterling silver rings, cuff wrist breadth, and chain drape lengths.',
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        id: '10000000-0000-0000-0000-000000000004',
        slug: 'guide',
        title: 'Project 925 Craft & Care Guide',
        contentMarkdown: `# Sterling Silver Maintenance & Patina Cultivation

True solid .925 sterling silver improves with wear. Here are the atelier rituals for cultivating and caring for your pieces.

## Silver Oxidation & Natural Patina
Solid .925 sterling silver naturally reacts with oxygen and ambient sulfur in the air:
- **Depth in Recesses:** We deliberately encourage the accumulation of deep shadows in sculpted crevices while raised surfaces stay radiant through natural skin contact.
- **Avoid Chemical Dips:** Liquid chemical silver dips destroy deliberate atelier oxidation. Never submerge your piece in commercial silver dip.
- **Atelier Polishing:** Use the untreated dense cotton cloth included in your canvas pouch across high-relief surfaces only.`,
        metaDescription:
          'Essential rituals for preserving, polishing, and cultivating natural oxidized patina on .925 sterling silver.',
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        id: '10000000-0000-0000-0000-000000000005',
        slug: 'contact',
        title: 'Kathmandu Workshop Concierge & Atelier Inquiries',
        contentMarkdown: `# Studio Consultations & Inquiries

Direct communication with our silversmiths and workshop staff in Kathmandu. We respond to sizing inquiries, custom commissions, and workshop visits within 24 business hours.

### Workshop Location
- **Kathmandu Silversmithing & Lost-Wax Atelier:** Kathmandu Workshop, Nepal (Mon–Fri: 10:00 – 18:00 NPT)

### Direct Digital Channels
- **General & Sizing Inquiries:** concierge@project925.co
- **Bespoke Commissions:** bespoke@project925.co
- **Repairs & Restorations:** workshop@project925.co`,
        metaDescription:
          'Contact the Project 925 master silversmiths and atelier concierge in Kathmandu for bespoke inquiries.',
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        id: '10000000-0000-0000-0000-000000000006',
        slug: 'returns',
        title: 'Bespoke Metalsmithing Policy & Covenant',
        contentMarkdown: `# Returns, Adjustments & Lifetime Craft Covenant

Because every Order-Made (OM) commission is individually cast from liquid .925 silver to your exact mandrel measurements, custom pieces cannot be returned for change of mind once pouring begins. We stand behind our metalsmithing with a lifetime covenant.

## The Atelier Guarantee
- **Complimentary Sizing Tuning:** Every custom ring includes one complimentary resizing (+/- 1 US size) within 60 days of delivery.
- **Lifetime Ultrasonic Cleansing & Refinishing:** Return your piece anytime for professional workshop cleaning and surface repolishing.
- **Structural Integrity:** If a weld, link, or bezel fails under ordinary wear, our Kathmandu workshop will repair it free of charge.`,
        metaDescription:
          'Details on our Order-Made jewellery covenant, sizing adjustments, and lifetime craft warranty.',
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        id: '10000000-0000-0000-0000-000000000007',
        slug: 'terms',
        title: 'Terms of Service & Atelier Contract',
        contentMarkdown: `# Commercial Terms & Commission Covenant

By placing an Order-Made or Limited Drop commission with Project 925, you agree to the craft covenants outlined herein.

## 1. Bespoke Manufacturing Timeline
Order-Made commissions require 10 to 18 business days of bench assembly prior to dispatch.

## 2. Point of No Return
Once molten .925 sterling silver is poured into the investment mold at the CASTING stage, the commission is locked and non-refundable.

## 3. Customs & Export Compliance
All pieces are crafted in Nepal and exported under Nepal Customs HS Code 7113.11.0000 from Tribhuvan International Airport (TIA-KTM). Deliveries may be subject to local import inspection in the destination country.`,
        metaDescription:
          'Official commercial terms, metalsmithing timelines, and export protocols for Project 925 clients.',
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        id: '10000000-0000-0000-0000-000000000008',
        slug: 'privacy',
        title: 'Atelier Vault Privacy & Security Policy',
        contentMarkdown: `# Atelier Vault Privacy & Sizing Security

Your anatomical measurements and sizing specifications belong strictly to you.

## 1. Vault Sizing Security
Sizing specifications stored in your Atelier Vault (mandrels, wrist breadth, drape) are encrypted and used solely to calibrate casting trees and mandrels during production. We never sell or transfer personal data.

## 2. Zero Trackers
Our storefront operates without third-party advertising trackers. Analytics are privacy-respecting and self-hosted.`,
        metaDescription:
          'Our commitment to protecting your sizing measurements, privacy, and personal data.',
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
      },
    ])
    .onConflictDoUpdate({
      target: contentPages.slug,
      set: {
        slug: sql`EXCLUDED.slug`,
        title: sql`EXCLUDED.title`,
        contentMarkdown: sql`EXCLUDED.content_markdown`,
        metaDescription: sql`EXCLUDED.meta_description`,
        status: sql`EXCLUDED.status`,
        isPublished: sql`EXCLUDED.is_published`,
        publishedAt: sql`EXCLUDED.published_at`,
        updatedAt: sql`NOW()`,
      },
    });

  // 8. Announcements
  await db
    .insert(announcements)
    .values([
      {
        id: '20000000-0000-0000-0000-000000000001',
        title: 'Project 925 Kathmandu Atelier Drop',
        message:
          'Handcrafted .925 sterling silver rings, heavy cuffs, and sacred Kathmandu amulets now shipping worldwide via TIA Express.',
        type: 'PROMO',
        startDate: new Date(),
        priority: 10,
      },
      {
        id: '20000000-0000-0000-0000-000000000002',
        title: 'Kathmandu Silversmithing Bench Queue',
        message:
          'Bespoke lost-wax casting queue operating at 10–14 business days. Every piece is individually poured and hand-finished.',
        type: 'INFO',
        startDate: new Date(),
        priority: 5,
      },
    ])
    .onConflictDoNothing();

  logger.info('Project 925 database seeded successfully.');
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('seed.ts')) {
  runDatabaseSeed()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('SEED ERROR DETAILS:', err);
      process.exit(1);
    });
}
