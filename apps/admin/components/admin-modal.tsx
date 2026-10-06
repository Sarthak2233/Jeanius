'use client';

import React, { useEffect, useRef, useId } from 'react';

export interface AdminModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly size?: 'sm' | 'md' | 'lg' | 'full';
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function AdminModal({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  className = '',
  style,
}: AdminModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      document.body.style.overflow = 'hidden';
    } else {
      if (dialog.open) {
        dialog.close();
      }
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement, Event>) => {
    e.preventDefault();
    onClose();
  };

  const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog || e.target !== dialog) return;

    const rect = dialog.getBoundingClientRect();
    const isInside =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;

    if (!isInside) {
      onClose();
    }
  };

  const maxWidthStyles: Record<'sm' | 'md' | 'lg' | 'full', string> = {
    sm: '420px',
    md: '580px',
    lg: '800px',
    full: '95vw',
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={handleClick}
      closedby="any"
      aria-labelledby={title ? titleId : undefined}
      aria-modal="true"
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        margin: 'auto',
        maxWidth: maxWidthStyles[size],
        width: 'calc(100% - 2rem)',
        maxHeight: '90vh',
        backgroundColor: 'var(--bg-surface, #121826)',
        color: 'var(--text-primary, #f8fafc)',
        border: '1px solid var(--border-grid, #334155)',
        borderRadius: 'var(--radius-none, 0px)',
        padding: '0',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        zIndex: 1000,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        outline: 'none',
        ...style,
      }}
    >
      {/* Admin Modal Header */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: 'var(--color-telemetry, #38bdf8)', fontSize: '0.75rem' }}>
            [ · ]
          </span>
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
            aria-label="Close modal"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1rem',
              color: 'var(--text-muted, #94a3b8)',
              cursor: 'pointer',
              padding: '0.2rem',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Admin Modal Body */}
      <div
        style={{
          padding: '1.25rem',
          overflowY: 'auto',
          flex: 1,
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: 'var(--font-size-xs, 0.75rem)',
          lineHeight: 'var(--leading-relaxed, 1.6)',
        }}
      >
        {children}
      </div>
    </dialog>
  );
}
