'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type {
  BraceletFitType,
  ChainStyleType,
  PreciousAlloy,
  JewelleryFinish,
  JewelleryMeasurements,
} from '@jeanius/domain';
import {
  updateProfileAction,
  addAddressAction,
  deleteAddressAction,
} from '../../actions/auth.actions';

export interface AccountClientProps {
  readonly profile: {
    readonly id: string;
    readonly email: string;
    readonly fullName: string;
    readonly phone?: string | null;
    readonly role: string;
    readonly jewelleryPreferences?: JewelleryMeasurements;
  };
  readonly addresses: Array<{
    readonly id: string;
    readonly fullName: string;
    readonly addressLine1: string;
    readonly addressLine2?: string | null;
    readonly city: string;
    readonly stateOrProvince?: string | null;
    readonly postalCode: string;
    readonly country: string;
    readonly phone: string;
    readonly isDefaultShipping: boolean;
    readonly isDefaultBilling: boolean;
  }>;
}

export function AccountClientView({ profile, addresses }: AccountClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'vault' | 'addresses'>('vault');
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  // Form State for Jewellery Vault
  const initialJewellery = profile.jewelleryPreferences || {};
  const [ringSizeUs, setRingSizeUs] = useState<string>(
    initialJewellery.ringSizeUs || initialJewellery.rings?.ringSizeUs || '10.0',
  );
  const [ringMandrelMm, setRingMandrelMm] = useState<number>(
    initialJewellery.ringMandrelMm || initialJewellery.rings?.ringMandrelMm || 19.8,
  );
  const [preferredFinger, setPreferredFinger] = useState<
    'INDEX' | 'MIDDLE' | 'RING' | 'PINKY' | 'THUMB'
  >(initialJewellery.rings?.preferredFinger || 'RING');
  const [dominantHand, setDominantHand] = useState<'LEFT' | 'RIGHT'>(
    initialJewellery.rings?.dominantHand || 'RIGHT',
  );
  const [comfortFit, setComfortFit] = useState<boolean>(initialJewellery.rings?.comfortFit ?? true);

  // Wrist
  const [wristCircumferenceInches, setWristCircumferenceInches] = useState<number>(
    initialJewellery.wristCircumferenceInches ||
      initialJewellery.wrists?.wristCircumferenceInches ||
      6.75,
  );
  const [cuffGapMm, setCuffGapMm] = useState<number>(initialJewellery.wrists?.cuffGapMm || 28);
  const [braceletFit, setBraceletFit] = useState<BraceletFitType>(
    initialJewellery.wrists?.braceletFit || 'COMFORT',
  );

  // Necklace
  const [chainLengthInches, setChainLengthInches] = useState<number>(
    initialJewellery.necklaces?.preferredChainLengthInches || 20,
  );
  const [chainStyle, setChainStyle] = useState<ChainStyleType>(
    initialJewellery.necklaces?.chainStyle || 'CURB',
  );

  // Metal & Finish
  const [preferredAlloy, setPreferredAlloy] = useState<PreciousAlloy>(
    initialJewellery.preferredAlloy ||
      initialJewellery.metals?.preferredAlloy ||
      'STERLING_SILVER_925',
  );
  const [preferredFinish, setPreferredFinish] = useState<JewelleryFinish>(
    initialJewellery.preferredFinish ||
      initialJewellery.metals?.preferredFinish ||
      'OXIDIZED_PATINA',
  );

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddrFullName, setNewAddrFullName] = useState(profile.fullName);
  const [newAddrLine1, setNewAddrLine1] = useState('');
  const [newAddrLine2, setNewAddrLine2] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrState, setNewAddrState] = useState('');
  const [newAddrPostal, setNewAddrPostal] = useState('');
  const [newAddrCountry, setNewAddrCountry] = useState('NP');
  const [newAddrPhone, setNewAddrPhone] = useState(profile.phone || '');
  const [newAddrDefaultShipping, setNewAddrDefaultShipping] = useState(false);

  const handleSaveVault = () => {
    setFeedback(null);
    startTransition(async () => {
      const payload = {
        jewelleryPreferences: {
          ringSizeUs,
          ringMandrelMm,
          preferredFinger,
          dominantHand,
          comfortFit,
          wristCircumferenceInches,
          cuffGapMm,
          braceletFit,
          preferredChainLengthInches: chainLengthInches,
          chainStyle,
          preferredAlloy,
          preferredFinish,
          rings: {
            ringSizeUs,
            ringMandrelMm,
            preferredFinger,
            dominantHand,
            comfortFit,
          },
          wrists: {
            wristCircumferenceInches,
            cuffGapMm,
            braceletFit,
          },
          necklaces: {
            preferredChainLengthInches: chainLengthInches,
            chainStyle,
          },
          metals: {
            preferredAlloy,
            preferredFinish,
          },
        },
      };

      const res = await updateProfileAction(payload);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'Atelier Sizing Vault successfully saved and synchronized.',
        });
        router.refresh();
      } else {
        setFeedback({
          type: 'error',
          message: res.error?.message || 'Failed to update sizing vault.',
        });
      }
    });
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const res = await addAddressAction({
        fullName: newAddrFullName,
        addressLine1: newAddrLine1,
        addressLine2: newAddrLine2 || undefined,
        city: newAddrCity,
        stateOrProvince: newAddrState || undefined,
        postalCode: newAddrPostal,
        country: newAddrCountry,
        phone: newAddrPhone,
        isDefaultShipping: newAddrDefaultShipping,
        isDefaultBilling: false,
      });

      if (res.success) {
        setShowAddressForm(false);
        setNewAddrLine1('');
        setNewAddrLine2('');
        setNewAddrCity('');
        setNewAddrPostal('');
        setFeedback({ type: 'success', message: 'Address successfully added to account.' });
        router.refresh();
      } else {
        setFeedback({
          type: 'error',
          message: res.error?.message || 'Failed to add address.',
        });
      }
    });
  };

  const handleDeleteAddress = (addressId: string) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await deleteAddressAction(addressId);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Address deleted.' });
        router.refresh();
      } else {
        setFeedback({
          type: 'error',
          message: res.error?.message || 'Failed to delete address.',
        });
      }
    });
  };

  const isMember = profile.role === 'MEMBER' || profile.role === 'ADMIN';

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-canvas, #fdfbf7)',
        minHeight: '100vh',
        padding: '3.5rem 1.5rem 6rem',
      }}
    >
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        {/* Collector Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              backgroundColor: isMember ? '#fef3c7' : '#f1f5f9',
              border: `1px solid ${isMember ? '#fde68a' : '#e2e8f0'}`,
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: isMember ? '#b45309' : '#475569',
              marginBottom: '0.75rem',
            }}
          >
            {isMember ? '★ VIP GUILD PATRON' : 'ATELIER COLLECTOR ACCOUNT'}
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
              fontSize: '2.4rem',
              fontWeight: 700,
              color: '#0f172a',
              margin: '0 0 0.5rem 0',
            }}
          >
            {profile.fullName}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
            {profile.email} {profile.phone ? `· ${profile.phone}` : ''}
          </p>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            style={{
              padding: '1rem',
              borderRadius: '6px',
              marginBottom: '2rem',
              backgroundColor: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${feedback.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              color: feedback.type === 'success' ? '#166534' : '#991b1b',
              fontSize: '0.85rem',
            }}
          >
            {feedback.message}
          </div>
        )}

        {/* Navigation Tabs */}
        <div
          role="tablist"
          style={{
            display: 'flex',
            gap: '1rem',
            borderBottom: '1px solid #e2e8f0',
            marginBottom: '2rem',
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'vault'}
            onClick={() => setActiveTab('vault')}
            style={{
              padding: '0.75rem 0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'vault' ? '#0f172a' : '#64748b',
              borderBottom: activeTab === 'vault' ? '2px solid #0f172a' : '2px solid transparent',
            }}
          >
            Atelier Sizing Vault
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'addresses'}
            onClick={() => setActiveTab('addresses')}
            style={{
              padding: '0.75rem 0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'addresses' ? '#0f172a' : '#64748b',
              borderBottom:
                activeTab === 'addresses' ? '2px solid #0f172a' : '2px solid transparent',
            }}
          >
            Shipping Addresses ({addresses.length})
          </button>
        </div>

        {/* =====================================================================
            TAB 1: SIZING VAULT
            ===================================================================== */}
        {activeTab === 'vault' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Atelier Order-Made Sizing Clarity Banner */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>📐</span>
              <div>
                <strong
                  style={{
                    fontSize: '0.88rem',
                    color: '#0f172a',
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}
                >
                  Atelier Order-Made Sizing Profile
                </strong>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                  These anatomical measurements are stored exclusively for bespoke hand-carved
                  Order-Made pieces crafted to your exact proportions at our Kathmandu workshop.
                  Numbered Drop releases are pre-finished allocations cast in standardized physical
                  stock sizes.
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
              }}
            >
              {/* Ring Calibration */}
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
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    color: '#94a3b8',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '0.25rem',
                  }}
                >
                  CALIBRATION
                </div>
                <h2 style={{ fontSize: '1.25rem', color: '#0f172a', margin: '0 0 1.25rem 0' }}>
                  Ring Mandrel &amp; Finger
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label
                      htmlFor="vault-ring-size"
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#334155',
                        textTransform: 'uppercase',
                        marginBottom: '0.35rem',
                      }}
                    >
                      US Mandrel Size
                    </label>
                    <input
                      id="vault-ring-size"
                      type="text"
                      value={ringSizeUs}
                      onChange={(e) => setRingSizeUs(e.target.value)}
                      placeholder="e.g. 10.0"
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="vault-mandrel-mm"
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#334155',
                        textTransform: 'uppercase',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Inside Diameter (mm)
                    </label>
                    <input
                      id="vault-mandrel-mm"
                      type="number"
                      step="0.1"
                      value={ringMandrelMm}
                      onChange={(e) => setRingMandrelMm(parseFloat(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#334155',
                        textTransform: 'uppercase',
                        marginBottom: '0.35rem',
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
                            padding: '0.4rem 0.2rem',
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

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.8rem',
                        color: '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={comfortFit}
                        onChange={(e) => setComfortFit(e.target.checked)}
                        style={{ accentColor: '#0f172a' }}
                      />
                      <span>Comfort-fit bevel</span>
                    </label>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.8rem',
                        color: '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="hand"
                        checked={dominantHand === 'RIGHT'}
                        onChange={() => setDominantHand('RIGHT')}
                        style={{ accentColor: '#0f172a' }}
                      />
                      <span>Right hand</span>
                    </label>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.8rem',
                        color: '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="hand"
                        checked={dominantHand === 'LEFT'}
                        onChange={() => setDominantHand('LEFT')}
                        style={{ accentColor: '#0f172a' }}
                      />
                      <span>Left hand</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Wrist & Cuff Calibration */}
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
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    color: '#94a3b8',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '0.25rem',
                  }}
                >
                  CALIBRATION
                </div>
                <h2 style={{ fontSize: '1.25rem', color: '#0f172a', margin: '0 0 1.25rem 0' }}>
                  Heavy Cuff &amp; Wrist Breadth
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.35rem',
                      }}
                    >
                      <label
                        htmlFor="vault-wrist-circ"
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#334155',
                          textTransform: 'uppercase',
                        }}
                      >
                        Wrist Circumference
                      </label>
                      <span
                        style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono, monospace)' }}
                      >
                        {wristCircumferenceInches}″ ({(wristCircumferenceInches * 2.54).toFixed(1)}{' '}
                        cm)
                      </span>
                    </div>
                    <input
                      id="vault-wrist-circ"
                      type="range"
                      min={5.5}
                      max={8.5}
                      step={0.125}
                      value={wristCircumferenceInches}
                      onChange={(e) => setWristCircumferenceInches(parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: '#0f172a' }}
                    />
                  </div>

                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.35rem',
                      }}
                    >
                      <label
                        htmlFor="vault-cuff-gap"
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#334155',
                          textTransform: 'uppercase',
                        }}
                      >
                        Cuff Entrance Gap
                      </label>
                      <span
                        style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono, monospace)' }}
                      >
                        {cuffGapMm} mm ({(cuffGapMm / 25.4).toFixed(2)}″)
                      </span>
                    </div>
                    <input
                      id="vault-cuff-gap"
                      type="range"
                      min={20}
                      max={40}
                      step={1}
                      value={cuffGapMm}
                      onChange={(e) => setCuffGapMm(parseInt(e.target.value, 10))}
                      style={{ width: '100%', accentColor: '#0f172a' }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#334155',
                        textTransform: 'uppercase',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Cuff Fit Profile
                    </label>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.5rem',
                      }}
                    >
                      {(['SNUG', 'COMFORT', 'LOOSE'] as const).map((fit) => (
                        <button
                          key={fit}
                          type="button"
                          onClick={() => setBraceletFit(fit)}
                          style={{
                            padding: '0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            borderRadius: '4px',
                            border: `1px solid ${braceletFit === fit ? '#0f172a' : '#e2e8f0'}`,
                            backgroundColor: braceletFit === fit ? '#0f172a' : '#f8fafc',
                            color: braceletFit === fit ? '#ffffff' : '#475569',
                            cursor: 'pointer',
                          }}
                        >
                          {fit}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chain & Talisman Drape */}
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
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    color: '#94a3b8',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '0.25rem',
                  }}
                >
                  CALIBRATION
                </div>
                <h2 style={{ fontSize: '1.25rem', color: '#0f172a', margin: '0 0 1.25rem 0' }}>
                  Necklace &amp; Talisman Drape
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#334155',
                        textTransform: 'uppercase',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Preferred Chain Length
                    </label>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '0.5rem',
                      }}
                    >
                      {[18, 20, 22, 24].map((len) => (
                        <button
                          key={len}
                          type="button"
                          onClick={() => setChainLengthInches(len)}
                          style={{
                            padding: '0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            borderRadius: '4px',
                            border: `1px solid ${chainLengthInches === len ? '#0f172a' : '#e2e8f0'}`,
                            backgroundColor: chainLengthInches === len ? '#0f172a' : '#f8fafc',
                            color: chainLengthInches === len ? '#ffffff' : '#475569',
                            cursor: 'pointer',
                          }}
                        >
                          {len}″ Drape
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#334155',
                        textTransform: 'uppercase',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Chain Weave Profile
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
                </div>
              </div>

              {/* Precious Alloy & Patina */}
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
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    color: '#94a3b8',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '0.25rem',
                  }}
                >
                  FINISHES
                </div>
                <h2 style={{ fontSize: '1.25rem', color: '#0f172a', margin: '0 0 1.25rem 0' }}>
                  Precious Alloy &amp; Patina
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#334155',
                        textTransform: 'uppercase',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Fine Metal Selection
                    </label>
                    <select
                      value={preferredAlloy}
                      onChange={(e) => setPreferredAlloy(e.target.value as PreciousAlloy)}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="STERLING_SILVER_925">
                        Solid .925 Sterling Silver (Kathmandu)
                      </option>
                      <option value="SOLID_BRASS">Solid Cast Architectural Brass</option>
                      <option value="GOLD_18K">18K Solid Yellow Gold (Repoussé Trim)</option>
                      <option value="WHITE_GOLD_14K">14K Solid White Gold</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#334155',
                        textTransform: 'uppercase',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Atelier Patina Finish
                    </label>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '0.5rem',
                      }}
                    >
                      {[
                        { id: 'OXIDIZED_PATINA' as const, label: 'Sacred Antiqued Patina' },
                        { id: 'SATIN_MATTE' as const, label: 'Directional Satin' },
                        { id: 'HIGH_POLISH' as const, label: 'Raw Mirror High Polish' },
                        { id: 'HAMMERED_RAW' as const, label: 'Anvil Faceted Raw' },
                      ].map((fin) => (
                        <button
                          key={fin.id}
                          type="button"
                          onClick={() => setPreferredFinish(fin.id)}
                          style={{
                            padding: '0.5rem',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            borderRadius: '4px',
                            border: `1px solid ${preferredFinish === fin.id ? '#0f172a' : '#e2e8f0'}`,
                            backgroundColor: preferredFinish === fin.id ? '#0f172a' : '#f8fafc',
                            color: preferredFinish === fin.id ? '#ffffff' : '#475569',
                            cursor: 'pointer',
                          }}
                        >
                          {fin.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={handleSaveVault}
                  disabled={isPending}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    border: 'none',
                    cursor: isPending ? 'wait' : 'pointer',
                    transition: 'opacity 150ms ease',
                  }}
                >
                  {isPending ? 'Synchronizing Vault...' : 'Save & Lock Sizing Calibrations →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 2: ADDRESSES
            ===================================================================== */}
        {activeTab === 'addresses' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
                Saved Workshop Delivery Addresses
              </h2>
              <button
                type="button"
                onClick={() => setShowAddressForm(!showAddressForm)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {showAddressForm ? 'Cancel' : '+ Add Address'}
              </button>
            </div>

            {showAddressForm && (
              <form
                onSubmit={handleCreateAddress}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '2rem',
                  marginBottom: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <label
                      htmlFor="addr-fullname"
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#334155',
                        textTransform: 'uppercase',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Recipient Full Name
                    </label>
                    <input
                      id="addr-fullname"
                      type="text"
                      required
                      value={newAddrFullName}
                      onChange={(e) => setNewAddrFullName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="addr-phone"
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#334155',
                        textTransform: 'uppercase',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Phone (TIA Export Customs)
                    </label>
                    <input
                      id="addr-phone"
                      type="tel"
                      required
                      value={newAddrPhone}
                      onChange={(e) => setNewAddrPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="addr-line1"
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#334155',
                      textTransform: 'uppercase',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Street Address
                  </label>
                  <input
                    id="addr-line1"
                    type="text"
                    required
                    value={newAddrLine1}
                    onChange={(e) => setNewAddrLine1(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <label
                      htmlFor="addr-city"
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#334155',
                        textTransform: 'uppercase',
                        marginBottom: '0.35rem',
                      }}
                    >
                      City
                    </label>
                    <input
                      id="addr-city"
                      type="text"
                      required
                      value={newAddrCity}
                      onChange={(e) => setNewAddrCity(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="addr-state"
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#334155',
                        textTransform: 'uppercase',
                        marginBottom: '0.35rem',
                      }}
                    >
                      State / Province
                    </label>
                    <input
                      id="addr-state"
                      type="text"
                      value={newAddrState}
                      onChange={(e) => setNewAddrState(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="addr-postal"
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#334155',
                        textTransform: 'uppercase',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Postal Code
                    </label>
                    <input
                      id="addr-postal"
                      type="text"
                      required
                      value={newAddrPostal}
                      onChange={(e) => setNewAddrPostal(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="addr-country"
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#334155',
                        textTransform: 'uppercase',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Country (2-letter code)
                    </label>
                    <input
                      id="addr-country"
                      type="text"
                      maxLength={2}
                      required
                      value={newAddrCountry}
                      onChange={(e) => setNewAddrCountry(e.target.value.toUpperCase())}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  </div>
                </div>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.82rem',
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={newAddrDefaultShipping}
                    onChange={(e) => setNewAddrDefaultShipping(e.target.checked)}
                    style={{ accentColor: '#0f172a' }}
                  />
                  <span>Set as default shipping address</span>
                </label>

                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    alignSelf: 'flex-start',
                    padding: '0.65rem 1.25rem',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: isPending ? 'wait' : 'pointer',
                  }}
                >
                  Save Address →
                </button>
              </form>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                        {addr.fullName}
                      </strong>
                      {addr.isDefaultShipping && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontFamily: 'var(--font-mono, monospace)',
                            padding: '0.15rem 0.4rem',
                            borderRadius: '2px',
                            backgroundColor: '#ecfdf5',
                            color: '#047857',
                            fontWeight: 600,
                          }}
                        >
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                      <div>{addr.addressLine1}</div>
                      {addr.addressLine2 && <div>{addr.addressLine2}</div>}
                      <div>
                        {addr.city}, {addr.postalCode}
                      </div>
                      <div>{addr.country}</div>
                      <div style={{ marginTop: '0.25rem', color: '#94a3b8' }}>{addr.phone}</div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: '1rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid #f1f5f9',
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      disabled={isPending}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#b91c1c',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
