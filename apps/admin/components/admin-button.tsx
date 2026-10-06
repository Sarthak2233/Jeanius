'use client';

import React, { useState } from 'react';

export interface AdminButtonProps {
  readonly variant?: 'bench' | 'telemetry' | 'hazard' | 'qc' | 'ghost';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly shortcut?: string;
  readonly fullWidth?: boolean;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly leftIcon?: React.ReactNode;
  readonly rightIcon?: React.ReactNode;
  readonly type?: 'button' | 'submit' | 'reset';
  readonly onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly children: React.ReactNode;
  readonly ariaLabel?: string;
}

export function AdminButton({
  variant = 'bench',
  size = 'md',
  shortcut,
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  type = 'button',
  onClick,
  className = '',
  style,
  children,
  ariaLabel,
}: AdminButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const isDisabled = disabled || loading;

  const sizeStyles: Record<'sm' | 'md' | 'lg', React.CSSProperties> = {
    sm: {
      padding: '0.25rem 0.5rem',
      fontSize: 'var(--font-size-2xs, 0.65rem)',
      letterSpacing: 'var(--tracking-mono, 0.05em)',
    },
    md: {
      padding: '0.45rem 0.85rem',
      fontSize: 'var(--font-size-xs, 0.75rem)',
      letterSpacing: 'var(--tracking-mono, 0.05em)',
    },
    lg: {
      padding: '0.65rem 1.25rem',
      fontSize: 'var(--font-size-sm, 0.85rem)',
      letterSpacing: 'var(--tracking-mono, 0.05em)',
    },
  };

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'bench':
        return {
          backgroundColor: isHovered && !isDisabled ? '#334155' : 'var(--bg-bench, #1e293b)',
          color: 'var(--text-primary, #f8fafc)',
          border: '1px solid var(--border-grid, #334155)',
        };
      case 'telemetry':
        return {
          backgroundColor:
            isHovered && !isDisabled ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.12)',
          color: 'var(--color-telemetry, #38bdf8)',
          border: '1px solid var(--color-telemetry, #38bdf8)',
        };
      case 'hazard':
        return {
          backgroundColor:
            isHovered && !isDisabled ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.12)',
          color: 'var(--border-hazard, #ef4444)',
          border: '1px solid var(--border-hazard, #ef4444)',
        };
      case 'qc':
        return {
          backgroundColor:
            isHovered && !isDisabled ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.12)',
          color: '#10b981',
          border: '1px solid #10b981',
        };
      case 'ghost':
        return {
          backgroundColor: isHovered && !isDisabled ? 'rgba(51, 65, 85, 0.4)' : 'transparent',
          color: 'var(--text-secondary, #cbd5e1)',
          border: '1px solid var(--border-grid, #334155)',
        };
    }
  };

  const activeTransform = isActive && !isDisabled ? 'scale(0.98)' : 'none';

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      className={className}
      style={{
        display: fullWidth ? 'flex' : 'inline-flex',
        width: fullWidth ? '100%' : 'auto',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        borderRadius: 'var(--radius-none, 0px)',
        fontFamily: 'var(--font-mono, monospace)',
        fontVariantNumeric: 'tabular-nums',
        fontWeight: 600,
        textTransform: 'uppercase',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        transform: activeTransform,
        transition:
          'transform 150ms cubic-bezier(0, 0, 0.2, 1), background-color 150ms ease, border-color 150ms ease',
        outline: 'none',
        userSelect: 'none',
        boxSizing: 'border-box',
        ...sizeStyles[size],
        ...getVariantStyles(),
        ...style,
      }}
    >
      {loading && (
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: '0.75rem',
            height: '0.75rem',
            borderRadius: '50%',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            animation: 'spin 600ms linear infinite',
          }}
        />
      )}
      {!loading && leftIcon && <span style={{ display: 'inline-flex' }}>{leftIcon}</span>}
      <span>{children}</span>
      {!loading && rightIcon && <span style={{ display: 'inline-flex' }}>{rightIcon}</span>}
      {shortcut && !loading && (
        <kbd
          style={{
            display: 'inline-block',
            fontSize: '0.62rem',
            lineHeight: 1,
            padding: '2px 4px',
            backgroundColor: 'var(--bg-terminal, #0b0f19)',
            border: '1px solid var(--border-grid, #334155)',
            borderRadius: '2px',
            color: 'var(--text-muted, #94a3b8)',
            fontFamily: 'inherit',
          }}
        >
          {shortcut}
        </kbd>
      )}
    </button>
  );
}
