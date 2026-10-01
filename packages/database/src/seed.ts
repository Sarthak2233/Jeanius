import { db } from './client';
import {
  usersProfile,
  fabricBolts,
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
        fullName: 'Jeanius Workshop Admin',
        role: 'ADMIN',
        phone: '+977-1-4200001',
      },
      {
        id: 'c0000000-0000-0000-0000-000000000002',
        email: 'mastercutter@jeanius.co',
        fullName: 'Pasang Master Cutter',
        role: 'TAILOR',
        phone: '+977-9800000002',
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
    ])
    .onConflictDoNothing();

  // 7. Content
  await db
    .insert(contentPages)
    .values([
      {
        id: '10000000-0000-0000-0000-000000000001',
        slug: 'kathmandu-workshop',
        title: 'Inside the Kathmandu Workshop',
        contentMarkdown:
          '# Handcrafted in the Himalayas\n\nEvery pair of Jeanius selvedge jeans is cut and sewn by hand.',
        metaDescription: 'Explore artisan craftsmanship in Kathmandu.',
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
        title: 'Lot 002 Capsule Drop',
        message: 'Limited run of 45 pairs available worldwide.',
        type: 'PROMO',
        startDate: new Date(),
        priority: 10,
      },
    ])
    .onConflictDoNothing();

  console.log('Database seeded successfully.');
}
