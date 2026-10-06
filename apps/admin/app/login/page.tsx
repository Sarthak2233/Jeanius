'use client';

import React, { useState, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { adminLoginAction } from '../../actions/admin-auth.actions';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#090d16' }} />}>
      <LoginFormContent />
    </Suspense>
  );
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(
    errorParam === 'unauthorized_customer'
      ? 'Shopper/Customer accounts are not authorized for atelier staff access.'
      : null,
  );
  const [isPending, startTransition] = useTransition();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const res = await adminLoginAction({
        email,
        password,
      });

      if (!res.success) {
        setErrorMsg(res.error?.message || 'Authentication failed');
        return;
      }

      // Successful staff login: navigate to returnUrl or designated dashboard
      const target = returnUrl !== '/' ? returnUrl : res.data?.redirectPath || '/';
      router.push(target);
      router.refresh();
    });
  };

  const fillCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#090d16',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '2.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <span
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#38bdf8',
              fontWeight: 600,
            }}
          >
            Kathmandu Workshop Rail
          </span>
          <h1
            style={{
              fontSize: '1.5rem',
              letterSpacing: '0.05em',
              margin: '0.5rem 0 0 0',
              color: '#f8fafc',
            }}
          >
            ATELIER OPERATIONS
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Restricted Staff & Workshop Floor Terminal
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              backgroundColor: '#450a0a',
              border: '1px solid #dc2626',
              borderRadius: '6px',
              color: '#fca5a5',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
            }}
          >
            {errorMsg}
          </div>
        )}

        <form
          onSubmit={handleLogin}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 500,
                color: '#cbd5e1',
                marginBottom: '0.5rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Staff Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="artisan@jeanius.co"
              style={{
                width: '100%',
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '6px',
                padding: '0.75rem 1rem',
                color: '#f8fafc',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 500,
                color: '#cbd5e1',
                marginBottom: '0.5rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{
                width: '100%',
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '6px',
                padding: '0.75rem 1rem',
                color: '#f8fafc',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            style={{
              marginTop: '0.5rem',
              width: '100%',
              backgroundColor: isPending ? '#475569' : '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.85rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              cursor: isPending ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            {isPending ? 'Verifying Credentials...' : 'Authenticate & Enter Rail'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #334155' }}>
          <p
            style={{
              fontSize: '0.75rem',
              color: '#64748b',
              margin: '0 0 0.75rem 0',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textAlign: 'center',
            }}
          >
            Local Development Quick Fill
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => fillCredentials('admin@jeanius.co', 'adminpassword123')}
              style={{
                padding: '0.5rem',
                fontSize: '0.75rem',
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '4px',
                color: '#cbd5e1',
                cursor: 'pointer',
              }}
            >
              Director (ADMIN)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('mastercutter@jeanius.co', 'tailorpassword123')}
              style={{
                padding: '0.5rem',
                fontSize: '0.75rem',
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '4px',
                color: '#cbd5e1',
                cursor: 'pointer',
              }}
            >
              Master Cutter (TAILOR)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('metalsmith@jeanius.co', 'jewellerpassword123')}
              style={{
                padding: '0.5rem',
                fontSize: '0.75rem',
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '4px',
                color: '#cbd5e1',
                cursor: 'pointer',
              }}
            >
              Metalsmith (JEWELLER)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('logistics@jeanius.co', 'fulfillmentpassword123')}
              style={{
                padding: '0.5rem',
                fontSize: '0.75rem',
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '4px',
                color: '#cbd5e1',
                cursor: 'pointer',
              }}
            >
              Logistics (FULFILLMENT)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('care@jeanius.co', 'supportpassword123')}
              style={{
                padding: '0.5rem',
                fontSize: '0.75rem',
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '4px',
                color: '#cbd5e1',
                cursor: 'pointer',
              }}
            >
              Support (SUPPORT)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
