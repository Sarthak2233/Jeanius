import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import type { ProductDetailDto } from '@jeanius/contracts';
import { queryClient } from '@jeanius/database';
import { ProductFacts } from '../app/shop/[slug]/product-facts';
import { ShippingInfo } from '../app/shop/[slug]/shipping-info';
import { ProductDetailClient } from '../app/shop/[slug]/product-detail-client';
import { ProductJsonLd } from '../components/product-jsonld';
import { useConfiguratorStore } from '../stores/configurator-store';
import { useCartStore } from '../stores/cart-store';
import { resolveVariantAction } from '../actions/catalog.actions';

describe('State 10: Product Detail & Configurator (JN-180 → JN-198)', () => {
  after(async () => {
    await queryClient.end();
  });

  const sampleJewelleryDetail: ProductDetailDto = {
    id: 'b0000000-0000-0000-0000-000000000001',
    slug: 'vajra-seal-signet-ring',
    title: 'Vajra Seal Signet Ring',
    description:
      'Lost-wax cast solid .925 sterling silver signet ring chiseled with the sacred double-vajra symbol in our Kathmandu workshop.',
    basePriceAmount: 24000,
    basePriceCurrency: 'USD',
    commerceModel: 'OM',
    category: 'rings',
    status: 'PUBLISHED',
    primaryImage: {
      url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800',
      altText: 'Vajra Seal Signet Ring Front',
      position: 0,
      isPrimary: true,
    },
    images: [
      {
        id: 'img-1',
        url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800',
        altText: 'Primary Image',
        isPrimary: true,
        position: 0,
      },
      {
        id: 'img-2',
        url: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&q=80&w=800',
        altText: 'Secondary Image',
        isPrimary: false,
        position: 1,
      },
    ],
    options: [
      {
        id: 'opt-size',
        code: 'ring_size',
        name: 'Mandrel Ring Size (US)',
        isRequired: true,
        position: 0,
        values: [
          {
            id: 'val-size-9',
            code: 'US 9',
            label: 'US 9 (Standard)',
            priceDeltaAmount: 0,
            priceDeltaCurrency: 'USD',
            isAvailable: true,
            position: 0,
          },
          {
            id: 'val-size-10',
            code: 'US 10',
            label: 'US 10 (+0.5g Silver)',
            priceDeltaAmount: 1500,
            priceDeltaCurrency: 'USD',
            isAvailable: true,
            position: 1,
          },
          {
            id: 'val-size-11',
            code: 'US 11',
            label: 'US 11 (+1.0g Silver)',
            priceDeltaAmount: 2500,
            priceDeltaCurrency: 'USD',
            isAvailable: false,
            position: 2,
          },
        ],
      },
      {
        id: 'opt-finish',
        code: 'surface_finish',
        name: 'Artisan Patina Finish',
        isRequired: true,
        position: 1,
        values: [
          {
            id: 'val-finish-matte',
            code: 'Oxidized Matte',
            label: 'Oxidized Matte (Shadow Patina)',
            priceDeltaAmount: 0,
            priceDeltaCurrency: 'USD',
            isAvailable: true,
            position: 0,
          },
          {
            id: 'val-finish-mirror',
            code: 'High Polish',
            label: 'High Mirror Polish',
            priceDeltaAmount: 1000,
            priceDeltaCurrency: 'USD',
            isAvailable: true,
            position: 1,
          },
        ],
      },
    ],
    variants: [
      {
        id: 'var-1',
        sku: 'VSR-9-OXM',
        options: { ring_size: 'US 9', surface_finish: 'Oxidized Matte' },
        additionalPriceAmount: 0,
        additionalPriceCurrency: 'USD',
        inventoryCount: 5,
        status: 'AVAILABLE',
      },
      {
        id: 'var-2',
        sku: 'VSR-10-OXM',
        options: { ring_size: 'US 10', surface_finish: 'Oxidized Matte' },
        additionalPriceAmount: 1500,
        additionalPriceCurrency: 'USD',
        inventoryCount: 4,
        status: 'AVAILABLE',
      },
    ],
    leadTimeDays: 21,
    craftSpecs: {
      purity: 'Solid .925 Sterling Silver',
      workshop: 'Kathmandu Artisan Atelier, Nepal',
      hallmark: "Stamped '925' + Kathmandu Artisan Seal",
      casing: 'Handcrafted Himalayan Wood Presentation Box',
    },
  };

  describe('JN-182: ProductFacts Presentation Component', () => {
    it('renders authentic Kathmandu metallurgy and workshop specifications', () => {
      const html = renderToString(<ProductFacts product={sampleJewelleryDetail} />);

      assert.ok(html.includes('Solid .925 Sterling Silver'));
      assert.ok(html.includes('Kathmandu Artisan Atelier, Nepal'));
      assert.ok(
        html.includes('Stamped &#x27;925&#x27; + Kathmandu Artisan Seal') ||
          html.includes('Stamped &#39;925&#39;'),
      );
      assert.ok(
        html.includes('Lost-Wax Casting, Chasing &amp; Liver of Sulfur Patina') ||
          html.includes('Lost-Wax Casting'),
      );
    });
  });

  describe('JN-183: ShippingInfo Presentation Component', () => {
    it('renders OM lead-time timeline and international DHL express specs', () => {
      const html = renderToString(<ShippingInfo commerceModel="OM" leadTimeDays={21} />);

      assert.ok(html.includes('21 business days'));
      assert.ok(html.includes('DHL Express Worldwide'));
      assert.ok(html.includes('HS 7113.11'));
    });

    it('renders DROP ready-to-ship notice when commerceModel is DROP', () => {
      const html = renderToString(<ShippingInfo commerceModel="DROP" leadTimeDays={3} />);

      assert.ok(html.includes('within 2 business days'));
    });
  });

  describe('JN-180 & JN-181: ProductDetailClient Layout & ProductGallery', () => {
    it('renders luxury 2-column layout with breadcrumb and gallery', () => {
      const html = renderToString(
        <ProductDetailClient product={sampleJewelleryDetail} relatedProducts={[]} />,
      );

      assert.ok(html.includes('Vajra Seal Signet Ring'));
      assert.ok(html.includes('Atelier Shop'));
      assert.ok(html.includes('Rings'));
      assert.ok(html.includes('ORDER-MADE'));
      assert.ok(html.includes('Kathmandu Atelier • Solid .925 Silver'));
    });
  });

  describe('ProductJsonLd: Schema.org Structured Microdata', () => {
    it('generates valid Schema.org Product JSON-LD script', () => {
      const html = renderToString(<ProductJsonLd product={sampleJewelleryDetail} />);

      assert.ok(html.includes('application/ld+json'));
      assert.ok(html.includes('Vajra Seal Signet Ring'));
      assert.ok(html.includes('Solid .925 Sterling Silver'));
      assert.ok(html.includes('https://schema.org/PreOrder'));
    });
  });

  describe('JN-186 & JN-191: Configurator Zustand Store', () => {
    it('initializes base price and tracks selected options', () => {
      const store = useConfiguratorStore.getState();
      store.initProduct(24000, 'USD', { ring_size: 'US 9' });

      const stateAfterInit = useConfiguratorStore.getState();
      assert.strictEqual(stateAfterInit.basePriceAmount, 24000);
      assert.strictEqual(stateAfterInit.unitPriceAmount, 24000);
      assert.strictEqual(stateAfterInit.selectedOptions['ring_size'], 'US 9');

      // Update option
      store.setOption('ring_size', 'US 10');
      assert.strictEqual(useConfiguratorStore.getState().selectedOptions['ring_size'], 'US 10');

      // Update quantity
      store.setQuantity(3);
      assert.strictEqual(useConfiguratorStore.getState().quantity, 3);
    });

    it('updates live resolved variant details', () => {
      const store = useConfiguratorStore.getState();
      store.setResolvedVariant({
        variantId: 'var-2',
        sku: 'VSR-10-OXM',
        unitPriceAmount: 25500,
        unitPriceCurrency: 'USD',
        isAvailable: true,
        inventoryCount: 4,
        selectedOptions: { ring_size: 'US 10', surface_finish: 'Oxidized Matte' },
      });

      const state = useConfiguratorStore.getState();
      assert.strictEqual(state.activeSku, 'VSR-10-OXM');
      assert.strictEqual(state.activeVariantId, 'var-2');
      assert.strictEqual(state.unitPriceAmount, 25500);
      assert.strictEqual(state.isAvailable, true);
    });

    it('supports Atelier Sizing Vault pre-population and per-piece custom override', () => {
      const store = useConfiguratorStore.getState();
      store.initProduct(24000, 'USD', { ring_size: 'US 9' });

      // Pre-populate sizing vault
      store.setVaultDefaults({ ring_size: 'US 10' });
      store.setOption('ring_size', 'US 10');

      let state = useConfiguratorStore.getState();
      assert.strictEqual(state.vaultDefaults['ring_size'], 'US 10');
      assert.strictEqual(state.selectedOptions['ring_size'], 'US 10');

      // Customer overrides sizing for a specific piece (e.g. pinky ring or gift)
      store.setOption('ring_size', 'US 11');

      state = useConfiguratorStore.getState();
      assert.strictEqual(state.selectedOptions['ring_size'], 'US 11');
      assert.strictEqual(state.vaultDefaults['ring_size'], 'US 10'); // Vault remains intact
    });
  });

  describe('JN-195: Cart Drawer Integration & Store', () => {
    it('adds configured jewellery piece with custom options, variantId, and calculates subtotal', () => {
      const cart = useCartStore.getState();
      cart.clearCart();

      cart.addItem({
        productId: sampleJewelleryDetail.id,
        variantId: 'var-1',
        sku: 'VSR-9-OXM',
        title: sampleJewelleryDetail.title,
        slug: sampleJewelleryDetail.slug,
        unitPriceAmount: 24000,
        unitPriceCurrency: 'USD',
        selectedOptions: { ring_size: 'US 9', surface_finish: 'Oxidized Matte' },
        imageUrl: sampleJewelleryDetail.primaryImage?.url,
        quantity: 2,
      });

      const state = useCartStore.getState();
      assert.strictEqual(state.items.length, 1);
      assert.strictEqual(state.items[0]?.variantId, 'var-1');
      assert.strictEqual(state.items[0]?.sku, 'VSR-9-OXM');
      assert.strictEqual(state.items[0]?.quantity, 2);
      assert.strictEqual(state.getSubtotalAmount(), 48000);
      assert.strictEqual(state.isCartDrawerOpen, true); // Opens drawer on add
    });
  });

  describe('JN-197: Server-side Configuration Validation Action', () => {
    it('validates schema and returns validation error on invalid payload', async () => {
      const result = await resolveVariantAction({
        productId: 'invalid-id',
        // missing selectedOptions
      });

      assert.strictEqual(result.success, false);
      if (!result.success && result.error) {
        assert.strictEqual(result.error.code, 'VALIDATION_ERROR');
      }
    });
  });
});
