'use client';

import React, { useState, useMemo } from 'react';
import { updateProfileAction } from '../../actions/auth.actions';

export type SizingTab = 'RINGS' | 'CUFFS' | 'CHAINS' | 'PATINA';

interface RingSizeRow {
  readonly us: string;
  readonly uk: string;
  readonly eu: string;
  readonly diameterMm: number;
  readonly circumferenceMm: number;
}

const RING_MANDREL_TABLE: readonly RingSizeRow[] = [
  { us: '4.0', uk: 'H', eu: '47', diameterMm: 14.9, circumferenceMm: 46.8 },
  { us: '5.0', uk: 'J 1/2', eu: '49', diameterMm: 15.7, circumferenceMm: 49.3 },
  { us: '6.0', uk: 'L 1/2', eu: '52', diameterMm: 16.5, circumferenceMm: 51.9 },
  { us: '7.0', uk: 'N 1/2', eu: '54', diameterMm: 17.3, circumferenceMm: 54.4 },
  { us: '8.0', uk: 'P 1/2', eu: '57', diameterMm: 18.1, circumferenceMm: 57.0 },
  { us: '9.0', uk: 'R 1/2', eu: '59', diameterMm: 19.0, circumferenceMm: 59.5 },
  { us: '10.0', uk: 'T 1/2', eu: '62', diameterMm: 19.8, circumferenceMm: 62.1 },
  { us: '11.0', uk: 'V 1/2', eu: '65', diameterMm: 20.6, circumferenceMm: 64.6 },
  { us: '12.0', uk: 'X 1/2', eu: '67', diameterMm: 21.4, circumferenceMm: 67.2 },
  { us: '13.0', uk: 'Z 1/2', eu: '70', diameterMm: 22.2, circumferenceMm: 69.7 },
  { us: '14.0', uk: 'Z+2', eu: '72', diameterMm: 23.0, circumferenceMm: 72.3 },
];

export function SizingStudioClient() {
  const [activeTab, setActiveTab] = useState<SizingTab>('RINGS');

  // Ring State
  const [selectedUsSize, setSelectedUsSize] = useState<string>('10.0');
  const [bandWidthMm, setBandWidthMm] = useState<number>(8);
  const [prominentKnuckle, setProminentKnuckle] = useState<boolean>(false);
  const [preferredFinger, setPreferredFinger] = useState<
    'INDEX' | 'MIDDLE' | 'RING' | 'PINKY' | 'THUMB'
  >('RING');

  // Cuff State
  const [wristCircumferenceInches, setWristCircumferenceInches] = useState<number>(6.75);

  // Chain State
  const [chainLengthInches, setChainLengthInches] = useState<number>(20);
  const [chainStyle, setChainStyle] = useState<'CABLE' | 'CURB' | 'ROPE' | 'BOX' | 'FIGARO'>(
    'CURB',
  );

  // Patina State
  const [selectedFinish, setSelectedFinish] = useState<
    'HIGH_POLISH' | 'SATIN_MATTE' | 'OXIDIZED_PATINA' | 'HAMMERED_RAW'
  >('OXIDIZED_PATINA');

  // Save State
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Compensated Ring Calculation
  const compensatedRingSize = useMemo(() => {
    let size = parseFloat(selectedUsSize);
    // Bands > 8mm displace more soft tissue and require +0.5 size ease
    if (bandWidthMm >= 9) {
      size += 0.5;
    }
    // Prominent knuckles require +0.25 to +0.5 size clearance to slip over the joint
    if (prominentKnuckle) {
      size += 0.25;
    }
    return size.toFixed(2);
  }, [selectedUsSize, bandWidthMm, prominentKnuckle]);

  // Cuff Sizing Tier
  const cuffTier = useMemo(() => {
    if (wristCircumferenceInches < 6.25)
      return { tier: 'Small (S)', innerCircumference: '6.0"', gap: '1.0"' };
    if (wristCircumferenceInches <= 7.0)
      return { tier: 'Medium (M)', innerCircumference: '6.75"', gap: '1.1"' };
    if (wristCircumferenceInches <= 7.75)
      return { tier: 'Large (L)', innerCircumference: '7.5"', gap: '1.2"' };
    return { tier: 'Extra Large (XL)', innerCircumference: '8.25"', gap: '1.25"' };
  }, [wristCircumferenceInches]);

  const handleSaveToVault = async () => {
    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const activeRing =
        RING_MANDREL_TABLE.find((r) => r.us === selectedUsSize) ?? RING_MANDREL_TABLE[6]!;

      const payload = {
        craftFocus: 'JEWELLERY' as const,
        jewelleryPreferences: {
          ringSizeUs: compensatedRingSize,
          ringMandrelMm: activeRing.diameterMm,
          preferredFinger,
          wristCircumferenceInches,
          preferredChainLengthInches: chainLengthInches,
          preferredFinish: selectedFinish,
        },
      };

      const res = await updateProfileAction(payload);
      if (res.success) {
        setSaveSuccess('Sizing matrix permanently calibrated in your Atelier Vault.');
      } else {
        setSaveError(res.error?.message ?? 'Please sign in to save sizing specifications.');
      }
    } catch {
      setSaveError('Network error while saving sizing calibrations.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-canvas, #fdfbf7)',
        minHeight: '100vh',
        padding: '3rem 1.5rem 6rem',
      }}
    >
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        {/* Editorial Header */}
        <div style={{ marginBottom: '3rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#475569',
              marginBottom: '1rem',
            }}
          >
            KATHMANDU WORKSHOP · BENCH SIZING PROTOCOL
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
              fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              margin: '0 0 1rem 0',
              textTransform: 'uppercase',
            }}
          >
            Project 925 Sizing &amp; Mandrel Studio
          </h1>
          <p
            style={{
              color: '#64748b',
              fontSize: '1.05rem',
              lineHeight: 1.6,
              maxWidth: '720px',
              margin: 0,
            }}
          >
            Because each Order-Made (OM) talisman and ring is individually poured from molten .925
            sterling silver at our Kathmandu workshop, precise bench sizing ensures your piece fits
            perfectly on first cast.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div
          role="tablist"
          aria-label="Jewellery Sizing Categories"
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid #e2e8f0',
            marginBottom: '2.5rem',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'RINGS' as const, label: 'Ring Mandrel & Wide Shank' },
            { id: 'CUFFS' as const, label: 'Heavy Cuff & Wrist Gap' },
            { id: 'CHAINS' as const, label: 'Chain Drape & Link Matrix' },
            { id: 'PATINA' as const, label: 'Silver Oxidation & Patina' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: isActive ? '#0f172a' : '#64748b',
                  borderBottom: isActive ? '2px solid #0f172a' : '2px solid transparent',
                  transition: 'all 150ms ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* =====================================================================
            TAB 1: RINGS (Mandrel Table & Wide Shank Compensator)
            ===================================================================== */}
        {activeTab === 'RINGS' && (
          <section aria-label="Ring Mandrel Studio">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
                marginBottom: '3rem',
              }}
            >
              {/* Interactive Ring Calibrator Card */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '2rem',
                  boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem',
                  }}
                >
                  CALIBRATOR
                </div>
                <h2 style={{ fontSize: '1.4rem', color: '#0f172a', margin: '0 0 1.25rem 0' }}>
                  Ring Mandrel &amp; Wide Shank Compensator
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Base US Size Selector */}
                  <div>
                    <label
                      htmlFor="us-size-select"
                      style={{
                        display: 'block',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: '#334155',
                        textTransform: 'uppercase',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Base US Mandrel Size
                    </label>
                    <select
                      id="us-size-select"
                      value={selectedUsSize}
                      onChange={(e) => setSelectedUsSize(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.75rem',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      {RING_MANDREL_TABLE.map((row) => (
                        <option key={row.us} value={row.us}>
                          US {row.us} (UK {row.uk} · EU {row.eu} · {row.diameterMm}mm ⌀)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Finger Selection */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: '#334155',
                        textTransform: 'uppercase',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Target Finger
                    </label>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '0.35rem',
                      }}
                    >
                      {(['INDEX', 'MIDDLE', 'RING', 'PINKY', 'THUMB'] as const).map((finger) => (
                        <button
                          key={finger}
                          type="button"
                          onClick={() => setPreferredFinger(finger)}
                          style={{
                            padding: '0.5rem 0.2rem',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            borderRadius: '4px',
                            border: `1px solid ${preferredFinger === finger ? '#0f172a' : '#e2e8f0'}`,
                            backgroundColor: preferredFinger === finger ? '#0f172a' : '#f8fafc',
                            color: preferredFinger === finger ? '#ffffff' : '#475569',
                            cursor: 'pointer',
                          }}
                        >
                          {finger}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Band Width Slider */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.4rem',
                      }}
                    >
                      <label
                        htmlFor="band-width-range"
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: '#334155',
                          textTransform: 'uppercase',
                        }}
                      >
                        Band Width
                      </label>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontWeight: 600,
                        }}
                      >
                        {bandWidthMm} mm {bandWidthMm >= 9 ? '(Wide Shank +0.5)' : '(Standard)'}
                      </span>
                    </div>
                    <input
                      id="band-width-range"
                      type="range"
                      min={3}
                      max={14}
                      step={1}
                      value={bandWidthMm}
                      onChange={(e) => setBandWidthMm(parseInt(e.target.value, 10))}
                      style={{ width: '100%', accentColor: '#0f172a' }}
                    />
                  </div>

                  {/* Prominent Knuckle Checkbox */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      color: '#334155',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={prominentKnuckle}
                      onChange={(e) => setProminentKnuckle(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#0f172a' }}
                    />
                    <span>Prominent Knuckle clearance (+0.25 size ease)</span>
                  </label>

                  {/* Final Compensated Display */}
                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: '6px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      marginTop: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.7rem',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-mono, monospace)',
                      }}
                    >
                      CALIBRATED BENCH CAST SIZE
                    </div>
                    <div
                      style={{
                        fontSize: '1.6rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        margin: '0.25rem 0',
                      }}
                    >
                      US {compensatedRingSize}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                      Adjusted for {bandWidthMm}mm shank displacement and knuckle articulation.
                    </div>
                  </div>
                </div>
              </div>

              {/* Mandrel Guidance & Rules */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.72rem',
                      color: '#94a3b8',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      marginBottom: '0.5rem',
                    }}
                  >
                    WORKSHOP COVENANT
                  </div>
                  <h3 style={{ fontSize: '1.25rem', color: '#0f172a', margin: '0 0 1rem 0' }}>
                    The Kathmandu Ring Mandrel Invariant
                  </h3>
                  <div
                    style={{
                      fontSize: '0.88rem',
                      lineHeight: 1.6,
                      color: '#475569',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <p style={{ margin: 0 }}>
                      <strong>1. Knuckle vs. Base:</strong> If your knuckle is significantly wider
                      than your finger base, measure both. Your ring must pass the knuckle with
                      slight resistance so it does not slip off in cold weather.
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>2. Shank Width Law:</strong> Heavy armor signets and carved talisman
                      rings (width ≥ 9mm) displace more flesh. They fit tighter than standard 3mm
                      wedding bands. Always size up by +0.5 to +0.75 US size.
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>3. Temperature Dynamics:</strong> Fingers expand up to half a size in
                      warm weather or after manual labor. Measure in the afternoon under neutral
                      ambient temperature.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '1.5rem',
                    paddingTop: '1.25rem',
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  <button
                    type="button"
                    onClick={handleSaveToVault}
                    disabled={isSaving}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      border: 'none',
                      cursor: isSaving ? 'wait' : 'pointer',
                      transition: 'opacity 150ms ease',
                    }}
                  >
                    {isSaving ? 'Calibrating...' : 'Save Mandrel Sizing to Vault →'}
                  </button>
                  {saveSuccess && (
                    <div
                      style={{
                        color: '#059669',
                        fontSize: '0.78rem',
                        marginTop: '0.5rem',
                        textAlign: 'center',
                      }}
                    >
                      {saveSuccess}
                    </div>
                  )}
                  {saveError && (
                    <div
                      style={{
                        color: '#dc2626',
                        fontSize: '0.78rem',
                        marginTop: '0.5rem',
                        textAlign: 'center',
                      }}
                    >
                      {saveError}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Standard Conversion Table */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1.5rem',
                overflowX: 'auto',
              }}
            >
              <h3
                style={{
                  fontSize: '1rem',
                  color: '#0f172a',
                  margin: '0 0 1rem 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                International Mandrel Conversion Chart
              </h3>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: '0.82rem',
                }}
              >
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '0.6rem 0.75rem' }}>US Size</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>UK / AU</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>EU Standard</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Diameter (mm)</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Circumference (mm)</th>
                  </tr>
                </thead>
                <tbody>
                  {RING_MANDREL_TABLE.map((row) => (
                    <tr
                      key={row.us}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: selectedUsSize === row.us ? '#f8fafc' : 'transparent',
                        fontWeight: selectedUsSize === row.us ? 600 : 400,
                      }}
                    >
                      <td style={{ padding: '0.6rem 0.75rem', color: '#0f172a' }}>US {row.us}</td>
                      <td style={{ padding: '0.6rem 0.75rem', color: '#475569' }}>{row.uk}</td>
                      <td style={{ padding: '0.6rem 0.75rem', color: '#475569' }}>{row.eu}</td>
                      <td
                        style={{
                          padding: '0.6rem 0.75rem',
                          fontFamily: 'var(--font-mono, monospace)',
                          color: '#0f172a',
                        }}
                      >
                        {row.diameterMm} mm
                      </td>
                      <td
                        style={{
                          padding: '0.6rem 0.75rem',
                          fontFamily: 'var(--font-mono, monospace)',
                          color: '#0f172a',
                        }}
                      >
                        {row.circumferenceMm} mm
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* =====================================================================
            TAB 2: CUFFS (Heavy Cuff & Wrist Gap Calibrator)
            ===================================================================== */}
        {activeTab === 'CUFFS' && (
          <section aria-label="Wrist & Cuff Calibrator">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
              }}
            >
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '2rem',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem',
                  }}
                >
                  CALIBRATOR
                </div>
                <h2 style={{ fontSize: '1.4rem', color: '#0f172a', margin: '0 0 1.25rem 0' }}>
                  Heavy Solid Silver Cuff Calibrator
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.4rem',
                      }}
                    >
                      <label
                        htmlFor="wrist-range"
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: '#334155',
                          textTransform: 'uppercase',
                        }}
                      >
                        Wrist Circumference (Snug)
                      </label>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontWeight: 600,
                        }}
                      >
                        {wristCircumferenceInches.toFixed(2)}″ (
                        {(wristCircumferenceInches * 2.54).toFixed(1)} cm)
                      </span>
                    </div>
                    <input
                      id="wrist-range"
                      type="range"
                      min={5.5}
                      max={8.5}
                      step={0.125}
                      value={wristCircumferenceInches}
                      onChange={(e) => setWristCircumferenceInches(parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: '#0f172a' }}
                    />
                  </div>

                  <div
                    style={{
                      padding: '1.25rem',
                      borderRadius: '6px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.7rem',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-mono, monospace)',
                      }}
                    >
                      RECOMMENDED WORKSHOP TIER
                    </div>
                    <div
                      style={{
                        fontSize: '1.6rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        margin: '0.25rem 0',
                      }}
                    >
                      {cuffTier.tier}
                    </div>
                    <div
                      style={{
                        fontSize: '0.82rem',
                        color: '#475569',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                        marginTop: '0.5rem',
                      }}
                    >
                      <div>
                        · Inner Metal Circumference: <strong>{cuffTier.innerCircumference}</strong>
                      </div>
                      <div>
                        · Calibrated Entrance Gap: <strong>{cuffTier.gap} (25–32mm)</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '2rem',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem',
                  }}
                >
                  TECHNIQUE
                </div>
                <h3 style={{ fontSize: '1.25rem', color: '#0f172a', margin: '0 0 1rem 0' }}>
                  The Solid Silver Cuff Entry Ritual
                </h3>
                <div
                  style={{
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    color: '#475569',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <p style={{ margin: 0 }}>
                    <strong>Never Bend a Solid Cuff Repeatedly:</strong> Solid .925 sterling silver
                    work-hardens when flexed back and forth. Repeated bending will cause
                    micro-fractures along the spine.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>The Side-Slide Technique:</strong> Position the gap over the soft tissue
                    on the narrow side of your wrist (1.5″ above the wrist bone), then roll the cuff
                    over the forearm. It slides on effortlessly without flexing metal.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Permanent Custom Form:</strong> Adjust the opening once when you receive
                    your piece to achieve the perfect entrance gap, then maintain that geometry for
                    life.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            TAB 3: CHAINS (Chain Drape & Link Matrix)
            ===================================================================== */}
        {activeTab === 'CHAINS' && (
          <section aria-label="Chain Drape Matrix">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
              }}
            >
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '2rem',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem',
                  }}
                >
                  CALIBRATOR
                </div>
                <h2 style={{ fontSize: '1.4rem', color: '#0f172a', margin: '0 0 1.25rem 0' }}>
                  Chain Drape &amp; Link Profile
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: '#334155',
                        textTransform: 'uppercase',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Length &amp; Chest Drape
                    </label>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '0.5rem',
                      }}
                    >
                      {[
                        { len: 18, name: '18″ Choker' },
                        { len: 20, name: '20″ Collar' },
                        { len: 22, name: '22″ Chest' },
                        { len: 24, name: '24″ Talisman' },
                      ].map((item) => (
                        <button
                          key={item.len}
                          type="button"
                          onClick={() => setChainLengthInches(item.len)}
                          style={{
                            padding: '0.6rem 0.2rem',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            borderRadius: '4px',
                            border: `1px solid ${chainLengthInches === item.len ? '#0f172a' : '#e2e8f0'}`,
                            backgroundColor: chainLengthInches === item.len ? '#0f172a' : '#f8fafc',
                            color: chainLengthInches === item.len ? '#ffffff' : '#475569',
                            cursor: 'pointer',
                          }}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: '#334155',
                        textTransform: 'uppercase',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Weave / Link Architecture
                    </label>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.5rem',
                      }}
                    >
                      {(['CURB', 'CABLE', 'ROPE', 'BOX', 'FIGARO'] as const).map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setChainStyle(style)}
                          style={{
                            padding: '0.5rem',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            borderRadius: '4px',
                            border: `1px solid ${chainStyle === style ? '#0f172a' : '#e2e8f0'}`,
                            backgroundColor: chainStyle === style ? '#0f172a' : '#f8fafc',
                            color: chainStyle === style ? '#ffffff' : '#475569',
                            cursor: 'pointer',
                          }}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: '6px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.7rem',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-mono, monospace)',
                      }}
                    >
                      DRAPE RECOMMENDATION
                    </div>
                    <div
                      style={{
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        margin: '0.25rem 0',
                      }}
                    >
                      {chainLengthInches}″ Solid Silver {chainStyle}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                      {chainLengthInches <= 18 &&
                        'Rests cleanly above the collarbone for high-impact choker aesthetics.'}
                      {chainLengthInches === 20 &&
                        'Universal classic drape resting directly at the sternum hollow.'}
                      {chainLengthInches === 22 &&
                        'Comfortable drop falling mid-chest; ideal for medium amulets.'}
                      {chainLengthInches >= 24 &&
                        'Deep heavy drape engineered to suspend substantial Kathmandu talismans.'}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '2rem',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem',
                  }}
                >
                  KATHMANDU ARTISAN WEAVES
                </div>
                <h3 style={{ fontSize: '1.25rem', color: '#0f172a', margin: '0 0 1rem 0' }}>
                  Hand-Linked .925 Solid Silver
                </h3>
                <div
                  style={{
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    color: '#475569',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <p style={{ margin: 0 }}>
                    Every link is individually formed from drawn .925 sterling silver wire, closed,
                    and hard-soldered at our Kathmandu workshop.
                  </p>
                  <p style={{ margin: 0 }}>
                    Unlike machine-stamped hollow chains, our solid links have substantial heft,
                    drape with natural fluid momentum, and will never dent or snap under everyday
                    wear.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            TAB 4: PATINA (Silver Oxidation & Finishes)
            ===================================================================== */}
        {activeTab === 'PATINA' && (
          <section aria-label="Patina & Finishes">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {[
                {
                  id: 'OXIDIZED_PATINA' as const,
                  title: 'Sacred Antiqued Patina',
                  desc: 'Deliberate liver-of-sulfur oxidation concentrated in deep-carved reliefs, with hand-buffed radiant silver highlights on raised surfaces.',
                  badge: 'Signature Atelier Finish',
                },
                {
                  id: 'SATIN_MATTE' as const,
                  title: 'Directional Satin Matte',
                  desc: 'Muted, low-reflectivity brushed texture creating a contemporary industrial finish that resists noticeable surface scratches.',
                  badge: 'Tactile Minimalist',
                },
                {
                  id: 'HIGH_POLISH' as const,
                  title: 'Raw Mirror High Polish',
                  desc: 'Ultrasonic cleansed and jeweler’s rouge mirror finish. Reflects ambient light brilliantly; slowly cultivates honest character with wear.',
                  badge: 'Brilliant Classic',
                },
                {
                  id: 'HAMMERED_RAW' as const,
                  title: 'Anvil Faceted Raw',
                  desc: 'Hand-struck planar facets reflecting light organically in multiple directions from our Kathmandu shaping stake.',
                  badge: 'Sacred Hand-Forged',
                },
              ].map((finish) => {
                const isSelected = selectedFinish === finish.id;
                return (
                  <div
                    key={finish.id}
                    onClick={() => setSelectedFinish(finish.id)}
                    style={{
                      backgroundColor: '#ffffff',
                      border: `2px solid ${isSelected ? '#0f172a' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      padding: '1.5rem',
                      cursor: 'pointer',
                      transition: 'border-color 150ms ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-mono, monospace)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '2px',
                          backgroundColor: isSelected ? '#0f172a' : '#f1f5f9',
                          color: isSelected ? '#ffffff' : '#475569',
                          fontWeight: 600,
                          display: 'inline-block',
                          marginBottom: '0.75rem',
                        }}
                      >
                        {finish.badge}
                      </span>
                      <h4 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                        {finish.title}
                      </h4>
                      <p
                        style={{
                          fontSize: '0.82rem',
                          lineHeight: 1.5,
                          color: '#64748b',
                          margin: 0,
                        }}
                      >
                        {finish.desc}
                      </p>
                    </div>

                    <div
                      style={{
                        marginTop: '1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: isSelected ? '#0f172a' : '#94a3b8',
                      }}
                    >
                      <span>{isSelected ? '✓ Calibrated in Vault' : 'Select Finish'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
