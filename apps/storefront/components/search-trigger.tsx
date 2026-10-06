'use client';

import React from 'react';
import { useUiStore } from '../stores';

export interface SearchTriggerProps {
  readonly variant?: 'default' | 'icon-only';
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function SearchTrigger({ variant = 'default', className, style }: SearchTriggerProps) {
  const openSearch = useUiStore((state) => state.openSearch);

  if (variant === 'icon-only') {
    return (
      <button
        type="button"
        onClick={openSearch}
        aria-label="Search studio (Press /)"
        className={className}
        style={{
          background: 'none',
          border: 'none',
          color: '#334155',
          cursor: 'pointer',
          padding: '10px',
          minWidth: '44px',
          minHeight: '44px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          ...style,
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
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openSearch}
      aria-label="Search studio (Press / to focus)"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '0.45rem 1.15rem',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '9999px',
        color: '#64748b',
        fontSize: '0.78rem',
        cursor: 'pointer',
        minWidth: '320px',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
        transition: 'border-color 150ms ease, box-shadow 150ms ease, color 150ms ease',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ color: '#94a3b8' }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span style={{ letterSpacing: '0.01em' }}>Search catalog...</span>
      </div>
      <kbd
        style={{
          fontSize: '0.68rem',
          fontFamily: 'var(--font-mono, monospace)',
          backgroundColor: '#f8fafc',
          color: '#475569',
          padding: '0.1rem 0.45rem',
          borderRadius: '4px',
          border: '1px solid #cbd5e1',
          fontWeight: 600,
        }}
      >
        /
      </kbd>
    </button>
  );
}
