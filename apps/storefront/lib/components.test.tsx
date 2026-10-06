import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Button } from '../components/button';
import { Input, NumberStepper, Textarea, Select } from '../components/input';
import { ProductImage } from '../components/product-image';
import { ProductGallery } from '../components/product-gallery';
import { OptionSelector } from '../components/option-selector';

describe('Storefront Core Design System Components (JN-133 → JN-137)', () => {
  // ==========================================================================
  // JN-133: Button Component
  // ==========================================================================
  describe('JN-133: Button Component', () => {
    it('renders primary action button with children text', () => {
      const html = renderToString(<Button variant="primary">BUY NOW</Button>);
      assert.ok(html.includes('BUY NOW'));
      assert.ok(html.includes('var(--color-bg-dark, #0f172a)'));
      assert.ok(html.includes('cubic-bezier(0.16, 1, 0.3, 1)'));
    });

    it('renders secondary action button with subtle border', () => {
      const html = renderToString(<Button variant="secondary">ADD TO CART</Button>);
      assert.ok(html.includes('ADD TO CART'));
      assert.ok(html.includes('var(--border-subtle, #cbd5e1)'));
    });

    it('renders loading state with spinner and aria-busy', () => {
      const html = renderToString(<Button loading>PROCESSING</Button>);
      assert.ok(html.includes('aria-busy="true"'));
      assert.ok(html.includes('disabled=""'));
      assert.ok(html.includes('animation:spin'));
    });

    it('renders disabled state properly', () => {
      const html = renderToString(<Button disabled>UNAVAILABLE</Button>);
      assert.ok(html.includes('disabled=""'));
      assert.ok(html.includes('aria-disabled="true"'));
    });

    it('renders left and right icons', () => {
      const html = renderToString(
        <Button leftIcon={<span id="left-icon">‹</span>} rightIcon={<span id="right-icon">›</span>}>
          NAVIGATE
        </Button>,
      );
      assert.ok(html.includes('id="left-icon"'));
      assert.ok(html.includes('id="right-icon"'));
    });
  });

  // ==========================================================================
  // JN-134: Input Primitives
  // ==========================================================================
  describe('JN-134: Input Primitives', () => {
    it('renders Input with label, placeholder, and concentric outline', () => {
      const html = renderToString(
        <Input label="Customer Email" placeholder="atelier@jeanius.com" required />,
      );
      assert.ok(html.includes('Customer Email'));
      assert.ok(html.includes('atelier@jeanius.com'));
      assert.ok(html.includes('*'));
    });

    it('renders Input error state with role="alert" and selvedge red border', () => {
      const html = renderToString(<Input label="Email" error="Invalid atelier member email" />);
      assert.ok(html.includes('role="alert"'));
      assert.ok(html.includes('Invalid atelier member email'));
      assert.ok(html.includes('var(--color-craft-selvedgeRed, #b91c1c)'));
    });

    it('renders NumberStepper with bounds, current value, and unit', () => {
      const html = renderToString(
        <NumberStepper
          label="Waist Size"
          value={32}
          min={28}
          max={44}
          unit="in"
          onChange={() => {}}
        />,
      );
      assert.ok(html.includes('Waist Size'));
      assert.ok(html.includes('>32<'));
      assert.ok(html.includes('>in<'));
      assert.ok(html.includes('aria-label="Decrease value"'));
      assert.ok(html.includes('aria-label="Increase value"'));
    });

    it('renders Textarea for bespoke tailoring notes', () => {
      const html = renderToString(
        <Textarea label="Custom Inseam Hemming" defaultValue="Chainstitch with copper thread" />,
      );
      assert.ok(html.includes('Custom Inseam Hemming'));
      assert.ok(html.includes('Chainstitch with copper thread'));
    });

    it('renders Select dropdown with options', () => {
      const html = renderToString(
        <Select
          label="Denim Wash"
          options={[
            { value: 'raw', label: '14oz Raw Selvedge' },
            { value: 'one-wash', label: 'One Wash Natural' },
            { value: 'vintage', label: 'Vintage Faded', disabled: true },
          ]}
        />,
      );
      assert.ok(html.includes('Denim Wash'));
      assert.ok(html.includes('14oz Raw Selvedge'));
      assert.ok(html.includes('disabled=""'));
    });
  });

  // ==========================================================================
  // JN-135: Product-Image Component
  // ==========================================================================
  describe('JN-135: Product-Image Component', () => {
    it('renders 1:1 aspect ratio container for precious jewelry', () => {
      const html = renderToString(
        <ProductImage
          src="/images/bracelet-clasp.jpg"
          alt="Hardihooder Snake Bracelet S Clasp"
          aspectRatio="1:1"
          fit="contain"
        />,
      );
      assert.ok(html.includes('aspect-ratio:1 / 1'));
      assert.ok(html.includes('object-fit:contain'));
      assert.ok(html.includes('Hardihooder Snake Bracelet S Clasp'));
    });

    it('renders 4:5 aspect ratio container for raw denim garments', () => {
      const html = renderToString(
        <ProductImage
          src="/images/lot-001-denim.jpg"
          alt="Lot 001 Straight Raw Denim"
          aspectRatio="4:5"
        />,
      );
      assert.ok(html.includes('aspect-ratio:4 / 5'));
    });

    it('applies fetchpriority="high" and eager loading for LCP images', () => {
      const html = renderToString(
        <ProductImage src="/images/hero-ring.jpg" alt="Hero Sovereign Ring" fetchPriority="high" />,
      );
      assert.ok(html.includes('fetchPriority="high"'));
      assert.ok(html.includes('loading="eager"'));
    });
  });

  // ==========================================================================
  // JN-136: Gallery Component
  // ==========================================================================
  describe('JN-136: Product Gallery Component', () => {
    const testImages = [
      { src: '/images/ring-front.jpg', alt: 'Ring Front View' },
      { src: '/images/ring-profile.jpg', alt: 'Ring Profile View' },
      { src: '/images/ring-engraving.jpg', alt: 'Ring Engraving Detail' },
    ];

    it('renders current image and thumbnail strip', () => {
      const html = renderToString(<ProductGallery images={testImages} aspectRatio="1:1" />);
      assert.ok(html.includes('Ring Front View'));
      assert.ok(html.includes('1 / 3')); // counter badge
      assert.ok(html.includes('aria-label="Product image thumbnails"'));
      assert.ok(html.includes('aria-label="View image 1 of 3"'));
      assert.ok(html.includes('aria-label="View image 2 of 3"'));
      assert.ok(html.includes('aria-label="View image 3 of 3"'));
    });

    it('renders fallback when no images provided', () => {
      const html = renderToString(<ProductGallery images={[]} />);
      assert.ok(html.includes('NO MEDIA AVAILABLE'));
    });
  });

  // ==========================================================================
  // JN-137: Option-Selector Component
  // ==========================================================================
  describe('JN-137: Option-Selector Component', () => {
    const sizeOptions = [
      { id: 'us-7', label: 'US 7', available: true },
      { id: 'us-8', label: 'US 8', available: true, priceDeltaCents: 3500 },
      { id: 'us-9', label: 'US 9', available: false },
    ];

    it('renders chips mode with active state, price delta, and sold out tags', () => {
      const html = renderToString(
        <OptionSelector
          name="ring-size"
          label="Ring Size (US)"
          options={sizeOptions}
          selectedValue="us-8"
          onChange={() => {}}
        />,
      );
      assert.ok(html.includes('Ring Size (US)'));
      assert.ok(html.includes('US 7'));
      assert.ok(html.includes('US 8'));
      assert.ok(html.includes('$35.00')); // Price delta formatted
      assert.ok(html.includes('Sold Out')); // Unavailable indicator
      assert.ok(html.includes('disabled=""')); // Disabled on sold out
    });

    it('renders swatches mode for metal finishes', () => {
      const swatchOptions = [
        { id: 'silver', label: '925 Sterling Silver', available: true, swatchColor: '#cbd5e1' },
        { id: 'gold', label: '18K Gold Vermeil', available: true, swatchColor: '#f59e0b' },
      ];

      const html = renderToString(
        <OptionSelector
          name="finish"
          label="Precious Alloy"
          type="swatches"
          options={swatchOptions}
          selectedValue="silver"
          onChange={() => {}}
        />,
      );
      assert.ok(html.includes('Precious Alloy'));
      assert.ok(html.includes('role="radiogroup"'));
      assert.ok(html.includes('#cbd5e1'));
      assert.ok(html.includes('#f59e0b'));
    });

    it('renders error validation message when present', () => {
      const html = renderToString(
        <OptionSelector
          name="size"
          label="Size"
          options={sizeOptions}
          error="Please choose a ring size before proceeding"
          onChange={() => {}}
        />,
      );
      assert.ok(html.includes('role="alert"'));
      assert.ok(html.includes('Please choose a ring size before proceeding'));
    });
  });
});
