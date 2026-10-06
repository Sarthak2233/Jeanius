import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { PriceDisplay } from '../components/price-display';
import { StatusBadge } from '../components/status-badge';
import { Modal } from '../components/modal';
import { Drawer } from '../components/drawer';
import { ToastProvider } from '../components/toast';
import { Skeleton, Spinner, LoadingOverlay } from '../components/loading';
import { EmptyState } from '../components/empty-state';
import { ErrorState } from '../components/error-state';

describe('Storefront Overlays, Feedback & Loading States (JN-138 → JN-143)', () => {
  // ==========================================================================
  // JN-138: Enhanced PriceDisplay
  // ==========================================================================
  describe('JN-138: Enhanced PriceDisplay', () => {
    it('renders compare-at strikethrough pricing for sale items', () => {
      const html = renderToString(
        <PriceDisplay amount={45000} compareAtAmount={60000} currency="USD" />,
      );
      assert.ok(html.includes('<del'));
      assert.ok(html.includes('$600.00'));
      assert.ok(html.includes('$450.00'));
      assert.ok(html.includes('<data value="450"'));
    });

    it('renders price delta prefix when configured', () => {
      const html = renderToString(<PriceDisplay amount={3500} delta />);
      assert.ok(html.includes('+$35.00'));
    });

    it('renders custom currency code suffix and size tokens', () => {
      const html = renderToString(
        <PriceDisplay amount={10000} currency="EUR" size="hero" showCurrencyCode />,
      );
      assert.ok(html.includes('EUR'));
      assert.ok(html.includes('font-size:var(--font-size-2xl, 2rem)'));
    });
  });

  // ==========================================================================
  // JN-139: StatusBadge with Pulse & Stock States
  // ==========================================================================
  describe('JN-139: Enhanced StatusBadge', () => {
    it('renders in-stock and made-to-order states', () => {
      const inStockHtml = renderToString(<StatusBadge status="In Stock" variant="in_stock" />);
      assert.ok(inStockHtml.includes('In Stock'));
      assert.ok(inStockHtml.includes('var(--color-status-success-bg, #ecfdf5)'));

      const omHtml = renderToString(<StatusBadge status="Order-Made" variant="made_to_order" />);
      assert.ok(omHtml.includes('Order-Made'));
      assert.ok(omHtml.includes('var(--color-om-bg, #fffbeb)'));
    });

    it('renders live pulse indicator dot for active operations', () => {
      const html = renderToString(
        <StatusBadge status="In Production" variant="in_production" pulse />,
      );
      assert.ok(html.includes('animation:pulse'));
      assert.ok(html.includes('border-radius:50%'));
    });

    it('renders out-of-stock and hazard states', () => {
      const html = renderToString(<StatusBadge status="Sold Out" variant="sold_out" />);
      assert.ok(html.includes('Sold Out'));
      assert.ok(html.includes('var(--color-craft-selvedgeRedSubtle, #fef2f2)'));
    });
  });

  // ==========================================================================
  // JN-140: Modal and Drawer Overlays
  // ==========================================================================
  describe('JN-140: Modal and Drawer Components', () => {
    it('renders Modal dialog with title, close action, and closedby="any"', () => {
      const html = renderToString(
        <Modal isOpen onClose={() => {}} title="Atelier Ring Mandrel Sizing">
          <p id="modal-content">Custom ring sizing chart</p>
        </Modal>,
      );
      assert.ok(html.includes('Atelier Ring Mandrel Sizing'));
      assert.ok(html.includes('closedby="any"'));
      assert.ok(html.includes('aria-modal="true"'));
      assert.ok(html.includes('aria-label="Close dialog"'));
      assert.ok(html.includes('Custom ring sizing chart'));
    });

    it('returns null when Modal is closed', () => {
      const html = renderToString(
        <Modal isOpen={false} onClose={() => {}} title="Closed Modal">
          <p>Hidden</p>
        </Modal>,
      );
      assert.equal(html, '');
    });

    it('renders Drawer with slide position and accessible role', () => {
      const html = renderToString(
        <Drawer isOpen onClose={() => {}} position="right" title="Atelier Shopping Bag">
          <div id="drawer-items">1 item in bag</div>
        </Drawer>,
      );
      assert.ok(html.includes('Atelier Shopping Bag'));
      assert.ok(html.includes('role="dialog"'));
      assert.ok(html.includes('aria-modal="true"'));
      assert.ok(html.includes('aria-label="Close drawer"'));
      assert.ok(html.includes('slideInRight'));
    });
  });

  // ==========================================================================
  // JN-141: Toast Notification System
  // ==========================================================================
  describe('JN-141: Toast Notification System', () => {
    it('renders ToastProvider and aria-live notification region', () => {
      const html = renderToString(
        <ToastProvider>
          <div id="page-content">Atelier App</div>
        </ToastProvider>,
      );
      assert.ok(html.includes('Atelier App'));
      assert.ok(html.includes('role="region"'));
      assert.ok(html.includes('aria-label="Notifications"'));
    });
  });

  // ==========================================================================
  // JN-142: Loading States
  // ==========================================================================
  describe('JN-142: Loading States', () => {
    it('renders Skeleton with shimmer animation and shape variants', () => {
      const rectHtml = renderToString(<Skeleton variant="rectangular" height="200px" />);
      assert.ok(rectHtml.includes('animation:shimmer'));
      assert.ok(rectHtml.includes('height:200px'));

      const circleHtml = renderToString(<Skeleton variant="circular" width="48px" height="48px" />);
      assert.ok(circleHtml.includes('border-radius:50%'));
    });

    it('renders Spinner with accessible status role', () => {
      const html = renderToString(<Spinner size="md" label="Loading order..." />);
      assert.ok(html.includes('role="status"'));
      assert.ok(html.includes('Loading order...'));
      assert.ok(html.includes('animation:spin'));
    });

    it('renders LoadingOverlay with backdrop blur', () => {
      const html = renderToString(<LoadingOverlay message="Securing bolt cut..." />);
      assert.ok(html.includes('role="status"'));
      assert.ok(html.includes('aria-live="polite"'));
      assert.ok(html.includes('Securing bolt cut...'));
    });
  });

  // ==========================================================================
  // JN-143: Empty and Error States
  // ==========================================================================
  describe('JN-143: Empty and Error States', () => {
    it('renders EmptyState with emblem, title, and action button', () => {
      const html = renderToString(
        <EmptyState
          title="Your Atelier Bag is Empty"
          description="Explore our made-to-order selvedge denim and handcrafted jewelry."
          actionLabel="EXPLORE SHOP"
          actionHref="/shop"
        />,
      );
      assert.ok(html.includes('role="status"'));
      assert.ok(html.includes('Your Atelier Bag is Empty'));
      assert.ok(html.includes('EXPLORE SHOP'));
      assert.ok(html.includes('J&amp;J'));
    });

    it('renders ErrorState with role="alert", error code, and retry action', () => {
      const html = renderToString(
        <ErrorState
          errorCode="ERR_INVENTORY_DEPLETED"
          message="Selected selvedge bolt does not have continuous yardage remaining."
          onRetry={() => {}}
        />,
      );
      assert.ok(html.includes('role="alert"'));
      assert.ok(html.includes('ERR_INVENTORY_DEPLETED'));
      assert.ok(
        html.includes('Selected selvedge bolt does not have continuous yardage remaining.'),
      );
      assert.ok(html.includes('TRY AGAIN'));
      assert.ok(html.includes('CONTACT CONCIERGE'));
    });
  });
});
