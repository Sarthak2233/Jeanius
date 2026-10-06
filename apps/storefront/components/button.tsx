'use client';

import React, { useState } from 'react';

export interface ButtonProps {
  readonly variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  readonly size?: 'sm' | 'md' | 'lg';
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

export function Button({
  variant = 'primary',
  size = 'md',
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
}: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const isDisabled = disabled || loading;

  const sizeStyles: Record<'sm' | 'md' | 'lg', React.CSSProperties> = {
    sm: {
      padding: '0.375rem 0.75rem',
      fontSize: 'var(--font-size-xs, 0.75rem)',
      letterSpacing: 'var(--tracking-wide, 0.05em)',
    },
    md: {
      padding: '0.625rem 1.25rem',
      fontSize: 'var(--font-size-sm, 0.875rem)',
      letterSpacing: 'var(--tracking-wide, 0.05em)',
    },
    lg: {
      padding: '0.875rem 1.75rem',
      fontSize: 'var(--font-size-base, 1rem)',
      letterSpacing: '0.06em',
    },
  };

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isHovered && !isDisabled ? '#1e293b' : 'var(--color-bg-dark, #0f172a)',
          color: 'var(--color-text-inverse, #fdfbf7)',
          border: '1px solid transparent',
        };
      case 'secondary':
        return {
          backgroundColor:
            isHovered && !isDisabled
              ? 'var(--color-bg-elevated, #faf8f4)'
              : 'var(--color-bg-surface, #ffffff)',
          color: 'var(--color-text-primary, #0f172a)',
          border: '1px solid var(--border-subtle, #cbd5e1)',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--color-text-primary, #0f172a)',
          border: `1px solid ${isHovered && !isDisabled ? 'var(--color-text-primary, #0f172a)' : 'var(--border-default, #cbd5e1)'}`,
        };
      case 'ghost':
        return {
          backgroundColor:
            isHovered && !isDisabled ? 'var(--color-bg-elevated, #faf8f4)' : 'transparent',
          color: 'var(--color-text-primary, #0f172a)',
          border: '1px solid transparent',
        };
      case 'destructive':
        return {
          backgroundColor:
            isHovered && !isDisabled ? '#991b1b' : 'var(--color-craft-selvedgeRed, #b91c1c)',
          color: '#ffffff',
          border: '1px solid transparent',
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
        borderRadius: 'var(--radius-sm, 2px)',
        fontFamily: 'var(--font-sans, sans-serif)',
        fontWeight: 600,
        textTransform: 'uppercase',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.55 : 1,
        transform: activeTransform,
        transition:
          'transform 150ms cubic-bezier(0.16, 1, 0.3, 1), background-color 150ms ease, border-color 150ms ease, opacity 150ms ease',
        outline: 'none',
        userSelect: 'none',
        textDecoration: 'none',
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
            width: '0.85em',
            height: '0.85em',
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
    </button>
  );
}
