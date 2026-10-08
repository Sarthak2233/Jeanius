import { sql } from 'drizzle-orm';
import { createLogger } from '@jeanius/observability';
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

const logger = createLogger('database:seed');

export async function runDatabaseSeed() {
  logger.info('Seeding Jeanius database...');

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
        role: 'JEWELLER',
        phone: '+977-9800000003',
      },
      {
        id: 'c0000000-0000-0000-0000-000000000004',
        email: 'logistics@jeanius.co',
        fullName: 'Kiran Fulfillment Lead',
        role: 'FULFILLMENT',
        phone: '+977-9800000004',
      },
      {
        id: 'c0000000-0000-0000-0000-000000000005',
        email: 'care@jeanius.co',
        fullName: 'Sita Customer Care Lead',
        role: 'SUPPORT',
        phone: '+977-9800000005',
      },
      {
        id: 'c0000000-0000-0000-0000-000000000006',
        email: 'shopper@example.com',
        fullName: 'Alex Raw Denim Collector',
        role: 'CUSTOMER',
        phone: '+1-415-555-0199',
      },
      {
        id: 'c0000000-0000-0000-0000-000000000007',
        email: 'vip@example.com',
        fullName: 'Elena VIP Atelier Patron',
        role: 'MEMBER',
        phone: '+1-212-555-0188',
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
        id: 'e0000000-0000-0000-0000-000000000001',
        metalAlloy: 'STERLING_SILVER_925',
        purity: '0.925',
        lotNumber: 'MS-AG-01',
        initialWeightGrams: '5000.00',
        remainingWeightGrams: '5000.00',
        supplier: 'Rio Grande',
        status: 'ACTIVE',
      },
      {
        id: 'e0000000-0000-0000-0000-000000000002',
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
        contentMarkdown: `# Handcrafted in the Himalayas

Every piece at Jeanius & Jewl—from raw selvedge jeans to hand-cast sterling silver signet rings—is crafted by master artisans in our Kathmandu atelier.

### The Sacred Rhythm of the Loom & Forge
In the heart of Kathmandu, our artisans merge time-honoured Himalayan metalcraft with Japanese vintage denim tailoring. We do not mass-produce; we build heirloom garments and talismanic silver designed to wear in, develop character, and last generations.`,
        metaDescription:
          'Explore handmade raw denim and artisan jewellery crafted in Kathmandu, Nepal.',
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        id: '10000000-0000-0000-0000-000000000002',
        slug: 'about',
        title: 'About Jeanius & Jewl Atelier',
        contentMarkdown: `# Origins & Operational Protocol

Founded on the uncompromising intersection of heritage denim tailoring and artisanal silversmithing, Jeanius & Jewl operates as an independent craft house between Kathmandu and Seoul.

## Chapter 01 · Kathmandu Denim Bench
In Kathmandu, our master tailors operate rare vintage Union Special 43200G chainstitch machines. Every raw denim garment is hand-chalked and cut from verified Japanese Kurabo and Kuroki selvedge bolts. There is no automated assembly line: one tailor cuts, stitches, and finishes the garment from initial bolt roll to final buttonhole.

Because raw denim contracts on its initial soak, our patterns incorporate calculated warp shrinkage ratios (+3%). Each client receives a piece dialed to their exact anatomical measurements.

## Chapter 02 · Himalayan Jewellery Workbench
At our jewellery bench, silversmiths hand-carve ring models in wax before lost-wax vacuum casting in solid 925 sterling silver. From heavy signet rings to hand-turned denim shank buttons and key carabiners, every piece is stamped with the studio hallmark and hand-finished with directional satin brushing.

We reject rhodium flash plating: our silver is meant to breathe, oxidise, and accumulate the unique patina of its wearer alongside fading indigo selvedge.

## Chapter 03 · The Order-Made (OM) Protocol
1. **Confirmation & Lock:** Within 24 hours of checkout, your tailoring measurements are reviewed by our cutters before the bolt is allocated.
2. **14–21 Day Assembly:** Garments are cut along the warp grain, sewn with cotton-poly core threads, and riveted with solid silver hardware.
3. **Calipers & Dispatch:** Final quality calipers verify measurements before packing in ecru canvas and dispatching worldwide via DHL Express.`,
        metaDescription:
          'Origins of Jeanius & Jewl, our Kathmandu denim cutting tables, silversmithing bench, and Order-Made philosophy.',
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        id: '10000000-0000-0000-0000-000000000003',
        slug: 'sizing',
        title: 'Precision Sizing & Shrinkage Studio',
        contentMarkdown: `# Master Fitting & Measurement Guide

Because our denim is unsanforized or lightly starched raw Japanese selvedge and our jewellery is cast in solid 925 sterling silver, precise anatomical measurements ensure an immaculate fit for life.

## Part 01 · Raw Denim Tailoring
Raw selvedge denim does not behave like mass-market stretch jeans. It has zero elastane and forms to your body over hundreds of hours of wear.

### Two Ways to Measure:
1. **Laid-Flat Method (Recommended):** Take your best-fitting pair of non-stretch jeans, button them completely, lay them flat on a hard table, and measure straight across (Points A through Q).
2. **Body Anatomical Method:** Using a flexible tailor's tape, measure directly against the body without pulling tight.

### Loomstate Shrinkage & Ease Allowances
- **Unsanforized (Loomstate):** Shrinks approximately 3% in warp length on the first warm soak. Our cutting engine automatically adds +3% to your inseam length.
- **Thigh Ease:** Maintain at least +0.75" to +1.0" ease over your raw thigh circumference to allow comfortable sitting.
- **Waistband Anchor:** Men typically anchor waistbands at the pelvic rim, while women's high-rise cuts anchor at the natural waist (narrowest rib point) to prevent gap.

## Part 02 · Solid 925 Jewellery Mandrel
Ring sizes must accommodate your knuckle. Measure during afternoon hours when finger volume is baseline.
- **Wide Shank Compensation:** For rings with shank width 8mm or wider (e.g. Lot J01 Signet), add +0.5 US size to avoid constriction.
- **Comfort Fit:** Rounded inner bands slide over knuckles smoothly; standard flat bands fit tighter.`,
        metaDescription:
          'Comprehensive guide to measuring raw selvedge denim, shrinkage allowances, and jewellery ring mandrel sizing charts.',
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        id: '10000000-0000-0000-0000-000000000004',
        slug: 'guide',
        title: 'Master Craft & Care Guide',
        contentMarkdown: `# Selvedge Denim & Silver Maintenance

True craft items improve with age when cared for with patience. Here are the atelier rituals for caring for raw denim and solid silver.

## The Raw Denim Soak Ritual
1. **First Soak:** Turn jeans inside out. Submerge in lukewarm water (30°C) with a teaspoon of sea salt for 45 minutes without agitation.
2. **Drip Dry:** Remove without wringing out. Hang vertically out of direct sunlight until dry.
3. **First 6 Months:** Wear consistently before the first machine wash to establish high-contrast honeycombs, whiskers, and train the denim grain.

## Silver Oxidation & Patina Care
Solid 925 sterling silver naturally reacts with oxygen and sulfur in the air.
- **Natural Patina:** We encourage allowing the silver to develop dark shadows in recessed crevices while the high surfaces remain bright from daily friction.
- **Polishing:** Use an untreated cotton silver cloth on high-relief surfaces. Avoid harsh liquid dips which strip deliberate atelier oxidation.`,
        metaDescription:
          'Essential care and maintenance rituals for raw selvedge denim and handcrafted sterling silver.',
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        id: '10000000-0000-0000-0000-000000000005',
        slug: 'contact',
        title: 'Atelier Concierge & Communications',
        contentMarkdown: `# Studio Consultations & Inquiries

Direct communication with our tailoring cutters in Kathmandu and jewellery artisans. We respond to sizing inquiries, bespoke commissions, and repair intakes within 24 business hours.

### Workshop Locations
- **Kathmandu Denim Cutting & Chainstitch Bench:** Baber Mahal Revisited, Kathmandu, Nepal (Mon–Sat: 09:00 – 18:00 NPT)
- **Kathmandu Silversmithing & Lost-Wax Bench:** New Road, Kathmandu, Nepal (Mon–Fri: 10:00 – 18:00 NPT)

### Direct Digital Channels
- **General & Sizing Inquiries:** concierge@jeaniusjewl.com
- **Bespoke Commissions:** bespoke@jeaniusjewl.com
- **Repairs & Hemming:** workshop@jeaniusjewl.com`,
        metaDescription:
          'Contact the Jeanius & Jewl master tailors and jewellery artisans for bespoke consultations and inquiries.',
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        id: '10000000-0000-0000-0000-000000000006',
        slug: 'returns',
        title: 'Bespoke & Made-To-Order Policy',
        contentMarkdown: `# Returns, Alterations & Lifetime Guarantee

Because every Order-Made (OM) garment is cut from raw bolts to your specific anatomical measurements, custom pieces cannot be returned for change of mind once cutting begins. However, we guarantee our craftsmanship for life.

## The Atelier Fit Guarantee
- **Complimentary Hemming:** If your raw selvedge denim inseam requires adjustments after the initial shrink soak, return them for complimentary chainstitching on our vintage Union Special 43200G.
- **Lifetime Seam Repair:** Blowouts at the crotch or yoke after years of wear receive complimentary sashiko darning and seam reinforcement.
- **Jewellery Resizing & Cleansing:** Hand-cast rings include one complimentary size tuning (+/- 1 US size) and lifetime ultrasonic cleansing.

## Limited Drops & Ready-To-Wear
For limited drop products that are not made-to-order, unworn items with security tags intact may be returned within 14 days of international delivery.`,
        metaDescription:
          'Details on our Order-Made fit guarantee, alteration policies, and lifetime repair service.',
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        id: '10000000-0000-0000-0000-000000000007',
        slug: 'terms',
        title: 'Terms of Service & Atelier Contract',
        contentMarkdown: `# Commercial Terms & Craft Covenant

By placing an Order-Made or Limited Drop commission with Jeanius & Jewl, you agree to the craft covenants outlined herein.

## 1. Bespoke Manufacturing Timeline
Order-Made garments require 14 to 21 business days of bench assembly prior to dispatch. Lead times may vary slightly during seasonal selvedge mill shipments.

## 2. Tolerance Margins
Due to the hand-chalked nature of bespoke cutting and shuttle loom selvedge tension, finished garment dimensions may exhibit a +/- 0.35 inch tolerance margin, which settles during initial soak.

## 3. Currency & Import Duties
All orders are billed in US Dollars (USD). International deliveries may be subject to local import tariffs and customs inspections upon arrival in destination countries.`,
        metaDescription:
          'Official commercial terms, production timelines, and agreements for Jeanius & Jewl clients.',
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        id: '10000000-0000-0000-0000-000000000008',
        slug: 'privacy',
        title: 'Privacy & Vault Security Policy',
        contentMarkdown: `# Atelier Vault Privacy & Data Protection

Your anatomical measurements and sizing specifications belong strictly to you.

## 1. Vault Measurement Security
Tailoring specifications stored in your Atelier Vault are encrypted and utilized solely to parameterize cutting tickets and ring mandrels during production. We never sell or share biometric or anatomical data.

## 2. Zero Unnecessary Trackers
Our storefront and admin portals operate with zero third-party behavioral advertising trackers. Analytics are privacy-respecting and self-hosted.

## 3. Data Deletion Rights
You may export or permanently erase your Atelier Vault measurements and account history at any time from your Account settings.`,
        metaDescription:
          'Our commitment to protecting your anatomical measurements, privacy, and personal data.',
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
      },
    ])
    .onConflictDoUpdate({
      target: contentPages.id,
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
        title: 'Lot 002 & Lot J01 Capsule Drop',
        message:
          'Limited runs of raw Kurabo selvedge denim and hand-forged sterling silver available worldwide.',
        type: 'PROMO',
        startDate: new Date(),
        priority: 10,
      },
      {
        id: '20000000-0000-0000-0000-000000000002',
        title: 'Kathmandu Cutting Bench Queue',
        message:
          'Bespoke jeans cutting queue is currently operating at 14–18 business days. Each piece is chainstitched individually.',
        type: 'INFO',
        startDate: new Date(),
        priority: 5,
      },
    ])
    .onConflictDoNothing();

  logger.info('Database seeded successfully.');
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('seed.ts')) {
  runDatabaseSeed()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Seed execution failed', err);
      process.exit(1);
    });
}
