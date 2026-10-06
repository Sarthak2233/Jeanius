'use client';

import React from 'react';
import { useCartStore } from '../stores';
import { Drawer } from './drawer';
import { EmptyState } from './empty-state';
import { Button } from './button';

export interface CartDrawerProps {
  readonly isOpen?: boolean;
  readonly onClose?: () => void;
  readonly itemCount?: number;
}

export function CartDrawer({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  itemCount = 0,
}: CartDrawerProps = {}) {
  const storeIsOpen = useCartStore((state) => state.isCartDrawerOpen);
  const storeClose = useCartStore((state) => state.closeCartDrawer);

  const isCartDrawerOpen = controlledIsOpen ?? storeIsOpen;
  const closeCartDrawer = controlledOnClose ?? storeClose;

  return (
    <Drawer
      isOpen={isCartDrawerOpen}
      onClose={closeCartDrawer}
      position="right"
      title={`Atelier Bag (${itemCount})`}
      size="md"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between',
        }}
      >
        {itemCount === 0 ? (
          <div style={{ padding: '2rem 1rem' }}>
            <EmptyState
              title="Your Atelier Bag is Empty"
              description="Explore precision handmade selvedge denim and bespoke sterling silver jewellery."
              actionLabel="EXPLORE ATELIER"
              onAction={closeCartDrawer}
            />
          </div>
        ) : (
          <div style={{ padding: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Your bag items will be calculated server-side during checkout.
            </p>
          </div>
        )}

        <div
          style={{
            borderTop: '1px solid #e2e8f0',
            padding: '1.25rem',
            backgroundColor: '#faf8f4',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <span style={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Shipping
            </span>
            <span style={{ color: '#0f172a' }}>Calculated at checkout</span>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={itemCount === 0}
            onClick={closeCartDrawer}
          >
            PROCEED TO CHECKOUT
          </Button>

          <p
            style={{
              fontSize: '0.75rem',
              color: '#94a3b8',
              textAlign: 'center',
              marginTop: '0.75rem',
              marginBottom: 0,
            }}
          >
            All Order-Made (OM) pieces are tailored individually.
          </p>
        </div>
      </div>
    </Drawer>
  );
}
