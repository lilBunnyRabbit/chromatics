import { shift, ramp, type RampOptions } from "../../core/adjust.js";
import { finite } from "../../core/channel.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import { readFunction, serialize, type CssOptions } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { D50_WHITE } from "../../core/matrices.js";
import type { Edge } from "../../core/model.js";
import { clamp } from "../../core/polar.js";
import { Xyz50 } from "../xyz50/xyz50.js";

// CSS Color 4 sample code `XYZ_to_Lab`: "from CIE standard, which now defines these as a rational fraction".
const EPSILON = 216 / 24389;
const KAPPA = 24389 / 27;
const [WX, WY, WZ] = D50_WHITE;

const POW25_7 = 25 ** 7;
const RAD = Math.PI / 180;

function hueDeg(b: number, a: number): number {
  if (a === 0 && b === 0) return 0;
  const h = Math.atan2(b, a) / RAD;
  return h < 0 ? h + 360 : h;
}

// CIEDE2000 (CIE 142-2001) in the form of Sharma, Wu & Dalal (2005), including their notes on the
// hue mean and difference when a chroma is 0.
function deltaE2000(x: Lab, y: Lab): number {
  const c1 = Math.hypot(x.a, x.b);
  const c2 = Math.hypot(y.a, y.b);
  const cBar7 = ((c1 + c2) / 2) ** 7;
  const g = 0.5 * (1 - Math.sqrt(cBar7 / (cBar7 + POW25_7)));
  const a1 = (1 + g) * x.a;
  const a2 = (1 + g) * y.a;
  const c1p = Math.hypot(a1, x.b);
  const c2p = Math.hypot(a2, y.b);
  const h1p = hueDeg(x.b, a1);
  const h2p = hueDeg(y.b, a2);
  const dL = y.l - x.l;
  const dC = c2p - c1p;
  let dh = 0;
  if (c1p * c2p !== 0) {
    dh = h2p - h1p;
    if (dh > 180) dh -= 360;
    else if (dh < -180) dh += 360;
  }
  const dH = 2 * Math.sqrt(c1p * c2p) * Math.sin((dh / 2) * RAD);
  const lBar = (x.l + y.l) / 2;
  const cBarP = (c1p + c2p) / 2;
  let hBar = h1p + h2p;
  if (c1p * c2p !== 0) {
    if (Math.abs(h1p - h2p) <= 180) hBar /= 2;
    else hBar = hBar < 360 ? (hBar + 360) / 2 : (hBar - 360) / 2;
  }
  const t =
    1 -
    0.17 * Math.cos((hBar - 30) * RAD) +
    0.24 * Math.cos(2 * hBar * RAD) +
    0.32 * Math.cos((3 * hBar + 6) * RAD) -
    0.2 * Math.cos((4 * hBar - 63) * RAD);
  const dTheta = 30 * Math.exp(-(((hBar - 275) / 25) ** 2));
  const cBarP7 = cBarP ** 7;
  const rC = 2 * Math.sqrt(cBarP7 / (cBarP7 + POW25_7));
  const l50 = (lBar - 50) ** 2;
  const sL = 1 + (0.015 * l50) / Math.sqrt(20 + l50);
  const sC = 1 + 0.045 * cBarP;
  const sH = 1 + 0.015 * cBarP * t;
  const rT = -Math.sin(2 * dTheta * RAD) * rC;
  const l = dL / sL;
  const c = dC / sC;
  const h = dH / sH;
  return Math.sqrt(l * l + c * c + h * h + rT * c * h);
}

function f(v: number): number {
  return v > EPSILON ? Math.cbrt(v) : (KAPPA * v + 16) / 116;
}

function xyzToLab(c: Xyz50): Lab {
  const fx = f(c.x / WX);
  const fy = f(c.y / WY);
  const fz = f(c.z / WZ);
  return new Lab(116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz), c.alpha);
}

// CSS Color 4 sample code `Lab_to_XYZ`.
function labToXyz(c: Lab): Xyz50 {
  const fy = (c.l + 16) / 116;
  const fx = c.a / 500 + fy;
  const fz = fy - c.b / 200;
  const x = fx ** 3 > EPSILON ? fx ** 3 : (116 * fx - 16) / KAPPA;
  const y = c.l > KAPPA * EPSILON ? fy ** 3 : c.l / KAPPA;
  const z = fz ** 3 > EPSILON ? fz ** 3 : (116 * fz - 16) / KAPPA;
  return new Xyz50(x * WX, y * WY, z * WZ, c.alpha);
}

/**
 * CIE L\*a\*b\* (CIE 1976) relative to D50, as CSS Color 4 defines `lab()`. Lightness `l` 0–100,
 * `a` green(−)/red(+) and `b` blue(−)/yellow(+), CSS reference range ±125. The space of ΔE 2000.
 *
 * For perceptual work prefer {@link Oklab}. Unbounded; nothing clamps
 * except at parse time.
 *
 * @example
 * ```ts
 * Lab.parse('lab(52.2 40 59.2)');
 * Lab.parse('lab(52% 32% 47%)');          // percentages: l of 100, a / b of 125
 * ```
 */
export class Lab extends RectangularColor {
  static readonly id = "lab";
  static readonly channels = {
    l: { range: [0, 100], percent: 100 },
    a: { range: [-125, 125], percent: 125 },
    b: { range: [-125, 125], percent: 125 },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Xyz50, labToXyz, xyzToLab)];
  static readonly terminal = false;

  private _l: number;
  private _a: number;
  private _b: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(l: number, a: number, b: number, alpha = 1) {
    super(alpha);
    this._l = finite(l, "lab", "l");
    this._a = finite(a, "lab", "a");
    this._b = finite(b, "lab", "b");
  }

  get model(): "lab" {
    return "lab";
  }

  /** CIE lightness L\*, 0 (black) to 100 (diffuse white). Not 0–1. */
  get l(): number {
    return this._l;
  }
  set l(value: number) {
    this._l = finite(value, "lab", "l");
  }

  /** Green (−) to red (+); CSS reference range ±125. */
  get a(): number {
    return this._a;
  }
  set a(value: number) {
    this._a = finite(value, "lab", "a");
  }

  /** Blue (−) to yellow (+); CSS reference range ±125. */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "lab", "b");
  }

  get coords(): readonly [l: number, a: number, b: number] {
    return [this._l, this._a, this._b];
  }

  /** Adds `amount` × the `l` range (0–100) to `l` and returns this color (mutates). Not clamped. */
  lighten(amount: number): this {
    return shift(this, "l", amount);
  }

  /** Subtracts `amount` × the `l` range (0–100) from `l` (mutates). Not clamped. */
  darken(amount: number): this {
    return shift(this, "l", -amount);
  }

  /**
   * `n` new colors with this one's other channels and `l` evenly spaced from `from` to `to` (fractions
   * of the range, default 0.05–0.95). Steps are raw: map each for display, `c.to(Srgb).gamutMap()`.
   *
   * @throws {RangeError} when `n` isn't an integer ≥ 2.
   */
  ramp(n: number, options: RampOptions = {}): this[] {
    return ramp(this, "l", n, options);
  }

  /** CIE ΔE*ab (1976): the Euclidean distance to `other` in Lab. Prefer {@link deltaE2000}, which corrects Lab's non-uniformity. */
  deltaE76(other: Lab): number {
    return Math.hypot(this._l - other._l, this._a - other._a, this._b - other._b);
  }

  /**
   * CIEDE2000 color difference to `other`, with kL = kC = kH = 1 (CIE 142-2001; implemented after Sharma,
   * Wu & Dalal 2005 and checked against their 34 published test pairs). Symmetric.
   *
   * @example
   * ```ts
   * a.to(Lab).deltaE2000(b.to(Lab)); // CSS Color 4 takes 2 as one just-noticeable difference
   * ```
   */
  deltaE2000(other: Lab): number {
    return deltaE2000(this, other);
  }

  /**
   * Parses `lab(l a b [/ alpha])`. Percentages: `l` of 100, `a` / `b` of 125. As in CSS, `l` clamps to
   * 0–100 at parse time.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Lab {
    const { coords, alpha } = readFunction(input, ["lab"], Lab.channels);
    const [l = 0, a = 0, b = 0] = coords;
    // CSS Color 4 #specifying-lab-lch: L below 0% / above 100% clamps at parsed-value time.
    return new Lab(clamp(l, 0, 100), a, b, alpha);
  }

  /** `lab(l a b)`, shortest exact numbers. */
  override toString(): string {
    return serialize("lab", Lab.channels, this.coords, this.alpha, "exact");
  }

  /** `lab(l a b)`, rounded per {@link CssOptions}. */
  toCss(options: CssOptions = {}): string {
    return serialize("lab", Lab.channels, this.coords, this.alpha, options);
  }
}
