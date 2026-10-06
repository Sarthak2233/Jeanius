'use client';

import React from 'react';
import Link from 'next/link';
import { logoutAction } from '../actions/auth.actions';

export interface AccountNavStateProps {
  readonly isAuthenticated: boolean;
  readonly role?: string;
  readonly fullName?: string;
  readonly variant?: 'desktop' | 'mobile';
  readonly onNavigate?: () => void;
}

export function AccountNavState({
  isAuthenticated,
  role = 'COLLECTOR',
  fullName = 'Collector',
  variant = 'desktop',
  onNavigate,
}: AccountNavStateProps) {
  const isMember = role === 'MEMBER';
  const isAdmin = role === 'ADMIN';

  if (!isAuthenticated) {
    if (variant === 'mobile') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          <Link
            href="/login"
            onClick={onNavigate}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.75rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              color: '#0f172a',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              minHeight: '44px',
            }}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            onClick={onNavigate}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.75rem',
              backgroundColor: '#0f172a',
              borderRadius: '4px',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              minHeight: '44px',
            }}
          >
            Register
          </Link>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link
          href="/login"
          style={{
            textDecoration: 'none',
            color: '#334155',
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '0.35rem 0.5rem',
            transition: 'color var(--duration-micro, 150ms) ease',
          }}
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          style={{
            textDecoration: 'none',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)',
            transition: 'opacity var(--duration-micro, 150ms) ease',
          }}
        >
          Register
        </Link>
      </div>
    );
  }

  // Authenticated State
  const roleBadgeBackground = isMember ? '#fef3c7' : isAdmin ? '#e0e7ff' : '#f1f5f9';
  const roleBadgeColor = isMember ? '#92400e' : isAdmin ? '#3730a3' : '#475569';
  const roleLabel = isMember ? '★ VIP' : role;

  if (variant === 'mobile') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
        <Link
          href="/account"
          onClick={onNavigate}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            backgroundColor: '#faf8f4',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            textDecoration: 'none',
            color: '#0f172a',
            minHeight: '44px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.15rem 0.45rem',
                borderRadius: '3px',
                backgroundColor: roleBadgeBackground,
                color: roleBadgeColor,
                textTransform: 'uppercase',
              }}
            >
              {roleLabel}
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{fullName}</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Account →</span>
        </Link>

        <form action={logoutAction}>
          <button
            type="submit"
            onClick={onNavigate}
            style={{
              width: '100%',
              padding: '0.65rem',
              background: 'none',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              color: '#64748b',
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            Sign Out
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <Link
        href="/account"
        style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: '#0f172a',
        }}
      >
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '0.15rem 0.45rem',
            borderRadius: '3px',
            backgroundColor: roleBadgeBackground,
            color: roleBadgeColor,
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
          }}
        >
          {roleLabel}
        </span>
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{fullName}</span>
      </Link>

      <form action={logoutAction}>
        <button
          type="submit"
          style={{
            background: 'none',
            border: '1px solid #e2e8f0',
            padding: '0.35rem 0.65rem',
            borderRadius: '4px',
            color: '#64748b',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'border-color 150ms ease, color 150ms ease',
          }}
        >
          Sign Out
        </button>
      </form>
    </div>
  );
}
