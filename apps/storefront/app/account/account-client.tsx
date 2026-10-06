'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type {
  BottomsSilhouette,
  TopsFitPreference,
  BraceletFitType,
  ChainStyleType,
  PreciousAlloy,
  JewelleryFinish,
  DenimMeasurements,
  JewelleryMeasurements,
} from '@jeanius/domain';
import type { ResolvedCustomizationDefaultsDto } from '@jeanius/contracts';
import {
  updateProfileAction,
  addAddressAction,
  deleteAddressAction,
  resolveCustomizationDefaultsAction,
} from '../../actions/auth.actions';

export interface AccountClientProps {
  readonly profile: {
    readonly id: string;
    readonly email: string;
    readonly fullName: string;
    readonly phone?: string | null;
    readonly role: string;
    readonly denimPreferences?: DenimMeasurements;
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
  const [activeTab, setActiveTab] = useState<'vault' | 'simulator' | 'addresses'>('vault');
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  // Vault form state
  const denim = profile.denimPreferences || {};
  const bottoms = denim.bottoms || {};
  const tops = denim.tops || {};
  const jewel = profile.jewelleryPreferences || {};
  const rings = jewel.rings || {};
  const wrists = jewel.wrists || {};
  const necklaces = jewel.necklaces || {};
  const metals = jewel.metals || {};

  // Denim Bottoms
  const [waist, setWaist] = useState<string>(
    bottoms.waistInches?.toString() || denim.waistInches?.toString() || '32',
  );
  const [inseam, setInseam] = useState<string>(
    bottoms.inseamInches?.toString() || denim.inseamInches?.toString() || '34',
  );
  const [silhouette, setSilhouette] = useState<BottomsSilhouette>(
    bottoms.silhouette || denim.silhouette || 'STRAIGHT',
  );
  const [hemAllowance, setHemAllowance] = useState<string>(
    bottoms.hemAllowanceInches?.toString() || '1',
  );

  // Denim Tops
  const [chest, setChest] = useState<string>(tops.chestInches?.toString() || '40');
  const [shoulder, setShoulder] = useState<string>(tops.shoulderWidthInches?.toString() || '18');
  const [sleeve, setSleeve] = useState<string>(tops.sleeveLengthInches?.toString() || '25');
  const [fitPreference, setFitPreference] = useState<TopsFitPreference>(
    tops.fitPreference || 'REGULAR',
  );

  // Jewellery
  const [ringSize, setRingSize] = useState<string>(rings.ringSizeUs || jewel.ringSizeUs || '10');
  const [wristCirc, setWristCirc] = useState<string>(
    wrists.wristCircumferenceInches?.toString() ||
      jewel.wristCircumferenceInches?.toString() ||
      '7.25',
  );
  const [braceletFit, setBraceletFit] = useState<BraceletFitType>(wrists.braceletFit || 'COMFORT');
  const [chainLength, setChainLength] = useState<string>(
    necklaces.preferredChainLengthInches?.toString() || '22',
  );
  const [chainStyle, setChainStyle] = useState<ChainStyleType>(necklaces.chainStyle || 'CURB');
  const [preferredAlloy, setPreferredAlloy] = useState<PreciousAlloy>(
    metals.preferredAlloy || jewel.preferredAlloy || 'STERLING_SILVER_925',
  );
  const [preferredFinish, setPreferredFinish] = useState<JewelleryFinish>(
    metals.preferredFinish || jewel.preferredFinish || 'OXIDIZED_PATINA',
  );

  // Auto-Fill Simulator State
  const [simCategory, setSimCategory] = useState<'BOTTOMS' | 'TOPS' | 'JEWELLERY'>('BOTTOMS');
  const [simResult, setSimResult] = useState<ResolvedCustomizationDefaultsDto | null>(null);

  // Address Modal State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addrName, setAddrName] = useState(profile.fullName);
  const [addrLine1, setAddrLine1] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrPostal, setAddrPostal] = useState('');
  const [addrCountry, setAddrCountry] = useState('NP');
  const [addrPhone, setAddrPhone] = useState(profile.phone || '+977-9800000000');

  const handleSaveVault = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const payload = {
        denimPreferences: {
          bottoms: {
            waistInches: parseFloat(waist) || 32,
            inseamInches: parseFloat(inseam) || 34,
            silhouette,
            hemAllowanceInches: parseFloat(hemAllowance) || 1,
          },
          tops: {
            chestInches: parseFloat(chest) || 40,
            shoulderWidthInches: parseFloat(shoulder) || 18,
            sleeveLengthInches: parseFloat(sleeve) || 25,
            fitPreference,
          },
          waistInches: parseFloat(waist) || 32,
          inseamInches: parseFloat(inseam) || 34,
          silhouette,
        },
        jewelleryPreferences: {
          rings: {
            ringSizeUs: ringSize,
            preferredFinger: 'RING' as const,
          },
          wrists: {
            wristCircumferenceInches: parseFloat(wristCirc) || 7.25,
            braceletFit,
          },
          necklaces: {
            preferredChainLengthInches: parseFloat(chainLength) || 22,
            chainStyle,
          },
          metals: {
            preferredAlloy,
            preferredFinish,
          },
          ringSizeUs: ringSize,
          preferredAlloy,
          preferredFinish,
        },
      };

      const result = await updateProfileAction(payload);
      if (!result.success) {
        setFeedback({ type: 'error', message: result.error?.message || 'Failed to save vault' });
        return;
      }

      setFeedback({ type: 'success', message: 'Atelier Measurements Vault saved successfully!' });
      router.refresh();
    });
  };

  const handleRunSimulator = async () => {
    startTransition(async () => {
      const result = await resolveCustomizationDefaultsAction({
        category: simCategory,
      });

      if (result.success && result.data) {
        setSimResult(result.data);
      } else {
        setFeedback({
          type: 'error',
          message: result.error?.message || 'Auto-fill simulation failed',
        });
      }
    });
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const result = await addAddressAction({
        fullName: addrName,
        addressLine1: addrLine1,
        city: addrCity,
        postalCode: addrPostal,
        country: addrCountry,
        phone: addrPhone,
        isDefaultShipping: addresses.length === 0,
        isDefaultBilling: addresses.length === 0,
      });

      if (!result.success) {
        setFeedback({ type: 'error', message: result.error?.message || 'Failed to add address' });
        return;
      }

      setShowAddAddress(false);
      setAddrLine1('');
      setAddrCity('');
      setAddrPostal('');
      setFeedback({ type: 'success', message: 'Address added to your address book.' });
      router.refresh();
    });
  };

  const handleDeleteAddress = async (id: string) => {
    startTransition(async () => {
      const result = await deleteAddressAction(id);
      if (!result.success) {
        setFeedback({
          type: 'error',
          message: result.error?.message || 'Failed to delete address',
        });
        return;
      }
      setFeedback({ type: 'success', message: 'Address removed.' });
      router.refresh();
    });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem 4rem 1.5rem' }}>
      {/* Header Profile Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '2rem',
        }}
      >
        <div>
          <span
            style={{
              display: 'inline-block',
              padding: '0.2rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              background: profile.role === 'MEMBER' ? '#fef3c7' : '#f1f5f9',
              color: profile.role === 'MEMBER' ? '#92400e' : '#475569',
              borderRadius: '3px',
              marginBottom: '0.5rem',
            }}
          >
            {profile.role} ACCOUNT
          </span>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.25rem 0', color: '#0f172a' }}>
            {profile.fullName}
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
            {profile.email} {profile.phone ? `• ${profile.phone}` : ''}
          </p>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            marginBottom: '1.5rem',
            borderRadius: '4px',
            background: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${feedback.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            color: feedback.type === 'success' ? '#166534' : '#991b1b',
            fontSize: '0.9rem',
          }}
        >
          {feedback.message}
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '2rem',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('vault')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'vault' ? '2px solid #0f172a' : '2px solid transparent',
            color: activeTab === 'vault' ? '#0f172a' : '#64748b',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Atelier Measurements Vault
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'simulator' ? '2px solid #0f172a' : '2px solid transparent',
            color: activeTab === 'simulator' ? '#0f172a' : '#64748b',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Auto-Fill Simulator
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('addresses')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'addresses' ? '2px solid #0f172a' : '2px solid transparent',
            color: activeTab === 'addresses' ? '#0f172a' : '#64748b',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Address Book ({addresses.length})
        </button>
      </div>

      {/* TAB 1: MEASUREMENTS VAULT */}
      {activeTab === 'vault' && (
        <form onSubmit={handleSaveVault}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
            }}
          >
            {/* Denim Tailoring */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '1.5rem',
              }}
            >
              <h2
                style={{
                  fontSize: '1.1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#1e3a8a',
                  margin: '0 0 1rem 0',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '0.5rem',
                }}
              >
                1. Denim Tailoring Vault
              </h2>

              <h3
                style={{
                  fontSize: '0.85rem',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  margin: '1rem 0 0.5rem 0',
                }}
              >
                Lower Body (Jeans & Trousers)
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#475569',
                    }}
                  >
                    Waist (Inches)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#475569',
                    }}
                  >
                    Inseam (Inches)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={inseam}
                    onChange={(e) => setInseam(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#475569',
                    }}
                  >
                    Cut Silhouette
                  </label>
                  <select
                    value={silhouette}
                    onChange={(e) => setSilhouette(e.target.value as BottomsSilhouette)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                    }}
                  >
                    <option value="STRAIGHT">Straight Selvedge</option>
                    <option value="SLIM_TAPERED">Slim Tapered</option>
                    <option value="WIDE_LEG">Wide Leg Atelier</option>
                    <option value="RELAXED_TAPERED">Relaxed Tapered</option>
                    <option value="BOOTCUT">Vintage Bootcut</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#475569',
                    }}
                  >
                    Hem Allowance (Inches)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={hemAllowance}
                    onChange={(e) => setHemAllowance(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>

              <h3
                style={{
                  fontSize: '0.85rem',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  margin: '1.5rem 0 0.5rem 0',
                }}
              >
                Upper Body (Jackets & Overshirts)
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#475569',
                    }}
                  >
                    Chest Circumference
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={chest}
                    onChange={(e) => setChest(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#475569',
                    }}
                  >
                    Shoulder Width
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={shoulder}
                    onChange={(e) => setShoulder(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#475569',
                    }}
                  >
                    Sleeve Length
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={sleeve}
                    onChange={(e) => setSleeve(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#475569',
                    }}
                  >
                    Jacket Fit
                  </label>
                  <select
                    value={fitPreference}
                    onChange={(e) => setFitPreference(e.target.value as TopsFitPreference)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                    }}
                  >
                    <option value="REGULAR">Regular Workwear</option>
                    <option value="SLIM">Slim Tailored</option>
                    <option value="BOXY">Boxy Type II</option>
                    <option value="OVERSIZED">Oversized Chore</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Jewellery & Metalsmithing */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '1.5rem',
              }}
            >
              <h2
                style={{
                  fontSize: '1.1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#92400e',
                  margin: '0 0 1rem 0',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '0.5rem',
                }}
              >
                2. Jewellery & Metalsmithing Vault
              </h2>

              <h3
                style={{
                  fontSize: '0.85rem',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  margin: '1rem 0 0.5rem 0',
                }}
              >
                Fingers & Wrists
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#475569',
                    }}
                  >
                    Ring Size (US)
                  </label>
                  <input
                    type="text"
                    value={ringSize}
                    onChange={(e) => setRingSize(e.target.value)}
                    placeholder="10.0"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#475569',
                    }}
                  >
                    Wrist Circumference
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={wristCirc}
                    onChange={(e) => setWristCirc(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#475569',
                    }}
                  >
                    Cuff / Bracelet Fit
                  </label>
                  <select
                    value={braceletFit}
                    onChange={(e) => setBraceletFit(e.target.value as BraceletFitType)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                    }}
                  >
                    <option value="COMFORT">Comfort Fit</option>
                    <option value="SNUG">Snug Fit</option>
                    <option value="LOOSE">Loose Drape</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#475569',
                    }}
                  >
                    Chain Style
                  </label>
                  <select
                    value={chainStyle}
                    onChange={(e) => setChainStyle(e.target.value as ChainStyleType)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                    }}
                  >
                    <option value="CURB">Curb</option>
                    <option value="CABLE">Cable</option>
                    <option value="ROPE">Rope</option>
                    <option value="BOX">Box</option>
                    <option value="FIGARO">Figaro</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#475569',
                    }}
                  >
                    Chain Length (Inches)
                  </label>
                  <input
                    type="number"
                    value={chainLength}
                    onChange={(e) => setChainLength(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>

              <h3
                style={{
                  fontSize: '0.85rem',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  margin: '1.5rem 0 0.5rem 0',
                }}
              >
                Metallurgical Preferences
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#475569',
                    }}
                  >
                    Preferred Metal Alloy
                  </label>
                  <select
                    value={preferredAlloy}
                    onChange={(e) => setPreferredAlloy(e.target.value as PreciousAlloy)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                    }}
                  >
                    <option value="STERLING_SILVER_925">.925 Sterling Silver</option>
                    <option value="SOLID_BRASS">Solid Yellow Brass</option>
                    <option value="GOLD_18K">18K Solid Gold</option>
                    <option value="WHITE_GOLD_14K">14K White Gold</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#475569',
                    }}
                  >
                    Preferred Patina / Finish
                  </label>
                  <select
                    value={preferredFinish}
                    onChange={(e) => setPreferredFinish(e.target.value as JewelleryFinish)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                    }}
                  >
                    <option value="OXIDIZED_PATINA">Oxidized Vintage Patina</option>
                    <option value="HIGH_POLISH">High Mirror Polish</option>
                    <option value="SATIN_MATTE">Satin Hand Brushed</option>
                    <option value="HAMMERED_RAW">Raw Hammered Texture</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'right' }}>
            <button
              type="submit"
              disabled={isPending}
              style={{
                padding: '0.75rem 1.75rem',
                background: '#0f172a',
                color: '#fdfbf7',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {isPending ? 'Saving Bespoke Vault...' : 'Save Atelier Measurements Vault'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: AUTO-FILL SIMULATOR */}
      {activeTab === 'simulator' && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '2rem',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0', color: '#0f172a' }}>
            Bespoke Auto-Fill Simulator
          </h2>
          <p
            style={{
              color: '#64748b',
              fontSize: '0.9rem',
              lineHeight: 1.5,
              margin: '0 0 1.5rem 0',
            }}
          >
            This simulator runs the domain-pure <strong>Customization Auto-Fill Resolver</strong>{' '}
            against your saved measurements vault. When you browse the catalog and open a bespoke
            configurator, this service automatically pre-populates your tailoring options with zero
            manual data entry.
          </p>

          <div
            style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}
          >
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
              Select Product Category:
            </label>
            <select
              value={simCategory}
              onChange={(e) => setSimCategory(e.target.value as 'BOTTOMS' | 'TOPS' | 'JEWELLERY')}
              style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            >
              <option value="BOTTOMS">BOTTOMS (Raw Selvedge Jeans)</option>
              <option value="TOPS">TOPS (Type II Denim Jacket)</option>
              <option value="JEWELLERY">JEWELLERY (Rings & Cuffs)</option>
            </select>
            <button
              type="button"
              onClick={handleRunSimulator}
              disabled={isPending}
              style={{
                padding: '0.5rem 1.25rem',
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isPending ? 'Resolving...' : 'Run Auto-Fill Resolution'}
            </button>
          </div>

          {simResult && (
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '1.5rem',
                marginTop: '1rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    color: '#0f172a',
                  }}
                >
                  Resolved Configurator Specifications:
                </span>
                <span
                  style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '3px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: simResult.isComplete ? '#dcfce7' : '#fef3c7',
                    color: simResult.isComplete ? '#15803d' : '#b45309',
                  }}
                >
                  {simResult.isComplete ? '✓ COMPLETE RESOLUTION' : 'PARTIAL (MISSING DEFAULTS)'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <h4
                    style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '0.8rem',
                      color: '#64748b',
                      textTransform: 'uppercase',
                    }}
                  >
                    Auto-Filled Measurements:
                  </h4>
                  <pre
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      padding: '0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      margin: 0,
                    }}
                  >
                    {JSON.stringify(simResult.measurements, null, 2)}
                  </pre>
                </div>

                <div>
                  <h4
                    style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '0.8rem',
                      color: '#64748b',
                      textTransform: 'uppercase',
                    }}
                  >
                    Material & Sizing Preferences:
                  </h4>
                  <pre
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      padding: '0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      margin: 0,
                    }}
                  >
                    {JSON.stringify(simResult.materialPreferences, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ADDRESS BOOK */}
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
            <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#0f172a' }}>
              Saved Shipping & Billing Addresses
            </h2>
            <button
              type="button"
              onClick={() => setShowAddAddress(!showAddAddress)}
              style={{
                padding: '0.5rem 1rem',
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {showAddAddress ? 'Cancel' : '+ Add Address'}
            </button>
          </div>

          {showAddAddress && (
            <form
              onSubmit={handleCreateAddress}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '1.5rem',
                marginBottom: '2rem',
              }}
            >
              <h3 style={{ fontSize: '1rem', margin: '0 0 1rem 0', color: '#0f172a' }}>
                New Address Details
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={addrName}
                    onChange={(e) => setAddrName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>
                    Phone
                  </label>
                  <input
                    type="text"
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>
                  Street Address
                </label>
                <input
                  type="text"
                  value={addrLine1}
                  onChange={(e) => setAddrLine1(e.target.value)}
                  required
                  placeholder="Lazimpat Road, House 12"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    required
                    placeholder="Kathmandu"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={addrPostal}
                    onChange={(e) => setAddrPostal(e.target.value)}
                    required
                    placeholder="44600"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>
                    Country Code
                  </label>
                  <input
                    type="text"
                    value={addrCountry}
                    onChange={(e) => setAddrCountry(e.target.value)}
                    required
                    placeholder="NP"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                style={{
                  padding: '0.6rem 1.25rem',
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Save Address
              </button>
            </form>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {addresses.map((addr) => (
              <div
                key={addr.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '1.25rem',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {addr.isDefaultShipping && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.4rem',
                        background: '#e0f2fe',
                        color: '#0369a1',
                        borderRadius: '3px',
                        fontWeight: 700,
                      }}
                    >
                      DEFAULT SHIPPING
                    </span>
                  )}
                  {addr.isDefaultBilling && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.4rem',
                        background: '#f1f5f9',
                        color: '#475569',
                        borderRadius: '3px',
                        fontWeight: 700,
                      }}
                    >
                      BILLING
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>
                  {addr.fullName}
                </div>
                <div style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.4 }}>
                  {addr.addressLine1}
                  {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                  <br />
                  {addr.city}, {addr.postalCode}, {addr.country}
                  <br />
                  {addr.phone}
                </div>
                <div
                  style={{
                    marginTop: '1rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(addr.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Delete Address
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
