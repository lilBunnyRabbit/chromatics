// CIECAM02 (CIE 159:2004) and CAM16 (Li et al. 2017, Color Res. Appl. 42(6)): both papers are paywalled, so
// the equations follow material-color-utilities `cam16.ts` / `viewing_conditions.ts` (Apache-2.0, see
// THIRD_PARTY_NOTICES.md), checked against colour-science `ciecam02.py` / `cam16.py` @ 248121e3. The two
// models differ only in the adaptation matrix and the space the compression runs in (ADR-012).
import { lightnessToY } from "./luv.js";
import { multiply, type Matrix } from "./linear.js";
import { CAT02, CAT02_INVERSE, CAT02_TO_HPE, CAT16, CAT16_INVERSE, D65_WHITE, HPE_TO_CAT02 } from "./matrices.js";

export type Surround = "average" | "dim" | "dark";

/** Viewing conditions for an appearance model. Every field defaults to Material's (ADR-012). */
export interface ViewingConditions {
  /** Adopted white as relative XYZ (Y = 1). Default: D65. */
  readonly white?: readonly [x: number, y: number, z: number];
  /** Adapting field luminance L_A in cd/m². Default: 200/π · Y(L* 50) / 100 ≈ 11.72. */
  readonly adaptingLuminance?: number;
  /** Background relative luminance Y_b, 0–100. Default: Y(L* 50) ≈ 18.42. */
  readonly backgroundLuminance?: number;
  /** Default: `"average"`. */
  readonly surround?: Surround;
  /** `true` sets the degree of adaptation D to 1 (illuminant fully discounted). Default: `false`. */
  readonly discounting?: boolean;
}

// CIE 159:2004 Table 1 (as in colour-science `VIEWING_CONDITIONS_CIECAM02` and colorjs `surroundMap`): F, c, N_c.
const SURROUNDS: Readonly<Record<Surround, readonly [number, number, number]>> = {
  average: [1, 0.69, 1],
  dim: [0.9, 0.59, 0.9],
  dark: [0.8, 0.525, 0.8],
};

export interface Environment {
  readonly cat: Matrix;
  readonly catInverse: Matrix;
  readonly post: Matrix | undefined;
  readonly postInverse: Matrix | undefined;
  readonly rgbD: readonly [number, number, number];
  readonly fl: number;
  readonly flRoot: number;
  readonly n: number;
  readonly z: number;
  readonly nbb: number;
  readonly c: number;
  readonly nc: number;
  readonly aw: number;
}

export type CamKind = "cam16" | "ciecam02";

function spow(x: number, p: number): number {
  return Math.sign(x) * Math.abs(x) ** p;
}

// Post-adaptation compression. The papers add 0.1 to each response and subtract 0.305 from A; both cancel
// in every correlate, so neither is applied (MCU's form).
function compress(x: number, fl: number): number {
  const f = (fl * Math.abs(x)) / 100;
  const p = f ** 0.42;
  return (Math.sign(x) * 400 * p) / (p + 27.13);
}

function expand(x: number, fl: number): number {
  const a = Math.abs(x);
  // The compression approaches 400 as light goes to infinity; past it there is no light to recover.
  if (a >= 400) return Math.sign(x) * Infinity;
  return Math.sign(x) * (100 / fl) * ((27.13 * a) / (400 - a)) ** (1 / 0.42);
}

export function environment(kind: CamKind, input: ViewingConditions = {}): Environment {
  const [cat, catInverse] = kind === "cam16" ? [CAT16, CAT16_INVERSE] : [CAT02, CAT02_INVERSE];
  const [post, postInverse] = kind === "cam16" ? [undefined, undefined] : [CAT02_TO_HPE, HPE_TO_CAT02];
  const white = (input.white ?? D65_WHITE).map((v) => v * 100) as [number, number, number];
  const yb = input.backgroundLuminance ?? lightnessToY(50) * 100;
  const la = input.adaptingLuminance ?? ((200 / Math.PI) * lightnessToY(50) * 100) / 100;
  const [f, c, nc] = SURROUNDS[input.surround ?? "average"];
  const rgbW = multiply(cat, ...white);
  // CIE 159 eq. (degree of adaptation), clamped to [0, 1] as MCU and colour-science do.
  const d = input.discounting ? 1 : Math.min(1, Math.max(0, f * (1 - (1 / 3.6) * Math.exp((-la - 42) / 92))));
  const rgbD = rgbW.map((v) => (d * white[1]) / v + 1 - d) as [number, number, number];
  const k = 1 / (5 * la + 1);
  const k4 = k ** 4;
  const fl = k4 * la + 0.1 * (1 - k4) ** 2 * Math.cbrt(5 * la);
  const n = yb / white[1];
  const nbb = 0.725 / n ** 0.2;
  const cw = rgbW.map((v, i) => v * rgbD[i]!) as [number, number, number];
  const pw = post ? multiply(post, ...cw) : cw;
  const [ra, ga, ba] = pw.map((v) => compress(v, fl)) as [number, number, number];
  return {
    cat,
    catInverse,
    post,
    postInverse,
    rgbD,
    fl,
    flRoot: fl ** 0.25,
    n,
    z: 1.48 + Math.sqrt(n),
    nbb,
    c,
    nc,
    aw: (2 * ra + ga + 0.05 * ba) * nbb,
  };
}

export interface Appearance {
  readonly J: number;
  readonly C: number;
  readonly M: number;
  readonly h: number;
}

const RAD = Math.PI / 180;

function eccentricity(h: number): number {
  const hp = h < 20.14 ? h + 360 : h;
  return 0.25 * (Math.cos(hp * RAD + 2) + 3.8);
}

/** Relative XYZ (Y = 1 for the white) → J, C, M, h under `env`. */
export function fromXyz(env: Environment, x: number, y: number, z: number, achromatic: number): Appearance {
  const rgb = multiply(env.cat, x * 100, y * 100, z * 100).map((v, i) => v * env.rgbD[i]!) as [number, number, number];
  const p = env.post ? multiply(env.post, ...rgb) : rgb;
  const [ra, ga, ba] = p.map((v) => compress(v, env.fl)) as [number, number, number];
  const a = (11 * ra - 12 * ga + ba) / 11;
  const b = (ra + ga - 2 * ba) / 9;
  const u = (20 * ra + 20 * ga + 21 * ba) / 20;
  const p2 = (40 * ra + 20 * ga + ba) / 20;
  const J = 100 * spow((p2 * env.nbb) / env.aw, env.c * env.z);
  const t = ((50000 / 13) * eccentricity(hueOf(a, b)) * env.nc * env.nbb * Math.hypot(a, b)) / (u + 0.305);
  const alpha = spow(t, 0.9) * (1.64 - 0.29 ** env.n) ** 0.73;
  const C = alpha * spow(J / 100, 0.5);
  const M = C * env.flRoot;
  return { J, C, M, h: Math.abs(M) <= achromatic ? 0 : hueOf(a, b) };
}

function hueOf(a: number, b: number): number {
  const h = Math.atan2(b, a) / RAD;
  return h < 0 ? h + 360 : h;
}

/** J, M, h → relative XYZ under `env` (MCU `xyzInViewingConditions`, closed form). */
export function toXyz(env: Environment, J: number, M: number, h: number): [number, number, number] {
  // Below the grill 45 floor J is black: C / √(J / 100) would divide by an underflowed 0.
  if (Math.abs(J) < 1e-12) return [0, 0, 0];
  const C = M / env.flRoot;
  const alpha = C / spow(J / 100, 0.5);
  const t = spow(alpha / (1.64 - 0.29 ** env.n) ** 0.73, 1 / 0.9);
  const rad = h * RAD;
  const ac = env.aw * spow(J / 100, 1 / (env.c * env.z));
  const p1 = eccentricity(h) * (50000 / 13) * env.nc * env.nbb;
  const p2 = ac / env.nbb;
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);
  const gamma = (23 * (p2 + 0.305) * t) / (23 * p1 + 11 * t * cos + 108 * t * sin);
  const a = gamma * cos;
  const b = gamma * sin;
  const ra = (460 * p2 + 451 * a + 288 * b) / 1403;
  const ga = (460 * p2 - 891 * a - 261 * b) / 1403;
  const ba = (460 * p2 - 220 * a - 6300 * b) / 1403;
  const p = [ra, ga, ba].map((v) => expand(v, env.fl)) as [number, number, number];
  const rgb = (env.postInverse ? multiply(env.postInverse, ...p) : p).map((v, i) => v / env.rgbD[i]!) as [
    number,
    number,
    number,
  ];
  return multiply(env.catInverse, ...rgb).map((v) => v / 100) as [number, number, number];
}

/** Brightness Q (CIE 159). */
export function brightness(env: Environment, J: number): number {
  return (4 / env.c) * spow(J / 100, 0.5) * (env.aw + 4) * env.flRoot;
}

// Hue quadrature as colour-science `hue_quadrature` (@ 248121e3) writes it from the CIE 159:2004 table. Its
// blue → red interval is split at 360° (H 385.9 there), which reproduces Fairchild's worked CIECAM02 values
// (H 399.6 at h 19.56, 305.8 at h 248.9); the textbook single-interval form misses them by ~0.3.
const HUES = [20.14, 90, 164.25, 237.53] as const;
const ECC = [0.8, 0.7, 1, 1.2] as const;

/** Hue quadrature H, 0–400 (red 0 / 400, yellow 100, green 200, blue 300). */
export function quadrature(h: number): number {
  if (h < HUES[0]) return 385.9 + (14.1 * h) / 0.856 / (h / 0.856 + (HUES[0] - h) / ECC[0]);
  if (h >= HUES[3]) {
    const t = (h - HUES[3]) / ECC[3];
    return 300 + (85.9 * t) / (t + (360 - h) / 0.856);
  }
  const i = h < HUES[1] ? 0 : h < HUES[2] ? 1 : 2;
  const t1 = (h - HUES[i]!) / ECC[i]!;
  const t2 = (HUES[i + 1]! - h) / ECC[i + 1]!;
  return 100 * i + (100 * t1) / (t1 + t2);
}
