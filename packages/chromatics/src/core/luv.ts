// CIE 015:2018 §8.2.2.1 eqs. 8.26–8.30, u′ v′ from eq. 8.1. Its (24/116)³ and 116 · 841/108 are
// these rationals, as in CSS Color 4 `XYZ_to_Lab`.
const EPSILON = 216 / 24389;
const KAPPA = 24389 / 27;

export type White = readonly [x: number, y: number, z: number];

export function chromaticity(x: number, y: number, z: number): [u: number, v: number] | undefined {
  const d = x + 15 * y + 3 * z;
  return d === 0 ? undefined : [(4 * x) / d, (9 * y) / d];
}

/** Relative luminance Y / Yn for a CIE lightness L*: the inverse of eqs. 8.26–8.28. */
export function lightnessToY(l: number): number {
  return l > KAPPA * EPSILON ? ((l + 16) / 116) ** 3 : l / KAPPA;
}

export function xyzToLuv(x: number, y: number, z: number, white: White): [l: number, u: number, v: number] {
  const [un, vn] = chromaticity(...white)!;
  const t = y / white[1];
  const l = t > EPSILON ? 116 * Math.cbrt(t) - 16 : KAPPA * t;
  // No chromaticity at X + 15Y + 3Z = 0: u* = v* = 0 is the limit along the grey axis.
  const uv = chromaticity(x, y, z);
  if (uv === undefined) return [l, 0, 0];
  return [l, 13 * l * (uv[0] - un), 13 * l * (uv[1] - vn)];
}

// The CIE gives only the forward direction; this inverts it. L* = 0 is black whatever u* v* say.
// Below the junction Y = L*·Yn/κ, so Y·u′ is folded into (Yn/κ)·(un·L* + u*/13): nothing divides a
// tiny L* into an overflowing u′ or multiplies it out to 0.
export function luvToXyz(l: number, u: number, v: number, white: White): [x: number, y: number, z: number] {
  if (l === 0) return [0, 0, 0];
  const [un, vn] = chromaticity(...white)!;
  const up = un + u / (13 * l);
  // v′ = 0 exactly means the true v′ (Y far below X or Z) was under half an ulp of vn on the way in. Any
  // v′ that small gives back the same u* v*, so the smallest one keeps the result finite.
  const vp = vn + v / (13 * l) || vn * 2 ** -56;
  if (l > KAPPA * EPSILON) {
    const y = ((l + 16) / 116) ** 3 * white[1];
    return [(9 * y * up) / (4 * vp), y, (y * (12 - 3 * up - 20 * vp)) / (4 * vp)];
  }
  const k = white[1] / KAPPA;
  const lu = un * l + u / 13;
  const lv = vn * l + v / 13;
  return [(9 * k * lu) / (4 * vp), k * l, (k * (12 * l - 3 * lu - 20 * lv)) / (4 * vp)];
}
