'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { redeemInviteTokenAction } from '../../actions/membership.actions';

export function InviteTokenRedeemer() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await redeemInviteTokenAction(token.trim());
      if (res.success) {
        setMessage({
          type: 'success',
          text: res.data?.message ?? 'VIP Member status activated. Refreshing vault...',
        });
        setTimeout(() => {
          router.refresh();
        }, 800);
      } else {
        setMessage({
          type: 'error',
          text: res.error?.message ?? 'Invalid invitation token.',
        });
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'An error occurred while redeeming your token.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
      }}
    >
      <div
        style={{
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          color: '#64748b',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '0.4rem',
        }}
      >
        Have an Atelier Invitation?
      </div>
      <p style={{ margin: '0 0 1rem 0', fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
        Enclosed invitation tokens from previous jewellery boxes or VIP private invitations can be
        redeemed below for immediate vault privileges.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}
      >
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="e.g. VIP-ATELIER-925"
          disabled={isSubmitting}
          style={{
            flex: '1 1 240px',
            padding: '0.65rem 1rem',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            fontSize: '0.9rem',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        />
        <button
          type="submit"
          disabled={isSubmitting || !token.trim()}
          style={{
            padding: '0.65rem 1.25rem',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? 'Verifying...' : 'Redeem Token →'}
        </button>
      </form>

      {message && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.6rem 0.85rem',
            borderRadius: '4px',
            fontSize: '0.85rem',
            backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: message.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
