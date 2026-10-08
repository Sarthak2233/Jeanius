'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
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
  StomachProfile,
  SeatProfile,
  FitCutType,
  RisePreference,
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
    readonly craftFocus?: 'GARMENT' | 'JEWELLERY' | 'DUAL_CRAFT';
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

  const initialCraftFocus: 'GARMENT' | 'JEWELLERY' | 'DUAL_CRAFT' =
    profile.craftFocus ||
    (profile.denimPreferences && !profile.jewelleryPreferences
      ? 'GARMENT'
      : !profile.denimPreferences && profile.jewelleryPreferences
        ? 'JEWELLERY'
        : 'DUAL_CRAFT');

  const [craftFocus, setCraftFocus] = useState<'GARMENT' | 'JEWELLERY' | 'DUAL_CRAFT'>(
    initialCraftFocus,
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

  // Denim Bottoms (Wholesome Modern Tailor Points A–Q)
  const [gender, setGender] = useState<'MEN' | 'WOMEN' | 'UNISEX'>(
    (bottoms.gender as 'MEN' | 'WOMEN' | 'UNISEX') || 'MEN',
  );
  const [waist, setWaist] = useState<string>(
    bottoms.waistInches?.toString() || denim.waistInches?.toString() || '32',
  );
  const [inseam, setInseam] = useState<string>(
    bottoms.inseamInches?.toString() || denim.inseamInches?.toString() || '34',
  );
  const [outseam, setOutseam] = useState<string>(bottoms.outseamInches?.toString() || '42');
  const [thigh, setThigh] = useState<string>(bottoms.thighInches?.toString() || '23');
  const [knee, setKnee] = useState<string>(bottoms.kneeInches?.toString() || '17');
  const [legOpening, setLegOpening] = useState<string>(
    bottoms.legOpeningInches?.toString() || '16',
  );
  const [frontRise, setFrontRise] = useState<string>(bottoms.frontRiseInches?.toString() || '11');
  const [backRise, setBackRise] = useState<string>(bottoms.backRiseInches?.toString() || '14.5');
  const [crotchTotal, setCrotchTotal] = useState<string>(
    bottoms.crotchTotalInches?.toString() || '25.5',
  );
  const [calf, setCalf] = useState<string>(bottoms.calfInches?.toString() || '15');
  const [ankle, setAnkle] = useState<string>(bottoms.ankleInches?.toString() || '10');
  const [naturalWaist, setNaturalWaist] = useState<string>(
    bottoms.naturalWaistInches?.toString() || '28',
  );
  const [hips, setHips] = useState<string>(bottoms.hipsInches?.toString() || '38');
  const [risePreference, setRisePreference] = useState<RisePreference>(
    (bottoms.risePreference as RisePreference) || 'MID_RISE',
  );
  const [seatProfile, setSeatProfile] = useState<SeatProfile>(
    (bottoms.seatProfile as SeatProfile) || 'AVERAGE',
  );
  const [stomachProfile, setStomachProfile] = useState<StomachProfile>(
    (bottoms.stomachProfile as StomachProfile) || 'AVERAGE',
  );
  const [bottomsFitCut, setBottomsFitCut] = useState<FitCutType>(bottoms.fitCut || 'NORMAL');
  const [silhouette, setSilhouette] = useState<BottomsSilhouette>(
    bottoms.silhouette || denim.silhouette || 'STRAIGHT',
  );
  const [hemAllowance, setHemAllowance] = useState<string>(
    bottoms.hemAllowanceInches?.toString() || '1',
  );

  // Denim Tops (Modern Tailor Shirt & Suit System)
  const [topsGender, setTopsGender] = useState<'MEN' | 'WOMEN' | 'UNISEX'>(
    (tops.gender as 'MEN' | 'WOMEN' | 'UNISEX') || 'MEN',
  );
  const [collar, setCollar] = useState<string>(
    tops.collarInches?.toString() || tops.neckInches?.toString() || '16',
  );
  const [chest, setChest] = useState<string>(tops.chestInches?.toString() || '40');
  const [shirtWaist, setShirtWaist] = useState<string>(tops.waistInches?.toString() || '36');
  const [stomach, setStomach] = useState<string>(tops.stomachInches?.toString() || '38');
  const [shirtHip, setShirtHip] = useState<string>(tops.hipInches?.toString() || '40');
  const [shoulder, setShoulder] = useState<string>(tops.shoulderWidthInches?.toString() || '18');
  const [yoke, setYoke] = useState<string>(tops.yokeInches?.toString() || '18.5');
  const [sleeve, setSleeve] = useState<string>(tops.sleeveLengthInches?.toString() || '25');
  const [shortSleeve, setShortSleeve] = useState<string>(
    tops.shortSleeveLengthInches?.toString() || '9.5',
  );
  const [bicep, setBicep] = useState<string>(tops.bicepInches?.toString() || '14');
  const [cuff, setCuff] = useState<string>(
    tops.cuffInches?.toString() || tops.wristInches?.toString() || '9.5',
  );
  const [armhole, setArmhole] = useState<string>(tops.armholeInches?.toString() || '20');
  const [shirtLength, setShirtLength] = useState<string>(
    tops.shirtLengthInches?.toString() || tops.backLengthInches?.toString() || '30',
  );
  const [jacketLength, setJacketLength] = useState<string>(
    tops.jacketLengthInches?.toString() || '30',
  );
  const [breastPoint, setBreastPoint] = useState<string>(
    tops.breastPointInches?.toString() || '10.5',
  );
  const [waistPoint, setWaistPoint] = useState<string>(tops.waistPointInches?.toString() || '16.5');
  const [frontBustWidth, setFrontBustWidth] = useState<string>(
    tops.frontBustWidthInches?.toString() || '18',
  );
  const [fitPreference, setFitPreference] = useState<TopsFitPreference>(
    tops.fitPreference || 'REGULAR',
  );
  const [topsFitCut, setTopsFitCut] = useState<FitCutType>(tops.fitCut || 'NORMAL');
  const [topsStomachProfile, setTopsStomachProfile] = useState<StomachProfile>(
    (tops.stomachProfile as StomachProfile) || 'AVERAGE',
  );

  // Jewellery
  const [ringSize, setRingSize] = useState<string>(rings.ringSizeUs || jewel.ringSizeUs || '10');
  const [bandWidth, setBandWidth] = useState<string>(rings.bandWidthMm?.toString() || '8');
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

  const getGarmentPayload = () => ({
    bottoms: {
      gender,
      waistInches: parseFloat(waist) || 32,
      inseamInches: parseFloat(inseam) || 34,
      outseamInches: parseFloat(outseam) || undefined,
      thighInches: parseFloat(thigh) || undefined,
      kneeInches: parseFloat(knee) || undefined,
      legOpeningInches: parseFloat(legOpening) || undefined,
      frontRiseInches: parseFloat(frontRise) || undefined,
      backRiseInches: parseFloat(backRise) || undefined,
      crotchTotalInches: parseFloat(crotchTotal) || undefined,
      calfInches: parseFloat(calf) || undefined,
      ankleInches: parseFloat(ankle) || undefined,
      naturalWaistInches: parseFloat(naturalWaist) || undefined,
      hipsInches: parseFloat(hips) || undefined,
      risePreference,
      seatProfile,
      stomachProfile,
      fitCut: bottomsFitCut,
      silhouette,
      hemAllowanceInches: parseFloat(hemAllowance) || 1,
    },
    tops: {
      gender: topsGender,
      collarInches: parseFloat(collar) || undefined,
      neckInches: parseFloat(collar) || undefined,
      chestInches: parseFloat(chest) || 40,
      waistInches: parseFloat(shirtWaist) || undefined,
      stomachInches: parseFloat(stomach) || undefined,
      hipInches: parseFloat(shirtHip) || undefined,
      shoulderWidthInches: parseFloat(shoulder) || 18,
      yokeInches: parseFloat(yoke) || undefined,
      sleeveLengthInches: parseFloat(sleeve) || 25,
      shortSleeveLengthInches: parseFloat(shortSleeve) || undefined,
      bicepInches: parseFloat(bicep) || undefined,
      cuffInches: parseFloat(cuff) || undefined,
      wristInches: parseFloat(cuff) || undefined,
      armholeInches: parseFloat(armhole) || undefined,
      shirtLengthInches: parseFloat(shirtLength) || undefined,
      jacketLengthInches: parseFloat(jacketLength) || undefined,
      backLengthInches: parseFloat(shirtLength) || undefined,
      breastPointInches: topsGender === 'WOMEN' ? parseFloat(breastPoint) || undefined : undefined,
      waistPointInches: topsGender === 'WOMEN' ? parseFloat(waistPoint) || undefined : undefined,
      frontBustWidthInches:
        topsGender === 'WOMEN' ? parseFloat(frontBustWidth) || undefined : undefined,
      fitPreference,
      fitCut: topsFitCut,
      stomachProfile: topsStomachProfile,
    },
    waistInches: parseFloat(waist) || 32,
    inseamInches: parseFloat(inseam) || 34,
    silhouette,
  });

  const getJewelleryPayload = () => ({
    rings: {
      ringSizeUs: ringSize,
      bandWidthMm: parseFloat(bandWidth) || undefined,
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
  });

  const handleSaveGarmentVault = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const result = await updateProfileAction({
        denimPreferences: getGarmentPayload(),
        craftFocus: craftFocus === 'DUAL_CRAFT' ? 'DUAL_CRAFT' : 'GARMENT',
      });
      if (!result.success) {
        setFeedback({
          type: 'error',
          message: result.error?.message || 'Failed to save garment vault',
        });
        return;
      }

      setFeedback({
        type: 'success',
        message: 'Garment Tailoring measurements saved to Atelier Vault!',
      });
      router.refresh();
    });
  };

  const handleSaveJewelleryVault = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const result = await updateProfileAction({
        jewelleryPreferences: getJewelleryPayload(),
        craftFocus: craftFocus === 'DUAL_CRAFT' ? 'DUAL_CRAFT' : 'JEWELLERY',
      });
      if (!result.success) {
        setFeedback({
          type: 'error',
          message: result.error?.message || 'Failed to save jewellery vault',
        });
        return;
      }

      setFeedback({
        type: 'success',
        message: 'Precious Jewellery specifications saved to Atelier Vault!',
      });
      router.refresh();
    });
  };

  const handleSaveBothVaults = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const result = await updateProfileAction({
        denimPreferences: getGarmentPayload(),
        jewelleryPreferences: getJewelleryPayload(),
        craftFocus: 'DUAL_CRAFT',
      });
      if (!result.success) {
        setFeedback({
          type: 'error',
          message: result.error?.message || 'Failed to save atelier vault',
        });
        return;
      }

      setFeedback({
        type: 'success',
        message: 'Dual-Craft Atelier measurements saved successfully!',
      });
      router.refresh();
    });
  };

  const handleClearGarmentProfile = async () => {
    if (!window.confirm('Clear saved garment measurements from the vault?')) return;
    setFeedback(null);

    startTransition(async () => {
      const result = await updateProfileAction({ denimPreferences: null });
      if (!result.success) {
        setFeedback({
          type: 'error',
          message: result.error?.message || 'Failed to clear garment profile',
        });
        return;
      }

      setFeedback({ type: 'success', message: 'Garment profile cleared from vault.' });
      router.refresh();
    });
  };

  const handleClearJewelleryProfile = async () => {
    if (!window.confirm('Clear saved jewellery specifications from the vault?')) return;
    setFeedback(null);

    startTransition(async () => {
      const result = await updateProfileAction({ jewelleryPreferences: null });
      if (!result.success) {
        setFeedback({
          type: 'error',
          message: result.error?.message || 'Failed to clear jewellery profile',
        });
        return;
      }

      setFeedback({ type: 'success', message: 'Jewellery profile cleared from vault.' });
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
        <div>
          {/* Craft Focus Mode Switcher */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1.25rem 1.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  textTransform: 'uppercase',
                  color: '#64748b',
                  letterSpacing: '0.08em',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '0.2rem',
                }}
              >
                Atelier Craft Specialization
              </span>
              <h3 style={{ fontSize: '1.05rem', color: '#0f172a', margin: 0 }}>
                Decoupled Sizing: Garment, Jewellery, or Both
              </h3>
            </div>

            <div
              style={{
                display: 'inline-flex',
                backgroundColor: '#f1f5f9',
                padding: '4px',
                borderRadius: '6px',
                gap: '4px',
              }}
            >
              <button
                type="button"
                onClick={() => setCraftFocus('GARMENT')}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: craftFocus === 'GARMENT' ? '#0f172a' : 'transparent',
                  color: craftFocus === 'GARMENT' ? '#ffffff' : '#475569',
                  transition: 'all 150ms ease',
                }}
              >
                👖 Garment Only
              </button>
              <button
                type="button"
                onClick={() => setCraftFocus('JEWELLERY')}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: craftFocus === 'JEWELLERY' ? '#0f172a' : 'transparent',
                  color: craftFocus === 'JEWELLERY' ? '#ffffff' : '#475569',
                  transition: 'all 150ms ease',
                }}
              >
                💍 Jewellery Only
              </button>
              <button
                type="button"
                onClick={() => setCraftFocus('DUAL_CRAFT')}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: craftFocus === 'DUAL_CRAFT' ? '#0f172a' : 'transparent',
                  color: craftFocus === 'DUAL_CRAFT' ? '#ffffff' : '#475569',
                  transition: 'all 150ms ease',
                }}
              >
                ✨ Dual-Craft (Both)
              </button>
            </div>
          </div>

          {/* Craft Status Telemetry Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                padding: '0.85rem 1.15rem',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: profile.denimPreferences ? '#bbf7d0' : '#e2e8f0',
                backgroundColor: profile.denimPreferences ? '#f0fdf4' : '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
                  👖 Garment Profile
                </span>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                  {profile.denimPreferences
                    ? `Waist ${waist}" · Inseam ${inseam}" (${silhouette})`
                    : 'Unconfigured (Optional for jewellery patrons)'}
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: profile.denimPreferences ? '#dcfce7' : '#e2e8f0',
                  color: profile.denimPreferences ? '#166534' : '#64748b',
                }}
              >
                {profile.denimPreferences ? 'SAVED' : 'UNSET'}
              </span>
            </div>

            <div
              style={{
                padding: '0.85rem 1.15rem',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: profile.jewelleryPreferences ? '#fed7aa' : '#e2e8f0',
                backgroundColor: profile.jewelleryPreferences ? '#fff7ed' : '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
                  💍 Jewellery Profile
                </span>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                  {profile.jewelleryPreferences
                    ? `Ring US ${ringSize} · Wrist ${wristCirc}" (${preferredAlloy.split('_')[0]})`
                    : 'Unconfigured (Optional for denim patrons)'}
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: profile.jewelleryPreferences ? '#ffedd5' : '#e2e8f0',
                  color: profile.jewelleryPreferences ? '#9a3412' : '#64748b',
                }}
              >
                {profile.jewelleryPreferences ? 'SAVED' : 'UNSET'}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                craftFocus === 'DUAL_CRAFT' ? 'repeat(auto-fit, minmax(360px, 1fr))' : '1fr',
              gap: '2rem',
            }}
          >
            {/* Denim Tailoring */}
            {(craftFocus === 'GARMENT' || craftFocus === 'DUAL_CRAFT') && (
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

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    margin: '1rem 0 0.5rem 0',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '0.85rem',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      margin: 0,
                    }}
                  >
                    Lower Body (Jeans & Trousers)
                  </h3>
                  <Link
                    href="/sizing"
                    target="_blank"
                    style={{
                      fontSize: '0.72rem',
                      color: '#b91c1c',
                      textDecoration: 'underline',
                      fontWeight: 600,
                    }}
                  >
                    Need Guidance? Sizing Studio ↗
                  </Link>
                </div>

                {/* Lower Body Configuration Row 1 */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
                      Anatomical Pattern Cut
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'MEN' | 'WOMEN' | 'UNISEX')}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                      }}
                    >
                      <option value="MEN">Men’s Pattern (Pelvic Anchor)</option>
                      <option value="WOMEN">Women’s Pattern (Lordosis Curve)</option>
                      <option value="UNISEX">Unisex / Vintage Straight</option>
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
                      Rise Preference
                    </label>
                    <select
                      value={risePreference}
                      onChange={(e) =>
                        setRisePreference(e.target.value as 'HIGH_RISE' | 'MID_RISE' | 'LOW_RISE')
                      }
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                      }}
                    >
                      <option value="MID_RISE">Mid Rise (Classic)</option>
                      <option value="HIGH_RISE">High Rise (Torso Anchor)</option>
                      <option value="LOW_RISE">Low Rise (Hip Hugger)</option>
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
                      Trouser Fit Ease
                    </label>
                    <select
                      value={bottomsFitCut}
                      onChange={(e) => setBottomsFitCut(e.target.value as FitCutType)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                      }}
                    >
                      <option value="NORMAL">Normal Fit (Tailored Room)</option>
                      <option value="SLIM">Slim Fit (Clean Contour)</option>
                      <option value="LOOSE">Loose Fit (Comfort Relaxed)</option>
                    </select>
                  </div>
                </div>

                {/* Lower Body Posture Profiles */}
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
                      Point Q: Seat Posture
                    </label>
                    <select
                      value={seatProfile}
                      onChange={(e) =>
                        setSeatProfile(e.target.value as 'FLAT' | 'AVERAGE' | 'ROUNDED' | 'STOUT')
                      }
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                      }}
                    >
                      <option value="AVERAGE">Average Posture</option>
                      <option value="FLAT">Flat Seat</option>
                      <option value="ROUNDED">Rounded / Prominent</option>
                      <option value="STOUT">Stout Fork</option>
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
                      Abdomen / Stomach Posture
                    </label>
                    <select
                      value={stomachProfile}
                      onChange={(e) =>
                        setStomachProfile(
                          e.target.value as 'FLAT' | 'AVERAGE' | 'ROUNDED' | 'STOUT',
                        )
                      }
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                      }}
                    >
                      <option value="AVERAGE">Average Abdomen</option>
                      <option value="FLAT">Flat Stomach</option>
                      <option value="ROUNDED">Rounded Stomach</option>
                      <option value="STOUT">Stout (Beer Belly)</option>
                    </select>
                  </div>
                </div>

                {/* Point A, Point H & Point I: Waist, Inseam & Outseam */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
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
                      Point A: Waist (Inches)
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
                      Point H: Inseam (Inches)
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
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#475569',
                      }}
                    >
                      Point I: Outseam / Pants Length
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={outseam}
                      onChange={(e) => setOutseam(e.target.value)}
                      placeholder="42"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>

                {/* Points C, D & E: Thigh, Knee & Leg Opening */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
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
                      Point C: Thigh (Inches)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={thigh}
                      onChange={(e) => setThigh(e.target.value)}
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
                      Point D: Knee (Inches)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={knee}
                      onChange={(e) => setKnee(e.target.value)}
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
                      Point E: Hem Opening (Inches)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={legOpening}
                      onChange={(e) => setLegOpening(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>

                {/* Points F, G & N: Front Rise, Back Rise & Total Crotch */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
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
                      Point F: Front Rise (Inches)
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={frontRise}
                      onChange={(e) => setFrontRise(e.target.value)}
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
                      Point G: Back Rise (Inches)
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={backRise}
                      onChange={(e) => setBackRise(e.target.value)}
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
                      Point N: Total Crotch
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={crotchTotal}
                      onChange={(e) => setCrotchTotal(e.target.value)}
                      placeholder="25.5"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>

                {/* Points O & P: Calf & Ankle Circumference */}
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
                      Point O: Calf Circumference (Inches)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={calf}
                      onChange={(e) => setCalf(e.target.value)}
                      placeholder="15.0"
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
                      Point P: Ankle Circumference (Inches)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={ankle}
                      onChange={(e) => setAnkle(e.target.value)}
                      placeholder="10.0"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>

                {/* Point B: Fullest Hips & Cut Silhouette */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
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
                      Point B: Hips / Seat Fullest
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={hips}
                      onChange={(e) => setHips(e.target.value)}
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

                {/* Women's Specific Point L */}
                {gender === 'WOMEN' && (
                  <div
                    style={{
                      backgroundColor: '#fff7ed',
                      border: '1px solid #fed7aa',
                      padding: '0.75rem',
                      borderRadius: '4px',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#9a3412',
                        marginBottom: '0.5rem',
                      }}
                    >
                      FEMALE ANATOMY CALIBRATION (POINT L)
                    </div>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: '#475569',
                        }}
                      >
                        Point L: Natural Waist (Narrowest Rib Plane)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={naturalWaist}
                        onChange={(e) => setNaturalWaist(e.target.value)}
                        style={{
                          width: '100%',
                          maxWidth: '240px',
                          padding: '0.4rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* ======================================================= */}
                {/* UPPER BODY (SHIRTS, JACKETS & SUITS - MODERN TAILOR)     */}
                {/* ======================================================= */}
                <h3
                  style={{
                    fontSize: '0.85rem',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    margin: '2rem 0 0.5rem 0',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '1.25rem',
                  }}
                >
                  Upper Body (Shirts, Overshirts, Jackets &amp; Suits)
                </h3>

                {/* Upper Body Configuration Row 1 */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
                      Upper Pattern Model
                    </label>
                    <select
                      value={topsGender}
                      onChange={(e) => setTopsGender(e.target.value as 'MEN' | 'WOMEN' | 'UNISEX')}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                      }}
                    >
                      <option value="MEN">Men’s Shirt &amp; Suit Cut</option>
                      <option value="WOMEN">Women’s Shirt &amp; Blouse Cut</option>
                      <option value="UNISEX">Unisex Overshirt Cut</option>
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
                      Fit Allowance Ease
                    </label>
                    <select
                      value={topsFitCut}
                      onChange={(e) => setTopsFitCut(e.target.value as FitCutType)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                      }}
                    >
                      <option value="NORMAL">Normal Fit (+16cm Ease)</option>
                      <option value="SLIM">Slim Fit (+12cm Ease)</option>
                      <option value="LOOSE">Loose Fit (+20cm Ease)</option>
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
                      Jacket / Overshirt Fit
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
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#475569',
                      }}
                    >
                      Abdomen Profile
                    </label>
                    <select
                      value={topsStomachProfile}
                      onChange={(e) =>
                        setTopsStomachProfile(
                          e.target.value as 'FLAT' | 'AVERAGE' | 'ROUNDED' | 'STOUT',
                        )
                      }
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                      }}
                    >
                      <option value="AVERAGE">Average Abdomen</option>
                      <option value="FLAT">Flat Stomach</option>
                      <option value="ROUNDED">Rounded</option>
                      <option value="STOUT">Stout (Beer Belly)</option>
                    </select>
                  </div>
                </div>

                {/* Upper Body Row 2: Collar, Chest, Shirt Waist */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
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
                      Collar / Neck (Inches)
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={collar}
                      onChange={(e) => setCollar(e.target.value)}
                      placeholder="16.0"
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
                      Shirt Waistline (Inches)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={shirtWaist}
                      onChange={(e) => setShirtWaist(e.target.value)}
                      placeholder="36.0"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>

                {/* Upper Body Row 3: Stomach, Hip, Shirt Length */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
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
                      Stomach / Belly (Inches)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={stomach}
                      onChange={(e) => setStomach(e.target.value)}
                      placeholder="38.0"
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
                      Shirt Base Hip (Inches)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={shirtHip}
                      onChange={(e) => setShirtHip(e.target.value)}
                      placeholder="40.0"
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
                      Shirt Length (Front Neck to Hem)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={shirtLength}
                      onChange={(e) => setShirtLength(e.target.value)}
                      placeholder="30.0"
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
                      Suit Jacket Length (to Thumb Joint)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={jacketLength}
                      onChange={(e) => setJacketLength(e.target.value)}
                      placeholder="30.0"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>

                {/* Upper Body Row 4: Shoulders, Yoke, Armhole */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
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
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#475569',
                      }}
                    >
                      Yoke (Back Shoulder-to-Shoulder)
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={yoke}
                      onChange={(e) => setYoke(e.target.value)}
                      placeholder="18.5"
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
                      Armhole / Sleeve Hole
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={armhole}
                      onChange={(e) => setArmhole(e.target.value)}
                      placeholder="20.0"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>

                {/* Upper Body Row 5: Sleeve, Short Sleeve, Bicep, Cuff */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
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
                      Short Sleeve
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={shortSleeve}
                      onChange={(e) => setShortSleeve(e.target.value)}
                      placeholder="9.5"
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
                      Bicep (Upper Arm)
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={bicep}
                      onChange={(e) => setBicep(e.target.value)}
                      placeholder="14.0"
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
                      Cuff / Wrist (Inches)
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={cuff}
                      onChange={(e) => setCuff(e.target.value)}
                      placeholder="9.5"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>

                {/* Women's Specific Upper Body Callout */}
                {(topsGender === 'WOMEN' || gender === 'WOMEN') && (
                  <div
                    style={{
                      backgroundColor: '#fff7ed',
                      border: '1px solid #fed7aa',
                      padding: '0.75rem',
                      borderRadius: '4px',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#9a3412',
                        marginBottom: '0.5rem',
                      }}
                    >
                      WOMEN’S UPPER BODY CALIBRATION (BREAST POINT, WAIST POINT &amp; BUST)
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: '0.75rem',
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: '#475569',
                          }}
                        >
                          Breast Point (Shoulder to Apex)
                        </label>
                        <input
                          type="number"
                          step="0.25"
                          value={breastPoint}
                          onChange={(e) => setBreastPoint(e.target.value)}
                          placeholder="10.5"
                          style={{
                            width: '100%',
                            padding: '0.4rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '4px',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: '#475569',
                          }}
                        >
                          Waist Point (Shoulder to Waist)
                        </label>
                        <input
                          type="number"
                          step="0.25"
                          value={waistPoint}
                          onChange={(e) => setWaistPoint(e.target.value)}
                          placeholder="16.5"
                          style={{
                            width: '100%',
                            padding: '0.4rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '4px',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: '#475569',
                          }}
                        >
                          Front Bust Width (Armpit to Armpit)
                        </label>
                        <input
                          type="number"
                          step="0.25"
                          value={frontBustWidth}
                          onChange={(e) => setFrontBustWidth(e.target.value)}
                          placeholder="18.0"
                          style={{
                            width: '100%',
                            padding: '0.4rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '4px',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Denim Box Action Footer */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '2rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  {profile.denimPreferences ? (
                    <button
                      type="button"
                      onClick={handleClearGarmentProfile}
                      disabled={isPending}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'transparent',
                        color: '#b91c1c',
                        border: '1px solid #fecaca',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: isPending ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Clear Garment Profile ✕
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    type="button"
                    onClick={handleSaveGarmentVault}
                    disabled={isPending}
                    style={{
                      padding: '0.65rem 1.35rem',
                      background: '#1e3a8a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: isPending ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isPending ? 'Saving...' : 'Save Garment Vault 👖'}
                  </button>
                </div>
              </div>
            )}

            {/* Jewellery & Metalsmithing */}
            {(craftFocus === 'JEWELLERY' || craftFocus === 'DUAL_CRAFT') && (
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
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    margin: '1rem 0 0.5rem 0',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '0.85rem',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      margin: 0,
                    }}
                  >
                    Fingers & Wrists
                  </h3>
                  <Link
                    href="/sizing"
                    target="_blank"
                    style={{
                      fontSize: '0.72rem',
                      color: '#b91c1c',
                      textDecoration: 'underline',
                      fontWeight: 600,
                    }}
                  >
                    Need Guidance? Sizing Studio ↗
                  </Link>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '1rem',
                    marginBottom: '0.75rem',
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
                      Band Width (mm)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="3"
                      max="16"
                      value={bandWidth}
                      onChange={(e) => setBandWidth(e.target.value)}
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

                {parseFloat(bandWidth) >= 8 && (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#92400e',
                      backgroundColor: '#fef3c7',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '4px',
                      marginBottom: '1rem',
                    }}
                  >
                    ⚡ Wide Shank Rule: Bands ≥ 8mm automatically receive +0.5 size compensation
                    during lost-wax casting.
                  </div>
                )}

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

                {/* Jewellery Box Action Footer */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '2rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  {profile.jewelleryPreferences ? (
                    <button
                      type="button"
                      onClick={handleClearJewelleryProfile}
                      disabled={isPending}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'transparent',
                        color: '#b91c1c',
                        border: '1px solid #fecaca',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: isPending ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Clear Jewellery Profile ✕
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    type="button"
                    onClick={handleSaveJewelleryVault}
                    disabled={isPending}
                    style={{
                      padding: '0.65rem 1.35rem',
                      background: '#92400e',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: isPending ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isPending ? 'Saving...' : 'Save Jewellery Vault 💍'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Unified Save Button for Dual-Craft mode */}
          {craftFocus === 'DUAL_CRAFT' && (
            <div
              style={{
                marginTop: '2.5rem',
                padding: '1.5rem',
                backgroundColor: '#faf8f4',
                border: '1px solid #ebe7df',
                borderRadius: '8px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div>
                <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1rem' }}>
                  Complete Atelier Patron Profile
                </h4>
                <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                  Save both denim tailoring and jewellery specifications in a single verified atomic
                  transaction.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveBothVaults}
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
                {isPending ? 'Saving Dual Vault...' : 'Save Both Atelier Vaults ✨'}
              </button>
            </div>
          )}

          {/* Single Focus Assistance Banners */}
          {craftFocus === 'GARMENT' && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem 1.25rem',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '0.85rem',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <span>
                💡 Looking to customize precious jewellery too? Switch to{' '}
                <strong>Jewellery Only</strong> or <strong>Dual-Craft</strong> anytime.
              </span>
              <button
                type="button"
                onClick={() => setCraftFocus('DUAL_CRAFT')}
                style={{
                  padding: '0.35rem 0.75rem',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Enable Dual-Craft ↗
              </button>
            </div>
          )}

          {craftFocus === 'JEWELLERY' && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem 1.25rem',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '0.85rem',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <span>
                💡 Looking to order bespoke jeans too? Switch to <strong>Garment Only</strong> or{' '}
                <strong>Dual-Craft</strong> anytime.
              </span>
              <button
                type="button"
                onClick={() => setCraftFocus('DUAL_CRAFT')}
                style={{
                  padding: '0.35rem 0.75rem',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Enable Dual-Craft ↗
              </button>
            </div>
          )}
        </div>
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
