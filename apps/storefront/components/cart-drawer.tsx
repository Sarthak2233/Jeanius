'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../stores';
import { Drawer } from './drawer';
import { EmptyState } from './empty-state';
import { Button } from './button';
import { PriceDisplay } from './price-display';

function useSafeRouter() {
  try {
    return useRouter();
  } catch {
    return null;
  }
}

export interface CartDrawerProps {
  readonly isOpen?: boolean;
  readonly onClose?: () => void;
  readonly itemCount?: number;
}

export function CartDrawer({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  itemCount: controlledItemCount,
}: CartDrawerProps = {}) {
  const router = useSafeRouter();
  const storeIsOpen = useCartStore((state) => state.isCartDrawerOpen);
  const storeClose = useCartStore((state) => state.closeCartDrawer);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotalCount = useCartStore((state) => state.getTotalCount);
  const getSubtotalAmount = useCartStore((state) => state.getSubtotalAmount);

  const isCartDrawerOpen = controlledIsOpen ?? storeIsOpen;
  const closeCartDrawer = controlledOnClose ?? storeClose;
  const totalCount = controlledItemCount ?? getTotalCount();
  const subtotal = getSubtotalAmount();

  const handleProceedToCheckout = () => {
    closeCartDrawer();
    if (router) {
      router.push('/checkout');
    } else if (typeof window !== 'undefined') {
      window.location.href = '/checkout';
    }
  };

  return (
    <Drawer
      isOpen={isCartDrawerOpen}
      onClose={closeCartDrawer}
      position="right"
      title={`Atelier Bag (${totalCount})`}
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
        {items.length === 0 ? (
          <div style={{ padding: '2rem 1rem' }}>
            <EmptyState
              title="Your Atelier Bag is Empty"
              description="Explore handcrafted .925 sterling silver talismans and bespoke jewellery."
              actionLabel="EXPLORE ATELIER"
              onAction={closeCartDrawer}
            />
          </div>
        ) : (
          <div
            style={{
              padding: '1rem',
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #ebe7df',
                  borderRadius: '6px',
                  alignItems: 'flex-start',
                }}
              >
                {item.imageUrl ? (
                  <div
                    style={{
                      width: '68px',
                      height: '68px',
                      position: 'relative',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      backgroundColor: '#f1f5f9',
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="68px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '4px',
                      backgroundColor: '#1e293b',
                      color: '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.68rem',
                      fontFamily: 'monospace',
                      flexShrink: 0,
                    }}
                  >
                    .925
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    href={`/shop/${item.slug}`}
                    onClick={closeCartDrawer}
                    style={{
                      textDecoration: 'none',
                      color: '#0f172a',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      display: 'block',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {item.title}
                  </Link>

                  {item.commerceModel === 'OM' && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-mono, monospace)',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        padding: '0.15rem 0.4rem',
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        borderRadius: '3px',
                        border: '1px solid #fde68a',
                        display: 'inline-block',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Order-Made · Bench Crafted
                    </span>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.35rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {item.customSpecifications &&
                      Object.entries(item.customSpecifications).map(([key, value]) => (
                        <span
                          key={key}
                          style={{
                            fontSize: '0.7rem',
                            fontFamily: 'var(--font-mono, monospace)',
                            padding: '0.15rem 0.4rem',
                            backgroundColor: '#f8fafc',
                            color: '#334155',
                            borderRadius: '3px',
                            border: '1px solid #cbd5e1',
                          }}
                        >
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}: {String(value)}
                        </span>
                      ))}
                    {Object.entries(item.selectedOptions).map(([key, value]) => (
                      <span
                        key={key}
                        style={{
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-mono, monospace)',
                          textTransform: 'uppercase',
                          padding: '0.15rem 0.4rem',
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          borderRadius: '3px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {key.replace('_', ' ')}: {value.replace('_', ' ')}
                      </span>
                    ))}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '0.25rem 0.5rem',
                          cursor: 'pointer',
                          color: '#475569',
                          fontWeight: 700,
                        }}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span
                        style={{
                          padding: '0 0.5rem',
                          fontSize: '0.82rem',
                          fontFamily: 'monospace',
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '0.25rem 0.5rem',
                          cursor: 'pointer',
                          color: '#475569',
                          fontWeight: 700,
                        }}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <PriceDisplay
                      amount={item.unitPriceAmount * item.quantity}
                      currency={item.unitPriceCurrency}
                      size="sm"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '0.2rem',
                  }}
                  aria-label="Remove item"
                >
                  ✕
                </button>
              </div>
            ))}
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
              marginBottom: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <span style={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Subtotal
            </span>
            <PriceDisplay amount={subtotal} currency="USD" size="md" />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              fontSize: '0.8rem',
            }}
          >
            <span style={{ color: '#94a3b8' }}>Shipping (DHL Express)</span>
            <span style={{ color: '#0f172a', fontWeight: 500 }}>Calculated at checkout</span>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={items.length === 0}
            onClick={handleProceedToCheckout}
          >
            PROCEED TO CHECKOUT
          </Button>

          <p
            style={{
              fontSize: '0.72rem',
              color: '#94a3b8',
              textAlign: 'center',
              marginTop: '0.75rem',
              marginBottom: 0,
            }}
          >
            Individually cast and finished at Kathmandu Workshop.
          </p>
        </div>
      </div>
    </Drawer>
  );
}
