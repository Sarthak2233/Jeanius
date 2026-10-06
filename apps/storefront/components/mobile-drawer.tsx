'use client';

import React from 'react';
import Link from 'next/link';
import { useUiStore } from '../stores';
import { Drawer } from './drawer';
import { AccountNavState } from './account-nav-state';

export interface MobileDrawerProps {
  readonly isOpen?: boolean;
  readonly onClose?: () => void;
  readonly isAuthenticated?: boolean;
  readonly role?: string;
  readonly fullName?: string;
}

export function MobileDrawer({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  isAuthenticated = false,
  role = 'COLLECTOR',
  fullName = 'Collector',
}: MobileDrawerProps) {
  const storeIsOpen = useUiStore((state) => state.isMobileNavOpen);
  const storeClose = useUiStore((state) => state.closeMobileNav);

  const isOpen = controlledIsOpen ?? storeIsOpen;
  const closeMobileNav = controlledOnClose ?? storeClose;

  const isMemberOrAdmin = role === 'MEMBER' || role === 'ADMIN';

  const NAV_LINKS = [
    { label: 'About / Guide', href: '/about' },
    { label: 'Shop (OM)', href: '/' },
    {
      label: 'Drop',
      href: '/drop',
      badge: !isMemberOrAdmin ? '🔒 VIP' : '★ VIP',
      isVip: true,
    },
    { label: 'Together', href: '/together' },
    { label: 'Sizing Guide', href: '/sizing' },
    { label: 'Contact Studio', href: '/contact' },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={closeMobileNav}
      position="left"
      title="Atelier Navigation"
      size="sm"
    >
      <div
        id="mobile-navigation-drawer"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between',
          padding: '1.25rem',
        }}
      >
        {/* Navigation Links */}
        <nav
          aria-label="Mobile navigation list"
          style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobileNav}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0.5rem',
                borderBottom: '1px solid #f1f5f9',
                textDecoration: 'none',
                color: link.isVip && isMemberOrAdmin ? '#b45309' : '#0f172a',
                fontSize: '0.95rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                minHeight: '44px',
              }}
            >
              <span>{link.label}</span>
              {link.badge && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '2px',
                    backgroundColor: isMemberOrAdmin ? '#fef3c7' : '#f1f5f9',
                    color: isMemberOrAdmin ? '#92400e' : '#64748b',
                    fontWeight: 700,
                  }}
                >
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Account and Telemetry Bottom Cluster */}
        <div
          style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <AccountNavState
            isAuthenticated={isAuthenticated}
            role={role}
            fullName={fullName}
            variant="mobile"
            onNavigate={closeMobileNav}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem',
              color: '#94a3b8',
              paddingTop: '0.5rem',
            }}
          >
            <span>Region: Worldwide (USD)</span>
            <span>Kathmandu &amp; Seoul</span>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
