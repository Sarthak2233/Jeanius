'use client';

import React, { createContext, useContext, useState, useCallback, useId } from 'react';

export interface ToastMessage {
  readonly id: string;
  readonly message: string;
  readonly title?: string;
  readonly type?: 'success' | 'error' | 'info' | 'warning';
  readonly duration?: number; // ms, default 4000
}

interface ToastContextValue {
  readonly showToast: (options: Omit<ToastMessage, 'id'>) => string;
  readonly dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { readonly children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ReadonlyArray<ToastMessage>>([]);
  const idPrefix = useId();

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ message, title, type = 'info', duration = 4000 }: Omit<ToastMessage, 'id'>) => {
      const id = `${idPrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastMessage = { id, message, title, type, duration };

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

  const getBorderColor = (type?: 'success' | 'error' | 'info' | 'warning'): string => {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'error':
        return 'var(--color-craft-selvedgeRed, #b91c1c)';
      case 'warning':
        return '#f59e0b';
      case 'info':
      default:
        return 'var(--border-subtle, #cbd5e1)';
    }
  };

  const getIcon = (type?: 'success' | 'error' | 'info' | 'warning'): string => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div
        role="region"
        aria-label="Notifications"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: '420px',
          width: 'calc(100% - 3rem)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          return (
            <div
              key={toast.id}
              role={isError ? 'alert' : 'status'}
              aria-live={isError ? 'assertive' : 'polite'}
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--color-bg-surface, #ffffff)',
                color: 'var(--color-text-primary, #0f172a)',
                border: `1px solid ${getBorderColor(toast.type)}`,
                borderLeft: `4px solid ${getBorderColor(toast.type)}`,
                borderRadius: 'var(--radius-sm, 2px)',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)',
                animation: 'slideInUp 200ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <span
                style={{
                  color: getBorderColor(toast.type),
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  lineHeight: 1.2,
                }}
              >
                {getIcon(toast.type)}
              </span>

              <div style={{ flex: 1 }}>
                {toast.title && (
                  <strong
                    style={{
                      display: 'block',
                      fontSize: 'var(--font-size-xs, 0.75rem)',
                      fontFamily: 'var(--font-sans, sans-serif)',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      marginBottom: '0.2rem',
                    }}
                  >
                    {toast.title}
                  </strong>
                )}
                <span
                  style={{
                    fontSize: 'var(--font-size-sm, 0.875rem)',
                    fontFamily: 'var(--font-sans, sans-serif)',
                    lineHeight: 'var(--leading-snug, 1.35)',
                  }}
                >
                  {toast.message}
                </span>
              </div>

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-muted, #64748b)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  lineHeight: 1,
                  padding: '0.1rem',
                }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
