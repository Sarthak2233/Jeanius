'use client';

import React, { useEffect, useRef, useId } from 'react';

export interface ModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly size?: 'sm' | 'md' | 'lg' | 'full';
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  className = '',
  style,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();

  // Synchronize modal state with native dialog API
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

  // Handle native cancel (Escape key)
  const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement, Event>) => {
    e.preventDefault();
    onClose();
  };

  // Cross-browser light-dismiss fallback (click on backdrop outside dialog content)
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
    sm: '400px',
    md: '560px',
    lg: '760px',
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
        backgroundColor: 'var(--color-bg-surface, #ffffff)',
        color: 'var(--color-text-primary, #0f172a)',
        border: '1px solid var(--border-subtle, #cbd5e1)',
        borderRadius: 'var(--radius-sm, 2px)',
        padding: '0',
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
        zIndex: 1000,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        outline: 'none',
        ...style,
      }}
    >
      {/* Modal Header */}
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
          aria-label="Close dialog"
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '1.25rem',
            lineHeight: 1,
            color: 'var(--color-text-muted, #64748b)',
            cursor: 'pointer',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✕
        </button>
      </div>

      {/* Modal Body */}
      <div
        style={{
          padding: '1.5rem',
          overflowY: 'auto',
          flex: 1,
          fontFamily: 'var(--font-sans, sans-serif)',
          lineHeight: 'var(--leading-relaxed, 1.75)',
        }}
      >
        {children}
      </div>
    </dialog>
  );
}
