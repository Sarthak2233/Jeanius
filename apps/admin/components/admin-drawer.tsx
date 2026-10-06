'use client';

import React, { useEffect, useId } from 'react';

export interface AdminDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly position?: 'left' | 'right';
  readonly title?: string;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function AdminDrawer({
  isOpen,
  onClose,
  position = 'right',
  title,
  size = 'md',
  children,
  className = '',
  style,
}: AdminDrawerProps) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const widthStyles: Record<'sm' | 'md' | 'lg', string> = {
    sm: '340px',
    md: '480px',
    lg: '640px',
  };

  if (!isOpen) return null;

  const isRight = position === 'right';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        justifyContent: isRight ? 'flex-end' : 'flex-start',
        ...style,
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 15, 25, 0.85)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Drawer Panel */}
      <div
        style={{
          position: 'relative',
          width: widthStyles[size],
          maxWidth: '90vw',
          height: '100%',
          backgroundColor: 'var(--bg-surface, #121826)',
          color: 'var(--text-primary, #f8fafc)',
          borderLeft: isRight ? '1px solid var(--border-grid, #334155)' : 'none',
          borderRight: !isRight ? '1px solid var(--border-grid, #334155)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1001,
          animation: `${isRight ? 'slideInRight' : 'slideInLeft'} 150ms cubic-bezier(0, 0, 0.2, 1)`,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-grid, #334155)',
            backgroundColor: 'var(--bg-terminal, #0b0f19)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--color-telemetry, #38bdf8)', fontSize: '0.75rem' }}>»</span>
            {title && (
              <h2
                id={titleId}
                style={{
                  margin: 0,
                  fontSize: 'var(--font-size-xs, 0.75rem)',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 600,
                  letterSpacing: 'var(--tracking-mono, 0.05em)',
                  textTransform: 'uppercase',
                  color: 'var(--text-primary, #f8fafc)',
                }}
              >
                {title}
              </h2>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <kbd
              style={{
                fontSize: '0.62rem',
                backgroundColor: 'var(--bg-bench, #1e293b)',
                border: '1px solid var(--border-grid, #334155)',
                padding: '1px 4px',
                borderRadius: '2px',
                color: 'var(--text-muted, #94a3b8)',
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              ESC
            </kbd>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1rem',
                color: 'var(--text-muted, #94a3b8)',
                cursor: 'pointer',
                padding: '0.2rem',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            padding: '1.25rem',
            overflowY: 'auto',
            flex: 1,
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 'var(--font-size-xs, 0.75rem)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
