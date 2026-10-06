'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { signUpAction } from '../../actions/auth.actions';

export default function StorefrontSignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await signUpAction({
        fullName,
        email,
        password,
        phone: phone.trim() ? phone.trim() : undefined,
      });

      if (!result.success) {
        setError(result.error?.message || 'Registration failed. Please check your inputs.');
        return;
      }

      setSuccess(true);
    });
  };

  return (
    <div
      style={{
        maxWidth: '480px',
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
          Bespoke Membership
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
          Create Profile
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
          Begin your journey with custom raw selvedge & hand-forged jewellery
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
            Registration Initiated
          </h2>
          <p
            style={{
              color: '#15803d',
              fontSize: '0.9rem',
              lineHeight: 1.5,
              margin: '0 0 1.5rem 0',
            }}
          >
            Your profile for <strong>{email}</strong> has been created. Please verify your email
            address to activate your account.
          </p>
          <div
            style={{
              padding: '0.75rem',
              background: '#ffffff',
              border: '1px dashed #86efac',
              borderRadius: '4px',
              fontSize: '0.8rem',
              color: '#166534',
              marginBottom: '1.5rem',
              textAlign: 'left',
            }}
          >
            <strong>Local Development Note:</strong>
            <br />
            Supabase sends emails to your local mailbox. Open{' '}
            <a
              href="http://localhost:54324"
              target="_blank"
              rel="noreferrer"
              style={{ color: '#15803d', fontWeight: 600, textDecoration: 'underline' }}
            >
              Inbucket (http://localhost:54324)
            </a>{' '}
            to view and confirm your verification link.
          </div>
          <Link
            href="/login"
            style={{
              display: 'inline-block',
              padding: '0.65rem 1.25rem',
              background: '#0f172a',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '0.85rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Proceed to Sign In
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
                htmlFor="fullName"
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
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Alex Morgan"
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
                Password (min 8 characters)
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
                htmlFor="phone"
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
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                placeholder="+1-555-0199"
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
              {isPending ? 'Registering Atelier Profile...' : 'Complete Registration'}
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
            Already have an account?{' '}
            <Link
              href="/login"
              style={{ color: '#0f172a', fontWeight: 600, textDecoration: 'underline' }}
            >
              Sign In
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
