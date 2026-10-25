// CSS Color 4 sample code `lin_sRGB`: the extended transfer function, mirrored for negative values so
// out-of-gamut channels survive a round trip.
export function srgbToLinear(v: number): number {
  const abs = Math.abs(v);
  if (abs <= 0.04045) return v / 12.92;
  return Math.sign(v) * Math.pow((abs + 0.055) / 1.055, 2.4);
}

// CSS Color 4 sample code `gam_sRGB`.
export function linearToSrgb(v: number): number {
  const abs = Math.abs(v);
  if (abs > 0.0031308) return Math.sign(v) * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
  return 12.92 * v;
}

// CSS Color 4 sample code `lin_a98rgb` / `gam_a98rgb`: a pure power 563/256, mirrored for negatives.
export function a98ToLinear(v: number): number {
  return Math.sign(v) * Math.pow(Math.abs(v), 563 / 256);
}

export function linearToA98(v: number): number {
  return Math.sign(v) * Math.pow(Math.abs(v), 256 / 563);
}

// CSS Color 4 sample code `lin_ProPhoto` / `gam_ProPhoto`: gamma 1.8 with a linear segment near 0
// (slope 16 up to 16/512 encoded, 1/512 linear), mirrored for negatives.
export function prophotoToLinear(v: number): number {
  const abs = Math.abs(v);
  if (abs <= 16 / 512) return v / 16;
  return Math.sign(v) * Math.pow(abs, 1.8);
}

export function linearToProphoto(v: number): number {
  const abs = Math.abs(v);
  if (abs >= 1 / 512) return Math.sign(v) * Math.pow(abs, 1 / 1.8);
  return 16 * v;
}

// CSS Color 4 sample code `lin_2020` / `gam_2020`: the ITU-R BT.1886 reference EOTF (gamma 2.4, black
// lift 0, gain 1) over the extended range.
export function rec2020ToLinear(v: number): number {
  return Math.sign(v) * Math.pow(Math.abs(v), 2.4);
}

export function linearToRec2020(v: number): number {
  return Math.sign(v) * Math.pow(Math.abs(v), 1 / 2.4);
}

// ITU-R BT.2100-3 Table 4, PQ: m1 = 2610/16384, m2 = 2523/4096 × 128, c1 = 3424/4096, c2 = 2413/4096 × 32,
// c3 = 2392/4096 × 32. Jzazbz swaps m2 for p = 1.7 × 2523/32 (Safdar 2017), hence the exponent parameter.
const PQ_M1 = 2610 / 16384;
export const PQ_M2 = 2523 / 32;
const PQ_C1 = 3424 / 4096;
const PQ_C2 = 2413 / 128;
const PQ_C3 = 2392 / 128;

function pq(y: number, m2: number): number {
  const p = y ** PQ_M1;
  return ((PQ_C1 + PQ_C2 * p) / (1 + PQ_C3 * p)) ** m2;
}

function pqInv(e: number, m2: number): number {
  const r = e ** (1 / m2);
  const d = PQ_C2 - PQ_C3 * r;
  // The encoding approaches (c2 / c3)^m2 as light goes to infinity; past it there is no light to decode.
  if (d <= 0) return Infinity;
  return (Math.max(r - PQ_C1, 0) / d) ** (1 / PQ_M1);
}

/**
 * PQ inverse EOTF of `y` = luminance / 10 000 cd/m². PQ(0) = c1^m2 isn't 0, so negative light mirrors the
 * curve around (0, PQ(0)) instead of around the origin: continuous, increasing, invertible (grill 60).
 */
export function pqEncode(y: number, m2 = PQ_M2): number {
  return y >= 0 ? pq(y, m2) : 2 * pq(0, m2) - pq(-y, m2);
}

/** The inverse of {@link pqEncode}: luminance / 10 000 cd/m². */
export function pqDecode(e: number, m2 = PQ_M2): number {
  const zero = pq(0, m2);
  return e >= zero ? pqInv(e, m2) : -pqInv(2 * zero - e, m2);
}

// ITU-R BT.2100-3 Table 5, HLG OETF, with Note 5c's published b and c. E is scene light in [0, 1]; the
// √ branch is odd, so negatives keep their sign (Note 5h: don't clip).
const HLG_A = 0.17883277;
const HLG_B = 0.28466892;
const HLG_C = 0.55991073;

export function hlgEncode(e: number): number {
  if (e <= 1 / 12) return Math.sign(e) * Math.sqrt(3 * Math.abs(e));
  return HLG_A * Math.log(12 * e - HLG_B) + HLG_C;
}

export function hlgDecode(v: number): number {
  if (v <= 0.5) return (Math.sign(v) * v * v) / 3;
  return (Math.exp((v - HLG_C) / HLG_A) + HLG_B) / 12;
}

// Academy S-2014-003 §4.4.1 Eq. 1 / §4.4.2 Eq. 3 (ACEScc). The spec sends every lin ≤ 0 to the encoding of
// 0 and caps decoding at 65504 (half-float max); here the curve mirrors around (0, ACEScc(0)) like PQ
// (grill 60) and is uncapped, so negative and very bright values round-trip (grill 70).
const ACESCC_ZERO = (-16 + 9.72) / 17.52;

function acesccPositive(lin: number): number {
  if (lin < 2 ** -15) return (Math.log2(2 ** -16 + lin * 0.5) + 9.72) / 17.52;
  return (Math.log2(lin) + 9.72) / 17.52;
}

function acesccPositiveInverse(v: number): number {
  if (v <= (9.72 - 15) / 17.52) return (2 ** (v * 17.52 - 9.72) - 2 ** -16) * 2;
  return 2 ** (v * 17.52 - 9.72);
}

export function linearToAcescc(lin: number): number {
  return lin >= 0 ? acesccPositive(lin) : 2 * ACESCC_ZERO - acesccPositive(-lin);
}

export function acesccToLinear(v: number): number {
  return v >= ACESCC_ZERO ? acesccPositiveInverse(v) : -acesccPositiveInverse(2 * ACESCC_ZERO - v);
}

// Academy S-2016-001 §4.4.1 Eq. 1 / §4.4.2 Eq. 3 (ACEScct), constants as printed (§4.4, decimals only).
// The linear toe already covers lin ≤ 0; the 65504 decode cap is dropped (grill 70).
const ACESCCT_X_BRK = 0.0078125;
const ACESCCT_Y_BRK = 0.155251141552511;
const ACESCCT_A = 10.5402377416545;
const ACESCCT_B = 0.0729055341958355;

export function linearToAcescct(lin: number): number {
  if (lin <= ACESCCT_X_BRK) return ACESCCT_A * lin + ACESCCT_B;
  return (Math.log2(lin) + 9.72) / 17.52;
}

export function acescctToLinear(v: number): number {
  if (v <= ACESCCT_Y_BRK) return (v - ACESCCT_B) / ACESCCT_A;
  return 2 ** (v * 17.52 - 9.72);
}

// SMPTE 170M-2004 §5.1 (OETF) and §5.2 (its inverse, break at V = 0.0812), mirrored for negatives.
export function linearToSmpte170m(lin: number): number {
  const abs = Math.abs(lin);
  if (abs < 0.018) return 4.5 * lin;
  return Math.sign(lin) * (1.099 * abs ** 0.45 - 0.099);
}

export function smpte170mToLinear(v: number): number {
  const abs = Math.abs(v);
  if (abs < 0.0812) return v / 4.5;
  return Math.sign(v) * ((abs + 0.099) / 1.099) ** (1 / 0.45);
}
