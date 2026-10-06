'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export interface AnnouncementBarProps {
  readonly message?: string;
  readonly linkText?: string;
  readonly linkHref?: string;
  readonly storageKey?: string;
}

export function AnnouncementBar({
  message = 'Order-Made (OM) pieces require 14–21 workshop days. Precision sizing is locked once cutting begins.',
  linkText = 'Learn more →',
  linkHref = '/about',
  storageKey = 'jj_announcement_dismissed',
}: AnnouncementBarProps) {
  const [isDismissed, setIsDismissed] = useState<boolean>(true); // default true for SSR stability

  useEffect(() => {
    try {
      const dismissed = window.sessionStorage.getItem(storageKey);
      if (!dismissed) {
        setIsDismissed(false);
      }
    } catch {
      setIsDismissed(false);
    }
  }, [storageKey]);

  if (isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      window.sessionStorage.setItem(storageKey, 'true');
    } catch {
      // Ignore sessionStorage exceptions in private browsing
    }
  };

  return (
    <aside
      role="complementary"
      aria-label="Atelier operational notice"
      style={{
        backgroundColor: '#faf8f4',
        borderBottom: '1px solid #e2e8f0',
        color: '#475569',
        fontSize: '0.75rem',
        letterSpacing: '0.04em',
        padding: '0.4rem 1rem',
        position: 'relative',
        zIndex: 40,
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <span style={{ fontWeight: 500 }}>{message}</span>

        {linkHref && linkText && (
          <Link
            href={linkHref}
            style={{
              color: '#0f172a',
              fontWeight: 600,
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              whiteSpace: 'nowrap',
            }}
          >
            {linkText}
          </Link>
        )}

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss operational notice"
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '8px',
            minWidth: '32px',
            minHeight: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
