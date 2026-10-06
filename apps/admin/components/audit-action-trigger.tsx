'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { recordPrivilegedAuditAction } from '../actions/admin-auth.actions';

export function AuditActionTrigger() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({
    status: 'idle',
    message: '',
  });

  const triggerAuditAction = (
    actionName: string,
    entityType: string,
    entityId: string,
    meta: Record<string, unknown>,
  ) => {
    startTransition(async () => {
      setFeedback({ status: 'idle', message: '' });
      const res = await recordPrivilegedAuditAction({
        action: actionName,
        entityType,
        entityId,
        payload: meta,
      });

      if (res.success) {
        setFeedback({
          status: 'success',
          message: `Recorded privileged action: "${actionName}" for ${entityType} [${entityId}].`,
        });
        router.refresh();
      } else {
        setFeedback({
          status: 'error',
          message: res.error?.message ?? 'Failed to record privileged audit action.',
        });
      }
    });
  };

  return (
    <div
      style={{
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '6px',
        padding: '1.25rem',
        marginTop: '1.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
        }}
      >
        <div>
          <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#f8fafc', fontWeight: 600 }}>
            Privileged Audit Action Simulator (JN-127)
          </h4>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            Author append-only audit events into Postgres through RecordPrivilegedActionUseCase.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            triggerAuditAction('BENCH_CALIBRATION', 'LOOM_STATION', 'KTM-LOOM-01', {
              calibratedBy: 'Workshop Director',
              shuttleTensionPsi: 42,
              selvedgeId: 'KUROKI_14OZ_RAW',
            })
          }
          style={{
            background: '#1e293b',
            border: '1px solid #475569',
            color: '#e2e8f0',
            padding: '0.5rem 0.85rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.6 : 1,
            transition: 'background 0.2s',
          }}
        >
          {isPending ? 'Logging...' : '⚡ Calibrate Denim Loom'}
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            triggerAuditAction('PRECIOUS_METAL_ASSAY', 'GOLD_INGOT', 'AU-18K-LOT-904', {
              purity: 0.75,
              finenessReport: 'Assay Office Kathmandu',
              weightGrams: 250.0,
            })
          }
          style={{
            background: '#1e293b',
            border: '1px solid #ca8a04',
            color: '#fef08a',
            padding: '0.5rem 0.85rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.6 : 1,
            transition: 'background 0.2s',
          }}
        >
          {isPending ? 'Logging...' : '👑 Assay 18k Gold Lot'}
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            triggerAuditAction('SECURITY_RLS_VERIFY', 'AUDIT_TRAIL', 'SYSTEM_CORE', {
              verificationType: 'APPEND_ONLY_RLS_CONFIRM',
              timestamp: new Date().toISOString(),
            })
          }
          style={{
            background: '#1e293b',
            border: '1px solid #0284c7',
            color: '#38bdf8',
            padding: '0.5rem 0.85rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.6 : 1,
            transition: 'background 0.2s',
          }}
        >
          {isPending ? 'Logging...' : '🛡️ Verify Security Trail'}
        </button>
      </div>

      {feedback.status !== 'idle' && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.5rem 0.75rem',
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
