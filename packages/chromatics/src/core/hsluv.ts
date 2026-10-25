// HSLuv / HPLuv: the sRGB gamut as six lines in the L* slice of CIELUV (hsluv/hsluv, MIT, Copyright (c)
// 2012-2026 Alexei Boronine, (c) 2016 Florian Dormont; see THIRD_PARTY_NOTICES.md). The lines are
// derived here in closed form from our exact Luv65 and sRGB matrix, not from the reference's Maxima
// constants, which expand its truncated D65 u′v′ (ADR-011).
import { chromaticity, lightnessToY } from "./luv.js";
import { D65_WHITE, XYZ_D65_TO_LINEAR_SRGB } from "./matrices.js";

const [UN, VN] = chromaticity(...D65_WHITE)!;

// At L* 0 and 100 the sRGB slice is a point, so every s / p names black or white. The reference's
// cut-offs (1e-8, 99.9999999) set the band; beyond it, out-of-range L* keeps its geometry (ADR-003).
const DARK = 1e-8;
const LIGHT = 1e-7;

export function singular(l: number): 0 | 100 | undefined {
  if (Math.abs(l) < DARK) return 0;
  if (Math.abs(l - 100) < LIGHT) return 100;
  return undefined;
}

/**
 * Each line A·u* + B·v* + K = 0 is a linear sRGB channel at 0 or 1. With X = 9Y·u′/(4v′) and
 * Z = Y·(12 − 3u′ − 20v′)/(4v′), the channel row m·XYZ = t times 4v′ is linear in u′, v′; then
 * u′ = u* / (13·L*) + u′n and v′ = v* / (13·L*) + v′n.
 */
function lines(l: number): [a: number, b: number, k: number][] {
  const y = lightnessToY(l) * D65_WHITE[1];
  const out: [number, number, number][] = [];
  for (const [m1, m2, m3] of XYZ_D65_TO_LINEAR_SRGB) {
    for (const t of [0, 1]) {
      const a = y * (9 * m1 - 3 * m3);
      const b = y * (4 * m2 - 20 * m3) - 4 * t;
      const c = 12 * m3 * y;
      out.push([a, b, 13 * l * (a * UN + b * VN + c)]);
    }
  }
  return out;
}

/** The largest Lchuv65 chroma inside sRGB at lightness `l` (0–100) and hue `h` (degrees). */
export function maxChromaForHue(l: number, h: number): number {
  const rad = (h * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  let min = Infinity;
  for (const [a, b, k] of lines(l)) {
    const d = -k / (a * cos + b * sin);
    if (d >= 0 && d < min) min = d;
  }
  return min;
}

/** The radius of the largest hue circle inside sRGB at lightness `l` (0–100): HPLuv's 100 %. */
export function maxChroma(l: number): number {
  let min = Infinity;
  for (const [a, b, k] of lines(l)) min = Math.min(min, Math.abs(k) / Math.hypot(a, b));
  return min;
}
