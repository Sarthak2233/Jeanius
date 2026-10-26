'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductDetailDto } from '@jeanius/contracts';
import { useCartStore } from '../../../stores/cart-store';
import { resolveCustomizationDefaultsAction } from '../../../actions/auth.actions';

export interface OrderMadeConfiguratorProps {
  readonly product: ProductDetailDto;
}

export interface PatinaFinishOption {
  readonly code: string;
  readonly label: string;
  readonly description?: string;
  readonly priceDeltaAmount?: number;
  readonly isDefault?: boolean;
}

interface EngravingSpecification {
  readonly allowed: boolean;
  readonly maxCharacters: number;
  readonly priceDeltaAmount: number;
}

interface PatinaSpecification {
  readonly allowedFinishes: readonly PatinaFinishOption[];
}

function useSafeRouter() {
  try {
    return useRouter();
  } catch {
    return null;
  }
}

export function OrderMadeConfigurator({ product }: OrderMadeConfiguratorProps) {
  const router = useSafeRouter();
  const addItemToCart = useCartStore((state) => state.addItem);

  // Extract input specifications or provide authentic workshop defaults
  const inputSpecs = (product.inputSpecifications ?? {}) as Record<string, unknown>;
  const engravingSpec = (inputSpecs.engraving as EngravingSpecification | undefined) ?? {
    allowed: true,
    maxCharacters: 20,
    priceDeltaAmount: 0,
  };
  const patinaSpec: PatinaSpecification = (inputSpecs.patina as
    PatinaSpecification | undefined) ?? {
    allowedFinishes: [
      {
        code: 'OXIDIZED_CHARCOAL',
        label: 'Oxidized Charcoal Patina',
        description: 'Deep sulfur chemical oxidation recessed in hand-carved relief',
        priceDeltaAmount: 0,
        isDefault: true,
      },
      {
        code: 'BRUSHED_MATTE',
        label: 'Brushed Matte Studio Finish',
        description: 'Tactile satin directional brushing across high silver planes',
        priceDeltaAmount: 0,
      },
      {
        code: 'MIRROR_POLISH',
        label: 'Mirror High Polish',
        description: 'High rouge buffed brilliant reflection',
        priceDeltaAmount: 0,
      },
    ],
  };

  const isRing = product.category.includes('ring') || !!inputSpecs.ringSize;
  const isCuff =
    product.category.includes('cuff') ||
    product.category.includes('bracelet') ||
    !!inputSpecs.wristSize;
  const isChain =
    product.category.includes('chain') ||
    product.category.includes('necklace') ||
    !!inputSpecs.chainLength;

  // Open-Ended Freeform Sizing State
  const [customRingSize, setCustomRingSize] = useState<string>('US 10.0');
  const [applyWideShank, setApplyWideShank] = useState<boolean>(false);
  const [customWristSize, setCustomWristSize] = useState<string>('6.75" (Medium)');
  const [customChainLength, setCustomChainLength] = useState<string>('22" (Standard Chest)');
  const [customGeneralDimension, setCustomGeneralDimension] = useState<string>(
    'Standard Bespoke Proportion',
  );

  // Artisan Finishes & Bench Notes
  const [silversmithNotes, setSilversmithNotes] = useState<string>('');
  const [engravingText, setEngravingText] = useState<string>('');
  const [patinaFinish, setPatinaFinish] = useState<string>('OXIDIZED_CHARCOAL');
  const [quantity, setQuantity] = useState<number>(1);
  const [vaultMatchSource, setVaultMatchSource] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Informational Sizing Reference Guide Modal State
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Auto-fill from collector's personal sizing vault (purely informational defaults)
  useEffect(() => {
    let isCancelled = false;

    resolveCustomizationDefaultsAction({ category: product.category })
      .then((res) => {
        if (isCancelled || !res.success || !res.data) return;

        const { measurements, materialPreferences, isComplete } = res.data;
        const matchReasons: string[] = [];

        if (isRing && measurements.ringSizeUs) {
          const val = String(measurements.ringSizeUs);
          setCustomRingSize(`US ${val}`);
          matchReasons.push(`Size US ${val}`);
        }

        if (isCuff && measurements.wristCircumferenceInches) {
          const val = String(measurements.wristCircumferenceInches);
          setCustomWristSize(`${val}"`);
          matchReasons.push(`Wrist ${val}"`);
        }

        if (isChain && measurements.preferredChainLengthInches) {
          const val = String(measurements.preferredChainLengthInches);
          setCustomChainLength(`${val}"`);
          matchReasons.push(`Chain ${val}"`);
        }

        if (materialPreferences.metalFinish) {
          const norm = materialPreferences.metalFinish.toUpperCase();
          if (norm.includes('OXIDIZED')) {
            setPatinaFinish('OXIDIZED_CHARCOAL');
            matchReasons.push('Oxidized Patina');
          } else if (norm.includes('BRUSH') || norm.includes('SATIN')) {
            setPatinaFinish('BRUSHED_MATTE');
            matchReasons.push('Brushed Matte');
          } else if (norm.includes('POLISH')) {
            setPatinaFinish('MIRROR_POLISH');
            matchReasons.push('Mirror Polish');
          }
        }

        if (matchReasons.length > 0 && isComplete) {
          setVaultMatchSource(matchReasons.join(' • '));
        }
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [product.category, isRing, isCuff, isChain]);

  // Dynamic Surcharge calculation
  let priceDelta = 0;
  if (isChain) {
    const parsedNum = parseFloat(customChainLength.replace(/[^0-9.]/g, ''));
    if (!isNaN(parsedNum) && parsedNum > 22) {
      priceDelta += 3000; // $30 heavy sterling bullion surcharge
    }
  }

  const selectedPatinaObj = patinaSpec.allowedFinishes.find(
    (f: PatinaFinishOption) => f.code === patinaFinish,
  );
  if (selectedPatinaObj?.priceDeltaAmount) {
    priceDelta += selectedPatinaObj.priceDeltaAmount;
  }
  if (engravingText.trim().length > 0 && engravingSpec.priceDeltaAmount) {
    priceDelta += engravingSpec.priceDeltaAmount;
  }

  const effectiveUnitPrice = product.basePriceAmount + priceDelta;

  const constructCustomSpecifications = (): Record<string, string | number | boolean> => {
    const specs: Record<string, string | number | boolean> = {
      purity: '.925 Sterling Silver',
      patinaFinish: selectedPatinaObj?.label ?? patinaFinish,
    };

    if (isRing) {
      specs.customRingSize = customRingSize.trim();
      if (applyWideShank) {
        specs.applyWideShankCompensator = true;
      }
    } else if (isCuff) {
      specs.customWristSize = customWristSize.trim();
    } else if (isChain) {
      specs.customChainLength = customChainLength.trim();
    } else {
      specs.customDimensions = customGeneralDimension.trim();
    }

    if (silversmithNotes.trim().length > 0) {
      specs.masterSilversmithNotes = silversmithNotes.trim();
    }

    if (engravingText.trim().length > 0) {
      specs.insideEngraving = engravingText.trim().toUpperCase();
    }

    return specs;
  };

  const handleAddToBag = () => {
    // Validate that required freeform input is not empty
    if (isRing && !customRingSize.trim()) {
      setValidationError('Please specify your desired ring size or fit notation.');
      return;
    }
    if (isCuff && !customWristSize.trim()) {
      setValidationError('Please specify your wrist size or fit preference.');
      return;
    }
    if (isChain && !customChainLength.trim()) {
      setValidationError('Please specify your desired chain length.');
      return;
    }

    setValidationError(null);
    const specs = constructCustomSpecifications();

    addItemToCart({
      productId: product.id,
      sku: `${product.slug.toUpperCase()}-OM`,
      title: product.title,
      slug: product.slug,
      commerceModel: 'OM',
      unitPriceAmount: effectiveUnitPrice,
      unitPriceCurrency: product.basePriceCurrency,
      selectedOptions: {
        patina: patinaFinish,
      },
      customSpecifications: specs,
      imageUrl: product.primaryImage?.url,
      quantity,
    });
  };

  const handleCommissionNow = () => {
    handleAddToBag();
    router?.push('/checkout');
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>
      {/* Vault Auto-Fill Banner */}
      {vaultMatchSource && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            fontSize: '0.82rem',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <strong style={{ fontWeight: 600 }}>Atelier Sizing Vault:</strong> Pre-filled from your
            profile ({vaultMatchSource}).
          </div>
          <span style={{ fontSize: '0.72rem', color: '#b45309', fontFamily: 'monospace' }}>
            OPEN-ENDED OVERRIDE ACTIVE
          </span>
        </div>
      )}

      {/* Dynamic Price Display */}
      <div style={{ marginBottom: '1.75rem' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono, monospace)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#64748b',
            display: 'block',
            marginBottom: '0.25rem',
          }}
        >
          ORDER-MADE BESPOKE COMMISSION
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '2rem',
              fontWeight: 600,
              fontFamily: 'var(--font-serif, "Playfair Display", serif)',
              color: '#0f172a',
            }}
          >
            ${(effectiveUnitPrice / 100).toFixed(2)}
          </span>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontFamily: 'monospace' }}>
            {product.basePriceCurrency}
          </span>
        </div>
      </div>

      {/* SIZING SPECIFICATION HEADER & INFORMATIONAL REFERENCE TRIGGER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
        }}
      >
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
          Custom Sizing &amp; Fitting Parameters
        </span>
        <button
          type="button"
          onClick={() => setIsGuideOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#0284c7',
            fontSize: '0.78rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: 0,
            textDecoration: 'underline',
          }}
        >
          📐 View Atelier Mandrel &amp; Sizing Guide
        </button>
      </div>

      {/* INFORMATIONAL SIZING BANNER */}
      <div
        style={{
          padding: '0.65rem 0.85rem',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '4px',
          fontSize: '0.75rem',
          color: '#475569',
          marginBottom: '1.25rem',
          lineHeight: 1.5,
        }}
      >
        <strong>Artisan Note:</strong> Inputs below are open-ended. You may enter any standard US
        size, international metric notation (e.g. EU 63, 20.2mm), fractional fit, or wrist
        circumference. The sizing guide above is for informational calibration only.
      </div>

      {/* 1. OPEN-ENDED SIZING INPUTS BY CATEGORY */}
      {isRing && (
        <div
          style={{
            marginBottom: '1.75rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <label
            htmlFor="ring-size-input"
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#0f172a',
              display: 'block',
              marginBottom: '0.35rem',
            }}
          >
            Bespoke Ring Size / Mandrel Target
          </label>
          <input
            id="ring-size-input"
            type="text"
            value={customRingSize}
            onChange={(e) => {
              setCustomRingSize(e.target.value);
              setValidationError(null);
            }}
            placeholder="e.g. US 10.25, EU 63, or 20.0mm inner diameter"
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              marginBottom: '0.5rem',
            }}
          />

          {/* Quick-select convenience chips (non-restrictive) */}
          <div
            style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}
          >
            {['US 7.0', 'US 8.0', 'US 9.0', 'US 10.0', 'US 11.0', 'US 12.0', 'US 13.0'].map(
              (preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCustomRingSize(preset)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.72rem',
                    fontFamily: 'monospace',
                    borderRadius: '3px',
                    border: customRingSize.includes(preset)
                      ? '1px solid #0f172a'
                      : '1px solid #e2e8f0',
                    backgroundColor: customRingSize.includes(preset) ? '#0f172a' : '#ffffff',
                    color: customRingSize.includes(preset) ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  {preset}
                </button>
              ),
            )}
          </div>

          {/* Wide Shank Compensator Toggle */}
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={applyWideShank}
                onChange={(e) => setApplyWideShank(e.target.checked)}
                style={{ marginTop: '0.2rem', cursor: 'pointer' }}
              />
              <div style={{ fontSize: '0.82rem', color: '#334155' }}>
                <strong style={{ color: '#0f172a' }}>
                  Apply Wide-Shank Compensator (+0.5 US Mandrel Offset)
                </strong>
                <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.75rem' }}>
                  Recommended for signets and wide cuffs (&gt;6mm). Relieves extra finger friction
                  while preserving true tailored fit.
                </p>
              </div>
            </label>
          </div>
        </div>
      )}

      {isCuff && (
        <div
          style={{
            marginBottom: '1.75rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '0.35rem',
            }}
          >
            <label
              htmlFor="wrist-size-input"
              style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}
            >
              Wrist Circumference / Fit Dimension
            </label>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>25mm Comfort Gap Default</span>
          </div>
          <input
            id="wrist-size-input"
            type="text"
            value={customWristSize}
            onChange={(e) => {
              setCustomWristSize(e.target.value);
              setValidationError(null);
            }}
            placeholder="e.g. 6.85 inches, 17.5 cm, or Large (snug fit)"
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              marginBottom: '0.5rem',
            }}
          />

          {/* Quick-select convenience chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {[
              { label: 'Small (6.25")', val: '6.25" (Small)' },
              { label: 'Medium (6.75")', val: '6.75" (Medium)' },
              { label: 'Large (7.50")', val: '7.50" (Large)' },
              { label: 'Extra Large (8.00")', val: '8.00" (Extra Large)' },
            ].map((chip) => (
              <button
                key={chip.val}
                type="button"
                onClick={() => setCustomWristSize(chip.val)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.72rem',
                  fontFamily: 'monospace',
                  borderRadius: '3px',
                  border: customWristSize === chip.val ? '1px solid #0f172a' : '1px solid #e2e8f0',
                  backgroundColor: customWristSize === chip.val ? '#0f172a' : '#ffffff',
                  color: customWristSize === chip.val ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {isChain && (
        <div
          style={{
            marginBottom: '1.75rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '0.35rem',
            }}
          >
            <label
              htmlFor="chain-length-input"
              style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}
            >
              Chain Drape Length
            </label>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Includes Heavy S-Clasp</span>
          </div>
          <input
            id="chain-length-input"
            type="text"
            value={customChainLength}
            onChange={(e) => {
              setCustomChainLength(e.target.value);
              setValidationError(null);
            }}
            placeholder="e.g. 21.5 inches, 55cm, or 24 inches"
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              marginBottom: '0.5rem',
            }}
          />

          {/* Quick-select convenience chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {[
              '18" (Collar)',
              '20" (Collarbone)',
              '22" (Standard Chest)',
              '24" (Sternum +$30)',
              '26" (Long Chest +$30)',
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setCustomChainLength(chip)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.72rem',
                  fontFamily: 'monospace',
                  borderRadius: '3px',
                  border: customChainLength === chip ? '1px solid #0f172a' : '1px solid #e2e8f0',
                  backgroundColor: customChainLength === chip ? '#0f172a' : '#ffffff',
                  color: customChainLength === chip ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isRing && !isCuff && !isChain && (
        <div
          style={{
            marginBottom: '1.75rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <label
            htmlFor="custom-dimension-input"
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#0f172a',
              display: 'block',
              marginBottom: '0.35rem',
            }}
          >
            Custom Dimension / Bespoke Proportions
          </label>
          <input
            id="custom-dimension-input"
            type="text"
            value={customGeneralDimension}
            onChange={(e) => setCustomGeneralDimension(e.target.value)}
            placeholder="e.g. Standard Atelier Proportion, 45mm x 25mm, or custom balance"
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              backgroundColor: '#ffffff',
              color: '#0f172a',
            }}
          />
        </div>
      )}

      {/* 2. MASTER SILVERSMITH BENCH NOTES */}
      <div
        style={{
          marginBottom: '1.75rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '0.35rem',
          }}
        >
          <label
            htmlFor="silversmith-notes"
            style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}
          >
            Master Silversmith Bench Notes (Optional)
          </label>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Artisan instructions</span>
        </div>
        <textarea
          id="silversmith-notes"
          rows={3}
          value={silversmithNotes}
          onChange={(e) => setSilversmithNotes(e.target.value)}
          placeholder="Specify any tailored nuances: e.g. slightly oval shank profile, match snugness of vintage signet, soft chamfered inside edges..."
          style={{
            width: '100%',
            padding: '0.65rem 0.75rem',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            fontSize: '0.82rem',
            lineHeight: 1.5,
            fontFamily: 'inherit',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            resize: 'vertical',
          }}
        />
        <span
          style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}
        >
          Reviewed by Kathmandu workshop bench master prior to wax carving and molten silver
          casting.
        </span>
      </div>

      {/* 3. ARTISAN SURFACE PATINA SECTION */}
      <div
        style={{
          marginBottom: '1.75rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#0f172a',
            display: 'block',
            marginBottom: '0.65rem',
          }}
        >
          Artisan Surface Patina Finish
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {patinaSpec.allowedFinishes.map((f: PatinaFinishOption) => (
            <label
              key={f.code}
              onClick={() => setPatinaFinish(f.code)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                border: patinaFinish === f.code ? '1.5px solid #0f172a' : '1px solid #e2e8f0',
                borderRadius: '6px',
                backgroundColor: patinaFinish === f.code ? '#fafafa' : '#ffffff',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="patinaFinish"
                value={f.code}
                checked={patinaFinish === f.code}
                onChange={() => setPatinaFinish(f.code)}
                style={{ marginTop: '0.2rem' }}
              />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                  {f.label}{' '}
                  {(f.priceDeltaAmount ?? 0) > 0 && `(+$${(f.priceDeltaAmount ?? 0) / 100})`}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                  {f.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 4. INSIDE-BAND ENGRAVING SECTION */}
      {engravingSpec.allowed && (
        <div
          style={{
            marginBottom: '1.75rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '0.4rem',
            }}
          >
            <label
              htmlFor="engraving-input"
              style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}
            >
              Complimentary Inside-Band Engraving (Optional)
            </label>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b' }}>
              {engravingText.length}/{engravingSpec.maxCharacters}
            </span>
          </div>
          <input
            id="engraving-input"
            type="text"
            maxLength={engravingSpec.maxCharacters}
            placeholder="E.G. KTM · 1984"
            value={engravingText}
            onChange={(e) => setEngravingText(e.target.value.toUpperCase())}
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              backgroundColor: '#ffffff',
            }}
          />
          <span
            style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.3rem', display: 'block' }}
          >
            Hand-stamped in Kathmandu. Allowed: A–Z, 0–9, ·, ., -, /
          </span>
        </div>
      )}

      {/* 5. QUANTITY CONTROLS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>Quantity</span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            style={{
              width: '36px',
              height: '36px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            −
          </button>
          <span
            style={{ width: '36px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 600 }}
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(Math.min(5, quantity + 1))}
            style={{
              width: '36px',
              height: '36px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* 6. WORKSHOP COVENANT & BENCH SUMMARY */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          marginBottom: '1.75rem',
          fontSize: '0.8rem',
          color: '#334155',
          lineHeight: 1.6,
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}
        >
          <span
            style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0284c7' }}
          />
          <strong style={{ color: '#0f172a' }}>Kathmandu Workshop Bench Ticket</strong>
        </div>
        <p style={{ margin: '0 0 0.5rem 0' }}>
          Target: Solid .925 Silver •{' '}
          {isRing &&
            `Custom Fit: "${customRingSize}" ${applyWideShank ? '(Wide Shank Compensated)' : ''} • `}
          {isCuff && `Wrist: "${customWristSize}" • `}
          {isChain && `Chain: "${customChainLength}" • `}
          {!isRing && !isCuff && !isChain && `Dimension: "${customGeneralDimension}" • `}
          Patina: {selectedPatinaObj?.label}
          {engravingText.trim() && ` • Engraving: "${engravingText.trim()}"`}
          {silversmithNotes.trim() && ` • Notes: "${silversmithNotes.trim()}"`}
        </p>
        <p style={{ margin: 0, fontSize: '0.73rem', color: '#64748b' }}>
          <strong>Lead Time:</strong> 7–14 business days hand-finishing. Point-of-no-return: casting
          begins upon payment confirmation; made-to-order custom pieces are non-refundable once
          molten silver is poured.
        </p>
      </div>

      {/* 7. CALLS TO ACTION */}
      {validationError && (
        <div
          role="alert"
          style={{
            padding: '0.65rem 0.85rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '4px',
            color: '#991b1b',
            fontSize: '0.8rem',
            marginBottom: '0.5rem',
          }}
        >
          {validationError}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={handleAddToBag}
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.9rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'opacity 150ms ease',
          }}
        >
          Add to Atelier Bag • ${((effectiveUnitPrice * quantity) / 100).toFixed(2)}
        </button>

        <button
          type="button"
          onClick={handleCommissionNow}
          style={{
            width: '100%',
            padding: '0.85rem',
            backgroundColor: 'transparent',
            color: '#0f172a',
            border: '1.5px solid #0f172a',
            borderRadius: '4px',
            fontSize: '0.85rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Commission Piece (Buy Now)
        </button>
      </div>

      {/* INFORMATIONAL SIZING & MANDREL REFERENCE MODAL */}
      {isGuideOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsGuideOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
              boxShadow:
                '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: '#0f172a' }}>
                  Atelier Sizing &amp; Mandrel Calibrator
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Kathmandu Workshop Reference Guide (Informational Only)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsGuideOpen(false)}
                style={{
                  background: 'none',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  width: '32px',
                  height: '32px',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  color: '#475569',
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#eff6ff',
                border: '1px solid #dbeafe',
                borderRadius: '6px',
                fontSize: '0.78rem',
                color: '#1e40af',
                marginBottom: '1.5rem',
                lineHeight: 1.5,
              }}
            >
              <strong>Open-Ended Specification:</strong> All sizing tables shown below are
              international workshop reference points. Because our artisans hand-sculpt every piece,
              you may request fractional, custom millimeter, or unique ergonomic fits directly in
              the configurator.
            </div>

            {/* RING MANDREL CONVERSION TABLE */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h4
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  marginBottom: '0.5rem',
                }}
              >
                1. International Ring Mandrel Scale
              </h4>
              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.78rem',
                    textAlign: 'left',
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>US Size</th>
                      <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>UK / AU</th>
                      <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>EU / ISO</th>
                      <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>Inner Dia (mm)</th>
                      <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>Circumference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { us: 'US 7.0', uk: 'N ½', eu: '54.5', dia: '17.3 mm', circ: '54.4 mm' },
                      { us: 'US 8.0', uk: 'P ½', eu: '57.0', dia: '18.1 mm', circ: '57.0 mm' },
                      { us: 'US 9.0', uk: 'R ½', eu: '59.5', dia: '18.9 mm', circ: '59.5 mm' },
                      { us: 'US 10.0', uk: 'T ½', eu: '62.0', dia: '19.8 mm', circ: '62.1 mm' },
                      { us: 'US 11.0', uk: 'V ½', eu: '64.5', dia: '20.6 mm', circ: '64.6 mm' },
                      { us: 'US 12.0', uk: 'X ½', eu: '67.0', dia: '21.4 mm', circ: '67.2 mm' },
                      { us: 'US 13.0', uk: 'Z ½', eu: '69.5', dia: '22.2 mm', circ: '69.7 mm' },
                    ].map((row, idx) => (
                      <tr
                        key={row.us}
                        style={{ borderBottom: idx < 6 ? '1px solid #f1f5f9' : 'none' }}
                      >
                        <td
                          style={{
                            padding: '0.45rem 0.75rem',
                            fontWeight: 600,
                            fontFamily: 'monospace',
                          }}
                        >
                          {row.us}
                        </td>
                        <td style={{ padding: '0.45rem 0.75rem' }}>{row.uk}</td>
                        <td style={{ padding: '0.45rem 0.75rem' }}>{row.eu}</td>
                        <td style={{ padding: '0.45rem 0.75rem', fontFamily: 'monospace' }}>
                          {row.dia}
                        </td>
                        <td style={{ padding: '0.45rem 0.75rem', color: '#64748b' }}>{row.circ}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* WRIST MEASUREMENT GUIDE */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h4
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  marginBottom: '0.5rem',
                }}
              >
                2. Wrist Circumference &amp; Cuff Comfort Gap
              </h4>
              <p
                style={{
                  fontSize: '0.78rem',
                  color: '#475569',
                  lineHeight: 1.6,
                  margin: '0 0 0.5rem 0',
                }}
              >
                To measure your wrist, wrap a flexible measuring tape or strip of paper snugly
                around your wrist bone. Mark the point of contact and measure flat.
              </p>
              <ul
                style={{
                  fontSize: '0.78rem',
                  color: '#475569',
                  lineHeight: 1.6,
                  paddingLeft: '1.25rem',
                  margin: 0,
                }}
              >
                <li>
                  <strong>Small:</strong> 6.0&quot;–6.5&quot; (15.2cm–16.5cm) wrist circumference
                </li>
                <li>
                  <strong>Medium (Atelier Standard):</strong> 6.5&quot;–7.2&quot; (16.5cm–18.3cm)
                  wrist circumference
                </li>
                <li>
                  <strong>Large:</strong> 7.2&quot;–8.0&quot; (18.3cm–20.3cm) wrist circumference
                </li>
                <li>
                  <strong>Comfort Gap:</strong> All open cuffs include a default ~25mm (1 inch)
                  opening gap for easy wrist entry.
                </li>
              </ul>
            </div>

            {/* CHAIN DRAPE GUIDE */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  marginBottom: '0.5rem',
                }}
              >
                3. Heavy Sterling Chain Drape Points
              </h4>
              <ul
                style={{
                  fontSize: '0.78rem',
                  color: '#475569',
                  lineHeight: 1.6,
                  paddingLeft: '1.25rem',
                  margin: 0,
                }}
              >
                <li>
                  <strong>18 inches (45cm):</strong> High collar, rests above the collarbone.
                </li>
                <li>
                  <strong>20 inches (50cm):</strong> Collarbone level, standard choker fit for open
                  collar shirts.
                </li>
                <li>
                  <strong>22 inches (55cm):</strong> Mid-chest level (most popular bespoke length).
                </li>
                <li>
                  <strong>24 inches (60cm):</strong> Sternum level, suitable for heavy statement
                  pendants.
                </li>
                <li>
                  <strong>26 inches (65cm):</strong> Deep chest drape, slips over the head without
                  opening clasp.
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setIsGuideOpen(false)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Return to Configurator
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
