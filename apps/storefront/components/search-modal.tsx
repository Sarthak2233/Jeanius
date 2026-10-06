'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUiStore } from '../stores';
import { Modal } from './modal';

const SUGGESTED_QUERIES = [
  { label: 'Raw Selvedge 16oz', href: '/?q=selvedge' },
  { label: 'Ring Mandrel Guide', href: '/sizing' },
  { label: 'OM Tailoring Lead Time', href: '/about' },
  { label: 'Sterling Silver 925', href: '/?q=silver' },
];

export interface SearchModalProps {
  readonly isOpen?: boolean;
  readonly onClose?: () => void;
}

export function SearchModal({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}: SearchModalProps = {}) {
  const storeIsOpen = useUiStore((state) => state.isSearchOpen);
  const openSearch = useUiStore((state) => state.openSearch);
  const storeClose = useUiStore((state) => state.closeSearch);

  const isSearchOpen = controlledIsOpen ?? storeIsOpen;
  const closeSearch = controlledOnClose ?? storeClose;

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard listener for '/' and 'Cmd+K' / 'Ctrl+K'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isEditable =
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        document.activeElement?.getAttribute('contenteditable') === 'true';

      if (e.key === '/' && !isEditable && !isSearchOpen) {
        e.preventDefault();
        openSearch();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isSearchOpen) {
          closeSearch();
        } else {
          openSearch();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, openSearch, closeSearch]);

  // Focus input when opened
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  return (
    <Modal isOpen={isSearchOpen} onClose={closeSearch} title="Search Atelier & Studio" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              position: 'absolute',
              left: '0.75rem',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search selvedge denim, jewellery, sizing..."
            aria-label="Search catalog query"
            style={{
              width: '100%',
              padding: '0.75rem 2.5rem 0.75rem 2.5rem',
              fontSize: '0.95rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search query"
              style={{
                position: 'absolute',
                right: '0.75rem',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round" />
                <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        <div>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#64748b',
              marginBottom: '0.5rem',
            }}
          >
            Curated Highlights
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {SUGGESTED_QUERIES.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeSearch}
                style={{
                  display: 'inline-block',
                  fontSize: '0.8rem',
                  padding: '0.35rem 0.65rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '3px',
                  color: '#334155',
                  textDecoration: 'none',
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid #f1f5f9',
            paddingTop: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: '#94a3b8',
          }}
        >
          <span>
            Press{' '}
            <kbd style={{ padding: '1px 4px', background: '#f1f5f9', borderRadius: '2px' }}>
              ESC
            </kbd>{' '}
            to exit
          </span>
          <span>Order-Made & Limited Drops</span>
        </div>
      </div>
    </Modal>
  );
}
