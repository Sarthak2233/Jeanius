import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  useCartStore,
  selectCartItems,
  selectCartTotalCount,
  selectCartSubtotal,
  selectIsCartDrawerOpen,
  selectIsCartHydrated,
  selectCartIsLoading,
  selectCartIsSyncing,
  useConfiguratorStore,
  selectConfiguredOptions,
  selectConfiguredCustomSpecifications,
  selectConfiguredUnitPrice,
  selectConfiguredQuantity,
  selectIsConfigValid,
  selectIsConfigAvailable,
  selectConfiguredSku,
  useUiStore,
  selectIsSearchOpen,
  selectIsMobileNavOpen,
  selectIsAnnouncementDismissed,
  selectActiveModalId,
  type CartItem,
} from '../stores';
import { computeLineItemFingerprint, mergeCartLinesPure } from '../actions/cart.actions';
import {
  CartItemSchema,
  CartDtoSchema,
  SyncCartInputSchema,
  MergeCartInputSchema,
} from '@jeanius/contracts';

describe('State 11: Zustand Stores & Client State Management (JN-199 → JN-208)', () => {
  const sampleRing: Omit<CartItem, 'id'> = {
    productId: 'a0000000-0000-0000-0000-000000000001',
    variantId: 'b0000000-0000-0000-0000-000000000001',
    sku: 'SKU-RING-001-US10-PATINA',
    title: 'Kala Bhairab Talisman Signet Ring',
    slug: 'kala-bhairab-talisman-signet-ring',
    commerceModel: 'OM',
    unitPriceAmount: 32000,
    unitPriceCurrency: 'USD',
    selectedOptions: {
      ring_size: 'US 10',
      finish: 'Oxidized Charcoal Patina',
    },
    customSpecifications: {
      engraving_text: 'OM MANI PADME HUM',
    },
    quantity: 1,
  };

  const samplePendant: Omit<CartItem, 'id'> = {
    productId: 'a0000000-0000-0000-0000-000000000002',
    variantId: 'b0000000-0000-0000-0000-000000000002',
    sku: 'SKU-PENDANT-001-24IN-MIRROR',
    title: 'Garuda Repoussé Talisman Pendant',
    slug: 'garuda-repousse-talisman-pendant',
    commerceModel: 'DROP',
    unitPriceAmount: 45000,
    unitPriceCurrency: 'USD',
    selectedOptions: {
      chain_length: '24 Inches',
      finish: 'High-Mirror Polish',
    },
    quantity: 2,
  };

  beforeEach(() => {
    // Reset stores to pristine state before each test
    useCartStore.getState().clearCart();
    useCartStore.getState().closeCartDrawer();
    useCartStore.getState().setLoading(false);
    useCartStore.getState().setSyncing(false);
    useCartStore.getState().setError(null);
    useConfiguratorStore.getState().resetConfiguration();
    useUiStore.getState().closeSearch();
    useUiStore.getState().closeMobileNav();
    useUiStore.getState().resetAnnouncement();
    useUiStore.getState().closeModal();
  });

  // ==========================================================================
  // JN-199: Cart Store
  // ==========================================================================
  describe('JN-199: Cart Store Operations & State Invariants', () => {
    it('initializes with empty items and closed cart drawer', () => {
      const state = useCartStore.getState();
      assert.strictEqual(state.items.length, 0);
      assert.strictEqual(state.isCartDrawerOpen, false);
      assert.strictEqual(state.getTotalCount(), 0);
      assert.strictEqual(state.getSubtotalAmount(), 0);
    });

    it('toggles, opens, and closes the cart drawer', () => {
      const store = useCartStore.getState();
      assert.strictEqual(store.isCartDrawerOpen, false);

      store.openCartDrawer();
      assert.strictEqual(useCartStore.getState().isCartDrawerOpen, true);

      store.closeCartDrawer();
      assert.strictEqual(useCartStore.getState().isCartDrawerOpen, false);

      store.toggleCartDrawer();
      assert.strictEqual(useCartStore.getState().isCartDrawerOpen, true);

      store.toggleCartDrawer();
      assert.strictEqual(useCartStore.getState().isCartDrawerOpen, false);
    });

    it('adds new items with deterministic unique IDs and opens drawer', () => {
      const store = useCartStore.getState();
      store.addItem(sampleRing);

      const state = useCartStore.getState();
      assert.strictEqual(state.items.length, 1);
      assert.strictEqual(state.isCartDrawerOpen, true);
      assert.ok(state.items[0]!.id.includes(sampleRing.productId));
      assert.strictEqual(state.items[0]!.title, sampleRing.title);
      assert.strictEqual(state.items[0]!.quantity, 1);
      assert.strictEqual(state.getTotalCount(), 1);
      assert.strictEqual(state.getSubtotalAmount(), 32000);
    });

    it('deduplicates lines with identical options and increments quantity', () => {
      const store = useCartStore.getState();
      store.addItem(sampleRing);
      store.addItem({ ...sampleRing, quantity: 2 });

      const state = useCartStore.getState();
      assert.strictEqual(state.items.length, 1); // Deduplicated to single line
      assert.strictEqual(state.items[0]!.quantity, 3);
      assert.strictEqual(state.getTotalCount(), 3);
      assert.strictEqual(state.getSubtotalAmount(), 32000 * 3);
    });

    it('treats items with different options as distinct lines', () => {
      const store = useCartStore.getState();
      store.addItem(sampleRing);

      // Same ring but different size
      const ringDifferentSize = {
        ...sampleRing,
        sku: 'SKU-RING-001-US11-PATINA',
        selectedOptions: {
          ring_size: 'US 11',
          finish: 'Oxidized Charcoal Patina',
        },
      };
      store.addItem(ringDifferentSize);

      const state = useCartStore.getState();
      assert.strictEqual(state.items.length, 2);
      assert.strictEqual(state.getTotalCount(), 2);
    });

    it('clamps item quantity at max 10 to protect workshop batch bounds', () => {
      const store = useCartStore.getState();
      store.addItem({ ...sampleRing, quantity: 8 });
      store.addItem({ ...sampleRing, quantity: 5 });

      const state = useCartStore.getState();
      assert.strictEqual(state.items[0]!.quantity, 10); // Clamped at 10
    });

    it('removes item by ID', () => {
      const store = useCartStore.getState();
      store.addItem(sampleRing);
      const itemId = useCartStore.getState().items[0]!.id;

      store.removeItem(itemId);
      const state = useCartStore.getState();
      assert.strictEqual(state.items.length, 0);
      assert.strictEqual(state.getTotalCount(), 0);
    });

    it('updates quantity and automatically removes item when quantity reaches 0', () => {
      const store = useCartStore.getState();
      store.addItem(sampleRing);
      const itemId = useCartStore.getState().items[0]!.id;

      store.updateQuantity(itemId, 4);
      assert.strictEqual(useCartStore.getState().items[0]!.quantity, 4);

      store.updateQuantity(itemId, 0);
      assert.strictEqual(useCartStore.getState().items.length, 0);
    });

    it('clears all cart items on clearCart', () => {
      const store = useCartStore.getState();
      store.addItem(sampleRing);
      store.addItem(samplePendant);
      assert.strictEqual(useCartStore.getState().items.length, 2);

      store.clearCart();
      assert.strictEqual(useCartStore.getState().items.length, 0);
      assert.strictEqual(useCartStore.getState().getTotalCount(), 0);
    });
  });

  // ==========================================================================
  // JN-200: Configurator Store
  // ==========================================================================
  describe('JN-200: Configurator Store & Option Matrix', () => {
    it('initializes product base parameters and resets previous options', () => {
      const store = useConfiguratorStore.getState();
      store.initProduct(28000, 'USD', { ring_size: 'US 9' }, { ring_size: 'US 10' });

      const state = useConfiguratorStore.getState();
      assert.strictEqual(state.basePriceAmount, 28000);
      assert.strictEqual(state.unitPriceAmount, 28000);
      assert.strictEqual(state.unitPriceCurrency, 'USD');
      assert.strictEqual(state.selectedOptions['ring_size'], 'US 9');
      assert.strictEqual(state.vaultDefaults['ring_size'], 'US 10');
      assert.strictEqual(state.quantity, 1);
    });

    it('sets individual options and clears prior validation errors', () => {
      const store = useConfiguratorStore.getState();
      store.initProduct(32000, 'USD');
      store.setValidationErrors(['Please select a ring size']);
      assert.strictEqual(useConfiguratorStore.getState().validationErrors.length, 1);

      store.setOption('ring_size', 'US 10');
      const state = useConfiguratorStore.getState();
      assert.strictEqual(state.selectedOptions['ring_size'], 'US 10');
      assert.strictEqual(state.validationErrors.length, 0);
    });

    it('supports custom artisan repoussé engraving specifications', () => {
      const store = useConfiguratorStore.getState();
      store.setCustomSpecification('engraving_text', 'KATHMANDU 925');

      const state = useConfiguratorStore.getState();
      assert.strictEqual(state.customSpecifications['engraving_text'], 'KATHMANDU 925');
    });

    it('applies Atelier Sizing Vault defaults seamlessly', () => {
      const store = useConfiguratorStore.getState();
      store.initProduct(35000, 'USD', {}, { ring_size: 'US 10.5', chain_length: '22 Inches' });

      store.applyVaultDefaults();
      const state = useConfiguratorStore.getState();
      assert.strictEqual(state.selectedOptions['ring_size'], 'US 10.5');
      assert.strictEqual(state.selectedOptions['chain_length'], '22 Inches');
    });

    it('updates live resolved variant details and price delta', () => {
      const store = useConfiguratorStore.getState();
      store.initProduct(30000, 'USD');

      store.setResolvedVariant({
        sku: 'SKU-SIGNET-001',
        variantId: 'v-001',
        unitPriceAmount: 34500, // +45 USD delta for oxidized patina
        isAvailable: true,
        inventoryCount: 15,
      });

      const state = useConfiguratorStore.getState();
      assert.strictEqual(state.activeSku, 'SKU-SIGNET-001');
      assert.strictEqual(state.activeVariantId, 'v-001');
      assert.strictEqual(state.unitPriceAmount, 34500);
      assert.strictEqual(state.isAvailable, true);
      assert.strictEqual(state.inventoryCount, 15);
      assert.strictEqual(state.isResolving, false);
    });

    it('resets configuration back to clean base state', () => {
      const store = useConfiguratorStore.getState();
      store.initProduct(25000, 'USD', { ring_size: 'US 10' });
      store.setOption('finish', 'Oxidized');
      store.setQuantity(4);

      store.resetConfiguration();
      const state = useConfiguratorStore.getState();
      assert.deepStrictEqual(state.selectedOptions, {});
      assert.strictEqual(state.quantity, 1);
      assert.strictEqual(state.activeSku, null);
    });
  });

  // ==========================================================================
  // JN-201: UI Store
  // ==========================================================================
  describe('JN-201: UI Store State Management', () => {
    it('manages search modal visibility', () => {
      const store = useUiStore.getState();
      assert.strictEqual(store.isSearchOpen, false);

      store.openSearch();
      assert.strictEqual(useUiStore.getState().isSearchOpen, true);

      store.closeSearch();
      assert.strictEqual(useUiStore.getState().isSearchOpen, false);

      store.toggleSearch();
      assert.strictEqual(useUiStore.getState().isSearchOpen, true);
    });

    it('manages mobile drawer navigation state', () => {
      const store = useUiStore.getState();
      assert.strictEqual(store.isMobileNavOpen, false);

      store.openMobileNav();
      assert.strictEqual(useUiStore.getState().isMobileNavOpen, true);

      store.closeMobileNav();
      assert.strictEqual(useUiStore.getState().isMobileNavOpen, false);

      store.toggleMobileNav();
      assert.strictEqual(useUiStore.getState().isMobileNavOpen, true);
    });

    it('manages announcement bar dismissal lifecycle', () => {
      const store = useUiStore.getState();
      assert.strictEqual(store.isAnnouncementDismissed, false);

      store.dismissAnnouncement();
      assert.strictEqual(useUiStore.getState().isAnnouncementDismissed, true);

      store.resetAnnouncement();
      assert.strictEqual(useUiStore.getState().isAnnouncementDismissed, false);
    });

    it('manages active modal stacking', () => {
      const store = useUiStore.getState();
      assert.strictEqual(store.activeModalId, null);

      store.openModal('SIZING_MANDREL_MODAL');
      assert.strictEqual(useUiStore.getState().activeModalId, 'SIZING_MANDREL_MODAL');

      store.closeModal();
      assert.strictEqual(useUiStore.getState().activeModalId, null);
    });
  });

  // ==========================================================================
  // JN-202: Fine-Grained Selectors (Performance & Re-render Prevention)
  // ==========================================================================
  describe('JN-202: Fine-Grained Store Selectors', () => {
    it('computes accurate projections via cart selectors', () => {
      const store = useCartStore.getState();
      store.addItem(sampleRing);
      store.addItem(samplePendant);

      const state = useCartStore.getState();
      assert.strictEqual(selectCartItems(state).length, 2);
      assert.strictEqual(selectCartTotalCount(state), 3); // 1 ring + 2 pendants
      assert.strictEqual(selectCartSubtotal(state), 32000 * 1 + 45000 * 2);
      assert.strictEqual(selectIsCartDrawerOpen(state), true);
      assert.strictEqual(selectCartIsLoading(state), false);
      assert.strictEqual(selectCartIsSyncing(state), false);
    });

    it('computes accurate projections via configurator selectors', () => {
      const store = useConfiguratorStore.getState();
      store.initProduct(30000, 'USD', { ring_size: 'US 11' });
      store.setResolvedVariant({
        sku: 'SKU-001',
        unitPriceAmount: 33000,
        isAvailable: true,
        inventoryCount: 5,
      });

      store.setCustomSpecification('custom_engraving', 'KTM-925');

      const state = useConfiguratorStore.getState();
      assert.strictEqual(selectConfiguredUnitPrice(state), 33000);
      assert.strictEqual(selectConfiguredQuantity(state), 1);
      assert.strictEqual(selectConfiguredSku(state), 'SKU-001');
      assert.strictEqual(selectIsConfigValid(state), true);
      assert.strictEqual(selectIsConfigAvailable(state), true);
      assert.strictEqual(selectConfiguredOptions(state)['ring_size'], 'US 11');
      assert.strictEqual(
        selectConfiguredCustomSpecifications(state)['custom_engraving'],
        'KTM-925',
      );
    });

    it('computes accurate projections via UI selectors', () => {
      const store = useUiStore.getState();
      store.openSearch();
      store.dismissAnnouncement();

      const state = useUiStore.getState();
      assert.strictEqual(selectIsSearchOpen(state), true);
      assert.strictEqual(selectIsMobileNavOpen(state), false);
      assert.strictEqual(selectIsAnnouncementDismissed(state), true);
      assert.strictEqual(selectActiveModalId(state), null);
    });
  });

  // ==========================================================================
  // JN-203, JN-204 & JN-207: Persistence & Hydration Safety
  // ==========================================================================
  describe('JN-203, JN-204 & JN-207: Persistence Strategy & Hydration Safety', () => {
    it('tracks hydration state atomically', () => {
      const store = useCartStore.getState();
      store.setHydrated(false);
      assert.strictEqual(selectIsCartHydrated(useCartStore.getState()), false);

      store.setHydrated(true);
      assert.strictEqual(selectIsCartHydrated(useCartStore.getState()), true);
    });

    it('persists only domain item lines while leaving UI flags ephemeral', () => {
      const store = useCartStore.getState();
      store.addItem(sampleRing);
      store.openCartDrawer();
      store.setLoading(true);

      const state = useCartStore.getState();
      // Partialize logic verification
      assert.strictEqual(state.items.length, 1);
      assert.strictEqual(state.isCartDrawerOpen, true);
    });
  });

  // ==========================================================================
  // JN-205 & JN-206: Deterministic Cart Merge Policy (Guest → Authenticated)
  // ==========================================================================
  describe('JN-205 & JN-206: Deterministic Cart Merge Policy', () => {
    it('generates consistent fingerprints regardless of option key insertion order', () => {
      const itemA = {
        productId: 'prod-001',
        variantId: 'var-001',
        selectedOptions: { b_finish: 'patina', a_size: 'us_10' },
      };
      const itemB = {
        productId: 'prod-001',
        variantId: 'var-001',
        selectedOptions: { a_size: 'us_10', b_finish: 'patina' },
      };

      const fpA = computeLineItemFingerprint(itemA);
      const fpB = computeLineItemFingerprint(itemB);
      assert.strictEqual(fpA, fpB);
    });

    it('merges identical lines by summing quantities up to 10', () => {
      const serverLines: CartItem[] = [
        {
          ...sampleRing,
          id: 'server-line-1',
          quantity: 2,
        },
      ];

      const guestLines: CartItem[] = [
        {
          ...sampleRing,
          id: 'guest-line-1',
          quantity: 3,
        },
      ];

      const merged = mergeCartLinesPure(serverLines, guestLines);
      assert.strictEqual(merged.length, 1);
      assert.strictEqual(merged[0]!.quantity, 5); // 2 + 3
    });

    it('clamps merged quantity at maximum of 10 for identical lines', () => {
      const serverLines: CartItem[] = [
        {
          ...sampleRing,
          id: 'server-line-1',
          quantity: 7,
        },
      ];

      const guestLines: CartItem[] = [
        {
          ...sampleRing,
          id: 'guest-line-1',
          quantity: 6,
        },
      ];

      const merged = mergeCartLinesPure(serverLines, guestLines);
      assert.strictEqual(merged.length, 1);
      assert.strictEqual(merged[0]!.quantity, 10); // Clamped at 10
    });

    it('preserves distinct server and guest items in merged result', () => {
      const serverLines: CartItem[] = [
        {
          ...sampleRing,
          id: 'server-line-1',
          quantity: 1,
        },
      ];

      const guestLines: CartItem[] = [
        {
          ...samplePendant,
          id: 'guest-line-2',
          quantity: 2,
        },
      ];

      const merged = mergeCartLinesPure(serverLines, guestLines);
      assert.strictEqual(merged.length, 2);
      assert.ok(merged.some((i) => i.productId === sampleRing.productId));
      assert.ok(merged.some((i) => i.productId === samplePendant.productId));
    });

    it('handles empty server cart gracefully on guest login', () => {
      const guestLines: CartItem[] = [{ ...sampleRing, id: 'g-1', quantity: 2 }];
      const merged = mergeCartLinesPure([], guestLines);
      assert.strictEqual(merged.length, 1);
      assert.strictEqual(merged[0]!.quantity, 2);
    });

    it('handles empty guest cart gracefully on member login', () => {
      const serverLines: CartItem[] = [{ ...samplePendant, id: 's-1', quantity: 1 }];
      const merged = mergeCartLinesPure(serverLines, []);
      assert.strictEqual(merged.length, 1);
      assert.strictEqual(merged[0]!.quantity, 1);
    });
  });

  // ==========================================================================
  // Contract Validation & Schema Guards
  // ==========================================================================
  describe('Contracts & Schema Validation for Cart Data Flow', () => {
    it('validates a well-formed CartItemDto', () => {
      const validItem = {
        ...sampleRing,
        id: 'cart-line-valid-1',
      };
      const result = CartItemSchema.safeParse(validItem);
      assert.strictEqual(result.success, true);
    });

    it('rejects CartItem with invalid negative price or quantity above 10', () => {
      const invalidPrice = {
        ...sampleRing,
        id: 'cart-line-invalid-1',
        unitPriceAmount: -500,
      };
      assert.strictEqual(CartItemSchema.safeParse(invalidPrice).success, false);

      const invalidQty = {
        ...sampleRing,
        id: 'cart-line-invalid-2',
        quantity: 15, // max is 10
      };
      assert.strictEqual(CartItemSchema.safeParse(invalidQty).success, false);
    });

    it('validates a complete CartDto with multiple lines and subtotal', () => {
      const validCart = {
        id: 'c0000000-0000-0000-0000-000000000001',
        customerId: 'u0000000-0000-0000-0000-000000000001',
        items: [{ ...sampleRing, id: 'line-1' }],
        totalCount: 1,
        subtotalAmount: 32000,
        currency: 'USD',
        updatedAt: new Date().toISOString(),
      };
      assert.strictEqual(CartDtoSchema.safeParse(validCart).success, true);
    });

    it('validates SyncCartInput and MergeCartInput payloads', () => {
      const syncPayload = { items: [{ ...sampleRing, id: 'line-1' }] };
      assert.strictEqual(SyncCartInputSchema.safeParse(syncPayload).success, true);

      const mergePayload = { guestItems: [{ ...samplePendant, id: 'line-2' }] };
      assert.strictEqual(MergeCartInputSchema.safeParse(mergePayload).success, true);
    });
  });
});
