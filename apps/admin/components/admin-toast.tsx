'use client';

import React, { createContext, useContext, useState, useCallback, useId } from 'react';

export interface AdminToastMessage {
  readonly id: string;
  readonly message: string;
  readonly title?: string;
  readonly type?: 'telemetry' | 'hazard' | 'qc' | 'neutral';
  readonly duration?: number; // ms, default 3500
}

interface AdminToastContextValue {
  readonly showToast: (options: Omit<AdminToastMessage, 'id'>) => string;
  readonly dismissToast: (id: string) => void;
}

const AdminToastContext = createContext<AdminToastContextValue | null>(null);

export function useAdminToast() {
  const context = useContext(AdminToastContext);
  if (!context) {
    throw new Error('useAdminToast must be used within an AdminToastProvider');
  }
  return context;
}

export function AdminToastProvider({ children }: { readonly children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ReadonlyArray<AdminToastMessage>>([]);
  const idPrefix = useId();

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ message, title, type = 'telemetry', duration = 3500 }: Omit<AdminToastMessage, 'id'>) => {
      const id = `${idPrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newToast: AdminToastMessage = { id, message, title, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast, idPrefix],
  );

  const getBorderColor = (type?: 'telemetry' | 'hazard' | 'qc' | 'neutral'): string => {
    switch (type) {
      case 'telemetry':
        return 'var(--color-telemetry, #38bdf8)';
      case 'hazard':
        return 'var(--border-hazard, #ef4444)';
      case 'qc':
        return '#10b981';
      case 'neutral':
      default:
        return 'var(--border-grid, #334155)';
    }
  };

  return (
    <AdminToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Admin Top-Right Telemetry Notification Stack */}
      <div
        role="region"
        aria-label="System notifications"
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          maxWidth: '440px',
          width: 'calc(100% - 3rem)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => {
          const isHazard = toast.type === 'hazard';
          const borderColor = getBorderColor(toast.type);

          return (
            <div
              key={toast.id}
              role={isHazard ? 'alert' : 'status'}
              aria-live={isHazard ? 'assertive' : 'polite'}
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-terminal, #0b0f19)',
                color: 'var(--text-primary, #f8fafc)',
                border: `1px solid ${borderColor}`,
                borderLeft: `3px solid ${borderColor}`,
                borderRadius: 'var(--radius-none, 0px)',
                fontFamily: 'var(--font-mono, monospace)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6)',
              }}
            >
              <span style={{ color: borderColor, fontSize: '0.8rem' }}>»</span>

              <div style={{ flex: 1 }}>
                {toast.title && (
                  <strong
                    style={{
                      display: 'block',
                      fontSize: 'var(--font-size-2xs, 0.65rem)',
                      letterSpacing: 'var(--tracking-mono, 0.05em)',
                      textTransform: 'uppercase',
                      color: borderColor,
                      marginBottom: '0.15rem',
                    }}
                  >
                    {toast.title}
                  </strong>
                )}
                <span style={{ fontSize: 'var(--font-size-xs, 0.75rem)', lineHeight: 1.4 }}>
                  {toast.message}
                </span>
              </div>

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss alert"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted, #94a3b8)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  padding: '0',
                }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </AdminToastContext.Provider>
  );
}
