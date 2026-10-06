'use client';

import React, { useState, useId } from 'react';

export interface AdminInputProps {
  readonly id?: string;
  readonly label?: string;
  readonly value?: string | number;
  readonly defaultValue?: string | number;
  readonly onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  readonly onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  readonly placeholder?: string;
  readonly unitTag?: string; // e.g. "OZ", "YDS", "MM", "G"
  readonly shortcut?: string; // e.g. "TAB", "^F"
  readonly error?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly type?: 'text' | 'number' | 'search';
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function AdminInput({
  id: explicitId,
  label,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  unitTag,
  shortcut,
  error,
  disabled = false,
  required = false,
  type = 'text',
  min,
  max,
  step,
  className = '',
  style,
}: AdminInputProps) {
  const generatedId = useId();
  const inputId = explicitId || generatedId;
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(error);

  const getBorderColor = (): string => {
    if (hasError) return 'var(--border-hazard, #ef4444)';
    if (isFocused) return 'var(--border-focus, #38bdf8)';
    return 'var(--border-grid, #334155)';
  };

  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', ...style }}
    >
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label
            htmlFor={inputId}
            style={{
              fontSize: 'var(--font-size-2xs, 0.65rem)',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 600,
              letterSpacing: 'var(--tracking-mono, 0.05em)',
              textTransform: 'uppercase',
              color: hasError ? 'var(--border-hazard, #ef4444)' : 'var(--text-secondary, #cbd5e1)',
            }}
          >
            {label}{' '}
            {required && (
              <span aria-hidden="true" style={{ color: 'var(--border-hazard, #ef4444)' }}>
                *
              </span>
            )}
          </label>
          {shortcut && (
            <kbd
              style={{
                fontSize: '0.6rem',
                backgroundColor: 'var(--bg-bench, #1e293b)',
                border: '1px solid var(--border-grid, #334155)',
                padding: '1px 3px',
                borderRadius: '2px',
                color: 'var(--text-muted, #94a3b8)',
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              {shortcut}
            </kbd>
          )}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: disabled ? 'var(--bg-bench, #1e293b)' : 'var(--bg-terminal, #0b0f19)',
          border: `1px solid ${getBorderColor()}`,
          borderRadius: 'var(--radius-none, 0px)',
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
          boxShadow: isFocused ? '0 0 0 1px rgba(56, 189, 248, 0.3)' : 'none',
        }}
      >
        <input
          id={inputId}
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          step={step}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
          onChange={onChange}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          style={{
            width: '100%',
            padding: '0.4rem 0.6rem',
            fontSize: 'var(--font-size-xs, 0.75rem)',
            fontFamily: 'var(--font-mono, monospace)',
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--text-primary, #f8fafc)',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {unitTag && (
          <span
            style={{
              padding: '0.2rem 0.5rem',
              fontSize: 'var(--font-size-2xs, 0.65rem)',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 600,
              color: 'var(--color-telemetry, #38bdf8)',
              backgroundColor: 'rgba(56, 189, 248, 0.08)',
              borderLeft: '1px solid var(--border-grid, #334155)',
              userSelect: 'none',
              letterSpacing: '0.05em',
            }}
          >
            {unitTag}
          </span>
        )}
      </div>

      {hasError && (
        <span
          id={`${inputId}-error`}
          role="alert"
          style={{
            fontSize: 'var(--font-size-2xs, 0.65rem)',
            fontFamily: 'var(--font-mono, monospace)',
            color: 'var(--border-hazard, #ef4444)',
            letterSpacing: 'var(--tracking-mono, 0.05em)',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
