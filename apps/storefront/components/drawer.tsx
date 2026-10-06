'use client';

import React, { useEffect, useId } from 'react';

export interface DrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly position?: 'left' | 'right';
  readonly title?: string;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function Drawer({
  isOpen,
  onClose,
  position = 'right',
  title,
  size = 'md',
  children,
  className = '',
  style,
}: DrawerProps) {
  const titleId = useId();

  // Escape key dismiss & body scroll lock
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
    sm: '320px',
    md: '420px',
    lg: '540px',
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
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          transition: 'opacity 200ms ease',
        }}
      />

      {/* Drawer Panel */}
      <div
        style={{
          position: 'relative',
          width: widthStyles[size],
          maxWidth: '85vw',
          height: '100%',
          backgroundColor: 'var(--color-bg-surface, #ffffff)',
          color: 'var(--color-text-primary, #0f172a)',
          boxShadow: isRight
            ? '-10px 0 25px -5px rgba(15, 23, 42, 0.15)'
            : '10px 0 25px -5px rgba(15, 23, 42, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1001,
          animation: `${isRight ? 'slideInRight' : 'slideInLeft'} 200ms cubic-bezier(0.16, 1, 0.3, 1)`,
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle, #cbd5e1)',
            backgroundColor: 'var(--color-bg-elevated, #faf8f4)',
          }}
        >
          {title ? (
            <h2
              id={titleId}
              style={{
                margin: 0,
                fontSize: 'var(--font-size-base, 1rem)',
                fontFamily: 'var(--font-sans, sans-serif)',
                fontWeight: 600,
                letterSpacing: 'var(--tracking-wide, 0.05em)',
                textTransform: 'uppercase',
                color: 'var(--color-text-primary, #0f172a)',
              }}
            >
              {title}
            </h2>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.25rem',
              lineHeight: 1,
              color: 'var(--color-text-muted, #64748b)',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            ✕
          </button>
        </div>

        {/* Drawer Body */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            flex: 1,
            fontFamily: 'var(--font-sans, sans-serif)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
