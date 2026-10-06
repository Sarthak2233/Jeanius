'use client';

import React, { useId } from 'react';
import { PriceDisplay } from './price-display';

export interface OptionItem {
  readonly id: string;
  readonly label: string;
  readonly available: boolean;
  readonly priceDeltaCents?: number;
  readonly swatchColor?: string;
  readonly swatchImage?: string;
  readonly description?: string;
}

export interface OptionSelectorProps {
  readonly name: string;
  readonly label: string;
  readonly required?: boolean;
  readonly type?: 'chips' | 'swatches' | 'select';
  readonly options: ReadonlyArray<OptionItem>;
  readonly selectedValue?: string;
  readonly onChange: (value: string) => void;
  readonly error?: string;
  readonly helperText?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function OptionSelector({
  name,
  label,
  required = false,
  type = 'chips',
  options,
  selectedValue,
  onChange,
  error,
  helperText,
  className = '',
  style,
}: OptionSelectorProps) {
  const generatedId = useId();
  const groupId = `option-group-${name.toLowerCase().replace(/\s+/g, '-')}-${generatedId}`;

  const hasError = Boolean(error);
  const selectedItem = options.find((opt) => opt.id === selectedValue);

  return (
    <div
      role="group"
      aria-labelledby={`${groupId}-label`}
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        ...style,
      }}
    >
      {/* Header with Label and Currently Selected Value */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <span
          id={`${groupId}-label`}
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
        </span>

        {selectedItem && (
          <span
            style={{
              fontSize: 'var(--font-size-xs, 0.75rem)',
              fontFamily: 'var(--font-sans, sans-serif)',
              fontWeight: 500,
              color: 'var(--color-text-primary, #0f172a)',
            }}
          >
            {selectedItem.label}
          </span>
        )}
      </div>

      {/* Select Dropdown Mode */}
      {type === 'select' ? (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--color-bg-surface, #ffffff)',
            border: `1px solid ${hasError ? 'var(--color-craft-selvedgeRed, #b91c1c)' : 'var(--border-subtle, #cbd5e1)'}`,
            borderRadius: 'var(--radius-sm, 2px)',
          }}
        >
          <select
            value={selectedValue || ''}
            onChange={(e) => onChange(e.target.value)}
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
              cursor: 'pointer',
            }}
          >
            <option value="">{`Select ${label}...`}</option>
            {options.map((opt) => (
              <option key={opt.id} value={opt.id} disabled={!opt.available}>
                {opt.label}
                {!opt.available
                  ? ' — Sold Out'
                  : opt.priceDeltaCents
                    ? ` (+$${(opt.priceDeltaCents / 100).toFixed(2)})`
                    : ''}
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
      ) : type === 'swatches' ? (
        /* Swatches Mode */
        <div
          role="radiogroup"
          aria-label={label}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.id === selectedValue;
            const isUnavailable = !opt.available;

            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-disabled={isUnavailable}
                disabled={isUnavailable}
                onClick={() => opt.available && onChange(opt.id)}
                title={opt.label + (isUnavailable ? ' (Unavailable)' : '')}
                style={{
                  position: 'relative',
                  width: '2.25rem',
                  height: '2.25rem',
                  borderRadius: '50%',
                  padding: '2px',
                  backgroundColor: 'var(--color-bg-surface, #ffffff)',
                  border: isSelected
                    ? '2px solid var(--color-text-primary, #0f172a)'
                    : '1px solid var(--border-subtle, #cbd5e1)',
                  cursor: isUnavailable ? 'not-allowed' : 'pointer',
                  opacity: isUnavailable ? 0.35 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'border-color 150ms ease, transform 150ms ease',
                }}
              >
                <span
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backgroundColor: opt.swatchColor || '#94a3b8',
                    backgroundImage: opt.swatchImage ? `url(${opt.swatchImage})` : undefined,
                    backgroundSize: 'cover',
                    display: 'block',
                  }}
                />
                {isUnavailable && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '1px',
                      backgroundColor: 'var(--color-craft-selvedgeRed, #b91c1c)',
                      transform: 'rotate(-45deg)',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      ) : (
        /* Chips / Pills Mode (Default) */
        <div
          role="radiogroup"
          aria-label={label}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.id === selectedValue;
            const isUnavailable = !opt.available;

            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-disabled={isUnavailable}
                disabled={isUnavailable}
                onClick={() => opt.available && onChange(opt.id)}
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-sm, 2px)',
                  fontFamily: 'var(--font-sans, sans-serif)',
                  fontSize: 'var(--font-size-xs, 0.75rem)',
                  fontWeight: isSelected ? 600 : 500,
                  color: isSelected
                    ? 'var(--color-text-inverse, #fdfbf7)'
                    : isUnavailable
                      ? 'var(--color-text-subtle, #94a3b8)'
                      : 'var(--color-text-primary, #0f172a)',
                  backgroundColor: isSelected
                    ? 'var(--color-bg-dark, #0f172a)'
                    : isUnavailable
                      ? 'var(--color-bg-elevated, #faf8f4)'
                      : 'var(--color-bg-surface, #ffffff)',
                  border: isSelected
                    ? '1px solid var(--color-bg-dark, #0f172a)'
                    : '1px solid var(--border-subtle, #cbd5e1)',
                  cursor: isUnavailable ? 'not-allowed' : 'pointer',
                  opacity: isUnavailable ? 0.5 : 1,
                  userSelect: 'none',
                  transition:
                    'background-color 150ms ease, border-color 150ms ease, color 150ms ease',
                }}
              >
                <span
                  style={{
                    textDecoration: isUnavailable ? 'line-through' : 'none',
                  }}
                >
                  {opt.label}
                </span>

                {/* Price Delta Badge */}
                {opt.priceDeltaCents !== undefined && opt.priceDeltaCents > 0 && !isUnavailable && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontFamily: 'var(--font-mono, monospace)',
                      color: isSelected
                        ? 'var(--color-craft-brass, #d97706)'
                        : 'var(--color-text-muted, #64748b)',
                    }}
                  >
                    +<PriceDisplay amount={opt.priceDeltaCents} style={{ color: 'inherit' }} />
                  </span>
                )}

                {isUnavailable && (
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontFamily: 'var(--font-mono, monospace)',
                      color: 'var(--color-craft-selvedgeRed, #b91c1c)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Sold Out
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Error Announcement */}
      {hasError && (
        <span
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

      {/* Helper Text */}
      {!hasError && helperText && (
        <span
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
