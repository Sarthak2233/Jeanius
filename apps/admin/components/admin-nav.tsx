import React from 'react';
import Link from 'next/link';
import { adminLogoutAction } from '../actions/admin-auth.actions';
import { createClient } from '../lib/supabase/server';

export interface AdminNavProps {
  readonly currentBench?: 'DIRECTOR' | 'TAILOR' | 'JEWELLER' | 'FULFILLMENT' | 'SUPPORT';
}

export async function AdminNav({ currentBench = 'DIRECTOR' }: AdminNavProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = (user?.user_metadata?.role as string) || 'STAFF';
  const email = user?.email || 'staff@jeanius.co';
  const isAdmin = role === 'ADMIN';

  return (
    <nav
      style={{
        borderBottom: '1px solid #334155',
        background: '#1e293b',
        padding: '0.85rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            color: '#f8fafc',
            fontWeight: 800,
            fontSize: '1rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Jeanius Atelier Console
        </Link>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {isAdmin && (
            <Link
              href="/"
              style={{
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: currentBench === 'DIRECTOR' ? '#38bdf8' : '#94a3b8',
                borderBottom: currentBench === 'DIRECTOR' ? '2px solid #38bdf8' : 'none',
                paddingBottom: '0.2rem',
              }}
            >
              Director
            </Link>
          )}

          {(isAdmin || role === 'TAILOR') && (
            <Link
              href="/workshop/tailor"
              style={{
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: currentBench === 'TAILOR' ? '#38bdf8' : '#94a3b8',
                borderBottom: currentBench === 'TAILOR' ? '2px solid #38bdf8' : 'none',
                paddingBottom: '0.2rem',
              }}
            >
              Denim Bench
            </Link>
          )}

          {(isAdmin || role === 'JEWELLER') && (
            <Link
              href="/workshop/jeweller"
              style={{
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: currentBench === 'JEWELLER' ? '#38bdf8' : '#94a3b8',
                borderBottom: currentBench === 'JEWELLER' ? '2px solid #38bdf8' : 'none',
                paddingBottom: '0.2rem',
              }}
            >
              Jeweller Bench
            </Link>
          )}

          {(isAdmin || role === 'FULFILLMENT') && (
            <Link
              href="/fulfillment"
              style={{
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: currentBench === 'FULFILLMENT' ? '#38bdf8' : '#94a3b8',
                borderBottom: currentBench === 'FULFILLMENT' ? '2px solid #38bdf8' : 'none',
                paddingBottom: '0.2rem',
              }}
            >
              Fulfillment
            </Link>
          )}

          {(isAdmin || role === 'SUPPORT') && (
            <Link
              href="/support"
              style={{
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: currentBench === 'SUPPORT' ? '#38bdf8' : '#94a3b8',
                borderBottom: currentBench === 'SUPPORT' ? '2px solid #38bdf8' : 'none',
                paddingBottom: '0.2rem',
              }}
            >
              Support Desk
            </Link>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              padding: '0.2rem 0.5rem',
              borderRadius: '3px',
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              background: '#0284c7',
              color: '#ffffff',
            }}
          >
            {role}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{email}</span>
        </div>

        <form action={adminLogoutAction}>
          <button
            type="submit"
            style={{
              background: '#334155',
              border: 'none',
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              color: '#f8fafc',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Exit Rail
          </button>
        </form>
      </div>
    </nav>
  );
}
