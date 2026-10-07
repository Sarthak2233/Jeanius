'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AtelierMarkdown } from '../../components/atelier-markdown';

export type GenderMode = 'MEN' | 'WOMEN' | 'UNISEX';
export type MethodMode = 'GARMENT_FLAT' | 'BODY_ANATOMICAL';
export type UnitMode = 'INCHES' | 'CM';

interface PointGuide {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly garmentFlatDesc: string;
  readonly bodyAnatDesc: string;
  readonly menNuance: string;
  readonly womenNuance: string;
  readonly commonMistake: string;
  readonly standardRangeInches: string;
}

const POINTS_A_TO_Q: readonly PointGuide[] = [
  {
    id: 'pointA',
    code: 'Point A',
    name: 'Waist (Top Edge)',
    garmentFlatDesc:
      'Button jeans completely and lay flat on a hard surface. Pull front and back waistband aligned so there is no dip. Measure straight across the inside edge of the top waistband from left to right, then double.',
    bodyAnatDesc:
      'Wrap tape horizontally around where you wear your pants. Keep one finger between tape and body. Do not suck in your stomach.',
    menNuance:
      'Men typically wear raw selvedge at the upper pelvis or iliac crest (mid-rise ~10"-11"). Measure 1" below the belly button.',
    womenNuance:
      'For high-rise jeans, measure around the narrowest point of your torso (natural waist, between ribs and hip bone). For mid-rise, measure 2" below the navel.',
    commonMistake:
      'Letting the front waistband dip below the rear waistband when laying flat. If front dips, your measurement will be 0.5" to 1" too small.',
    standardRangeInches: '26" – 44"',
  },
  {
    id: 'pointB',
    code: 'Point B',
    name: 'Hips / Seat (Fullest Part)',
    garmentFlatDesc:
      'Measure edge-to-edge across the jeans at the base of the fly zipper, approximately 3"–4" below the waistband, then double.',
    bodyAnatDesc:
      'Stand with heels together. Wrap the tape horizontally around the fullest part of your buttocks and hips.',
    menNuance:
      'Men have flatter pelvic contours; hip measurement typically adds 6"–8" over flat waist circumference.',
    womenNuance:
      'Women have wider pelvic breadth and lordosis curve; hip measurement typically adds 9"–13" over natural waist. Essential to prevent rear gaping.',
    commonMistake:
      'Measuring too high near the waistband instead of the fullest apex of the hips/seat.',
    standardRangeInches: '34" – 52"',
  },
  {
    id: 'pointC',
    code: 'Point C',
    name: 'Thigh Width',
    garmentFlatDesc:
      'Lay leg flat and smooth out wrinkles. Measure straight across the leg perpendicular to the seam, exactly 1 inch below the crotch intersection point.',
    bodyAnatDesc:
      'Measure the circumference around the widest part of your upper thigh, 1 inch below the crotch fold.',
    menNuance:
      'Raw denim has zero elastane. Add at least +1.0" to +1.25" ease over your body thigh circumference to sit comfortably.',
    womenNuance:
      'Curved female thigh-to-hip transitions require +1.0" ease for rigid 100% cotton selvedge to prevent seam stress when seated.',
    commonMistake: 'Measuring diagonally instead of strictly perpendicular to the outer leg seam.',
    standardRangeInches: '19" – 30"',
  },
  {
    id: 'pointD',
    code: 'Point D',
    name: 'Knee Width',
    garmentFlatDesc:
      'Measure exactly 13 inches down the inseam from the crotch point. Measure straight across the leg from edge to edge.',
    bodyAnatDesc:
      'Stand with leg slightly bent. Measure circumference around the middle of your kneecap.',
    menNuance:
      'Determines taper profile. Slim taper tapers sharply from thigh to knee; straight cut maintains parallel width.',
    womenNuance: 'Ensures knee articulation without restriction when bending or climbing stairs.',
    commonMistake:
      'Measuring at arbitrary knee positions rather than the standardized 13" distance below crotch.',
    standardRangeInches: '14" – 22"',
  },
  {
    id: 'pointE',
    code: 'Point E',
    name: 'Leg Opening / Hem',
    garmentFlatDesc:
      'Measure straight across the bottom cuff from outer selvedge seam to inner chainstitch seam.',
    bodyAnatDesc: 'Measure circumference around the ankle or over your preferred boot shaft.',
    menNuance:
      'For pairing with heritage engineer boots or Red Wings, 8.0"–8.75" flat opening fits over boot uppers. Sneaker tapers are 6.75"–7.5".',
    womenNuance: 'Wide leg cuts feature 10"+ openings; straight cigarette cuts feature 7.0"–7.5".',
    commonMistake:
      'Forgetting that chainstitch hemming on a tapered jean changes leg opening width as inseam is shortened.',
    standardRangeInches: '13" – 24"',
  },
  {
    id: 'pointF',
    code: 'Point F',
    name: 'Front Rise',
    garmentFlatDesc:
      'Start at the central cross-seam where four crotch panels meet. Pull tape taut straight up along the front fly to the top of the waistband.',
    bodyAnatDesc:
      'Measure from center crotch line up to where you desire your waistband to sit in front.',
    menNuance: 'Standard mid-rise is 10.5"–11.5". High-rise vintage 1947 cut is 12.0"–13.0".',
    womenNuance:
      'High-rise is 11.5"–13.5", positioning waistband comfortably over the belly button.',
    commonMistake:
      'Measuring with the crotch bunched or folded. Smooth out the crotch seams flat before placing the tape.',
    standardRangeInches: '9" – 14"',
  },
  {
    id: 'pointG',
    code: 'Point G',
    name: 'Back Rise',
    garmentFlatDesc:
      'Turn jeans over. Start at the crotch cross-seam and measure straight up the curved rear yoke seam to the top edge of the back waistband.',
    bodyAnatDesc:
      'Measure from center crotch line up over the buttocks to where waistband sits at the small of your back.',
    menNuance:
      'Men require a 2.5" to 3.5" rise differential ($BackRise - FrontRise$) to prevent waistband pulling down when bending.',
    womenNuance:
      'Women require a 3.5" to 5.0" rise differential due to greater seat projection and pelvic tilt.',
    commonMistake:
      'Pulling the back curve into a straight diagonal line. Follow the natural arc of the central seat seam.',
    standardRangeInches: '13" – 18"',
  },
  {
    id: 'pointH',
    code: 'Point H',
    name: 'Inseam Length',
    garmentFlatDesc:
      'Lay leg flat with inseam facing up. Measure from the crotch cross-seam down the inner seam all the way to the bottom hem.',
    bodyAnatDesc:
      'Stand straight barefoot with feet 6" apart. Measure from inner crotch fold down to the ankle bone or floor.',
    menNuance: 'Add +2" for cuffing (selvedge double roll) or stacking over boots.',
    womenNuance: 'Account for heel height if wearing heeled boots or mules (+1.5" to +2.5").',
    commonMistake: 'Measuring down the side outseam instead of the inner crotch seam.',
    standardRangeInches: '28" – 38"',
  },
  {
    id: 'pointI',
    code: 'Point I',
    name: 'Outseam Length',
    garmentFlatDesc:
      'Measure from the top outer edge of the waistband straight down the selvedge side-seam to the bottom hem.',
    bodyAnatDesc: 'Measure from the top of your hip bone down the side of your leg to the floor.',
    menNuance: 'Controls total vertical drape from waist anchor to shoe.',
    womenNuance:
      'High-rise outseam is longer because the waistband originates at the higher natural waist.',
    commonMistake: 'Bending the knee while taking body outseam measurement.',
    standardRangeInches: '38" – 48"',
  },
  {
    id: 'pointJ',
    code: 'Point J',
    name: 'Waistband Height',
    garmentFlatDesc:
      'Measure the vertical thickness of the waistband band itself (typically 1.5" to 1.75").',
    bodyAnatDesc: 'Desired width of the leather belt to be worn with the garment.',
    menNuance: 'Standard 1.5" allows 1.25" to 1.5" bridle leather belts.',
    womenNuance: 'Contoured 1.5"–2.0" waistband anchors comfortably at narrow waist.',
    commonMistake: 'Confusing waistband height with rise.',
    standardRangeInches: '1.25" – 2.0"',
  },
  {
    id: 'pointK',
    code: 'Point K',
    name: 'Fly Zipper / Button Length',
    garmentFlatDesc:
      'Measure from bottom of waistband seam to the bottom metal stop or bartack of the fly.',
    bodyAnatDesc: 'Vertical length of the front fly opening.',
    menNuance: 'Button flies on vintage selvedge typically feature 4 to 5 donut buttons.',
    womenNuance: 'Shorter fly on lower rise; longer 6"–7" fly on high-rise trousers.',
    commonMistake: 'Including the waistband in the fly length.',
    standardRangeInches: '4.5" – 8.0"',
  },
  {
    id: 'pointL',
    code: 'Point L',
    name: 'Natural Waist (High-Rise Anchor)',
    garmentFlatDesc:
      'On high-rise trousers, the measurement across the upper torso band where the narrowest waist sits.',
    bodyAnatDesc:
      'Bend sideways to find your natural crease. Measure around that exact horizontal plane.',
    menNuance: 'Only applicable for vintage high-waisted workwear or gurkha trousers.',
    womenNuance: 'Crucial for women. Prevents the "waistband gap" at the back when sitting.',
    commonMistake: 'Measuring too low near the hips instead of the narrowest ribcage point.',
    standardRangeInches: '24" – 40"',
  },
  {
    id: 'pointM',
    code: 'Point M',
    name: 'High Hip (Pelvic Rim)',
    garmentFlatDesc: 'Measurement across the jeans approximately 3 inches below the waistband.',
    bodyAnatDesc:
      'Circumference taken around the top of the hip bones (iliac crest), 3" below natural waist.',
    menNuance: 'This is where most modern men actually anchor their jeans.',
    womenNuance: 'Governs the taper from narrow waist to wide hips. Eliminates ballooning.',
    commonMistake: 'Confusing high hip with fullest seat hip (Point B).',
    standardRangeInches: '30" – 46"',
  },
  {
    id: 'pointN',
    code: 'Point N',
    name: 'Total Crotch Length',
    garmentFlatDesc: 'Sum of Front Rise (Point F) + Back Rise (Point G).',
    bodyAnatDesc:
      'Run tape from front waistband line, down between legs, up to rear waistband line.',
    menNuance: 'Ensures no pinching when riding bicycles or sitting for extended periods.',
    womenNuance: 'Accommodates pelvic depth. Crucial for comfort in rigid 14oz selvedge.',
    commonMistake: 'Pulling the tape too tight through the crotch.',
    standardRangeInches: '22" – 34"',
  },
  {
    id: 'pointO',
    code: 'Point O',
    name: 'Calf Circumference',
    garmentFlatDesc:
      'Measured across the leg 7 inches below the knee line (Point D), then doubled.',
    bodyAnatDesc: 'Circumference around the thickest muscular point of the calf.',
    menNuance: 'Athletes with developed calves require at least +1.5" ease on slim-taper cuts.',
    womenNuance: 'Prevents jeans from getting stuck on calves when sitting or standing.',
    commonMistake: 'Assuming calf is smaller than knee on slim cuts.',
    standardRangeInches: '13" – 19"',
  },
  {
    id: 'pointP',
    code: 'Point P',
    name: 'Ankle Circumference',
    garmentFlatDesc: 'Inner measurement of the hem circumference.',
    bodyAnatDesc: 'Circumference measured immediately above the ankle bone.',
    menNuance: 'Must be large enough for foot heel to pass through when putting on (min 11" circ).',
    womenNuance: 'Slim cigarette cuts require minimum 10" opening for foot passage.',
    commonMistake: 'Designing hem opening smaller than diagonal foot circumference.',
    standardRangeInches: '8" – 12"',
  },
  {
    id: 'pointQ',
    code: 'Point Q',
    name: 'Seat & Posture Profile',
    garmentFlatDesc: 'Atelier pattern adjustment for seat posture curvature.',
    bodyAnatDesc:
      'Visual posture assessment: Flat Seat, Average Seat, Rounded / Prominent Seat, or Stout.',
    menNuance: 'Athletic lifters with prominent glutes require extra rear fork curve.',
    womenNuance:
      'Women with pronounced lordosis require extra back rise slope and scooped crotch curve.',
    commonMistake:
      'Ignoring posture profile, leading to diagonal stress whiskering across the seat.',
    standardRangeInches: 'Profile Matrix',
  },
];

const RING_MANDREL_TABLE = [
  { us: '5.0', uk: 'J 1/2', eu: '49', diamMm: 15.7, circMm: 49.3 },
  { us: '5.5', uk: 'L', eu: '50.5', diamMm: 16.1, circMm: 50.6 },
  { us: '6.0', uk: 'M', eu: '52', diamMm: 16.5, circMm: 51.9 },
  { us: '6.5', uk: 'N', eu: '53', diamMm: 16.9, circMm: 53.1 },
  { us: '7.0', uk: 'O', eu: '54.5', diamMm: 17.3, circMm: 54.4 },
  { us: '7.5', uk: 'P', eu: '56', diamMm: 17.7, circMm: 55.7 },
  { us: '8.0', uk: 'Q', eu: '57', diamMm: 18.1, circMm: 57.0 },
  { us: '8.5', uk: 'R', eu: '58.5', diamMm: 18.5, circMm: 58.3 },
  { us: '9.0', uk: 'S', eu: '60', diamMm: 18.9, circMm: 59.5 },
  { us: '9.5', uk: 'T', eu: '61', diamMm: 19.4, circMm: 60.8 },
  { us: '10.0', uk: 'U', eu: '62.5', diamMm: 19.8, circMm: 62.1 },
  { us: '10.5', uk: 'V', eu: '63.5', diamMm: 20.2, circMm: 63.4 },
  { us: '11.0', uk: 'W', eu: '65', diamMm: 20.6, circMm: 64.6 },
  { us: '11.5', uk: 'X', eu: '66', diamMm: 21.0, circMm: 65.9 },
  { us: '12.0', uk: 'Y', eu: '67.5', diamMm: 21.4, circMm: 67.2 },
  { us: '12.5', uk: 'Z', eu: '68.5', diamMm: 21.8, circMm: 68.5 },
  { us: '13.0', uk: 'Z+1', eu: '70', diamMm: 22.2, circMm: 69.7 },
];

export interface SizingStudioClientProps {
  readonly cmsMarkdown?: string;
}

export function SizingStudioClient({ cmsMarkdown }: SizingStudioClientProps) {
  // Studio Interactive States
  const [gender, setGender] = useState<GenderMode>('MEN');
  const [method, setMethod] = useState<MethodMode>('GARMENT_FLAT');
  const [unit, setUnit] = useState<UnitMode>('INCHES');
  const [activePointId, setActivePointId] = useState<string>('pointA');

  // Calculator State
  const [targetWaist, setTargetWaist] = useState<number>(32);
  const [targetInseam, setTargetInseam] = useState<number>(34);
  const [targetThigh, setTargetThigh] = useState<number>(23);
  const [isRawLoomstate, setIsRawLoomstate] = useState<boolean>(true);

  // Jewellery Sizing State
  const [selectedRingSizeUs, setSelectedRingSizeUs] = useState<string>('10.0');
  const [ringBandWidthMm, setRingBandWidthMm] = useState<number>(9);
  const [wristCircInches, setWristCircInches] = useState<number>(7.25);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  // Calculations
  const calculatedCutInseam = useMemo(() => {
    if (!isRawLoomstate) return targetInseam;
    // +3% warp shrinkage allowance for unsanforized Japanese selvedge
    const rawCut = targetInseam * 1.03;
    return Math.round(rawCut * 10) / 10;
  }, [targetInseam, isRawLoomstate]);

  const recommendedRingSize = useMemo(() => {
    const base = parseFloat(selectedRingSizeUs);
    if (ringBandWidthMm >= 8) {
      // Wide cigar band / signet ring compensation: +0.5 size
      return (base + 0.5).toFixed(1);
    }
    return base.toFixed(1);
  }, [selectedRingSizeUs, ringBandWidthMm]);

  const activePoint = useMemo(
    () => POINTS_A_TO_Q.find((p) => p.id === activePointId) ?? POINTS_A_TO_Q[0]!,
    [activePointId],
  );

  const handleCopySpec = () => {
    const spec = `JEANIUS ATELIER TAILORING SPEC:
Gender Profile: ${gender}
Measurement Method: ${method}
Target Waist: ${targetWaist}"
Target Post-Soak Inseam: ${targetInseam}"
Loomstate Cut Inseam (+3% buffer): ${calculatedCutInseam}"
Target Thigh: ${targetThigh}"
Ring Size: US ${selectedRingSizeUs} (Compensated for ${ringBandWidthMm}mm band: US ${recommendedRingSize})
Wrist Circumference: ${wristCircInches}"`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(spec);
      setCopiedToast('Tailoring specifications copied to clipboard');
      setTimeout(() => setCopiedToast(null), 3000);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg-canvas, #fdfbf7)', minHeight: '100vh' }}>
      <article
        style={{
          maxWidth: '1080px',
          margin: '0 auto',
          padding: '4.5rem 2rem',
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono, monospace)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#94a3b8',
            fontWeight: 600,
            marginBottom: '0.75rem',
          }}
        >
          STUDIO MEASUREMENT METHODOLOGY &amp; ANATOMICAL ENGINE
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
            fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: '#0f172a',
            margin: '0 0 1.5rem 0',
            textTransform: 'uppercase',
          }}
        >
          Precision Sizing &amp; Shrinkage Studio
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            lineHeight: 1.75,
            color: '#334155',
            margin: '0 0 3rem 0',
            borderLeft: '2px solid #b91c1c',
            paddingLeft: '1.25rem',
            maxWidth: '840px',
          }}
        >
          Because our denim is unsanforized 14oz–15.5oz raw Japanese selvedge and our jewellery is
          cast in solid 925 sterling silver, precise anatomical measurements ensure an immaculate
          fit for life. Explore the Modern Tailor Points A–Q system and live calculation tools
          below.
        </p>

        {/* Dynamic CMS Chapter Intro */}
        {cmsMarkdown && (
          <div style={{ marginBottom: '3.5rem' }}>
            <AtelierMarkdown content={cmsMarkdown} />
          </div>
        )}

        {/* ============================================================== */}
        {/* INTERACTIVE STUDIO CONTROLS                                    */}
        {/* ============================================================== */}
        <section
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.03)',
            marginBottom: '3.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1.5rem',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '1.5rem',
              marginBottom: '2rem',
            }}
          >
            {/* Gender Toggle */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#64748b',
                  fontWeight: 600,
                  marginBottom: '0.4rem',
                }}
              >
                Anatomical Gender Model
              </label>
              <div
                style={{
                  display: 'inline-flex',
                  backgroundColor: '#f8fafc',
                  padding: '3px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                }}
              >
                {(['MEN', 'WOMEN', 'UNISEX'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    style={{
                      padding: '0.45rem 1rem',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      backgroundColor: gender === g ? '#0f172a' : 'transparent',
                      color: gender === g ? '#ffffff' : '#475569',
                    }}
                  >
                    {g === 'MEN' ? 'Men’s Cut' : g === 'WOMEN' ? 'Women’s Cut' : 'Unisex / Vintage'}
                  </button>
                ))}
              </div>
            </div>

            {/* Method Toggle */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#64748b',
                  fontWeight: 600,
                  marginBottom: '0.4rem',
                }}
              >
                Measuring Method
              </label>
              <div
                style={{
                  display: 'inline-flex',
                  backgroundColor: '#f8fafc',
                  padding: '3px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <button
                  type="button"
                  onClick={() => setMethod('GARMENT_FLAT')}
                  style={{
                    padding: '0.45rem 1rem',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    backgroundColor: method === 'GARMENT_FLAT' ? '#0f172a' : 'transparent',
                    color: method === 'GARMENT_FLAT' ? '#ffffff' : '#475569',
                  }}
                >
                  Laid-Flat Garment (Points A–Q)
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('BODY_ANATOMICAL')}
                  style={{
                    padding: '0.45rem 1rem',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    backgroundColor: method === 'BODY_ANATOMICAL' ? '#0f172a' : 'transparent',
                    color: method === 'BODY_ANATOMICAL' ? '#ffffff' : '#475569',
                  }}
                >
                  Body Anatomical Tape
                </button>
              </div>
            </div>

            {/* Units Toggle */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#64748b',
                  fontWeight: 600,
                  marginBottom: '0.4rem',
                }}
              >
                Measurement Unit
              </label>
              <div
                style={{
                  display: 'inline-flex',
                  backgroundColor: '#f8fafc',
                  padding: '3px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                }}
              >
                {(['INCHES', 'CM'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      backgroundColor: unit === u ? '#b91c1c' : 'transparent',
                      color: unit === u ? '#ffffff' : '#475569',
                    }}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Gender Anatomical Guidance Alert */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: gender === 'WOMEN' ? '#fff7ed' : '#f0fdf4',
              border: `1px solid ${gender === 'WOMEN' ? '#fed7aa' : '#bbf7d0'}`,
              borderRadius: '6px',
              marginBottom: '2rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>{gender === 'WOMEN' ? '📐' : '🧵'}</span>
            <div style={{ fontSize: '0.88rem', lineHeight: 1.6, color: '#334155' }}>
              <strong style={{ color: '#0f172a' }}>
                {gender === 'WOMEN'
                  ? 'Women’s Tailoring Nuance (Anatomical Waist vs. Lordosis Curve):'
                  : 'Men’s Tailoring Nuance (Pelvic Anchor & Thigh Ease):'}
              </strong>{' '}
              {gender === 'WOMEN' ? (
                <>
                  Women’s trousers anchor at the <strong>natural waist</strong> (narrowest torso
                  plane) for high-rise styles or high-hip for mid-rise. Female pelvic anatomy
                  requires a deeper back-to-front rise slope (differential of{' '}
                  <strong>+3.5" to +5.0"</strong>) to accommodate seat curvature without back-waist
                  gap.
                </>
              ) : (
                <>
                  Men typically anchor trousers on the <strong>iliac crest</strong> (upper pelvis).
                  A rise differential of <strong>+2.5" to +3.5"</strong> provides clean sitting
                  drape. Always maintain at least <strong>+1.0" ease</strong> over thigh
                  circumference on raw selvedge to prevent binding.
                </>
              )}
            </div>
          </div>

          {/* Points A through Q Grid & Viewer */}
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono, monospace)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#b91c1c',
                fontWeight: 700,
                marginBottom: '0.75rem',
              }}
            >
              MODERN TAILOR SYSTEM · POINTS A THROUGH Q
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', margin: '0 0 1rem 0' }}>
              Step-by-Step Lower Body Measuring Guide
            </h3>

            {/* Quick Point Selector Tabs */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.4rem',
                marginBottom: '1.5rem',
              }}
            >
              {POINTS_A_TO_Q.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePointId(p.id)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    border: '1px solid',
                    borderColor: activePointId === p.id ? '#0f172a' : '#cbd5e1',
                    borderRadius: '4px',
                    backgroundColor: activePointId === p.id ? '#0f172a' : '#ffffff',
                    color: activePointId === p.id ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                    fontWeight: activePointId === p.id ? 700 : 500,
                    transition: 'all 150ms ease',
                  }}
                >
                  {p.code}: {p.name.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Active Point Detail Card */}
            <div
              style={{
                backgroundColor: '#faf8f4',
                border: '1px solid #ebe7df',
                borderRadius: '8px',
                padding: '1.75rem',
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
                <div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      color: '#b91c1c',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {activePoint.code}
                  </span>
                  <h4 style={{ fontSize: '1.35rem', color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                    {activePoint.name}
                  </h4>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.8rem',
                    backgroundColor: '#ffffff',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '4px',
                    border: '1px solid #e2e8f0',
                    color: '#64748b',
                  }}
                >
                  Typical: {activePoint.standardRangeInches}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1.5rem',
                  marginTop: '1.25rem',
                }}
              >
                {/* Method Instructions */}
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      marginBottom: '0.35rem',
                    }}
                  >
                    {method === 'GARMENT_FLAT'
                      ? '📏 Laid-Flat Measuring Method'
                      : '📐 Body Tape Method'}
                  </div>
                  <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                    {method === 'GARMENT_FLAT'
                      ? activePoint.garmentFlatDesc
                      : activePoint.bodyAnatDesc}
                  </p>
                </div>

                {/* Gender Nuance */}
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      marginBottom: '0.35rem',
                    }}
                  >
                    {gender === 'WOMEN' ? '♀ Women’s Specific Nuance' : '♂ Men’s Specific Nuance'}
                  </div>
                  <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                    {gender === 'WOMEN' ? activePoint.womenNuance : activePoint.menNuance}
                  </p>
                </div>

                {/* Common Pitfall */}
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      color: '#b91c1c',
                      marginBottom: '0.35rem',
                    }}
                  >
                    ⚠️ Common Mistake to Avoid
                  </div>
                  <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                    {activePoint.commonMistake}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* INTERACTIVE SHRINKAGE & MASTER CUT CALCULATOR                  */}
        {/* ============================================================== */}
        <section
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.03)',
            marginBottom: '3.5rem',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono, monospace)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#d97706',
              fontWeight: 700,
              marginBottom: '0.5rem',
            }}
          >
            WARP SHRINKAGE &amp; LOOMSTATE CUT CALCULATOR
          </div>
          <h2 style={{ fontSize: '1.5rem', color: '#0f172a', margin: '0 0 1rem 0' }}>
            Live Kurabo Selvedge Inseam Buffer Engine
          </h2>
          <p
            style={{
              color: '#475569',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              margin: '0 0 1.75rem 0',
            }}
          >
            Raw loomstate selvedge contracts approximately 3% in warp length during its initial
            soak. Enter your desired post-soak finished inseam to see the exact master cut length
            our cutters will apply.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
              backgroundColor: '#faf8f4',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #ebe7df',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '0.4rem',
                }}
              >
                Desired Waist ({unit === 'INCHES' ? 'Inches' : 'CM'})
              </label>
              <input
                type="number"
                min={24}
                max={48}
                step={0.5}
                value={targetWaist}
                onChange={(e) => setTargetWaist(parseFloat(e.target.value) || 32)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '0.4rem',
                }}
              >
                Desired Inseam ({unit === 'INCHES' ? 'Inches' : 'CM'})
              </label>
              <input
                type="number"
                min={26}
                max={40}
                step={0.5}
                value={targetInseam}
                onChange={(e) => setTargetInseam(parseFloat(e.target.value) || 34)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '0.4rem',
                }}
              >
                Target Thigh ({unit === 'INCHES' ? 'Inches' : 'CM'})
              </label>
              <input
                type="number"
                min={18}
                max={34}
                step={0.5}
                value={targetThigh}
                onChange={(e) => setTargetThigh(parseFloat(e.target.value) || 23)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '0.4rem',
                }}
              >
                Denim Fabric State
              </label>
              <select
                value={isRawLoomstate ? 'RAW' : 'SANFORIZED'}
                onChange={(e) => setIsRawLoomstate(e.target.value === 'RAW')}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="RAW">14oz Kurabo Raw Selvedge (+3% Shrinkage)</option>
                <option value="SANFORIZED">15.5oz Kuroki Sanforized (Preshrunk &lt; 1%)</option>
              </select>
            </div>
          </div>

          {/* Calculator Output Telemetry */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '1.5rem',
              borderRadius: '8px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                }}
              >
                Loomstate Cut Inseam
              </div>
              <div
                style={{
                  fontSize: '1.6rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 700,
                  color: '#38bdf8',
                }}
              >
                {calculatedCutInseam}"
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                {isRawLoomstate ? '+3.0% shrinkage buffer added' : 'True to target (preshrunk)'}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                }}
              >
                Post-Soak Target Inseam
              </div>
              <div
                style={{
                  fontSize: '1.6rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 700,
                  color: '#f8fafc',
                }}
              >
                {targetInseam}"
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Final settled length after 1st wash
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                }}
              >
                Thigh Ease Allowance
              </div>
              <div
                style={{
                  fontSize: '1.6rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 700,
                  color: '#4ade80',
                }}
              >
                +1.0"
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Safe ease for zero-elastane selvedge
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SOLID 925 JEWELLERY SIZING MANDREL & SHANK COMPENSATOR         */}
        {/* ============================================================== */}
        <section
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.03)',
            marginBottom: '3.5rem',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono, monospace)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#1e40af',
              fontWeight: 700,
              marginBottom: '0.5rem',
            }}
          >
            SOLID 925 STERLING SILVER · MANDREL &amp; SHANK METRICS
          </div>
          <h2 style={{ fontSize: '1.5rem', color: '#0f172a', margin: '0 0 1rem 0' }}>
            Ring Mandrel &amp; Wide Shank Compensator
          </h2>
          <p
            style={{
              color: '#475569',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              margin: '0 0 1.75rem 0',
            }}
          >
            Rings with wide shanks (like our 9mm Lot J01 Signet Ring) cover more skin surface and
            fit substantially tighter than standard thin wedding bands. Our silversmiths
            automatically compensate for band width.
          </p>

          {/* Interactive Shank Width Compensator */}
          <div
            style={{
              backgroundColor: '#faf8f4',
              border: '1px solid #ebe7df',
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
              alignItems: 'center',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '0.4rem',
                }}
              >
                Standard Mandrel Size (US)
              </label>
              <select
                value={selectedRingSizeUs}
                onChange={(e) => setSelectedRingSizeUs(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '0.95rem',
                  backgroundColor: '#ffffff',
                }}
              >
                {RING_MANDREL_TABLE.map((r) => (
                  <option key={r.us} value={r.us}>
                    US {r.us} (UK {r.uk} · EU {r.eu} · {r.diamMm}mm diam)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '0.4rem',
                }}
              >
                Ring Band Width: {ringBandWidthMm}mm
              </label>
              <input
                type="range"
                min={3}
                max={14}
                step={1}
                value={ringBandWidthMm}
                onChange={(e) => setRingBandWidthMm(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: '#0f172a' }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.72rem',
                  color: '#64748b',
                }}
              >
                <span>Thin (3mm)</span>
                <span>Lot J01 (9mm)</span>
                <span>Wide Cigar (14mm)</span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '1rem',
                borderRadius: '6px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  color: '#64748b',
                  textTransform: 'uppercase',
                }}
              >
                Recommended Atelier Casting Size
              </div>
              <div
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  color: ringBandWidthMm >= 8 ? '#b91c1c' : '#0f172a',
                }}
              >
                US {recommendedRingSize}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                {ringBandWidthMm >= 8
                  ? 'Includes +0.5 US wide shank compensation'
                  : 'Standard true-to-mandrel size'}
              </div>
            </div>
          </div>

          {/* International Ring Mandrel Table */}
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.85rem',
              }}
            >
              <thead style={{ backgroundColor: '#faf8f4', borderBottom: '1px solid #ebe7df' }}>
                <tr>
                  <th
                    style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono, monospace)' }}
                  >
                    US Size
                  </th>
                  <th
                    style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono, monospace)' }}
                  >
                    UK / AU
                  </th>
                  <th
                    style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono, monospace)' }}
                  >
                    EU Standard
                  </th>
                  <th
                    style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono, monospace)' }}
                  >
                    Inside Diam (mm)
                  </th>
                  <th
                    style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono, monospace)' }}
                  >
                    Circumference (mm)
                  </th>
                </tr>
              </thead>
              <tbody>
                {RING_MANDREL_TABLE.map((row, idx) => (
                  <tr
                    key={row.us}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor:
                        row.us === selectedRingSizeUs
                          ? '#fef2f2'
                          : idx % 2 === 0
                            ? '#ffffff'
                            : '#fafafa',
                      fontWeight: row.us === selectedRingSizeUs ? 600 : 400,
                    }}
                  >
                    <td style={{ padding: '0.6rem 1rem', color: '#0f172a' }}>US {row.us}</td>
                    <td style={{ padding: '0.6rem 1rem', color: '#475569' }}>{row.uk}</td>
                    <td style={{ padding: '0.6rem 1rem', color: '#475569' }}>{row.eu}</td>
                    <td
                      style={{
                        padding: '0.6rem 1rem',
                        fontFamily: 'var(--font-mono, monospace)',
                        color: '#475569',
                      }}
                    >
                      {row.diamMm} mm
                    </td>
                    <td
                      style={{
                        padding: '0.6rem 1rem',
                        fontFamily: 'var(--font-mono, monospace)',
                        color: '#475569',
                      }}
                    >
                      {row.circMm} mm
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Wrist Circumference & Bracelet Fit Calculator */}
          <div
            style={{
              marginTop: '2rem',
              backgroundColor: '#faf8f4',
              border: '1px solid #ebe7df',
              borderRadius: '8px',
              padding: '1.5rem',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              Wrist &amp; Bracelet Sizing Calibration
            </h3>
            <p style={{ color: '#475569', fontSize: '0.88rem', margin: '0 0 1rem 0' }}>
              Measure around your wrist bone with a flexible tailor's tape. For comfort-fit silver
              cuffs, add +0.5" ease; for curb chain bracelets, add +0.75" ease.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    textTransform: 'uppercase',
                    color: '#64748b',
                    marginBottom: '0.35rem',
                  }}
                >
                  Wrist Circumference (Inches)
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="5"
                  max="10"
                  value={wristCircInches}
                  onChange={(e) => setWristCircInches(parseFloat(e.target.value) || 7.25)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    textTransform: 'uppercase',
                    color: '#64748b',
                  }}
                >
                  Recommended Bracelet Size
                </div>
                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    marginTop: '0.2rem',
                  }}
                >
                  {(wristCircInches + 0.5).toFixed(2)}" (Comfort Cuff) ·{' '}
                  {(wristCircInches + 0.75).toFixed(2)}" (Chain)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* ACTIONS & ATELIER VAULT CTA                                    */}
        {/* ============================================================== */}
        <div
          style={{
            padding: '2.5rem',
            backgroundColor: '#faf8f4',
            border: '1px solid #ebe7df',
            borderRadius: '10px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1.5rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.35rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              Save Your Tailoring Specs to Atelier Vault
            </h3>
            <p
              style={{
                color: '#64748b',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                margin: 0,
                maxWidth: '600px',
              }}
            >
              Your measurements are encrypted and automatically auto-filled during checkout. Never
              measure twice.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleCopySpec}
              style={{
                padding: '0.75rem 1.25rem',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#0f172a',
                cursor: 'pointer',
              }}
            >
              Copy Tailoring Specs 📋
            </button>
            <Link
              href="/account"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                padding: '0.75rem 1.5rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Open Atelier Vault →
            </Link>
          </div>
        </div>

        {/* Copied Toast Banner */}
        {copiedToast && (
          <div
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '0.75rem 1.25rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
              zIndex: 100,
            }}
          >
            ✓ {copiedToast}
          </div>
        )}
      </article>
    </div>
  );
}
