'use client';

import React, { useState, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginAction } from '../../actions/auth.actions';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleQuickFill = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await loginAction({ email, password });
      if (!result.success) {
        setError(result.error?.message || 'Authentication failed. Please verify credentials.');
        return;
      }

      router.push(returnUrl);
      router.refresh();
    });
  };

  return (
    <div
      style={{
        maxWidth: '440px',
        margin: '3rem auto',
        padding: '2.5rem',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <p
          style={{
            fontSize: '0.75rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#b45309',
            fontWeight: 600,
            margin: '0 0 0.5rem 0',
          }}
        >
          Customer Portal
        </p>
        <h1
          style={{
            fontSize: '1.75rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: '#0f172a',
            margin: '0 0 0.5rem 0',
            fontFamily: 'serif',
          }}
        >
          Atelier Sign In
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
          Access your saved bespoke measurements vault & orders
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '4px',
            color: '#991b1b',
            fontSize: '0.85rem',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#334155',
              marginBottom: '0.4rem',
            }}
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="collector@example.com"
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              fontSize: '0.95rem',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.4rem',
            }}
          >
            <label
              htmlFor="password"
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#334155',
              }}
            >
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              style={{ fontSize: '0.75rem', color: '#b45309', textDecoration: 'none' }}
            >
              Forgot Password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••••••"
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              fontSize: '0.95rem',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            background: '#0f172a',
            color: '#fdfbf7',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.9rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.7 : 1,
            transition: 'background-color 0.15s ease',
          }}
        >
          {isPending ? 'Verifying Atelier Credentials...' : 'Sign In to Atelier'}
        </button>
      </form>

      <div
        style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid #f1f5f9',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: '#64748b',
        }}
      >
        New to Jeanius & Jewl?{' '}
        <Link
          href="/signup"
          style={{ color: '#0f172a', fontWeight: 600, textDecoration: 'underline' }}
        >
          Create an Account
        </Link>
      </div>

      <div
        style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '4px',
        }}
      >
        <div
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#64748b',
            marginBottom: '0.5rem',
          }}
        >
          Development Quick-Fill:
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleQuickFill('shopper@example.com', 'customerpassword123')}
            style={{
              display: 'inline-block',
              padding: '0.35rem 0.6rem',
              fontSize: '0.75rem',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '3px',
              color: '#0f172a',
              cursor: 'pointer',
            }}
          >
            Customer (shopper@example.com)
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('vip@example.com', 'memberpassword123')}
            style={{
              display: 'inline-block',
              padding: '0.35rem 0.6rem',
              fontSize: '0.75rem',
              background: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: '3px',
              color: '#92400e',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            VIP Member (vip@example.com)
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StorefrontLoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          Loading Atelier Portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
