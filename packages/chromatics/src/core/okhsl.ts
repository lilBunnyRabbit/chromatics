// Okhsl / Okhsv: Björn Ottosson, "A perceptual color picker: Okhsv and Okhsl" (2021-09-08) and
// "sRGB gamut clipping" (2021-01-25), ported from ok_color.h (MIT, Copyright (c) 2021 Björn Ottosson;
// see THIRD_PARTY_NOTICES.md). His fitted polynomials are kept as published; the exact steps (Halley
// refinements, cusp scaling) use this package's Oklab matrices, so the shape follows our Oklab (ADR-011).
import { LMS_TO_XYZ, OKLAB_TO_LMS } from "../models/oklab/oklab.js";
import { XYZ_D65_TO_LINEAR_SRGB } from "./matrices.js";

type Row = readonly [number, number, number];

function row(r: Row): Row {
  const [m, n] = [LMS_TO_XYZ, r];
  return [0, 1, 2].map((j) => n[0] * m[0][j]! + n[1] * m[1][j]! + n[2] * m[2][j]!) as unknown as Row;
}

const LMS_TO_RGB: readonly [Row, Row, Row] = [
  row(XYZ_D65_TO_LINEAR_SRGB[0]),
  row(XYZ_D65_TO_LINEAR_SRGB[1]),
  row(XYZ_D65_TO_LINEAR_SRGB[2]),
];

// Within 1e-12 of black or white (the grill 45 floor) the gamut shape underflows; chroma there is
// invisible, so it's dropped and L kept.
const FLOOR = 1e-12;

export function shapeless(l: number): boolean {
  return l < FLOOR || 1 - l < FLOOR;
}

// ok_color.h `toe`: k1 = 0.206, k2 = 0.03, k3 = (1 + k1) / (1 + k2).
const K1 = 0.206;
const K2 = 0.03;
const K3 = (1 + K1) / (1 + K2);

// For d < 0 (x below k1/k3) d + √D cancels; (d + √D)(√D − d) = 4·k2·k3·x gives the same value stably.
export function toe(x: number): number {
  const d = K3 * x - K1;
  const root = Math.sqrt(d * d + 4 * K2 * K3 * x);
  return d >= 0 ? 0.5 * (d + root) : (2 * K2 * K3 * x) / (root - d);
}

export function toeInv(x: number): number {
  return (x * x + K1 * x) / (K3 * (x + K2));
}

interface Lc {
  readonly l: number;
  readonly c: number;
}

// LMS′ = OKLAB_TO_LMS · (L, C·a′, C·b′); `k` is its derivative in C.
function lmsPrime(l: number, c: number, a: number, b: number): [number, number, number] {
  return OKLAB_TO_LMS.map((r) => r[0] * l + c * (r[1] * a + r[2] * b)) as [number, number, number];
}

function slopes(a: number, b: number): [number, number, number] {
  return OKLAB_TO_LMS.map((r) => r[1] * a + r[2] * b) as [number, number, number];
}

function toRgb(l: number, c: number, a: number, b: number): [number, number, number] {
  const [x, y, z] = lmsPrime(l, c, a, b).map((v) => v * v * v) as [number, number, number];
  return LMS_TO_RGB.map((r) => r[0] * x + r[1] * y + r[2] * z) as [number, number, number];
}

// ok_color.h `compute_max_saturation`: the S = C / L at which a channel first reaches 0 at L = 1.
// Ottosson's fitted polynomials pick the channel and the first guess. His one Halley step is iterated to
// convergence ("otherwise do two/three steps"): on our matrices one step leaves sRGB red's Okhsv s at
// 0.99952, and a 0.001° hue sweep shows the selector then always picks the channel that leaves first.
const STEPS = 8;

function halley(w: Row, k: readonly number[], a: number, b: number, start: number): number {
  let s = start;
  for (let i = 0; i < STEPS; i++) {
    const p = lmsPrime(1, s, a, b);
    let f = 0;
    let f1 = 0;
    let f2 = 0;
    for (let j = 0; j < 3; j++) {
      f += w[j]! * p[j]! ** 3;
      f1 += w[j]! * 3 * k[j]! * p[j]! ** 2;
      f2 += w[j]! * 6 * k[j]! ** 2 * p[j]!;
    }
    const step = (f * f1) / (f1 * f1 - 0.5 * f * f2);
    s -= step;
    if (!(Math.abs(step) > 1e-15 * Math.abs(s))) break;
  }
  return s;
}

function maxSaturation(a: number, b: number): number {
  let k0: number, k1: number, k2: number, k3: number, k4: number, channel: 0 | 1 | 2;
  if (-1.88170328 * a - 0.80936493 * b > 1) {
    [k0, k1, k2, k3, k4, channel] = [1.19086277, 1.76576728, 0.59662641, 0.75515197, 0.56771245, 0];
  } else if (1.81444104 * a - 1.19445276 * b > 1) {
    [k0, k1, k2, k3, k4, channel] = [0.73956515, -0.45954404, 0.08285427, 0.1254107, 0.14503204, 1];
  } else {
    [k0, k1, k2, k3, k4, channel] = [1.35733652, -0.00915799, -1.1513021, -0.50559606, 0.00692167, 2];
  }
  return halley(LMS_TO_RGB[channel]!, slopes(a, b), a, b, k0 + k1 * a + k2 * b + k3 * a * a + k4 * a * b);
}

// ok_color.h `find_cusp`: the most chromatic sRGB color at hue (a′, b′).
export function cusp(a: number, b: number): Lc {
  const s = maxSaturation(a, b);
  const l = Math.cbrt(1 / Math.max(...toRgb(1, s, a, b)));
  return { l, c: l * s };
}

// ok_color.h `find_gamut_intersection`: t where L = L0·(1 − t) + t·L1, C = t·C1 meets the sRGB boundary.
function gamutIntersection(a: number, b: number, l1: number, c1: number, l0: number, top: Lc): number {
  if ((l1 - l0) * top.c - (top.l - l0) * c1 <= 0) {
    return (top.c * l0) / (c1 * top.l + top.c * (l0 - l1));
  }
  let t = (top.c * (l0 - 1)) / (c1 * (top.l - 1) + top.c * (l0 - l1));
  const k = slopes(a, b);
  const dl = l1 - l0;
  const dt = k.map((v, i) => dl * OKLAB_TO_LMS[i]![0] + c1 * v);
  // ok_color.h: "If higher accuracy is required, 2 or 3 iterations of the following block can be used".
  for (let i = 0; i < STEPS; i++) {
    const p = lmsPrime(l0 * (1 - t) + t * l1, t * c1, a, b);
    const lms = p.map((v) => v ** 3);
    const d1 = p.map((v, j) => 3 * dt[j]! * v * v);
    const d2 = p.map((v, j) => 6 * dt[j]! ** 2 * v);
    let step = Infinity;
    for (const w of LMS_TO_RGB) {
      const f = w[0] * lms[0]! + w[1] * lms[1]! + w[2] * lms[2]! - 1;
      const f1 = w[0] * d1[0]! + w[1] * d1[1]! + w[2] * d1[2]!;
      const f2 = w[0] * d2[0]! + w[1] * d2[1]! + w[2] * d2[2]!;
      const u = f1 / (f1 * f1 - 0.5 * f * f2);
      if (u >= 0) step = Math.min(step, -f * u);
    }
    if (step === Infinity) break;
    t += step;
    if (!(Math.abs(step) > 1e-15 * Math.abs(t))) break;
  }
  return t;
}

// ok_color.h `get_ST_mid`: Ottosson's fitted approximation of the cusp's S and T.
function stMid(a: number, b: number): [s: number, t: number] {
  const s =
    0.11516993 +
    1 /
      (7.4477897 +
        4.1590124 * b +
        a *
          (-2.19557347 +
            1.75198401 * b +
            a * (-2.13704948 - 10.02301043 * b + a * (-4.24894561 + 5.38770819 * b + 4.69891013 * a))));
  const t =
    0.11239642 +
    1 /
      (1.6132032 -
        0.68124379 * b +
        a *
          (0.40370612 +
            0.90148123 * b +
            a * (-0.27087943 + 0.6122399 * b + a * (0.00299215 - 0.45399568 * b - 0.14661872 * a))));
  return [s, t];
}

// Ottosson's soft minimum (x⁻ⁿ + y⁻ⁿ)^(−1/n), written as x · (1 + (x/y)ⁿ)^(−1/n) so tiny L doesn't overflow.
function softMin(x: number, y: number, n: number): number {
  const [lo, hi] = x <= y ? [x, y] : [y, x];
  return lo * (1 + (lo / hi) ** n) ** (-1 / n);
}

// ok_color.h `get_Cs`: the chroma at s = 0 (C0), at s = 0.8 (Cmid) and at the gamut edge (Cmax).
export function chromas(l: number, a: number, b: number): [c0: number, mid: number, max: number] {
  const top = cusp(a, b);
  const max = gamutIntersection(a, b, l, 1, l, top);
  const k = max / Math.min(l * (top.c / top.l), (1 - l) * (top.c / (1 - top.l)));
  const [sm, tm] = stMid(a, b);
  const mid = 0.9 * k * softMin(l * sm, (1 - l) * tm, 4);
  const c0 = softMin(l * 0.4, (1 - l) * 0.8, 2);
  return [c0, mid, max];
}

// ok_color.h `okhsv_to_srgb` / `srgb_to_okhsv`: the cusp-scaling step, shared by both directions.
export function scaleL(lvt: number, cvt: number, a: number, b: number): number {
  return Math.cbrt(1 / Math.max(...toRgb(lvt, cvt, a, b), 0));
}
