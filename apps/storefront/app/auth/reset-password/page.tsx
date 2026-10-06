'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { resetPasswordAction } from '../../../actions/auth.actions';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    startTransition(async () => {
      const result = await resetPasswordAction({ password });
      if (!result.success) {
        setError(result.error?.message || 'Failed to update password');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/account');
        router.refresh();
      }, 2000);
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
          Security Update
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
          Set New Password
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
          Create a new strong password for your atelier profile
        </p>
      </div>

      {success ? (
        <div
          style={{
            padding: '1.5rem',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
          <h2
            style={{
              fontSize: '1.2rem',
              color: '#166534',
              margin: '0 0 0.5rem 0',
              fontWeight: 600,
            }}
          >
            Password Updated
          </h2>
          <p style={{ color: '#15803d', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>
            Your credentials have been securely updated. Redirecting to your Atelier Vault...
          </p>
          <Link
            href="/account"
            style={{
              display: 'inline-block',
              padding: '0.65rem 1.25rem',
              background: '#0f172a',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            Go to Account Now
          </Link>
        </div>
      ) : (
        <>
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
                htmlFor="password"
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
                New Password (min 8 characters)
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
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

            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="confirmPassword"
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
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
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
              {isPending ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
