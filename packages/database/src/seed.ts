import { db } from './client';
import {
  usersProfile,
  fabricBolts,
  metalStocks,
  products,
  productOptions,
  optionValues,
  productVariants,
  contentPages,
  announcements,
} from './schema/index';

export async function runDatabaseSeed() {
  console.log('Seeding Jeanius database...');

  // 1. Users
  await db
    .insert(usersProfile)
    .values([
      {
        id: 'c0000000-0000-0000-0000-000000000001',
        email: 'admin@jeanius.co',
        fullName: 'Jeanius & Jewl Atelier Admin',
        role: 'ADMIN',
        phone: '+977-1-4200001',
      },
      {
        id: 'c0000000-0000-0000-0000-000000000002',
        email: 'mastercutter@jeanius.co',
        fullName: 'Pasang Master Cutter (Denim)',
        role: 'TAILOR',
        phone: '+977-9800000002',
      },
      {
        id: 'c0000000-0000-0000-0000-000000000003',
        email: 'metalsmith@jeanius.co',
        fullName: 'Bikash Master Jeweller (Metalsmith)',
        role: 'TAILOR',
        phone: '+977-9800000003',
      },
    ])
    .onConflictDoNothing();

  // 2. Fabric Bolts
  await db
    .insert(fabricBolts)
    .values([
      {
        id: 'd0000000-0000-0000-0000-000000000001',
        millName: 'Kurabo Mills Japan',
        fabricCode: 'KB-14-RAW',
        weightOz: '14.00',
        initialLengthYards: '100.00',
        remainingLengthYards: '100.00',
        status: 'ACTIVE',
      },
      {
        id: 'd0000000-0000-0000-0000-000000000002',
        millName: 'Kuroki Mills Japan',
        fabricCode: 'KK-155-IND',
        weightOz: '15.50',
        initialLengthYards: '85.00',
        remainingLengthYards: '85.00',
        status: 'ACTIVE',
      },
    ])
    .onConflictDoNothing();

  // 2.5 Metal Stocks
  await db
    .insert(metalStocks)
    .values([
      {
        id: 'ms000000-0000-0000-0000-000000000001',
        metalAlloy: 'STERLING_SILVER_925',
        purity: '0.925',
        lotNumber: 'MS-AG-01',
        initialWeightGrams: '5000.00',
        remainingWeightGrams: '5000.00',
        supplier: 'Rio Grande',
        status: 'ACTIVE',
      },
      {
        id: 'ms000000-0000-0000-0000-000000000002',
        metalAlloy: 'SOLID_BRASS',
        purity: '1.000',
        lotNumber: 'MS-BR-01',
        initialWeightGrams: '10000.00',
        remainingWeightGrams: '10000.00',
        supplier: 'Rio Grande',
        status: 'ACTIVE',
      },
    ])
    .onConflictDoNothing();

  // 3. Products
  await db
    .insert(products)
    .values([
      {
        id: 'a0000000-0000-0000-0000-000000000001',
        slug: 'lot-001-straight-selvedge',
        title: 'Lot 001 — Straight Selvedge Raw Denim',
        description:
          '14oz Japanese Kurabo raw selvedge denim. Hand-cut and crafted in our Kathmandu workshop.',
        basePriceAmount: 28000,
        basePriceCurrency: 'USD',
        commerceModel: 'OM',
        category: 'BOTTOMS',
        status: 'PUBLISHED',
      },
      {
        id: 'a0000000-0000-0000-0000-000000000002',
        slug: 'lot-002-slim-tapered-deep-indigo',
        title: 'Lot 002 — Slim Tapered Deep Indigo Selvedge',
        description: '15.5oz Kuroki Mills heavyweight selvedge denim. Tailored slim tapered cut.',
        basePriceAmount: 31000,
        basePriceCurrency: 'USD',
        commerceModel: 'DROP',
        category: 'BOTTOMS',
        status: 'PUBLISHED',
      },
      {
        id: 'a0000000-0000-0000-0000-000000000003',
        slug: 'lot-j01-sterling-signet-ring',
        title: 'Lot J01 — .925 Sterling Silver Signet Ring',
        description:
          'Solid .925 sterling silver signet ring with hand-chiseled crest. Made to order at our Kathmandu jewellery bench.',
        basePriceAmount: 22000,
        basePriceCurrency: 'USD',
        commerceModel: 'OM',
        category: 'JEWELLERY',
        status: 'PUBLISHED',
      },
      {
        id: 'a0000000-0000-0000-0000-000000000004',
        slug: 'lot-j02-forged-brass-cuff',
        title: 'Lot J02 — Hand-Forged Solid Brass Cuff',
        description:
          'Heavy solid brass cuff bracelet hand-hammered and heat-tempered with raw vintage patina.',
        basePriceAmount: 18000,
        basePriceCurrency: 'USD',
        commerceModel: 'DROP',
        category: 'JEWELLERY',
        status: 'PUBLISHED',
      },
      {
        id: 'a0000000-0000-0000-0000-000000000005',
        slug: 'lot-j03-curb-denim-wallet-chain',
        title: 'Lot J03 — Heavy Curb Denim Wallet Chain',
        description:
          'Solid sterling silver curb chain with hand-carved swivel clip engineered specifically for raw denim belt loops.',
        basePriceAmount: 38000,
        basePriceCurrency: 'USD',
        commerceModel: 'OM',
        category: 'JEWELLERY',
        status: 'PUBLISHED',
      },
    ])
    .onConflictDoNothing();

  // 4. Options
  await db
    .insert(productOptions)
    .values([
      {
        id: 'e0000000-0000-0000-0000-000000000001',
        productId: 'a0000000-0000-0000-0000-000000000001',
        name: 'Waist Size',
        code: 'waist',
        position: 1,
        isRequired: true,
      },
      {
        id: 'e0000000-0000-0000-0000-000000000002',
        productId: 'a0000000-0000-0000-0000-000000000001',
        name: 'Inseam Length',
        code: 'inseam',
        position: 2,
        isRequired: true,
      },
      {
        id: 'e0000000-0000-0000-0000-000000000003',
        productId: 'a0000000-0000-0000-0000-000000000003',
        name: 'Ring Size',
        code: 'ring_size',
        position: 1,
        isRequired: true,
      },
      {
        id: 'e0000000-0000-0000-0000-000000000004',
        productId: 'a0000000-0000-0000-0000-000000000003',
        name: 'Finish',
        code: 'finish',
        position: 2,
        isRequired: true,
      },
    ])
    .onConflictDoNothing();

  // 5. Option Values
  await db
    .insert(optionValues)
    .values([
      {
        id: 'f0000000-0000-0000-0000-000000000001',
        optionId: 'e0000000-0000-0000-0000-000000000001',
        code: '30',
        label: '30"',
        priceDeltaAmount: 0,
        position: 1,
      },
      {
        id: 'f0000000-0000-0000-0000-000000000002',
        optionId: 'e0000000-0000-0000-0000-000000000001',
        code: '32',
        label: '32"',
        priceDeltaAmount: 0,
        position: 2,
      },
      {
        id: 'f0000000-0000-0000-0000-000000000003',
        optionId: 'e0000000-0000-0000-0000-000000000002',
        code: '32',
        label: '32"',
        priceDeltaAmount: 0,
        position: 1,
      },
      {
        id: 'f0000000-0000-0000-0000-000000000004',
        optionId: 'e0000000-0000-0000-0000-000000000003',
        code: 'US8',
        label: 'US 8 (18.1mm)',
        priceDeltaAmount: 0,
        position: 1,
      },
      {
        id: 'f0000000-0000-0000-0000-000000000005',
        optionId: 'e0000000-0000-0000-0000-000000000003',
        code: 'US10',
        label: 'US 10 (19.8mm)',
        priceDeltaAmount: 0,
        position: 2,
      },
      {
        id: 'f0000000-0000-0000-0000-000000000006',
        optionId: 'e0000000-0000-0000-0000-000000000004',
        code: 'OXIDIZED',
        label: 'Oxidized Vintage Patina',
        priceDeltaAmount: 0,
        position: 1,
      },
      {
        id: 'f0000000-0000-0000-0000-000000000007',
        optionId: 'e0000000-0000-0000-0000-000000000004',
        code: 'HIGH_POLISH',
        label: 'High Mirror Polish',
        priceDeltaAmount: 1500,
        position: 2,
      },
    ])
    .onConflictDoNothing();

  // 6. Variants
  await db
    .insert(productVariants)
    .values([
      {
        id: 'b0000000-0000-0000-0000-000000000001',
        productId: 'a0000000-0000-0000-0000-000000000001',
        sku: 'LOT001-RAW-30-32',
        options: { waist: '30', inseam: '32' },
        additionalPriceAmount: 0,
        inventoryCount: 15,
        status: 'AVAILABLE',
      },
      {
        id: 'b0000000-0000-0000-0000-000000000002',
        productId: 'a0000000-0000-0000-0000-000000000001',
        sku: 'LOT001-RAW-32-32',
        options: { waist: '32', inseam: '32' },
        additionalPriceAmount: 0,
        inventoryCount: 20,
        status: 'AVAILABLE',
      },
      {
        id: 'b0000000-0000-0000-0000-000000000003',
        productId: 'a0000000-0000-0000-0000-000000000003',
        sku: 'LOTJ01-SILVER-US8-OXIDIZED',
        options: { ring_size: 'US8', finish: 'OXIDIZED' },
        additionalPriceAmount: 0,
        inventoryCount: 10,
        status: 'AVAILABLE',
      },
      {
        id: 'b0000000-0000-0000-0000-000000000004',
        productId: 'a0000000-0000-0000-0000-000000000003',
        sku: 'LOTJ01-SILVER-US10-OXIDIZED',
        options: { ring_size: 'US10', finish: 'OXIDIZED' },
        additionalPriceAmount: 0,
        inventoryCount: 10,
        status: 'AVAILABLE',
      },
    ])
    .onConflictDoNothing();

  // 7. Content
  await db
    .insert(contentPages)
    .values([
      {
        id: '10000000-0000-0000-0000-000000000001',
        slug: 'kathmandu-atelier',
        title: 'Inside the Jeanius & Jewl Atelier',
        contentMarkdown:
          '# Handcrafted in the Himalayas\n\nEvery piece at Jeanius & Jewl—from raw selvedge jeans to hand-cast sterling silver signet rings—is crafted by master artisans in our Kathmandu atelier.',
        metaDescription: 'Explore handmade raw denim and artisan jewellery in Kathmandu.',
        isPublished: true,
      },
    ])
    .onConflictDoNothing();

  // 8. Announcements
  await db
    .insert(announcements)
    .values([
      {
        id: '20000000-0000-0000-0000-000000000001',
        title: 'Lot 002 & Lot J01 Capsule Drop',
        message:
          'Limited runs of raw selvedge denim and hand-forged sterling silver available worldwide.',
        type: 'PROMO',
        startDate: new Date(),
        priority: 10,
      },
    ])
    .onConflictDoNothing();

  console.log('Database seeded successfully.');
}
