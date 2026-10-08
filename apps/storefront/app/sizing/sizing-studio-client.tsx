'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { CraftFocusDto } from '@jeanius/contracts';
import { AtelierMarkdown } from '../../components/atelier-markdown';
import { updateProfileAction } from '../../actions/auth.actions';

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

interface UpperBodyPointGuide {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly garmentFlatDesc: string;
  readonly bodyAnatDesc: string;
  readonly suitNuance: string;
  readonly womenNuance: string;
  readonly commonMistake: string;
  readonly standardRangeInches: string;
}

const UPPER_BODY_POINTS: readonly UpperBodyPointGuide[] = [
  {
    id: 'upper1',
    code: 'Point 1',
    name: 'Collar / Neck',
    garmentFlatDesc:
      'Spread the collar flat on a table. Place measuring tape at the middle of the buttonhole and measure across to the center of the collar button.',
    bodyAnatDesc:
      'Place two fingers between the tape measure and the base of your neck where neck meets shoulders. Ensure tape moves easily without tightening.',
    suitNuance:
      'For dress shirts paired with tailored suits, index finger room prevents choking when collar is fully buttoned with a tie knot.',
    womenNuance:
      'Measure around the base of the neck, or measure your favorite blouse collar from buttonhole to button.',
    commonMistake:
      'Measuring too high up the neck/throat rather than at the base where the shirt collar actually sits.',
    standardRangeInches: '14" – 18.5"',
  },
  {
    id: 'upper2',
    code: 'Point 2',
    name: 'Chest / Bust Circumference',
    garmentFlatDesc:
      'Button the shirt completely and lay flat. Measure straight from the left side seam to the right side seam just below the armpit, then double.',
    bodyAnatDesc:
      'Stand up straight, relax, and take a natural deep breath with arms at side. Measure horizontally around chest under armpits across the nipple apex.',
    suitNuance:
      'Over jacket chest: measure around fullest part over shoulder blades with index finger ease; do not overinflate or puff chest out.',
    womenNuance:
      'Measure around fullest bust line across both nipples. In addition, measure Front Bust Width across chest from armpit to armpit.',
    commonMistake:
      'Holding breath or flexing muscles during measurement, resulting in a tight shirt that pulls at front buttons.',
    standardRangeInches: '36" – 54"',
  },
  {
    id: 'upper3',
    code: 'Point 3',
    name: 'Waist (Torso Waistline)',
    garmentFlatDesc:
      'With the shirt laid flat, measure edge-to-edge from left seam to right seam at the narrowest waistline taper, then double.',
    bodyAnatDesc:
      'Stand in relaxed posture. If you do not have a prominent belly, measure around narrowest waist point. If fuller midsection, measure at widest point.',
    suitNuance:
      'Suit jacket suppression: governed by waistline ease to ensure a tailored silhouette without fabric pulling when buttoned.',
    womenNuance:
      'Measure narrowest waist between bottom of ribs and pelvic crest. Allows precise princess seam darting.',
    commonMistake: 'Holding the stomach in or measuring over heavy outerwear or thick belts.',
    standardRangeInches: '32" – 52"',
  },
  {
    id: 'upper4',
    code: 'Point 4',
    name: 'Stomach / Abdomen',
    garmentFlatDesc:
      'Measure straight across the shirt body at the height corresponding to the belly button / abdomen apex, then double.',
    bodyAnatDesc:
      'Measure around the widest part of your abdomen (coinciding with the navel, or 3-4 cm below). Leave 1 finger space inside tape.',
    suitNuance:
      'Critical for jackets to prevent lower button straining and lapels kicking open when standing or moving.',
    womenNuance:
      'Widest abdomen point is typically 3-4 cm under belly button. Essential for tailored peplum cuts.',
    commonMistake:
      'Assuming waist and stomach are identical. The abdomen measurement is vital for athletic and stout postures.',
    standardRangeInches: '32" – 54"',
  },
  {
    id: 'upper5',
    code: 'Point 5',
    name: 'Hip / Shirt Base',
    garmentFlatDesc:
      'With the shirt laid flat, measure straight from left seam to right seam across the bottom edge/base of the shirt, then double.',
    bodyAnatDesc:
      'Empty all pockets. Measure around the hips and seat at the fullest point with tape parallel to floor.',
    suitNuance:
      'Prevents suit jacket skirts and double vents from flaring out or catching over trouser seat pockets.',
    womenNuance:
      'Accommodates female pelvic flare so shirt does not ride up or bunch around waistband when seated.',
    commonMistake: 'Measuring too high near the waist rather than the bottom hem flare.',
    standardRangeInches: '36" – 54"',
  },
  {
    id: 'upper6',
    code: 'Point 6',
    name: 'Shoulder Width & Seam',
    garmentFlatDesc:
      'Measure the distance between sleeve seam and collar seam along the top shoulder seam, or across the back from shoulder edge to edge.',
    bodyAnatDesc:
      'Stand relaxed. Measure across top of shoulders from one shoulder bone edge to the other over the natural curved neck contour.',
    suitNuance:
      'Measures to where shoulder pads end and sleeve head rolls vertically down the arm.',
    womenNuance:
      'Measure between shoulders close to lowest neck point, finishing 1 cm before the end of the shoulder bone.',
    commonMistake:
      'Measuring a straight horizontal line across front chest instead of following the curved contour over back and neck.',
    standardRangeInches: '16.5" – 22"',
  },
  {
    id: 'upper7',
    code: 'Point 7',
    name: 'Yoke (Across Upper Back)',
    garmentFlatDesc:
      'Turn shirt over. Measure distance across the back between sleeve seams from one shoulder edge to the other.',
    bodyAnatDesc:
      'Measure horizontally across the upper back between rear armhole creases, 3" below collar base.',
    suitNuance:
      'Governs back mobility so reaching forward does not yank the cuffs back up your forearm.',
    womenNuance:
      'Ensures rear blade drape is smooth and prevents horizontal stress creases across upper back.',
    commonMistake: 'Measuring too low across the mid-back rather than along the upper yoke line.',
    standardRangeInches: '16" – 22"',
  },
  {
    id: 'upper8',
    code: 'Point 8',
    name: 'Sleeve Length (Long & Short)',
    garmentFlatDesc:
      'Lay sleeve flat. Measure along outside edge (opposite to sleeve seam) from top shoulder seam all the way to the end of cuff.',
    bodyAnatDesc:
      'Arm hanging relaxed at side: measure from outer shoulder bone tip down along outside arm to wrist bone (or thumb root for suit).',
    suitNuance:
      'For pairing with suit jackets, dress shirt cuff should extend exactly 1 cm (0.5") past jacket sleeve end.',
    womenNuance:
      'Measure to thumb joint. For short sleeve shirts, measure from shoulder tip to outer mid-bicep.',
    commonMistake:
      'Bending the elbow during measurement (Modern Tailor requires arm resting straight down at side).',
    standardRangeInches: '24.5" – 28.5"',
  },
  {
    id: 'upper9',
    code: 'Point 9',
    name: 'Bicep / Upper Arm Width',
    garmentFlatDesc:
      'With shirt laid flat, measure sleeve width perpendicular to edge at the upper arm just below armpit, then double.',
    bodyAnatDesc:
      'Measure circumference around upper arm at widest point while relaxed or flexed with 1 finger inside tape.',
    suitNuance:
      'Athletic arms require extra upper sleeve room to prevent jacket sleeve flattening against tricep muscles.',
    womenNuance: 'Prevents sleeves from binding or pinching when reaching forward or driving.',
    commonMistake: 'Measuring down at elbow rather than at the fullest upper arm point.',
    standardRangeInches: '11" – 18"',
  },
  {
    id: 'upper10',
    code: 'Point 10',
    name: 'Cuff & Wrist Circumference',
    garmentFlatDesc:
      'Spread cuff open flat. Place tape at outer edge of buttonhole and measure across to center of button.',
    bodyAnatDesc:
      'Measure actual wrist size around wrist bone. Add +0.25" to +0.5" ease if you wear medium or heavy watches.',
    suitNuance:
      'Tailor can specify asymmetric left/right cuff diameters to accommodate luxury mechanical watches.',
    womenNuance:
      'Measure wrist bone leaving 1 finger room for comfortable bracelet and watch drape.',
    commonMistake:
      'Measuring total cuff fabric length end-to-end instead of buttonhole-to-button active closure.',
    standardRangeInches: '8.5" – 11.5"',
  },
  {
    id: 'upper11',
    code: 'Point 11',
    name: 'Armhole / Sleeve Hole',
    garmentFlatDesc:
      'Place shirt flat facing you. Place tape at top of armhole seam and follow curved edge to where it meets sleeve seam.',
    bodyAnatDesc:
      'Place tape under armpit and loop around top of arm over shoulder with 1 finger inside tape.',
    suitNuance:
      'Higher armhole creates sleek silhouette and allows full arm elevation without lifting jacket hem.',
    womenNuance:
      'Contoured armhole ensures comfort around chest and bust side profile without chafing.',
    commonMistake:
      'Measuring straight line across rather than following the perimeter of the curved seam.',
    standardRangeInches: '18" – 24"',
  },
  {
    id: 'upper12',
    code: 'Point 12',
    name: 'Shirt & Jacket Length',
    garmentFlatDesc:
      'Measure from top of shoulder seam near the collar, straight down along front of body to where shirt hem ends.',
    bodyAnatDesc:
      'Stand relaxed. Measure from highest shoulder point (where neck and shoulder meet) down front of torso to desired hem.',
    suitNuance:
      'Suit jacket length should reach thumb knuckle, fully covering rear buttocks. Untucked shirts end at mid-fly.',
    womenNuance:
      'Measure from highest shoulder point (A) to longest hem point (B). Tunics and tuck-in shirts differ.',
    commonMistake:
      'Measuring down the center front placket from collar button rather than top shoulder seam.',
    standardRangeInches: '27" – 34"',
  },
  {
    id: 'upper13',
    code: 'Point 13',
    name: 'Women’s Special Contours (Apex & Darts)',
    garmentFlatDesc:
      'Atelier anatomical contour points for three-dimensional shaping: Breast Point, Waist Point, and Front Bust Width.',
    bodyAnatDesc:
      'Breast Point: highest shoulder point to breast apex. Waist Point: highest shoulder point through apex down to natural waist. Front Bust: armpit to armpit in front.',
    suitNuance:
      'Princess seams and tailored darts eliminate gaping and provide clean roll over bust contour.',
    womenNuance:
      'Essential for women’s fitted shirts to ensure dart apex hits precisely at natural apex.',
    commonMistake:
      'Using unisex or flat garments that cause chest tightness or excess billowy fabric around lower ribcage.',
    standardRangeInches: 'Anatomical Matrix',
  },
];

interface StandardShirtSize {
  readonly size: string;
  readonly collar: string;
  readonly shirtLength: string;
  readonly shoulderWidth: string;
  readonly sleeveNormal: string;
  readonly sleeveExtraLong: string;
  readonly chest: string;
  readonly waist: string;
  readonly sleeveWidth: string;
  readonly cuff: string;
  readonly hipWidth: string;
}

interface StandardTrousersSize {
  readonly size: string;
  readonly waistFlat: string;
  readonly waistCirc: string;
  readonly hipsFlat: string;
  readonly hipsCirc: string;
  readonly thigh: string;
  readonly knee: string;
  readonly legOpening: string;
  readonly frontRise: string;
  readonly backRise: string;
  readonly inseam: string;
  readonly outseam: string;
}

const STANDARD_TROUSERS_TABLE_STRAIGHT: readonly StandardTrousersSize[] = [
  {
    size: 'W28',
    waistFlat: '14 1/2"',
    waistCirc: '29"',
    hipsFlat: '18 1/2"',
    hipsCirc: '37"',
    thigh: '11 1/2"',
    knee: '8 1/4"',
    legOpening: '7 3/4"',
    frontRise: '10 1/2"',
    backRise: '14 1/2"',
    inseam: '34"',
    outseam: '43 1/2"',
  },
  {
    size: 'W30',
    waistFlat: '15 1/2"',
    waistCirc: '31"',
    hipsFlat: '19 1/2"',
    hipsCirc: '39"',
    thigh: '12"',
    knee: '8 1/2"',
    legOpening: '8"',
    frontRise: '10 3/4"',
    backRise: '14 3/4"',
    inseam: '34"',
    outseam: '43 3/4"',
  },
  {
    size: 'W31',
    waistFlat: '16"',
    waistCirc: '32"',
    hipsFlat: '20"',
    hipsCirc: '40"',
    thigh: '12 1/4"',
    knee: '8 5/8"',
    legOpening: '8 1/8"',
    frontRise: '11"',
    backRise: '15"',
    inseam: '34"',
    outseam: '44"',
  },
  {
    size: 'W32',
    waistFlat: '16 1/2"',
    waistCirc: '33"',
    hipsFlat: '20 1/2"',
    hipsCirc: '41"',
    thigh: '12 1/2"',
    knee: '8 3/4"',
    legOpening: '8 1/4"',
    frontRise: '11 1/4"',
    backRise: '15 1/4"',
    inseam: '34"',
    outseam: '44 1/4"',
  },
  {
    size: 'W33',
    waistFlat: '17"',
    waistCirc: '34"',
    hipsFlat: '21"',
    hipsCirc: '42"',
    thigh: '12 3/4"',
    knee: '8 7/8"',
    legOpening: '8 3/8"',
    frontRise: '11 3/8"',
    backRise: '15 3/8"',
    inseam: '34"',
    outseam: '44 3/8"',
  },
  {
    size: 'W34',
    waistFlat: '17 1/2"',
    waistCirc: '35"',
    hipsFlat: '21 1/2"',
    hipsCirc: '43"',
    thigh: '13"',
    knee: '9"',
    legOpening: '8 1/2"',
    frontRise: '11 1/2"',
    backRise: '15 1/2"',
    inseam: '34"',
    outseam: '44 1/2"',
  },
  {
    size: 'W36',
    waistFlat: '18 1/2"',
    waistCirc: '37"',
    hipsFlat: '22 1/2"',
    hipsCirc: '45"',
    thigh: '13 1/2"',
    knee: '9 1/4"',
    legOpening: '8 3/4"',
    frontRise: '11 7/8"',
    backRise: '16"',
    inseam: '34"',
    outseam: '44 7/8"',
  },
  {
    size: 'W38',
    waistFlat: '19 1/2"',
    waistCirc: '39"',
    hipsFlat: '23 1/2"',
    hipsCirc: '47"',
    thigh: '14"',
    knee: '9 1/2"',
    legOpening: '9"',
    frontRise: '12 1/4"',
    backRise: '16 1/2"',
    inseam: '34"',
    outseam: '45 1/4"',
  },
  {
    size: 'W40',
    waistFlat: '20 1/2"',
    waistCirc: '41"',
    hipsFlat: '24 1/2"',
    hipsCirc: '49"',
    thigh: '14 1/2"',
    knee: '9 3/4"',
    legOpening: '9 1/4"',
    frontRise: '12 1/2"',
    backRise: '17"',
    inseam: '34"',
    outseam: '45 1/2"',
  },
];

const STANDARD_TROUSERS_TABLE_SLIM: readonly StandardTrousersSize[] = [
  {
    size: 'W28',
    waistFlat: '14 1/2"',
    waistCirc: '29"',
    hipsFlat: '18"',
    hipsCirc: '36"',
    thigh: '11"',
    knee: '7 1/2"',
    legOpening: '6 1/2"',
    frontRise: '10"',
    backRise: '14"',
    inseam: '34"',
    outseam: '43"',
  },
  {
    size: 'W30',
    waistFlat: '15 1/2"',
    waistCirc: '31"',
    hipsFlat: '19"',
    hipsCirc: '38"',
    thigh: '11 1/2"',
    knee: '7 3/4"',
    legOpening: '6 3/4"',
    frontRise: '10 1/4"',
    backRise: '14 1/4"',
    inseam: '34"',
    outseam: '43 1/4"',
  },
  {
    size: 'W31',
    waistFlat: '16"',
    waistCirc: '32"',
    hipsFlat: '19 1/2"',
    hipsCirc: '39"',
    thigh: '11 3/4"',
    knee: '7 7/8"',
    legOpening: '6 7/8"',
    frontRise: '10 1/2"',
    backRise: '14 1/2"',
    inseam: '34"',
    outseam: '43 1/2"',
  },
  {
    size: 'W32',
    waistFlat: '16 1/2"',
    waistCirc: '33"',
    hipsFlat: '20"',
    hipsCirc: '40"',
    thigh: '12"',
    knee: '8"',
    legOpening: '7"',
    frontRise: '10 3/4"',
    backRise: '14 3/4"',
    inseam: '34"',
    outseam: '43 3/4"',
  },
  {
    size: 'W33',
    waistFlat: '17"',
    waistCirc: '34"',
    hipsFlat: '20 1/2"',
    hipsCirc: '41"',
    thigh: '12 1/4"',
    knee: '8 1/8"',
    legOpening: '7 1/8"',
    frontRise: '10 7/8"',
    backRise: '14 7/8"',
    inseam: '34"',
    outseam: '43 7/8"',
  },
  {
    size: 'W34',
    waistFlat: '17 1/2"',
    waistCirc: '35"',
    hipsFlat: '21"',
    hipsCirc: '42"',
    thigh: '12 1/2"',
    knee: '8 1/4"',
    legOpening: '7 1/4"',
    frontRise: '11"',
    backRise: '15"',
    inseam: '34"',
    outseam: '44"',
  },
  {
    size: 'W36',
    waistFlat: '18 1/2"',
    waistCirc: '37"',
    hipsFlat: '22"',
    hipsCirc: '44"',
    thigh: '13"',
    knee: '8 1/2"',
    legOpening: '7 1/2"',
    frontRise: '11 3/8"',
    backRise: '15 1/2"',
    inseam: '34"',
    outseam: '44 3/8"',
  },
  {
    size: 'W38',
    waistFlat: '19 1/2"',
    waistCirc: '39"',
    hipsFlat: '23"',
    hipsCirc: '46"',
    thigh: '13 1/2"',
    knee: '8 3/4"',
    legOpening: '7 3/4"',
    frontRise: '11 3/4"',
    backRise: '16"',
    inseam: '34"',
    outseam: '44 3/4"',
  },
  {
    size: 'W40',
    waistFlat: '20 1/2"',
    waistCirc: '41"',
    hipsFlat: '24"',
    hipsCirc: '48"',
    thigh: '14"',
    knee: '9"',
    legOpening: '8"',
    frontRise: '12"',
    backRise: '16 1/2"',
    inseam: '34"',
    outseam: '45"',
  },
];

const STANDARD_TROUSERS_TABLE_RELAXED: readonly StandardTrousersSize[] = [
  {
    size: 'W28',
    waistFlat: '14 1/2"',
    waistCirc: '29"',
    hipsFlat: '19 1/2"',
    hipsCirc: '39"',
    thigh: '12 1/2"',
    knee: '9 1/2"',
    legOpening: '9"',
    frontRise: '11 1/2"',
    backRise: '15 1/2"',
    inseam: '34"',
    outseam: '44 1/2"',
  },
  {
    size: 'W30',
    waistFlat: '15 1/2"',
    waistCirc: '31"',
    hipsFlat: '20 1/2"',
    hipsCirc: '41"',
    thigh: '13"',
    knee: '9 3/4"',
    legOpening: '9 1/4"',
    frontRise: '11 3/4"',
    backRise: '15 3/4"',
    inseam: '34"',
    outseam: '44 3/4"',
  },
  {
    size: 'W31',
    waistFlat: '16"',
    waistCirc: '32"',
    hipsFlat: '21"',
    hipsCirc: '42"',
    thigh: '13 1/4"',
    knee: '9 7/8"',
    legOpening: '9 3/8"',
    frontRise: '12"',
    backRise: '16"',
    inseam: '34"',
    outseam: '45"',
  },
  {
    size: 'W32',
    waistFlat: '16 1/2"',
    waistCirc: '33"',
    hipsFlat: '21 1/2"',
    hipsCirc: '43"',
    thigh: '13 1/2"',
    knee: '10"',
    legOpening: '9 1/2"',
    frontRise: '12 1/4"',
    backRise: '16 1/4"',
    inseam: '34"',
    outseam: '45 1/4"',
  },
  {
    size: 'W33',
    waistFlat: '17"',
    waistCirc: '34"',
    hipsFlat: '22"',
    hipsCirc: '44"',
    thigh: '13 3/4"',
    knee: '10 1/8"',
    legOpening: '9 5/8"',
    frontRise: '12 3/8"',
    backRise: '16 3/8"',
    inseam: '34"',
    outseam: '45 3/8"',
  },
  {
    size: 'W34',
    waistFlat: '17 1/2"',
    waistCirc: '35"',
    hipsFlat: '22 1/2"',
    hipsCirc: '45"',
    thigh: '14"',
    knee: '10 1/4"',
    legOpening: '9 3/4"',
    frontRise: '12 1/2"',
    backRise: '16 1/2"',
    inseam: '34"',
    outseam: '45 1/2"',
  },
  {
    size: 'W36',
    waistFlat: '18 1/2"',
    waistCirc: '37"',
    hipsFlat: '23 1/2"',
    hipsCirc: '47"',
    thigh: '14 1/2"',
    knee: '10 1/2"',
    legOpening: '10"',
    frontRise: '12 7/8"',
    backRise: '17"',
    inseam: '34"',
    outseam: '45 7/8"',
  },
  {
    size: 'W38',
    waistFlat: '19 1/2"',
    waistCirc: '39"',
    hipsFlat: '24 1/2"',
    hipsCirc: '49"',
    thigh: '15"',
    knee: '10 3/4"',
    legOpening: '10 1/4"',
    frontRise: '13 1/4"',
    backRise: '17 1/2"',
    inseam: '34"',
    outseam: '46 1/4"',
  },
  {
    size: 'W40',
    waistFlat: '20 1/2"',
    waistCirc: '41"',
    hipsFlat: '25 1/2"',
    hipsCirc: '51"',
    thigh: '15 1/2"',
    knee: '11"',
    legOpening: '10 1/2"',
    frontRise: '13 1/2"',
    backRise: '18"',
    inseam: '34"',
    outseam: '46 1/2"',
  },
];

const STANDARD_SHIRT_TABLE_SLIM: readonly StandardShirtSize[] = [
  {
    size: 'XS',
    collar: '14 1/8"',
    shirtLength: '28 3/4"',
    shoulderWidth: '16 7/8"',
    sleeveNormal: '25 1/4"',
    sleeveExtraLong: '27 1/8"',
    chest: '37 3/4"',
    waist: '33 7/8"',
    sleeveWidth: '9 1/2"',
    cuff: '9 1/2"',
    hipWidth: '37"',
  },
  {
    size: 'S',
    collar: '15"',
    shirtLength: '29 1/2"',
    shoulderWidth: '17 3/4"',
    sleeveNormal: '25 5/8"',
    sleeveExtraLong: '27 1/2"',
    chest: '39 3/8"',
    waist: '36 1/4"',
    sleeveWidth: '9 7/8"',
    cuff: '9 1/2"',
    hipWidth: '38 5/8"',
  },
  {
    size: 'M',
    collar: '15 3/4"',
    shirtLength: '29 1/2"',
    shoulderWidth: '18 1/8"',
    sleeveNormal: '25 5/8"',
    sleeveExtraLong: '27 1/2"',
    chest: '41 3/4"',
    waist: '39 3/8"',
    sleeveWidth: '10 1/4"',
    cuff: '9 7/8"',
    hipWidth: '41"',
  },
  {
    size: 'L',
    collar: '16 1/2"',
    shirtLength: '29 1/2"',
    shoulderWidth: '18 7/8"',
    sleeveNormal: '26"',
    sleeveExtraLong: '28"',
    chest: '44 7/8"',
    waist: '42 1/2"',
    sleeveWidth: '10 5/8"',
    cuff: '9 7/8"',
    hipWidth: '44 1/8"',
  },
  {
    size: 'XL',
    collar: '17 3/8"',
    shirtLength: '29 1/2"',
    shoulderWidth: '19 1/4"',
    sleeveNormal: '26 3/8"',
    sleeveExtraLong: '28 3/8"',
    chest: '48"',
    waist: '45 5/8"',
    sleeveWidth: '11 3/8"',
    cuff: '10 1/4"',
    hipWidth: '47 1/4"',
  },
  {
    size: 'XXL',
    collar: '18 1/8"',
    shirtLength: '29 1/2"',
    shoulderWidth: '20 1/8"',
    sleeveNormal: '26 3/4"',
    sleeveExtraLong: '28 3/4"',
    chest: '51 1/8"',
    waist: '48 7/8"',
    sleeveWidth: '11 3/4"',
    cuff: '10 5/8"',
    hipWidth: '50 3/8"',
  },
];

const STANDARD_SHIRT_TABLE_NORMAL: readonly StandardShirtSize[] = [
  {
    size: 'XS',
    collar: '14 1/8"',
    shirtLength: '28 3/4"',
    shoulderWidth: '16 7/8"',
    sleeveNormal: '25 1/4"',
    sleeveExtraLong: '27 1/8"',
    chest: '44 7/8"',
    waist: '41 3/4"',
    sleeveWidth: '11"',
    cuff: '9 1/2"',
    hipWidth: '44 1/8"',
  },
  {
    size: 'S',
    collar: '15"',
    shirtLength: '29 1/2"',
    shoulderWidth: '18 7/8"',
    sleeveNormal: '25 5/8"',
    sleeveExtraLong: '27 1/2"',
    chest: '46 1/2"',
    waist: '43 1/4"',
    sleeveWidth: '11 3/8"',
    cuff: '9 1/2"',
    hipWidth: '45 5/8"',
  },
  {
    size: 'M',
    collar: '15 3/4"',
    shirtLength: '29 1/2"',
    shoulderWidth: '19 1/4"',
    sleeveNormal: '25 5/8"',
    sleeveExtraLong: '27 1/2"',
    chest: '48"',
    waist: '44 7/8"',
    sleeveWidth: '11 3/4"',
    cuff: '9 7/8"',
    hipWidth: '47 1/4"',
  },
  {
    size: 'L',
    collar: '16 1/2"',
    shirtLength: '29 1/2"',
    shoulderWidth: '20 1/8"',
    sleeveNormal: '26"',
    sleeveExtraLong: '28"',
    chest: '49 5/8"',
    waist: '46 1/2"',
    sleeveWidth: '11 3/4"',
    cuff: '9 7/8"',
    hipWidth: '48 7/8"',
  },
  {
    size: 'XL',
    collar: '17 3/8"',
    shirtLength: '29 1/2"',
    shoulderWidth: '20 7/8"',
    sleeveNormal: '26 3/8"',
    sleeveExtraLong: '28 3/8"',
    chest: '52"',
    waist: '51 1/8"',
    sleeveWidth: '12 5/8"',
    cuff: '10 1/4"',
    hipWidth: '51 1/8"',
  },
  {
    size: 'XXL',
    collar: '18 1/8"',
    shirtLength: '29 1/2"',
    shoulderWidth: '22"',
    sleeveNormal: '26 3/4"',
    sleeveExtraLong: '28 3/4"',
    chest: '54 3/8"',
    waist: '53 1/2"',
    sleeveWidth: '13"',
    cuff: '10 5/8"',
    hipWidth: '53 1/2"',
  },
];

const STANDARD_SHIRT_TABLE_LOOSE: readonly StandardShirtSize[] = [
  {
    size: 'XS',
    collar: '14 1/8"',
    shirtLength: '28 3/4"',
    shoulderWidth: '16 7/8"',
    sleeveNormal: '25 1/4"',
    sleeveExtraLong: '27 1/8"',
    chest: '44 7/8"',
    waist: '44 7/8"',
    sleeveWidth: '11 3/8"',
    cuff: '9 1/2"',
    hipWidth: '44 7/8"',
  },
  {
    size: 'S',
    collar: '15"',
    shirtLength: '29 1/2"',
    shoulderWidth: '18 7/8"',
    sleeveNormal: '25 5/8"',
    sleeveExtraLong: '27 1/2"',
    chest: '46 1/2"',
    waist: '46 1/2"',
    sleeveWidth: '11 3/4"',
    cuff: '9 1/2"',
    hipWidth: '46 1/2"',
  },
  {
    size: 'M',
    collar: '15 3/4"',
    shirtLength: '29 1/2"',
    shoulderWidth: '19 1/4"',
    sleeveNormal: '25 5/8"',
    sleeveExtraLong: '27 1/2"',
    chest: '48"',
    waist: '48"',
    sleeveWidth: '12 1/4"',
    cuff: '9 7/8"',
    hipWidth: '48"',
  },
  {
    size: 'L',
    collar: '16 1/2"',
    shirtLength: '29 1/2"',
    shoulderWidth: '20 1/8"',
    sleeveNormal: '26"',
    sleeveExtraLong: '28"',
    chest: '49 5/8"',
    waist: '49 5/8"',
    sleeveWidth: '12 1/4"',
    cuff: '9 7/8"',
    hipWidth: '49 5/8"',
  },
  {
    size: 'XL',
    collar: '17 3/8"',
    shirtLength: '29 1/2"',
    shoulderWidth: '20 7/8"',
    sleeveNormal: '26 3/8"',
    sleeveExtraLong: '28 3/8"',
    chest: '52"',
    waist: '52"',
    sleeveWidth: '13"',
    cuff: '10 1/4"',
    hipWidth: '52"',
  },
  {
    size: 'XXL',
    collar: '18 1/8"',
    shirtLength: '29 1/2"',
    shoulderWidth: '22"',
    sleeveNormal: '26 3/4"',
    sleeveExtraLong: '28 3/4"',
    chest: '54 3/8"',
    waist: '54 3/8"',
    sleeveWidth: '13 3/8"',
    cuff: '10 5/8"',
    hipWidth: '54 3/8"',
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
  readonly initialCraftFocus?: CraftFocusDto;
  readonly isAuthenticated?: boolean;
}

export function SizingStudioClient({
  cmsMarkdown,
  initialCraftFocus,
  isAuthenticated = false,
}: SizingStudioClientProps) {
  // Studio Interactive States
  const [craftMode, setCraftMode] = useState<CraftFocusDto>(initialCraftFocus ?? 'DUAL_CRAFT');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [garmentCategory, setGarmentCategory] = useState<'BOTTOMS' | 'TOPS' | 'EASE_MATRIX'>(
    'BOTTOMS',
  );
  const [gender, setGender] = useState<GenderMode>('MEN');
  const [method, setMethod] = useState<MethodMode>('GARMENT_FLAT');
  const [unit, setUnit] = useState<UnitMode>('INCHES');
  const [activePointId, setActivePointId] = useState<string>('pointA');
  const [activeUpperPointId, setActiveUpperPointId] = useState<string>('upper1');
  const [standardTableFit, setStandardTableFit] = useState<'SLIM' | 'NORMAL' | 'LOOSE'>('SLIM');
  const [standardTrouserSilhouette, setStandardTrouserSilhouette] = useState<
    'STRAIGHT' | 'SLIM' | 'RELAXED'
  >('STRAIGHT');
  const [easeMatrixCategory, setEaseMatrixCategory] = useState<'TROUSERS' | 'SHIRTS'>('TROUSERS');

  // Lower Body Targets
  const [targetWaist, setTargetWaist] = useState<number>(32);
  const [targetInseam, setTargetInseam] = useState<number>(34);
  const [targetThigh, setTargetThigh] = useState<number>(23);
  const [isRawLoomstate, setIsRawLoomstate] = useState<boolean>(true);

  // Upper Body Targets (Modern Tailor System)
  const [targetChest, setTargetChest] = useState<number>(40);
  const [targetCollar, setTargetCollar] = useState<number>(16);
  const [targetSleeve, setTargetSleeve] = useState<number>(25.5);
  const [targetShirtFit, setTargetShirtFit] = useState<'SLIM' | 'NORMAL' | 'LOOSE'>('NORMAL');

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

  const calculatedShirtChest = useMemo(() => {
    // Slim: +12cm (+4.7"), Normal: +16cm (+6.3"), Loose: +20cm (+7.9")
    const easeInches = targetShirtFit === 'SLIM' ? 4.7 : targetShirtFit === 'NORMAL' ? 6.3 : 7.9;
    return Math.round((targetChest + easeInches) * 10) / 10;
  }, [targetChest, targetShirtFit]);

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

  const activeUpperPoint = useMemo(
    () => UPPER_BODY_POINTS.find((p) => p.id === activeUpperPointId) ?? UPPER_BODY_POINTS[0]!,
    [activeUpperPointId],
  );

  const handleCopyGarmentSpec = () => {
    const easeLabel =
      targetShirtFit === 'SLIM'
        ? '+12cm (+4.7") ease'
        : targetShirtFit === 'NORMAL'
          ? '+16cm (+6.3") ease, +4cm (+1.6") shoulders, -2cm (-0.8") sleeve'
          : '+20cm (+7.9") ease, +8cm (+3.1") shoulders, -4cm (-1.6") sleeve';

    const spec = `JEANIUS ATELIER TAILORING SPECIFICATIONS:
--- LOWER BODY (DENIM / TROUSERS · POINTS A–Q) ---
Gender Profile: ${gender}
Measurement Method: ${method}
Target Finished Waist: ${targetWaist}"
Target Post-Soak Inseam: ${targetInseam}"
Loomstate Cut Inseam (+3% buffer): ${calculatedCutInseam}"
Target Thigh: ${targetThigh}"
Fabric: ${isRawLoomstate ? 'Kurabo 14oz Raw (+3% Loomstate Buffer)' : 'Kuroki 15.5oz Sanforized'}

--- UPPER BODY (SHIRTS, JACKETS & SUITS · MODERN TAILOR) ---
Body Chest Circumference: ${targetChest}"
Collar / Neck: ${targetCollar}"
Sleeve Length: ${targetSleeve}"
Selected Fit Ease: ${targetShirtFit} FIT (${easeLabel})
Finished Tailored Shirt Chest: ${calculatedShirtChest}"`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(spec);
      setCopiedToast('Tailoring specifications copied to clipboard');
      setTimeout(() => setCopiedToast(null), 3000);
    }
  };

  const handleCopyJewellerySpec = () => {
    const matched = RING_MANDREL_TABLE.find((r) => r.us === selectedRingSizeUs);
    const spec = `JEANIUS ATELIER JEWELLERY SPEC:
Selected Ring Size: US ${selectedRingSizeUs}
Band Width: ${ringBandWidthMm}mm
Recommended Compensated Size: US ${recommendedRingSize}
EU Size: ${matched?.eu ?? 'N/A'}
UK Size: ${matched?.uk ?? 'N/A'}
Wrist Circumference: ${wristCircInches}"
Recommended Cuff Size: ${(wristCircInches + 0.5).toFixed(2)}"
Recommended Chain Size: ${(wristCircInches + 0.75).toFixed(2)}"`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(spec);
      setCopiedToast('Jewellery specifications copied to clipboard');
      setTimeout(() => setCopiedToast(null), 3000);
    }
  };

  const handleCopyDualSpec = () => {
    const matched = RING_MANDREL_TABLE.find((r) => r.us === selectedRingSizeUs);
    const spec = `JEANIUS ATELIER DUAL-CRAFT SPEC:
--- DENIM TAILORING ---
Gender Profile: ${gender}
Target Finished Waist: ${targetWaist}"
Target Post-Soak Inseam: ${targetInseam}"
Loomstate Cut Inseam (+3% buffer): ${calculatedCutInseam}"
Target Thigh: ${targetThigh}"
Finished Shirt Chest (${targetShirtFit} Fit): ${calculatedShirtChest}"
Collar: ${targetCollar}" | Sleeve: ${targetSleeve}"

--- SOLID 925 JEWELLERY ---
Selected Ring Size: US ${selectedRingSizeUs} (Compensated for ${ringBandWidthMm}mm: US ${recommendedRingSize})
EU / UK Size: ${matched?.eu ?? 'N/A'} / ${matched?.uk ?? 'N/A'}
Wrist Circumference: ${wristCircInches}"
Recommended Cuff Size: ${(wristCircInches + 0.5).toFixed(2)}"`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(spec);
      setCopiedToast('Dual-craft specifications copied to clipboard');
      setTimeout(() => setCopiedToast(null), 3000);
    }
  };

  const handleSaveGarmentToVault = async () => {
    if (!isAuthenticated) return;
    setIsSaving(true);
    try {
      const res = await updateProfileAction({
        craftFocus: craftMode,
        denimPreferences: {
          bottoms: {
            gender,
            waistInches: targetWaist,
            inseamInches: targetInseam,
            thighInches: targetThigh,
          },
          tops: {
            gender,
            chestInches: targetChest,
            collarInches: targetCollar,
            sleeveLengthInches: targetSleeve,
            fitCut: targetShirtFit,
          },
          waistInches: targetWaist,
          inseamInches: targetInseam,
        },
      });
      if (res.success) {
        setCopiedToast('Garment specifications saved to your Atelier Vault ✨');
        setTimeout(() => setCopiedToast(null), 3500);
      }
    } catch {
      // Ignore
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveJewelleryToVault = async () => {
    if (!isAuthenticated) return;
    setIsSaving(true);
    try {
      const res = await updateProfileAction({
        craftFocus: craftMode,
        jewelleryPreferences: {
          ringSizeUs: parseFloat(selectedRingSizeUs),
          wristCircumferenceInches: wristCircInches,
        },
      });
      if (res.success) {
        setCopiedToast('Jewellery specifications saved to your Atelier Vault ✨');
        setTimeout(() => setCopiedToast(null), 3500);
      }
    } catch {
      // Ignore
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBothToVault = async () => {
    if (!isAuthenticated) return;
    setIsSaving(true);
    try {
      const res = await updateProfileAction({
        craftFocus: 'DUAL_CRAFT',
        denimPreferences: {
          bottoms: {
            gender,
            waistInches: targetWaist,
            inseamInches: targetInseam,
            thighInches: targetThigh,
          },
          tops: {
            gender,
            chestInches: targetChest,
            collarInches: targetCollar,
            sleeveLengthInches: targetSleeve,
            fitCut: targetShirtFit,
          },
          waistInches: targetWaist,
          inseamInches: targetInseam,
        },
        jewelleryPreferences: {
          ringSizeUs: parseFloat(selectedRingSizeUs),
          wristCircumferenceInches: wristCircInches,
        },
      });
      if (res.success) {
        setCopiedToast('Both Garment & Jewellery specs saved to Atelier Vault ✨');
        setTimeout(() => setCopiedToast(null), 3500);
      }
    } catch {
      // Ignore
    } finally {
      setIsSaving(false);
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
        {/* ATELIER CRAFT FOCUS SWITCHER                                    */}
        {/* ============================================================== */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1.25rem 1.75rem',
            marginBottom: '2.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1.25rem',
            boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono, monospace)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#64748b',
                fontWeight: 600,
                marginBottom: '0.25rem',
              }}
            >
              Atelier Craft Specialization Focus
            </div>
            <div style={{ fontSize: '0.92rem', color: '#0f172a', fontWeight: 600 }}>
              {craftMode === 'GARMENT' && '🧵 Denim Tailoring Only — Points A–Q & Warp Shrinkage'}
              {craftMode === 'JEWELLERY' &&
                '💍 Jewellery & Metalsmithing Only — Ring Mandrel & Cuff Calibrations'}
              {craftMode === 'DUAL_CRAFT' &&
                '✨ Dual-Craft Atelier — Comprehensive Denim & Jewellery Studio'}
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#f8fafc',
              padding: '4px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              gap: '4px',
            }}
          >
            {(
              [
                { id: 'GARMENT', label: '🧵 Garment Only' },
                { id: 'JEWELLERY', label: '💍 Jewellery Only' },
                { id: 'DUAL_CRAFT', label: '✨ Dual-Craft' },
              ] as const
            ).map((c) => {
              const active = craftMode === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCraftMode(c.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    backgroundColor: active ? '#0f172a' : 'transparent',
                    color: active ? '#ffffff' : '#475569',
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {craftMode === 'JEWELLERY' && (
          <div
            style={{
              padding: '1.5rem',
              backgroundColor: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '8px',
              marginBottom: '3.5rem',
              textAlign: 'center',
              color: '#64748b',
              fontSize: '0.9rem',
            }}
          >
            🧵 Denim tailoring guide is hidden because your craft focus is set to{' '}
            <strong>Jewellery Only</strong>. Switch above to <em>Garment Only</em> or{' '}
            <em>Dual-Craft</em> to explore Points A–Q and raw warp shrinkage.
          </div>
        )}

        {/* ============================================================== */}
        {/* INTERACTIVE STUDIO CONTROLS (GARMENT & DUAL)                  */}
        {/* ============================================================== */}
        {(craftMode === 'GARMENT' || craftMode === 'DUAL_CRAFT') && (
          <>
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
              {/* Garment Category Sub-Tabs */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.6rem',
                  marginBottom: '2rem',
                  borderBottom: '2px solid #f1f5f9',
                  paddingBottom: '1rem',
                }}
              >
                {(
                  [
                    {
                      id: 'BOTTOMS',
                      label: '👖 Lower Body (Points A–Q · Trousers & Jeans)',
                    },
                    {
                      id: 'TOPS',
                      label: '👔 Upper Body (Points 1–13 · Shirts & Suits)',
                    },
                    {
                      id: 'EASE_MATRIX',
                      label: '📐 Fit Allowances & Standard Tables (Trousers & Upper Body)',
                    },
                  ] as const
                ).map((cat) => {
                  const active = garmentCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setGarmentCategory(cat.id)}
                      style={{
                        padding: '0.65rem 1.25rem',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 150ms ease',
                        backgroundColor: active ? '#0f172a' : '#f8fafc',
                        color: active ? '#ffffff' : '#475569',
                        boxShadow: active ? '0 2px 4px rgba(15,23,42,0.1)' : 'none',
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {garmentCategory === 'BOTTOMS' && (
                <>
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
                            {g === 'MEN'
                              ? 'Men’s Cut'
                              : g === 'WOMEN'
                                ? 'Women’s Cut'
                                : 'Unisex / Vintage'}
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
                            backgroundColor:
                              method === 'BODY_ANATOMICAL' ? '#0f172a' : 'transparent',
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
                          Women’s trousers anchor at the <strong>natural waist</strong> (narrowest
                          torso plane) for high-rise styles or high-hip for mid-rise. Female pelvic
                          anatomy requires a deeper back-to-front rise slope (differential of{' '}
                          <strong>+3.5" to +5.0"</strong>) to accommodate seat curvature without
                          back-waist gap.
                        </>
                      ) : (
                        <>
                          Men typically anchor trousers on the <strong>iliac crest</strong> (upper
                          pelvis). A rise differential of <strong>+2.5" to +3.5"</strong> provides
                          clean sitting drape. Always maintain at least <strong>+1.0" ease</strong>{' '}
                          over thigh circumference on raw selvedge to prevent binding.
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
                          <h4
                            style={{
                              fontSize: '1.35rem',
                              color: '#0f172a',
                              margin: '0.2rem 0 0 0',
                            }}
                          >
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
                          <p
                            style={{
                              color: '#475569',
                              fontSize: '0.88rem',
                              lineHeight: 1.6,
                              margin: 0,
                            }}
                          >
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
                            {gender === 'WOMEN'
                              ? '♀ Women’s Specific Nuance'
                              : '♂ Men’s Specific Nuance'}
                          </div>
                          <p
                            style={{
                              color: '#475569',
                              fontSize: '0.88rem',
                              lineHeight: 1.6,
                              margin: 0,
                            }}
                          >
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
                          <p
                            style={{
                              color: '#475569',
                              fontSize: '0.88rem',
                              lineHeight: 1.6,
                              margin: 0,
                            }}
                          >
                            {activePoint.commonMistake}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Finished Trousers & Jeans Standard Size Reference Tables */}
                  <div
                    style={{
                      marginTop: '2.5rem',
                      paddingTop: '2rem',
                      borderTop: '1px solid #e2e8f0',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-mono, monospace)',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: '#b91c1c',
                            fontWeight: 700,
                          }}
                        >
                          ATELIER STANDARD SIZES · FINISHED TROUSERS &amp; JEANS
                        </div>
                        <h4
                          style={{
                            fontSize: '1.25rem',
                            color: '#0f172a',
                            margin: '0.2rem 0 0 0',
                          }}
                        >
                          Standard Finished Pants Sizing Guide (W28 to W40)
                        </h4>
                      </div>
                      <div
                        style={{
                          display: 'inline-flex',
                          backgroundColor: '#f1f5f9',
                          padding: '3px',
                          borderRadius: '6px',
                          gap: '4px',
                        }}
                      >
                        {[
                          { id: 'STRAIGHT', label: 'Classic Straight (Heritage 1947)' },
                          { id: 'SLIM', label: 'Slim Tapered (Modern Clean)' },
                          { id: 'RELAXED', label: 'Wide Leg / Relaxed' },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() =>
                              setStandardTrouserSilhouette(
                                tab.id as 'STRAIGHT' | 'SLIM' | 'RELAXED',
                              )
                            }
                            style={{
                              padding: '0.4rem 0.85rem',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              backgroundColor:
                                standardTrouserSilhouette === tab.id ? '#0f172a' : 'transparent',
                              color: standardTrouserSilhouette === tab.id ? '#ffffff' : '#475569',
                              transition: 'all 150ms ease',
                            }}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <p
                      style={{
                        color: '#64748b',
                        fontSize: '0.86rem',
                        lineHeight: 1.6,
                        margin: '0 0 1.25rem 0',
                      }}
                    >
                      Measurements are taken from finished garments laid flat. For waist, measure
                      your best-fitting pants edge-to-edge (Point A) or compare your iliac crest
                      body tape measurement. All raw loomstate denim selections include an
                      additional +3% warp length shrinkage buffer.
                    </p>

                    <div
                      style={{
                        overflowX: 'auto',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                      }}
                    >
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontSize: '0.82rem',
                          textAlign: 'left',
                        }}
                      >
                        <thead>
                          <tr
                            style={{
                              backgroundColor: '#f8fafc',
                              borderBottom: '1px solid #e2e8f0',
                            }}
                          >
                            <th
                              style={{
                                padding: '0.65rem 0.75rem',
                                fontWeight: 700,
                                color: '#0f172a',
                              }}
                            >
                              Tagged Size
                            </th>
                            <th
                              style={{
                                padding: '0.65rem 0.75rem',
                                fontWeight: 600,
                                color: '#475569',
                              }}
                            >
                              Waist Flat (Pt A)
                            </th>
                            <th
                              style={{
                                padding: '0.65rem 0.75rem',
                                fontWeight: 600,
                                color: '#475569',
                              }}
                            >
                              Waist Circ
                            </th>
                            <th
                              style={{
                                padding: '0.65rem 0.75rem',
                                fontWeight: 600,
                                color: '#475569',
                              }}
                            >
                              Hips Flat (Pt B)
                            </th>
                            <th
                              style={{
                                padding: '0.65rem 0.75rem',
                                fontWeight: 600,
                                color: '#475569',
                              }}
                            >
                              Thigh (Pt C)
                            </th>
                            <th
                              style={{
                                padding: '0.65rem 0.75rem',
                                fontWeight: 600,
                                color: '#475569',
                              }}
                            >
                              Knee @13" (Pt D)
                            </th>
                            <th
                              style={{
                                padding: '0.65rem 0.75rem',
                                fontWeight: 600,
                                color: '#475569',
                              }}
                            >
                              Leg Opening (Pt E)
                            </th>
                            <th
                              style={{
                                padding: '0.65rem 0.75rem',
                                fontWeight: 600,
                                color: '#475569',
                              }}
                            >
                              Front Rise (Pt F)
                            </th>
                            <th
                              style={{
                                padding: '0.65rem 0.75rem',
                                fontWeight: 600,
                                color: '#475569',
                              }}
                            >
                              Back Rise (Pt G)
                            </th>
                            <th
                              style={{
                                padding: '0.65rem 0.75rem',
                                fontWeight: 600,
                                color: '#475569',
                              }}
                            >
                              Inseam (Pt H)
                            </th>
                            <th
                              style={{
                                padding: '0.65rem 0.75rem',
                                fontWeight: 600,
                                color: '#475569',
                              }}
                            >
                              Outseam (Pt I)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(standardTrouserSilhouette === 'STRAIGHT'
                            ? STANDARD_TROUSERS_TABLE_STRAIGHT
                            : standardTrouserSilhouette === 'SLIM'
                              ? STANDARD_TROUSERS_TABLE_SLIM
                              : STANDARD_TROUSERS_TABLE_RELAXED
                          ).map((row, idx) => (
                            <tr
                              key={row.size}
                              style={{
                                borderBottom: '1px solid #f1f5f9',
                                backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                              }}
                            >
                              <td
                                style={{
                                  padding: '0.55rem 0.75rem',
                                  fontWeight: 700,
                                  color: '#0f172a',
                                }}
                              >
                                {row.size}
                              </td>
                              <td
                                style={{
                                  padding: '0.55rem 0.75rem',
                                  color: '#0369a1',
                                  fontWeight: 600,
                                  fontFamily: 'var(--font-mono, monospace)',
                                }}
                              >
                                {row.waistFlat}
                              </td>
                              <td
                                style={{
                                  padding: '0.55rem 0.75rem',
                                  color: '#334155',
                                  fontFamily: 'var(--font-mono, monospace)',
                                }}
                              >
                                {row.waistCirc}
                              </td>
                              <td
                                style={{
                                  padding: '0.55rem 0.75rem',
                                  color: '#334155',
                                  fontFamily: 'var(--font-mono, monospace)',
                                }}
                              >
                                {row.hipsFlat}
                              </td>
                              <td
                                style={{
                                  padding: '0.55rem 0.75rem',
                                  color: '#334155',
                                  fontFamily: 'var(--font-mono, monospace)',
                                }}
                              >
                                {row.thigh}
                              </td>
                              <td
                                style={{
                                  padding: '0.55rem 0.75rem',
                                  color: '#334155',
                                  fontFamily: 'var(--font-mono, monospace)',
                                }}
                              >
                                {row.knee}
                              </td>
                              <td
                                style={{
                                  padding: '0.55rem 0.75rem',
                                  color: '#334155',
                                  fontFamily: 'var(--font-mono, monospace)',
                                }}
                              >
                                {row.legOpening}
                              </td>
                              <td
                                style={{
                                  padding: '0.55rem 0.75rem',
                                  color: '#334155',
                                  fontFamily: 'var(--font-mono, monospace)',
                                }}
                              >
                                {row.frontRise}
                              </td>
                              <td
                                style={{
                                  padding: '0.55rem 0.75rem',
                                  color: '#334155',
                                  fontFamily: 'var(--font-mono, monospace)',
                                }}
                              >
                                {row.backRise}
                              </td>
                              <td
                                style={{
                                  padding: '0.55rem 0.75rem',
                                  color: '#334155',
                                  fontFamily: 'var(--font-mono, monospace)',
                                }}
                              >
                                {row.inseam}
                              </td>
                              <td
                                style={{
                                  padding: '0.55rem 0.75rem',
                                  color: '#334155',
                                  fontFamily: 'var(--font-mono, monospace)',
                                }}
                              >
                                {row.outseam}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* ============================================================== */}
              {/* TAB 2: UPPER BODY (POINTS 1–13 SHIRTS & SUITS)                  */}
              {/* ============================================================== */}
              {garmentCategory === 'TOPS' && (
                <>
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
                    {/* Pattern Cut Toggle */}
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
                        Upper Pattern Model
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
                            {g === 'MEN'
                              ? 'Men’s Shirt & Suit'
                              : g === 'WOMEN'
                                ? 'Women’s Shirt & Blouse'
                                : 'Unisex Overshirt'}
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
                          Laid-Flat Best-Fitting Shirt
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
                            backgroundColor:
                              method === 'BODY_ANATOMICAL' ? '#0f172a' : 'transparent',
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

                  {/* Gender Guidance Alert */}
                  <div
                    style={{
                      padding: '1.25rem',
                      backgroundColor: gender === 'WOMEN' ? '#fff7ed' : '#eff6ff',
                      border: `1px solid ${gender === 'WOMEN' ? '#fed7aa' : '#bfdbfe'}`,
                      borderRadius: '6px',
                      marginBottom: '2rem',
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'flex-start',
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>{gender === 'WOMEN' ? '👗' : '👔'}</span>
                    <div style={{ fontSize: '0.88rem', lineHeight: 1.6, color: '#334155' }}>
                      <strong style={{ color: '#0f172a' }}>
                        {gender === 'WOMEN'
                          ? 'Women’s Upper Body Tailoring Nuance (Bust Darts & Waist Points):'
                          : 'Men’s Shirt & Suit Tailoring Nuance (Collar Ease & Cuff Exposure):'}
                      </strong>{' '}
                      {gender === 'WOMEN' ? (
                        <>
                          Women’s tailored shirts require 3D contour mapping: measure{' '}
                          <strong>Breast Point</strong> (top of shoulder to bust apex),{' '}
                          <strong>Waist Point</strong> (through apex to natural waist), and{' '}
                          <strong>Front Bust Width</strong> (armpit to armpit). This positions
                          princess darts with zero gaping or fabric stress.
                        </>
                      ) : (
                        <>
                          Dress shirts must allow <strong>two fingers inside the neck tape</strong>{' '}
                          for tie knot comfort without restriction. For pairing with tailored suits,
                          shirt cuffs should extend exactly{' '}
                          <strong>1 cm (0.5") past jacket sleeve end</strong> down to the wrist
                          bone.
                        </>
                      )}
                    </div>
                  </div>

                  {/* Points 1 through 13 Selector */}
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
                      MODERN TAILOR SYSTEM · POINTS 1 THROUGH 13
                    </div>
                    <h3 style={{ fontSize: '1.25rem', color: '#0f172a', margin: '0 0 1rem 0' }}>
                      Step-by-Step Upper Body Measuring Guide (Shirts, Overshirts, Jackets &amp;
                      Suits)
                    </h3>

                    {/* Quick Tabs */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.4rem',
                        marginBottom: '1.5rem',
                      }}
                    >
                      {UPPER_BODY_POINTS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setActiveUpperPointId(p.id)}
                          style={{
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-mono, monospace)',
                            border: '1px solid',
                            borderColor: activeUpperPointId === p.id ? '#0f172a' : '#cbd5e1',
                            borderRadius: '4px',
                            backgroundColor: activeUpperPointId === p.id ? '#0f172a' : '#ffffff',
                            color: activeUpperPointId === p.id ? '#ffffff' : '#475569',
                            cursor: 'pointer',
                            fontWeight: activeUpperPointId === p.id ? 700 : 500,
                            transition: 'all 150ms ease',
                          }}
                        >
                          {p.code}: {p.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>

                    {/* Active Upper Point Detail Card */}
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
                            {activeUpperPoint.code}
                          </span>
                          <h4
                            style={{
                              fontSize: '1.35rem',
                              color: '#0f172a',
                              margin: '0.2rem 0 0 0',
                            }}
                          >
                            {activeUpperPoint.name}
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
                          Typical: {activeUpperPoint.standardRangeInches}
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
                              ? '📏 Laid-Flat Best-Fitting Shirt Method'
                              : '📐 Body Tape Method'}
                          </div>
                          <p
                            style={{
                              color: '#475569',
                              fontSize: '0.88rem',
                              lineHeight: 1.6,
                              margin: 0,
                            }}
                          >
                            {method === 'GARMENT_FLAT'
                              ? activeUpperPoint.garmentFlatDesc
                              : activeUpperPoint.bodyAnatDesc}
                          </p>
                        </div>

                        {/* Suit / Dress Shirt Nuance */}
                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              color: '#0f172a',
                              marginBottom: '0.35rem',
                            }}
                          >
                            {gender === 'WOMEN'
                              ? '♀ Women’s Blouse & Peplum Nuance'
                              : '👔 Suit Jacket & Dress Shirt Nuance'}
                          </div>
                          <p
                            style={{
                              color: '#475569',
                              fontSize: '0.88rem',
                              lineHeight: 1.6,
                              margin: 0,
                            }}
                          >
                            {gender === 'WOMEN'
                              ? activeUpperPoint.womenNuance
                              : activeUpperPoint.suitNuance}
                          </p>
                        </div>

                        {/* Pitfall */}
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
                          <p
                            style={{
                              color: '#475569',
                              fontSize: '0.88rem',
                              lineHeight: 1.6,
                              margin: 0,
                            }}
                          >
                            {activeUpperPoint.commonMistake}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ============================================================== */}
              {/* TAB 3: FIT ALLOWANCE MATRIX & EUROPEAN STANDARD SIZES          */}
              {/* ============================================================== */}
              {garmentCategory === 'EASE_MATRIX' && (
                <>
                  {/* Category Switcher: Trousers vs Shirts */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      marginBottom: '2rem',
                      padding: '0.5rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setEaseMatrixCategory('TROUSERS')}
                      style={{
                        padding: '0.65rem 1.25rem',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 150ms ease',
                        backgroundColor:
                          easeMatrixCategory === 'TROUSERS' ? '#0f172a' : 'transparent',
                        color: easeMatrixCategory === 'TROUSERS' ? '#ffffff' : '#475569',
                        boxShadow:
                          easeMatrixCategory === 'TROUSERS'
                            ? '0 2px 4px rgba(15,23,42,0.1)'
                            : 'none',
                      }}
                    >
                      👖 Trousers &amp; Jeans (Ease Formulas &amp; Standard Sizing Tables)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEaseMatrixCategory('SHIRTS')}
                      style={{
                        padding: '0.65rem 1.25rem',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 150ms ease',
                        backgroundColor:
                          easeMatrixCategory === 'SHIRTS' ? '#0f172a' : 'transparent',
                        color: easeMatrixCategory === 'SHIRTS' ? '#ffffff' : '#475569',
                        boxShadow:
                          easeMatrixCategory === 'SHIRTS' ? '0 2px 4px rgba(15,23,42,0.1)' : 'none',
                      }}
                    >
                      👔 Shirts &amp; Suits (Ease Formulas &amp; European Standard Tables)
                    </button>
                  </div>

                  {easeMatrixCategory === 'TROUSERS' && (
                    <>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono, monospace)',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: '#0284c7',
                          fontWeight: 700,
                          marginBottom: '0.5rem',
                        }}
                      >
                        MODERN TAILOR TROUSERS FIT ALLOWANCE &amp; SIZING MATRIX
                      </div>
                      <h3 style={{ fontSize: '1.35rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                        Body Measurements vs. Finished Trousers &amp; Jeans Ease Allowances
                      </h3>
                      <p
                        style={{
                          color: '#475569',
                          fontSize: '0.9rem',
                          lineHeight: 1.6,
                          margin: '0 0 1.5rem 0',
                        }}
                      >
                        <strong>Note:</strong> When you provide measurements taken directly from
                        your best-fitting pair of trousers laid flat, we cut your pattern{' '}
                        <em>as is</em> without adding extra ease. When you provide{' '}
                        <strong>body tape measurements</strong>, our master tailors automatically
                        add anatomical ease for sitting tolerance, stride clearance, and knee
                        articulation:
                      </p>

                      {/* 4 Trouser Fit & Anatomy Cards */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                          gap: '1.25rem',
                          marginBottom: '2rem',
                        }}
                      >
                        {/* Slim Tapered */}
                        <div
                          style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '1.5rem',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '0.75rem',
                            }}
                          >
                            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.1rem' }}>
                              Slim Tapered Cut
                            </span>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                backgroundColor: '#e0f2fe',
                                color: '#0369a1',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontWeight: 600,
                              }}
                            >
                              +1.0" (+2.5 cm) Thigh Ease
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: '0.86rem',
                              color: '#475569',
                              lineHeight: 1.6,
                              margin: 0,
                            }}
                          >
                            Waistband cut with <strong>+0.5" to +0.75"</strong> comfort tolerance.
                            Thigh follows body profile closely with <strong>+1.0"</strong> total
                            circumference ease. Clean progressive taper to a modern{' '}
                            <strong>7.0"–7.5"</strong> leg opening.
                          </p>
                        </div>

                        {/* Classic Straight 1947 */}
                        <div
                          style={{
                            backgroundColor: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: '8px',
                            padding: '1.5rem',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '0.75rem',
                            }}
                          >
                            <span style={{ fontWeight: 700, color: '#166534', fontSize: '1.1rem' }}>
                              Classic Straight (1947 Heritage)
                            </span>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                backgroundColor: '#dcfce7',
                                color: '#15803d',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontWeight: 600,
                              }}
                            >
                              +1.75" (+4.5 cm) Thigh Ease
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: '0.86rem',
                              color: '#475569',
                              lineHeight: 1.6,
                              margin: 0,
                            }}
                          >
                            Standard mid-to-high rise. We add <strong>+1.75"</strong> thigh ease for
                            unrestricted stride and comfortable sitting posture. Legs fall straight
                            from the knee to a classic <strong>8.0"–8.5"</strong> hem.
                          </p>
                        </div>

                        {/* Relaxed Atelier Wide Leg */}
                        <div
                          style={{
                            backgroundColor: '#fffbeb',
                            border: '1px solid #fde68a',
                            borderRadius: '8px',
                            padding: '1.5rem',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '0.75rem',
                            }}
                          >
                            <span style={{ fontWeight: 700, color: '#92400e', fontSize: '1.1rem' }}>
                              Relaxed Wide Atelier Cut
                            </span>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                backgroundColor: '#fef3c7',
                                color: '#b45309',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontWeight: 600,
                              }}
                            >
                              +2.5" to +3.0" (+6.5 cm) Thigh Ease
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: '0.86rem',
                              color: '#475569',
                              lineHeight: 1.6,
                              margin: 0,
                            }}
                          >
                            Roomy architectural drape. Features <strong>+2.5" to +3.0"</strong>{' '}
                            thigh ease with generous seat volume, relaxed front and back rise, and a
                            wide <strong>9.0"+</strong> hem that cascades naturally over heavy
                            boots.
                          </p>
                        </div>

                        {/* Pelvic & Lordosis Rise Adjustment Card */}
                        <div
                          style={{
                            backgroundColor: '#faf5ff',
                            border: '1px solid #e9d5ff',
                            borderRadius: '8px',
                            padding: '1.5rem',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '0.75rem',
                            }}
                          >
                            <span style={{ fontWeight: 700, color: '#6b21a8', fontSize: '1.1rem' }}>
                              Pelvic Lordosis &amp; Seat Slope
                            </span>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                backgroundColor: '#f3e8ff',
                                color: '#7e22ce',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontWeight: 600,
                              }}
                            >
                              +3.5" to +5.0" Back Rise Slope
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: '0.86rem',
                              color: '#475569',
                              lineHeight: 1.6,
                              margin: 0,
                            }}
                          >
                            Accounts for anatomical gluteal projection and lumbar lordosis. The back
                            rise is drafted <strong>3.5" to 5.0"</strong> longer than the front rise
                            to prevent waist gapping and ensure the waistband stays level when
                            sitting.
                          </p>
                        </div>
                      </div>

                      {/* Live Trouser Fit Simulator Card */}
                      <div
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '1.5rem',
                          marginBottom: '2.5rem',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-mono, monospace)',
                            color: '#64748b',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            marginBottom: '0.5rem',
                          }}
                        >
                          LIVE TROUSERS &amp; JEANS FIT SIMULATOR
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem',
                            alignItems: 'flex-end',
                            marginBottom: '1.25rem',
                          }}
                        >
                          <div>
                            <label
                              style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: '#334155',
                                marginBottom: '0.35rem',
                              }}
                            >
                              Your Body Waist Circumference ({unit === 'INCHES' ? 'Inches' : 'CM'})
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              value={targetWaist}
                              onChange={(e) => setTargetWaist(parseFloat(e.target.value) || 32)}
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #cbd5e1',
                                borderRadius: '4px',
                                fontFamily: 'var(--font-mono, monospace)',
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
                                marginBottom: '0.35rem',
                              }}
                            >
                              Your Body Thigh Circumference ({unit === 'INCHES' ? 'Inches' : 'CM'})
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              value={targetThigh}
                              onChange={(e) => setTargetThigh(parseFloat(e.target.value) || 23)}
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #cbd5e1',
                                borderRadius: '4px',
                                fontFamily: 'var(--font-mono, monospace)',
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
                                marginBottom: '0.35rem',
                              }}
                            >
                              Finished Desired Inseam ({unit === 'INCHES' ? 'Inches' : 'CM'})
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              value={targetInseam}
                              onChange={(e) => setTargetInseam(parseFloat(e.target.value) || 34)}
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #cbd5e1',
                                borderRadius: '4px',
                                fontFamily: 'var(--font-mono, monospace)',
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
                                marginBottom: '0.35rem',
                              }}
                            >
                              Preferred Cut Silhouette
                            </label>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {(['STRAIGHT', 'SLIM', 'RELAXED'] as const).map((sil) => (
                                <button
                                  key={sil}
                                  type="button"
                                  onClick={() => setStandardTrouserSilhouette(sil)}
                                  style={{
                                    flex: 1,
                                    padding: '0.5rem 0.4rem',
                                    border: '1px solid',
                                    borderColor:
                                      standardTrouserSilhouette === sil ? '#0f172a' : '#cbd5e1',
                                    borderRadius: '4px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    backgroundColor:
                                      standardTrouserSilhouette === sil ? '#0f172a' : '#ffffff',
                                    color:
                                      standardTrouserSilhouette === sil ? '#ffffff' : '#475569',
                                  }}
                                >
                                  {sil === 'STRAIGHT'
                                    ? 'Straight'
                                    : sil === 'SLIM'
                                      ? 'Slim'
                                      : 'Relaxed'}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Calculated Trouser Result Cards */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: '0.75rem',
                            backgroundColor: '#ffffff',
                            padding: '1rem',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                              FINISHED WAISTBAND FLAT
                            </div>
                            <div
                              style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: '#0f172a',
                                fontFamily: 'var(--font-mono, monospace)',
                              }}
                            >
                              {Math.round(((targetWaist + 0.75) / 2) * 10) / 10}"
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                              Circ: {targetWaist + 0.75}" (+0.75" ease)
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                              FINISHED THIGH FLAT (PT C)
                            </div>
                            <div
                              style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: '#0369a1',
                                fontFamily: 'var(--font-mono, monospace)',
                              }}
                            >
                              {Math.round(
                                ((targetThigh +
                                  (standardTrouserSilhouette === 'SLIM'
                                    ? 1.0
                                    : standardTrouserSilhouette === 'STRAIGHT'
                                      ? 1.75
                                      : 2.5)) /
                                  2) *
                                  10,
                              ) / 10}
                              "
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                              {standardTrouserSilhouette === 'SLIM'
                                ? '+1.0" Thigh Ease'
                                : standardTrouserSilhouette === 'STRAIGHT'
                                  ? '+1.75" Thigh Ease'
                                  : '+2.5" Thigh Ease'}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                              KNEE WIDTH @ 13" (PT D)
                            </div>
                            <div
                              style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: '#166534',
                                fontFamily: 'var(--font-mono, monospace)',
                              }}
                            >
                              {standardTrouserSilhouette === 'SLIM'
                                ? '8.0"'
                                : standardTrouserSilhouette === 'STRAIGHT'
                                  ? '8.5"'
                                  : '9.25"'}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                              13" below crotch seam
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                              LEG OPENING FLAT (PT E)
                            </div>
                            <div
                              style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: '#b45309',
                                fontFamily: 'var(--font-mono, monospace)',
                              }}
                            >
                              {standardTrouserSilhouette === 'SLIM'
                                ? '7.25"'
                                : standardTrouserSilhouette === 'STRAIGHT'
                                  ? '8.125"'
                                  : '9.0"'}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                              Tailored hem diameter
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                              CUT INSEAM (PT H)
                            </div>
                            <div
                              style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: '#b91c1c',
                                fontFamily: 'var(--font-mono, monospace)',
                              }}
                            >
                              {calculatedCutInseam}"
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                              {isRawLoomstate
                                ? 'Includes +3% loomstate buffer'
                                : 'Sanforized exact'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Standard Finished Trousers & Jeans Table */}
                      <div style={{ marginBottom: '3rem' }}>
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1rem',
                          }}
                        >
                          <div>
                            <h4
                              style={{
                                fontSize: '1.15rem',
                                fontWeight: 700,
                                color: '#0f172a',
                                margin: 0,
                              }}
                            >
                              Standard Finished Jeans &amp; Trousers Sizing Chart (W28 – W40)
                            </h4>
                            <p
                              style={{
                                fontSize: '0.82rem',
                                color: '#64748b',
                                margin: '0.25rem 0 0 0',
                              }}
                            >
                              Finished garment dimensions across all key tailoring points (A–I).
                            </p>
                          </div>

                          {/* Silhouette Toggle */}
                          <div
                            style={{
                              display: 'inline-flex',
                              backgroundColor: '#f1f5f9',
                              padding: '3px',
                              borderRadius: '6px',
                            }}
                          >
                            {(
                              [
                                { id: 'STRAIGHT', label: '1947 Classic Straight' },
                                { id: 'SLIM', label: 'Slim Tapered' },
                                { id: 'RELAXED', label: 'Relaxed Wide Atelier' },
                              ] as const
                            ).map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => setStandardTrouserSilhouette(s.id)}
                                style={{
                                  padding: '0.35rem 0.85rem',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  backgroundColor:
                                    standardTrouserSilhouette === s.id ? '#0f172a' : 'transparent',
                                  color: standardTrouserSilhouette === s.id ? '#ffffff' : '#475569',
                                  transition: 'all 150ms ease',
                                }}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Table */}
                        <div
                          style={{
                            overflowX: 'auto',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                          }}
                        >
                          <table
                            style={{
                              width: '100%',
                              borderCollapse: 'collapse',
                              fontSize: '0.78rem',
                              textAlign: 'left',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <thead>
                              <tr
                                style={{
                                  backgroundColor: '#f8fafc',
                                  borderBottom: '1px solid #e2e8f0',
                                }}
                              >
                                <th
                                  style={{
                                    padding: '0.65rem 0.75rem',
                                    fontWeight: 700,
                                    color: '#0f172a',
                                  }}
                                >
                                  Tag Size
                                </th>
                                <th
                                  style={{
                                    padding: '0.65rem 0.75rem',
                                    fontWeight: 600,
                                    color: '#475569',
                                  }}
                                >
                                  Waist Flat (Pt A)
                                </th>
                                <th
                                  style={{
                                    padding: '0.65rem 0.75rem',
                                    fontWeight: 600,
                                    color: '#475569',
                                  }}
                                >
                                  Waist Circ
                                </th>
                                <th
                                  style={{
                                    padding: '0.65rem 0.75rem',
                                    fontWeight: 600,
                                    color: '#475569',
                                  }}
                                >
                                  Hips Flat (Pt B)
                                </th>
                                <th
                                  style={{
                                    padding: '0.65rem 0.75rem',
                                    fontWeight: 600,
                                    color: '#475569',
                                  }}
                                >
                                  Hips Circ
                                </th>
                                <th
                                  style={{
                                    padding: '0.65rem 0.75rem',
                                    fontWeight: 600,
                                    color: '#475569',
                                  }}
                                >
                                  Thigh (Pt C)
                                </th>
                                <th
                                  style={{
                                    padding: '0.65rem 0.75rem',
                                    fontWeight: 600,
                                    color: '#475569',
                                  }}
                                >
                                  Knee @13" (Pt D)
                                </th>
                                <th
                                  style={{
                                    padding: '0.65rem 0.75rem',
                                    fontWeight: 600,
                                    color: '#475569',
                                  }}
                                >
                                  Leg Opening (Pt E)
                                </th>
                                <th
                                  style={{
                                    padding: '0.65rem 0.75rem',
                                    fontWeight: 600,
                                    color: '#475569',
                                  }}
                                >
                                  Front Rise (Pt F)
                                </th>
                                <th
                                  style={{
                                    padding: '0.65rem 0.75rem',
                                    fontWeight: 600,
                                    color: '#475569',
                                  }}
                                >
                                  Back Rise (Pt G)
                                </th>
                                <th
                                  style={{
                                    padding: '0.65rem 0.75rem',
                                    fontWeight: 600,
                                    color: '#475569',
                                  }}
                                >
                                  Inseam (Pt H)
                                </th>
                                <th
                                  style={{
                                    padding: '0.65rem 0.75rem',
                                    fontWeight: 600,
                                    color: '#475569',
                                  }}
                                >
                                  Outseam (Pt I)
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {(standardTrouserSilhouette === 'STRAIGHT'
                                ? STANDARD_TROUSERS_TABLE_STRAIGHT
                                : standardTrouserSilhouette === 'SLIM'
                                  ? STANDARD_TROUSERS_TABLE_SLIM
                                  : STANDARD_TROUSERS_TABLE_RELAXED
                              ).map((row, idx) => (
                                <tr
                                  key={row.size}
                                  style={{
                                    borderBottom: '1px solid #f1f5f9',
                                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                                  }}
                                >
                                  <td
                                    style={{
                                      padding: '0.55rem 0.75rem',
                                      fontWeight: 700,
                                      color: '#0f172a',
                                    }}
                                  >
                                    {row.size}
                                  </td>
                                  <td
                                    style={{
                                      padding: '0.55rem 0.75rem',
                                      color: '#0369a1',
                                      fontWeight: 600,
                                      fontFamily: 'var(--font-mono, monospace)',
                                    }}
                                  >
                                    {row.waistFlat}
                                  </td>
                                  <td
                                    style={{
                                      padding: '0.55rem 0.75rem',
                                      color: '#334155',
                                      fontFamily: 'var(--font-mono, monospace)',
                                    }}
                                  >
                                    {row.waistCirc}
                                  </td>
                                  <td
                                    style={{
                                      padding: '0.55rem 0.75rem',
                                      color: '#334155',
                                      fontFamily: 'var(--font-mono, monospace)',
                                    }}
                                  >
                                    {row.hipsFlat}
                                  </td>
                                  <td
                                    style={{
                                      padding: '0.55rem 0.75rem',
                                      color: '#334155',
                                      fontFamily: 'var(--font-mono, monospace)',
                                    }}
                                  >
                                    {row.hipsCirc}
                                  </td>
                                  <td
                                    style={{
                                      padding: '0.55rem 0.75rem',
                                      color: '#334155',
                                      fontFamily: 'var(--font-mono, monospace)',
                                    }}
                                  >
                                    {row.thigh}
                                  </td>
                                  <td
                                    style={{
                                      padding: '0.55rem 0.75rem',
                                      color: '#334155',
                                      fontFamily: 'var(--font-mono, monospace)',
                                    }}
                                  >
                                    {row.knee}
                                  </td>
                                  <td
                                    style={{
                                      padding: '0.55rem 0.75rem',
                                      color: '#334155',
                                      fontFamily: 'var(--font-mono, monospace)',
                                    }}
                                  >
                                    {row.legOpening}
                                  </td>
                                  <td
                                    style={{
                                      padding: '0.55rem 0.75rem',
                                      color: '#334155',
                                      fontFamily: 'var(--font-mono, monospace)',
                                    }}
                                  >
                                    {row.frontRise}
                                  </td>
                                  <td
                                    style={{
                                      padding: '0.55rem 0.75rem',
                                      color: '#334155',
                                      fontFamily: 'var(--font-mono, monospace)',
                                    }}
                                  >
                                    {row.backRise}
                                  </td>
                                  <td
                                    style={{
                                      padding: '0.55rem 0.75rem',
                                      color: '#334155',
                                      fontFamily: 'var(--font-mono, monospace)',
                                    }}
                                  >
                                    {row.inseam}
                                  </td>
                                  <td
                                    style={{
                                      padding: '0.55rem 0.75rem',
                                      color: '#334155',
                                      fontFamily: 'var(--font-mono, monospace)',
                                    }}
                                  >
                                    {row.outseam}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}

                  {easeMatrixCategory === 'SHIRTS' && (
                    <>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono, monospace)',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: '#b91c1c',
                          fontWeight: 700,
                          marginBottom: '0.5rem',
                        }}
                      >
                        MODERN TAILOR FIT ALLOWANCE EASE RULES
                      </div>
                      <h3 style={{ fontSize: '1.35rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                        Body Measurements vs. Finished Shirt Ease Allowances
                      </h3>
                      <p
                        style={{
                          color: '#475569',
                          fontSize: '0.9rem',
                          lineHeight: 1.6,
                          margin: '0 0 1.5rem 0',
                        }}
                      >
                        <strong>Note:</strong> When you take measurements directly from your
                        best-fitting shirt laid flat, we take measurements <em>as is</em> without
                        adding extra ease. When you provide <strong>body tape measurements</strong>,
                        our master cutters automatically apply our European ease formulas:
                      </p>

                      {/* 3 Fit Cards Grid */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                          gap: '1.25rem',
                          marginBottom: '2rem',
                        }}
                      >
                        {/* Slim Fit */}
                        <div
                          style={{
                            backgroundColor: '#faf8f4',
                            border: '1px solid #ebe7df',
                            borderRadius: '8px',
                            padding: '1.5rem',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '0.75rem',
                            }}
                          >
                            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.1rem' }}>
                              Slim Fit
                            </span>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                backgroundColor: '#e0f2fe',
                                color: '#0369a1',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontWeight: 600,
                              }}
                            >
                              +12 cm (+4.7") Ease
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: '0.86rem',
                              color: '#475569',
                              lineHeight: 1.6,
                              margin: 0,
                            }}
                          >
                            We add <strong>12 cm (4.7")</strong> to your hip, waist, and chest
                            measurements for clean mobility. Sleeves, collar, and shirt length are
                            tailored exactly to your body measurements.
                          </p>
                        </div>

                        {/* Normal Fit */}
                        <div
                          style={{
                            backgroundColor: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: '8px',
                            padding: '1.5rem',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '0.75rem',
                            }}
                          >
                            <span style={{ fontWeight: 700, color: '#166534', fontSize: '1.1rem' }}>
                              Normal Fit (Classic)
                            </span>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                backgroundColor: '#dcfce7',
                                color: '#15803d',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontWeight: 600,
                              }}
                            >
                              +16 cm (+6.3") Ease
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: '0.86rem',
                              color: '#334155',
                              lineHeight: 1.6,
                              margin: 0,
                            }}
                          >
                            We add <strong>16 cm (6.3")</strong> to chest, waist, and hips. In
                            addition, we add <strong>4 cm (+1.6")</strong> to shoulders (+2 cm on
                            each side), and deduct <strong>2 cm (-0.8")</strong> off each sleeve for
                            relaxed drape.
                          </p>
                        </div>

                        {/* Loose Fit */}
                        <div
                          style={{
                            backgroundColor: '#faf5ff',
                            border: '1px solid #e9d5ff',
                            borderRadius: '8px',
                            padding: '1.5rem',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '0.75rem',
                            }}
                          >
                            <span style={{ fontWeight: 700, color: '#6b21a8', fontSize: '1.1rem' }}>
                              Loose Fit
                            </span>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                backgroundColor: '#f3e8ff',
                                color: '#7e22ce',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontWeight: 600,
                              }}
                            >
                              +20 cm (+7.9") Ease
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: '0.86rem',
                              color: '#475569',
                              lineHeight: 1.6,
                              margin: 0,
                            }}
                          >
                            We add <strong>20 cm (7.9")</strong> to chest, waist, and hips. In
                            addition, we add <strong>8 cm (+3.1")</strong> to shoulders (+4 cm on
                            each side), and deduct <strong>4 cm (-1.6")</strong> off each sleeve for
                            generous drape.
                          </p>
                        </div>
                      </div>

                      {/* Live Fit Simulator Card */}
                      <div
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '1.5rem',
                          marginBottom: '2.5rem',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-mono, monospace)',
                            color: '#64748b',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            marginBottom: '0.5rem',
                          }}
                        >
                          LIVE UPPER BODY FIT SIMULATOR
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem',
                            alignItems: 'flex-end',
                            marginBottom: '1.25rem',
                          }}
                        >
                          <div>
                            <label
                              style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: '#334155',
                                marginBottom: '0.35rem',
                              }}
                            >
                              Your Body Chest ({unit === 'INCHES' ? 'Inches' : 'CM'})
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              value={targetChest}
                              onChange={(e) => setTargetChest(parseFloat(e.target.value) || 40)}
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #cbd5e1',
                                borderRadius: '4px',
                                fontFamily: 'var(--font-mono, monospace)',
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
                                marginBottom: '0.35rem',
                              }}
                            >
                              Target Collar / Neck ({unit === 'INCHES' ? 'Inches' : 'CM'})
                            </label>
                            <input
                              type="number"
                              step="0.25"
                              value={targetCollar}
                              onChange={(e) => setTargetCollar(parseFloat(e.target.value) || 16)}
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #cbd5e1',
                                borderRadius: '4px',
                                fontFamily: 'var(--font-mono, monospace)',
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
                                marginBottom: '0.35rem',
                              }}
                            >
                              Target Sleeve Length
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              value={targetSleeve}
                              onChange={(e) => setTargetSleeve(parseFloat(e.target.value) || 25.5)}
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #cbd5e1',
                                borderRadius: '4px',
                                fontFamily: 'var(--font-mono, monospace)',
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
                                marginBottom: '0.35rem',
                              }}
                            >
                              Preferred Fit Cut
                            </label>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {(['SLIM', 'NORMAL', 'LOOSE'] as const).map((fit) => (
                                <button
                                  key={fit}
                                  type="button"
                                  onClick={() => setTargetShirtFit(fit)}
                                  style={{
                                    flex: 1,
                                    padding: '0.5rem 0.4rem',
                                    border: '1px solid',
                                    borderColor: targetShirtFit === fit ? '#0f172a' : '#cbd5e1',
                                    borderRadius: '4px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    backgroundColor: targetShirtFit === fit ? '#0f172a' : '#ffffff',
                                    color: targetShirtFit === fit ? '#ffffff' : '#475569',
                                  }}
                                >
                                  {fit}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Calculated Output Telemetry */}
                        <div
                          style={{
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            borderRadius: '6px',
                            padding: '1rem 1.5rem',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                            gap: '1rem',
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: '0.7rem',
                                color: '#94a3b8',
                                textTransform: 'uppercase',
                              }}
                            >
                              Finished Shirt Chest
                            </div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#38bdf8' }}>
                              {calculatedShirtChest}"
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              {targetShirtFit === 'SLIM'
                                ? '+4.7" (+12cm)'
                                : targetShirtFit === 'NORMAL'
                                  ? '+6.3" (+16cm)'
                                  : '+7.9" (+20cm)'}{' '}
                              ease
                            </div>
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: '0.7rem',
                                color: '#94a3b8',
                                textTransform: 'uppercase',
                              }}
                            >
                              Shoulder Adjustment
                            </div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#4ade80' }}>
                              {targetShirtFit === 'NORMAL'
                                ? '+1.6"'
                                : targetShirtFit === 'LOOSE'
                                  ? '+3.1"'
                                  : '0"'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              {targetShirtFit === 'NORMAL'
                                ? '+4cm total (+2cm/side)'
                                : targetShirtFit === 'LOOSE'
                                  ? '+8cm total (+4cm/side)'
                                  : 'Exact anatomical'}
                            </div>
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: '0.7rem',
                                color: '#94a3b8',
                                textTransform: 'uppercase',
                              }}
                            >
                              Sleeve Modification
                            </div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f59e0b' }}>
                              {targetShirtFit === 'NORMAL'
                                ? '-0.8"'
                                : targetShirtFit === 'LOOSE'
                                  ? '-1.6"'
                                  : '0"'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              {targetShirtFit === 'NORMAL'
                                ? '-2cm for shoulder drop'
                                : targetShirtFit === 'LOOSE'
                                  ? '-4cm for shoulder drop'
                                  : 'Exact anatomical'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* European Standard Size Reference Tables */}
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem',
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: '0.75rem',
                                fontFamily: 'var(--font-mono, monospace)',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: '#b91c1c',
                                fontWeight: 700,
                              }}
                            >
                              EUROPEAN STANDARD SIZES · FINISHED SHIRT MEASUREMENTS
                            </div>
                            <h4
                              style={{
                                fontSize: '1.15rem',
                                color: '#0f172a',
                                margin: '0.2rem 0 0 0',
                              }}
                            >
                              Standard Finished Shirt Sizing Guide (XS to XXL)
                            </h4>
                          </div>
                          <div
                            style={{
                              display: 'inline-flex',
                              backgroundColor: '#f1f5f9',
                              padding: '3px',
                              borderRadius: '6px',
                            }}
                          >
                            {(['SLIM', 'NORMAL', 'LOOSE'] as const).map((fit) => (
                              <button
                                key={fit}
                                type="button"
                                onClick={() => setStandardTableFit(fit)}
                                style={{
                                  padding: '0.35rem 0.85rem',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  backgroundColor:
                                    standardTableFit === fit ? '#0f172a' : 'transparent',
                                  color: standardTableFit === fit ? '#ffffff' : '#475569',
                                }}
                              >
                                {fit} Table
                              </button>
                            ))}
                          </div>
                        </div>

                        <div
                          style={{
                            overflowX: 'auto',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                          }}
                        >
                          <table
                            style={{
                              width: '100%',
                              borderCollapse: 'collapse',
                              fontSize: '0.82rem',
                              textAlign: 'left',
                            }}
                          >
                            <thead>
                              <tr
                                style={{
                                  backgroundColor: '#f8fafc',
                                  borderBottom: '1px solid #e2e8f0',
                                }}
                              >
                                <th
                                  style={{
                                    padding: '0.6rem 0.75rem',
                                    fontWeight: 700,
                                    color: '#0f172a',
                                  }}
                                >
                                  Size
                                </th>
                                <th
                                  style={{
                                    padding: '0.6rem 0.75rem',
                                    fontWeight: 600,
                                    color: '#475569',
                                  }}
                                >
                                  Collar
                                </th>
                                <th
                                  style={{
                                    padding: '0.6rem 0.75rem',
                                    fontWeight: 600,
                                    color: '#475569',
                                  }}
                                >
                                  Shirt Length
                                </th>
                                <th
                                  style={{
                                    padding: '0.6rem 0.75rem',
                                    fontWeight: 600,
                                    color: '#475569',
                                  }}
                                >
                                  Shoulder
                                </th>
                                <th
                                  style={{
                                    padding: '0.6rem 0.75rem',
                                    fontWeight: 600,
                                    color: '#475569',
                                  }}
                                >
                                  Sleeve (Norm)
                                </th>
                                <th
                                  style={{
                                    padding: '0.6rem 0.75rem',
                                    fontWeight: 600,
                                    color: '#475569',
                                  }}
                                >
                                  Sleeve (Long)
                                </th>
                                <th
                                  style={{
                                    padding: '0.6rem 0.75rem',
                                    fontWeight: 600,
                                    color: '#475569',
                                  }}
                                >
                                  Chest
                                </th>
                                <th
                                  style={{
                                    padding: '0.6rem 0.75rem',
                                    fontWeight: 600,
                                    color: '#475569',
                                  }}
                                >
                                  Waist
                                </th>
                                <th
                                  style={{
                                    padding: '0.6rem 0.75rem',
                                    fontWeight: 600,
                                    color: '#475569',
                                  }}
                                >
                                  Sleeve Width
                                </th>
                                <th
                                  style={{
                                    padding: '0.6rem 0.75rem',
                                    fontWeight: 600,
                                    color: '#475569',
                                  }}
                                >
                                  Cuff
                                </th>
                                <th
                                  style={{
                                    padding: '0.6rem 0.75rem',
                                    fontWeight: 600,
                                    color: '#475569',
                                  }}
                                >
                                  Hip Width
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {(standardTableFit === 'SLIM'
                                ? STANDARD_SHIRT_TABLE_SLIM
                                : standardTableFit === 'NORMAL'
                                  ? STANDARD_SHIRT_TABLE_NORMAL
                                  : STANDARD_SHIRT_TABLE_LOOSE
                              ).map((row, idx) => (
                                <tr
                                  key={row.size}
                                  style={{
                                    borderBottom: '1px solid #f1f5f9',
                                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                                  }}
                                >
                                  <td
                                    style={{
                                      padding: '0.55rem 0.75rem',
                                      fontWeight: 700,
                                      color: '#0f172a',
                                    }}
                                  >
                                    {row.size}
                                  </td>
                                  <td
                                    style={{
                                      padding: '0.55rem 0.75rem',
                                      color: '#334155',
                                      fontFamily: 'var(--font-mono, monospace)',
                                    }}
                                  >
                                    {row.collar}
                                  </td>
                                  <td
                                    style={{
                                      padding: '0.55rem 0.75rem',
                                      color: '#334155',
                                      fontFamily: 'var(--font-mono, monospace)',
                                    }}
                                  >
                                    {row.shirtLength}
                                  </td>
                                  <td
                                    style={{
                                      padding: '0.55rem 0.75rem',
                                      color: '#334155',
                                      fontFamily: 'var(--font-mono, monospace)',
                                    }}
                                  >
                                    {row.shoulderWidth}
                                  </td>
                                  <td
                                    style={{
                                      padding: '0.55rem 0.75rem',
                                      color: '#334155',
                                      fontFamily: 'var(--font-mono, monospace)',
                                    }}
                                  >
                                    {row.sleeveNormal}
                                  </td>
                                  <td
                                    style={{
                                      padding: '0.55rem 0.75rem',
                                      color: '#334155',
                                      fontFamily: 'var(--font-mono, monospace)',
                                    }}
                                  >
                                    {row.sleeveExtraLong}
                                  </td>
                                  <td
                                    style={{
                                      padding: '0.55rem 0.75rem',
                                      color: '#0369a1',
                                      fontWeight: 600,
                                      fontFamily: 'var(--font-mono, monospace)',
                                    }}
                                  >
                                    {row.chest}
                                  </td>
                                  <td
                                    style={{
                                      padding: '0.55rem 0.75rem',
                                      color: '#334155',
                                      fontFamily: 'var(--font-mono, monospace)',
                                    }}
                                  >
                                    {row.waist}
                                  </td>
                                  <td
                                    style={{
                                      padding: '0.55rem 0.75rem',
                                      color: '#334155',
                                      fontFamily: 'var(--font-mono, monospace)',
                                    }}
                                  >
                                    {row.sleeveWidth}
                                  </td>
                                  <td
                                    style={{
                                      padding: '0.55rem 0.75rem',
                                      color: '#334155',
                                      fontFamily: 'var(--font-mono, monospace)',
                                    }}
                                  >
                                    {row.cuff}
                                  </td>
                                  <td
                                    style={{
                                      padding: '0.55rem 0.75rem',
                                      color: '#334155',
                                      fontFamily: 'var(--font-mono, monospace)',
                                    }}
                                  >
                                    {row.hipWidth}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
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
                soak. Enter your desired post-soak finished inseam to see the exact master cut
                length our cutters will apply.
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
          </>
        )}

        {craftMode === 'GARMENT' && (
          <div
            style={{
              padding: '1.5rem',
              backgroundColor: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '8px',
              marginBottom: '3.5rem',
              textAlign: 'center',
              color: '#64748b',
              fontSize: '0.9rem',
            }}
          >
            💍 Jewellery sizing guide is hidden because your craft focus is set to{' '}
            <strong>Garment Only</strong>. Switch above to <em>Jewellery Only</em> or{' '}
            <em>Dual-Craft</em> to access solid 925 ring mandrels and cuff calibration.
          </div>
        )}

        {/* ============================================================== */}
        {/* SOLID 925 JEWELLERY SIZING MANDREL & SHANK COMPENSATOR         */}
        {/* ============================================================== */}
        {(craftMode === 'JEWELLERY' || craftMode === 'DUAL_CRAFT') && (
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
              <div
                style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}
              >
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
        )}

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
              {craftMode === 'GARMENT' && 'Save Denim Tailoring Specs to Atelier Vault'}
              {craftMode === 'JEWELLERY' && 'Save Jewellery Sizing Specs to Atelier Vault'}
              {craftMode === 'DUAL_CRAFT' && 'Save Dual-Craft Specs to Atelier Vault'}
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
              {craftMode === 'GARMENT' &&
                'Your garment tailoring profile (waist, inseam, thigh) is encrypted and automatically auto-filled during bespoke jeans checkout.'}
              {craftMode === 'JEWELLERY' &&
                'Your jewellery profile (ring size, shank compensation, wrist circumference) is encrypted and auto-filled during signet ring and cuff checkout.'}
              {craftMode === 'DUAL_CRAFT' &&
                'Both your garment and jewellery profiles are encrypted and auto-filled across all bespoke atelier commissions.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {craftMode === 'GARMENT' && (
              <>
                <button
                  type="button"
                  onClick={handleCopyGarmentSpec}
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
                  Copy Denim Specs 📋
                </button>
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={handleSaveGarmentToVault}
                    disabled={isSaving}
                    style={{
                      padding: '0.75rem 1.25rem',
                      backgroundColor: '#b91c1c',
                      border: 'none',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      opacity: isSaving ? 0.7 : 1,
                    }}
                  >
                    {isSaving ? 'Saving...' : 'Save Garment to Vault 💾'}
                  </button>
                )}
              </>
            )}

            {craftMode === 'JEWELLERY' && (
              <>
                <button
                  type="button"
                  onClick={handleCopyJewellerySpec}
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
                  Copy Jewellery Specs 📋
                </button>
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={handleSaveJewelleryToVault}
                    disabled={isSaving}
                    style={{
                      padding: '0.75rem 1.25rem',
                      backgroundColor: '#1e40af',
                      border: 'none',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      opacity: isSaving ? 0.7 : 1,
                    }}
                  >
                    {isSaving ? 'Saving...' : 'Save Jewellery to Vault 💾'}
                  </button>
                )}
              </>
            )}

            {craftMode === 'DUAL_CRAFT' && (
              <>
                <button
                  type="button"
                  onClick={handleCopyGarmentSpec}
                  style={{
                    padding: '0.75rem 1.1rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    cursor: 'pointer',
                  }}
                >
                  Copy Denim 🧵
                </button>
                <button
                  type="button"
                  onClick={handleCopyJewellerySpec}
                  style={{
                    padding: '0.75rem 1.1rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    cursor: 'pointer',
                  }}
                >
                  Copy Jewellery 💍
                </button>
                <button
                  type="button"
                  onClick={handleCopyDualSpec}
                  style={{
                    padding: '0.75rem 1.1rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    cursor: 'pointer',
                  }}
                >
                  Copy All 📋
                </button>
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={handleSaveBothToVault}
                    disabled={isSaving}
                    style={{
                      padding: '0.75rem 1.25rem',
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      opacity: isSaving ? 0.7 : 1,
                    }}
                  >
                    {isSaving ? 'Saving...' : 'Save Both to Vault ✨'}
                  </button>
                )}
              </>
            )}

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
