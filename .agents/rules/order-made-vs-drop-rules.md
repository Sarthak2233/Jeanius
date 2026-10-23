# Order-Made (OM) vs. DROP Commerce Models & Product Rules (JN-053)

This rule defines the architectural standards, domain purity, database modeling, and configurator requirements distinguishing **Order-Made (OM)** bespoke products from **DROP** pre-manufactured batch inventory across the Project 925 monorepo.

---

## 1. Domain Purity: Kathmandu Atelier .925 Sterling Silver

- **Origin & Materiality:** All products are handcrafted .925 sterling silver artisan jewellery originating strictly from the **Kathmandu Workshop** in Nepal.
- **Traditional Craft Disciplines:** Lost-wax investment flask casting, Newar repoussé talisman motifs, heavy brutalist signet silhouettes, liver-of-sulfur hand oxidation, and rotary rouge finishing.
- **Strict Prohibition:** Absolutely zero apparel, denim, third-party dropshipping, or multi-vendor marketplace artifacts.

---

## 2. The Two Non-Negotiable Commerce Models

Every commercial piece in Project 925 belongs to one of two mutually exclusive commerce models:

```
┌──────────────────────────────────────────────┐       ┌──────────────────────────────────────────────┐
│            ORDER-MADE (OM)                   │       │                 DROP                         │
├──────────────────────────────────────────────┤       ├──────────────────────────────────────────────┤
│ • Custom-manufactured upon payment           │       │ • Pre-manufactured limited physical batches  │
│ • ZERO pre-cast finished goods inventory     │       │ • Limited numbered stock in Kathmandu vault  │
│ • Driven by customer bespoke inputs          │       │ • Pre-set fixed physical variants & SKUs     │
│ • Stock locked on raw silver grain (grams)   │       │ • Stock decremented from inventory_count     │
│ • Creates a Jeweller Bench ProductionJob     │       │ • Direct warehouse pack & dispatch (24–48h)  │
│ • Irrevocable once casting begins            │       │ • 5-day post-delivery inspection window      │
└──────────────────────────────────────────────┘       └──────────────────────────────────────────────┘
```

---

## 3. Database Schema Isolation

### A. Order-Made Products (`order_made_products`)
- **No Pre-Cast Variants:** Never seed or link `product_variants` with fake inventory counts (e.g., `inventoryCount: 99`) for Order-Made pieces.
- **Input Specification Schema:** Each OM master record defines an `input_specifications` schema defining acceptable customer dimensions:
  - Ring mandrel sizes: range (e.g. US 3–16), step (`0.25` quarter sizes).
  - Wide-shank compensator allowance (`+0.5` size offset).
  - Wrist circumference / cuff gap ranges.
  - Chain drape lengths (inches/cm).
  - Inside-band engraving bounds (max characters, character restrictions).
  - Available workshop patina finishes (`OXIDIZED_CHARCOAL`, `BRUSHED_MATTE`, `MIRROR_POLISH`).
- **Dynamic Price Rules:** Surcharges for extra bullion weight (e.g., chains $>22"$) or precious metal accents are declared in `price_rules`.

### B. DROP Products (`drop_products` & `drop_variants`)
- **Physical Warehousing:** Pre-manufactured batches have real, finite inventory counts in `drop_variants`.
- **SKU Resolution:** Customers select from existing physical variants (e.g. `P925-DROP-01-M`). When inventory hits `0`, the variant is `SOLD_OUT`.

---

## 4. Cart Lines & Order Lines Persistence (JN-261 & JN-262)

Cart lines and order lines unify both models via a `commerce_model` discriminator column:

1. **For DROP items:**
   - `drop_variant_id` is **mandatory** (foreign key to `drop_variants`).
   - `order_made_product_id` is `null`.
   - `custom_specifications` is `null` or empty.
2. **For Order-Made items:**
   - `drop_variant_id` is `null`.
   - `order_made_product_id` is **mandatory** (foreign key to `order_made_products`).
   - `custom_specifications` is **mandatory** (`jsonb`), permanently freezing the customer's exact inputs (`ringSizeUs`, `mandrelMm`, `wideShankApplied`, `engravingText`, `patinaFinish`).
3. **Immutability Contract:** Once payment succeeds, the order line's `custom_specifications` and `unit_price_amount` are immutable. Future changes to customer sizing vaults or catalog pricing have zero effect on existing orders.

---

## 5. Storefront Configurator Directives

The Product Detail Page (`/shop/[slug]`) must branch its configurator based on `commerceModel`:

### A. Order-Made Configurator (`<OrderMadeConfigurator />`)
- **Continuous Input Controls:** Render quarter-increment steppers/numeric inputs for mandrel sizes, not static button chips.
- **Wide Shank Compensator:** Provide an interactive toggle explaining that wide bands (>6mm) require +0.5 size for physical comfort, dynamically adjusting the craftsman target.
- **Engraving Input:** Uppercase text input with live preview and character counter ($\le 20$ characters).
- **Atelier Bench Preview:** Render a live bench ticket card displaying the exact specifications that will be sent to the silversmith.
- **SLA & Policy Badges:** Explicitly show 7–14 business day casting lead times and the irrevocable casting policy warning.
- **Personal Sizing Vault:** When the customer is signed in, pre-fill defaults from `user_profiles`, but allow instantaneous per-piece override without mutating account defaults.

### B. DROP Configurator (`<DropConfigurator />`)
- **Stock Telemetry:** Render real batch stock indicators (e.g., *"Only 3 left of 15 in Kathmandu vault"*).
- **Standard Variant Chips:** Allow selection among physical ready-to-ship variants.
- **Dispatch Notice:** *"Dispatches within 24–48 hours via DHL Express."*

---

## 6. Workshop Operations Handshake

- When an Order-Made order line is confirmed:
  1. It generates a `ProductionJob` at the Kathmandu workshop bench (`apps/admin/app/workshop/jeweller/`).
  2. The job locks raw silver bullion reservation in `metal_stocks` (calculated in grams).
  3. The jeweller inspects the frozen `custom_specifications` to true the mandrel, execute flask burnout, and set the hallmark.
