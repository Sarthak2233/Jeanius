'use client';

import React, { useState, useId } from 'react';

// ============================================================================
// 1. Single-Line Input Component
// ============================================================================

export interface InputProps {
  readonly id?: string;
  readonly label?: string;
  readonly type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';
  readonly value?: string;
  readonly defaultValue?: string;
  readonly placeholder?: string;
  readonly onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  readonly onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  readonly error?: string;
  readonly helperText?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly prefixIcon?: React.ReactNode;
  readonly suffixIcon?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly autoFocus?: boolean;
  readonly autoComplete?: string;
}

export function Input({
  id: explicitId,
  label,
  type = 'text',
  value,
  defaultValue,
  placeholder,
  onChange,
  onFocus,
  onBlur,
  error,
  helperText,
  disabled = false,
  required = false,
  prefixIcon,
  suffixIcon,
  className = '',
  style,
  autoFocus,
  autoComplete,
}: InputProps) {
  const generatedId = useId();
  const inputId = explicitId || generatedId;
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(error);

  const getBorderColor = (): string => {
    if (hasError) return 'var(--color-craft-selvedgeRed, #b91c1c)';
    if (isFocused) return 'var(--color-text-primary, #0f172a)';
    return 'var(--border-subtle, #cbd5e1)';
  };

  const getBoxShadow = (): string => {
    if (isFocused) {
      return hasError ? '0 0 0 2px rgba(185, 28, 28, 0.15)' : '0 0 0 2px rgba(15, 23, 42, 0.12)';
    }
    return 'none';
  };

  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', ...style }}
    >
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: 'var(--font-size-xs, 0.75rem)',
            fontFamily: 'var(--font-sans, sans-serif)',
            fontWeight: 600,
            letterSpacing: 'var(--tracking-wide, 0.05em)',
            textTransform: 'uppercase',
            color: hasError
              ? 'var(--color-craft-selvedgeRed, #b91c1c)'
              : 'var(--color-text-secondary, #334155)',
          }}
        >
          {label}{' '}
          {required && (
            <span aria-hidden="true" style={{ color: 'var(--color-craft-selvedgeRed, #b91c1c)' }}>
              *
            </span>
          )}
        </label>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: disabled
            ? 'var(--color-bg-elevated, #faf8f4)'
            : 'var(--color-bg-surface, #ffffff)',
          border: `1px solid ${getBorderColor()}`,
          borderRadius: 'var(--radius-sm, 2px)',
          boxShadow: getBoxShadow(),
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
          overflow: 'hidden',
        }}
      >
        {prefixIcon && (
          <span
            style={{
              display: 'inline-flex',
              paddingLeft: '0.75rem',
              color: 'var(--color-text-muted, #64748b)',
            }}
          >
            {prefixIcon}
          </span>
        )}
        <input
          id={inputId}
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
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
            padding: '0.5rem 0.75rem',
            fontSize: 'var(--font-size-sm, 0.875rem)',
            fontFamily: 'var(--font-sans, sans-serif)',
            color: 'var(--color-text-primary, #0f172a)',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {suffixIcon && (
          <span
            style={{
              display: 'inline-flex',
              paddingRight: '0.75rem',
              color: 'var(--color-text-muted, #64748b)',
            }}
          >
            {suffixIcon}
          </span>
        )}
      </div>

      {hasError && (
        <span
          id={`${inputId}-error`}
          role="alert"
          style={{
            fontSize: 'var(--font-size-xs, 0.75rem)',
            color: 'var(--color-craft-selvedgeRed, #b91c1c)',
            fontFamily: 'var(--font-sans, sans-serif)',
          }}
        >
          {error}
        </span>
      )}

      {!hasError && helperText && (
        <span
          id={`${inputId}-helper`}
          style={{
            fontSize: 'var(--font-size-xs, 0.75rem)',
            color: 'var(--color-text-muted, #64748b)',
            fontFamily: 'var(--font-sans, sans-serif)',
          }}
        >
          {helperText}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// 2. NumberStepper Component (Custom Bespoke Sizing / Quantity)
// ============================================================================

export interface NumberStepperProps {
  readonly id?: string;
  readonly label?: string;
  readonly value: number;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly unit?: string; // e.g. "in", "cm", "qty"
  readonly onChange: (value: number) => void;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function NumberStepper({
  id: explicitId,
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit,
  onChange,
  disabled = false,
  className = '',
  style,
}: NumberStepperProps) {
  const generatedId = useId();
  const stepperId = explicitId || generatedId;

  const handleDecrement = () => {
    if (disabled || value <= min) return;
    onChange(Math.max(min, value - step));
  };

  const handleIncrement = () => {
    if (disabled || value >= max) return;
    onChange(Math.min(max, value + step));
  };

  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', ...style }}
    >
      {label && (
        <label
          htmlFor={stepperId}
          style={{
            fontSize: 'var(--font-size-xs, 0.75rem)',
            fontFamily: 'var(--font-sans, sans-serif)',
            fontWeight: 600,
            letterSpacing: 'var(--tracking-wide, 0.05em)',
            textTransform: 'uppercase',
            color: 'var(--color-text-secondary, #334155)',
          }}
        >
          {label}
        </label>
      )}

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          border: '1px solid var(--border-subtle, #cbd5e1)',
          borderRadius: 'var(--radius-sm, 2px)',
          backgroundColor: 'var(--color-bg-surface, #ffffff)',
          overflow: 'hidden',
          width: 'fit-content',
        }}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          aria-label="Decrease value"
          style={{
            padding: '0.5rem 0.75rem',
            backgroundColor: 'var(--color-bg-elevated, #faf8f4)',
            border: 'none',
            borderRight: '1px solid var(--border-subtle, #cbd5e1)',
            cursor: disabled || value <= min ? 'not-allowed' : 'pointer',
            opacity: disabled || value <= min ? 0.4 : 1,
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 600,
            color: 'var(--color-text-primary, #0f172a)',
            userSelect: 'none',
          }}
        >
          −
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.25rem',
            padding: '0.5rem 1rem',
            minWidth: '3.5rem',
            justifyContent: 'center',
          }}
        >
          <span
            id={stepperId}
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontVariantNumeric: 'tabular-nums',
              fontWeight: 600,
              fontSize: 'var(--font-size-sm, 0.875rem)',
              color: 'var(--color-text-primary, #0f172a)',
            }}
          >
            {value}
          </span>
          {unit && (
            <span
              style={{
                fontSize: 'var(--font-size-xs, 0.75rem)',
                color: 'var(--color-text-muted, #64748b)',
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              {unit}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          aria-label="Increase value"
          style={{
            padding: '0.5rem 0.75rem',
            backgroundColor: 'var(--color-bg-elevated, #faf8f4)',
            border: 'none',
            borderLeft: '1px solid var(--border-subtle, #cbd5e1)',
            cursor: disabled || value >= max ? 'not-allowed' : 'pointer',
            opacity: disabled || value >= max ? 0.4 : 1,
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 600,
            color: 'var(--color-text-primary, #0f172a)',
            userSelect: 'none',
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 3. Textarea Component (Custom Notes & Engraving Instructions)
// ============================================================================

export interface TextareaProps {
  readonly id?: string;
  readonly label?: string;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly placeholder?: string;
  readonly rows?: number;
  readonly onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  readonly error?: string;
  readonly helperText?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function Textarea({
  id: explicitId,
  label,
  value,
  defaultValue,
  placeholder,
  rows = 3,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  style,
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = explicitId || generatedId;
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(error);

  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', ...style }}
    >
      {label && (
        <label
          htmlFor={textareaId}
          style={{
            fontSize: 'var(--font-size-xs, 0.75rem)',
            fontFamily: 'var(--font-sans, sans-serif)',
            fontWeight: 600,
            letterSpacing: 'var(--tracking-wide, 0.05em)',
            textTransform: 'uppercase',
            color: hasError
              ? 'var(--color-craft-selvedgeRed, #b91c1c)'
              : 'var(--color-text-secondary, #334155)',
          }}
        >
          {label}{' '}
          {required && (
            <span aria-hidden="true" style={{ color: 'var(--color-craft-selvedgeRed, #b91c1c)' }}>
              *
            </span>
          )}
        </label>
      )}

      <textarea
        id={textareaId}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        required={required}
        aria-invalid={hasError}
        aria-describedby={
          hasError ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
        }
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          width: '100%',
          padding: '0.625rem 0.75rem',
          fontSize: 'var(--font-size-sm, 0.875rem)',
          fontFamily: 'var(--font-sans, sans-serif)',
          lineHeight: 'var(--leading-relaxed, 1.75)',
          color: 'var(--color-text-primary, #0f172a)',
          backgroundColor: disabled
            ? 'var(--color-bg-elevated, #faf8f4)'
            : 'var(--color-bg-surface, #ffffff)',
          border: `1px solid ${hasError ? 'var(--color-craft-selvedgeRed, #b91c1c)' : isFocused ? 'var(--color-text-primary, #0f172a)' : 'var(--border-subtle, #cbd5e1)'}`,
          borderRadius: 'var(--radius-sm, 2px)',
          boxShadow: isFocused ? '0 0 0 2px rgba(15, 23, 42, 0.12)' : 'none',
          outline: 'none',
          resize: 'vertical',
          boxSizing: 'border-box',
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
        }}
      />

      {hasError && (
        <span
          id={`${textareaId}-error`}
          role="alert"
          style={{
            fontSize: 'var(--font-size-xs, 0.75rem)',
            color: 'var(--color-craft-selvedgeRed, #b91c1c)',
            fontFamily: 'var(--font-sans, sans-serif)',
          }}
        >
          {error}
        </span>
      )}

      {!hasError && helperText && (
        <span
          id={`${textareaId}-helper`}
          style={{
            fontSize: 'var(--font-size-xs, 0.75rem)',
            color: 'var(--color-text-muted, #64748b)',
            fontFamily: 'var(--font-sans, sans-serif)',
          }}
        >
          {helperText}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// 4. Select Component (Dropdown option selection)
// ============================================================================

export interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

export interface SelectProps {
  readonly id?: string;
  readonly label?: string;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly placeholder?: string;
  readonly options: ReadonlyArray<SelectOption>;
  readonly onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  readonly error?: string;
  readonly helperText?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function Select({
  id: explicitId,
  label,
  value,
  defaultValue,
  placeholder = 'Select option...',
  options,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  style,
}: SelectProps) {
  const generatedId = useId();
  const selectId = explicitId || generatedId;
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(error);

  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', ...style }}
    >
      {label && (
        <label
          htmlFor={selectId}
          style={{
            fontSize: 'var(--font-size-xs, 0.75rem)',
            fontFamily: 'var(--font-sans, sans-serif)',
            fontWeight: 600,
            letterSpacing: 'var(--tracking-wide, 0.05em)',
            textTransform: 'uppercase',
            color: hasError
              ? 'var(--color-craft-selvedgeRed, #b91c1c)'
              : 'var(--color-text-secondary, #334155)',
          }}
        >
          {label}{' '}
          {required && (
            <span aria-hidden="true" style={{ color: 'var(--color-craft-selvedgeRed, #b91c1c)' }}>
              *
            </span>
          )}
        </label>
      )}

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: disabled
            ? 'var(--color-bg-elevated, #faf8f4)'
            : 'var(--color-bg-surface, #ffffff)',
          border: `1px solid ${hasError ? 'var(--color-craft-selvedgeRed, #b91c1c)' : isFocused ? 'var(--color-text-primary, #0f172a)' : 'var(--border-subtle, #cbd5e1)'}`,
          borderRadius: 'var(--radius-sm, 2px)',
          boxShadow: isFocused ? '0 0 0 2px rgba(15, 23, 42, 0.12)' : 'none',
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
        }}
      >
        <select
          id={selectId}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: '100%',
            padding: '0.5rem 2rem 0.5rem 0.75rem',
            fontSize: 'var(--font-size-sm, 0.875rem)',
            fontFamily: 'var(--font-sans, sans-serif)',
            color: 'var(--color-text-primary, #0f172a)',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            appearance: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: '0.75rem',
            pointerEvents: 'none',
            fontSize: '0.75rem',
            color: 'var(--color-text-muted, #64748b)',
          }}
        >
          ▼
        </span>
      </div>

      {hasError && (
        <span
          id={`${selectId}-error`}
          role="alert"
          style={{
            fontSize: 'var(--font-size-xs, 0.75rem)',
            color: 'var(--color-craft-selvedgeRed, #b91c1c)',
            fontFamily: 'var(--font-sans, sans-serif)',
          }}
        >
          {error}
        </span>
      )}

      {!hasError && helperText && (
        <span
          id={`${selectId}-helper`}
          style={{
            fontSize: 'var(--font-size-xs, 0.75rem)',
            color: 'var(--color-text-muted, #64748b)',
            fontFamily: 'var(--font-sans, sans-serif)',
          }}
        >
          {helperText}
        </span>
      )}
    </div>
  );
}
