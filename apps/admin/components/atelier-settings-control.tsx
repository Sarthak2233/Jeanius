'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateAtelierSettingAction } from '../actions/settings.actions';

export interface AtelierSettingsControlProps {
  readonly initialThreshold: number;
}

export function AtelierSettingsControl({ initialThreshold }: AtelierSettingsControlProps) {
  const router = useRouter();
  const [threshold, setThreshold] = useState<number>(initialThreshold);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({
    status: 'idle',
    message: '',
  });

  const handleSave = () => {
    startTransition(async () => {
      setFeedback({ status: 'idle', message: '' });
      const res = await updateAtelierSettingAction(
        'member_om_order_threshold',
        threshold,
        'Number of completed Order-Made bespoke commissions required to qualify for VIP Member drop access',
      );

      if (res.success) {
        setFeedback({
          status: 'success',
          message: `Atelier policy updated: Drop access qualification set to ${threshold} Order-Made commission(s).`,
        });
        router.refresh();
      } else {
        setFeedback({
          status: 'error',
          message: res.error?.message ?? 'Failed to update atelier setting.',
        });
      }
    });
  };

  const isZeroMode = threshold === 0;

  return (
    <div
      style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid #334155',
          paddingBottom: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.25rem',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🏛️</span>
            <h2
              style={{
                fontSize: '1.1rem',
                letterSpacing: '0.05em',
                color: '#f8fafc',
                margin: 0,
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              VIP Member Drop Qualification Setting
            </h2>
          </div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
            Controls the number of completed Order-Made (OM) commissions required before a
            registered collector unlocks numbered /drop releases.
          </p>
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            padding: '0.25rem 0.65rem',
            borderRadius: '4px',
            background: isZeroMode ? '#065f46' : '#0369a1',
            color: '#ffffff',
            fontWeight: 700,
            letterSpacing: '0.05em',
          }}
        >
          {isZeroMode
            ? 'OPEN PROMOTION (THRESHOLD = 0)'
            : `QUALIFICATION REQUIRED (${threshold} OM)`}
        </span>
      </div>

      {/* Policy Callout & Grandfathering Covenant */}
      <div
        style={{
          padding: '0.85rem 1rem',
          background: isZeroMode ? 'rgba(6, 78, 59, 0.4)' : '#0f172a',
          border: isZeroMode ? '1px solid #059669' : '1px solid #334155',
          borderRadius: '6px',
          marginBottom: '1.5rem',
          fontSize: '0.82rem',
          color: isZeroMode ? '#a7f3d0' : '#cbd5e1',
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: isZeroMode ? '#34d399' : '#38bdf8' }}>
          {isZeroMode
            ? '⚡ Open Promotional Access Active:'
            : '🛡️ Grandfathered Member Protection Invariant:'}
        </strong>{' '}
        {isZeroMode
          ? 'Any registered collector visiting /drop will immediately and permanently be elevated to MEMBER. When you later restore a higher threshold, these collectors remain permanently unlocked.'
          : 'Collectors elevated to MEMBER during prior promotion periods or via invitation tokens retain permanent access. Only non-member collectors will be evaluated against this threshold.'}
      </div>

      {/* Threshold Editor Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label
            htmlFor="threshold-input"
            style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}
          >
            Required OM Orders:
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #475569',
              borderRadius: '4px',
              background: '#0f172a',
            }}
          >
            <button
              type="button"
              disabled={isPending || threshold <= 0}
              onClick={() => setThreshold((prev) => Math.max(0, prev - 1))}
              style={{
                width: '36px',
                height: '36px',
                background: 'transparent',
                border: 'none',
                color: '#f8fafc',
                fontSize: '1.1rem',
                cursor: threshold <= 0 || isPending ? 'not-allowed' : 'pointer',
                opacity: threshold <= 0 ? 0.4 : 1,
              }}
            >
              −
            </button>
            <input
              id="threshold-input"
              type="number"
              min={0}
              max={20}
              value={threshold}
              onChange={(e) => setThreshold(Math.max(0, parseInt(e.target.value, 10) || 0))}
              style={{
                width: '50px',
                background: 'transparent',
                border: 'none',
                textAlign: 'center',
                color: '#f8fafc',
                fontFamily: 'monospace',
                fontSize: '1.1rem',
                fontWeight: 700,
              }}
            />
            <button
              type="button"
              disabled={isPending || threshold >= 20}
              onClick={() => setThreshold((prev) => Math.min(20, prev + 1))}
              style={{
                width: '36px',
                height: '36px',
                background: 'transparent',
                border: 'none',
                color: '#f8fafc',
                fontSize: '1.1rem',
                cursor: threshold >= 20 || isPending ? 'not-allowed' : 'pointer',
                opacity: threshold >= 20 ? 0.4 : 1,
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Quick presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>PRESETS:</span>
          {[
            { label: '0 (Open / Promo)', val: 0 },
            { label: '1 (Single OM)', val: 1 },
            { label: '2 (Standard Milestone)', val: 2 },
            { label: '3 (VIP Patron)', val: 3 },
          ].map((preset) => (
            <button
              key={preset.val}
              type="button"
              disabled={isPending}
              onClick={() => setThreshold(preset.val)}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                cursor: isPending ? 'not-allowed' : 'pointer',
                background: threshold === preset.val ? '#0284c7' : '#0f172a',
                border: threshold === preset.val ? '1px solid #38bdf8' : '1px solid #334155',
                color: threshold === preset.val ? '#ffffff' : '#cbd5e1',
                fontWeight: threshold === preset.val ? 700 : 500,
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={isPending}
          onClick={handleSave}
          style={{
            marginLeft: 'auto',
            padding: '0.55rem 1.25rem',
            borderRadius: '4px',
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            background: '#0284c7',
            color: '#ffffff',
            border: 'none',
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.6 : 1,
            transition: 'background 0.15s ease',
          }}
        >
          {isPending ? 'Saving Setting...' : 'Save Setting'}
        </button>
      </div>

      {feedback.status !== 'idle' && (
        <div
          style={{
            padding: '0.65rem 0.85rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            background: feedback.status === 'success' ? '#064e3b' : '#7f1d1d',
            color: feedback.status === 'success' ? '#a7f3d0' : '#fecaca',
            border: `1px solid ${feedback.status === 'success' ? '#059669' : '#dc2626'}`,
          }}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}
