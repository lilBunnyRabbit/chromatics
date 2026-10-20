import { shift, ramp, type RampOptions } from "../../core/adjust.js";
import { fromXyz, toXyz } from "../../core/cam.js";
import { finite, wrapHue } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { ACHROMATIC } from "../../core/families/cam.js";
import { HueColor } from "../../core/families/hue.js";
import { lightnessToY, yToLightness } from "../../core/luv.js";
import { D65_WHITE } from "../../core/matrices.js";
import type { Edge } from "../../core/model.js";
import { Cam16 } from "../cam16/cam16.js";
import { Xyz65 } from "../xyz65/xyz65.js";

// HCT (material-color-utilities, Apache-2.0, Copyright 2021 Google LLC; see THIRD_PARTY_NOTICES.md): hue and chroma are CAM16's under
// Material's viewing conditions (Cam16's defaults), tone is CIE L*. Unbounded, as in ColorAide / colorjs
// (grill 62): the inverse solves J for the tone's Y by Newton's method.
function fromXyzColor(c: Xyz65): Hct {
  const t = yToLightness(c.y);
  // Below the grill 45 floor (|Y| < 1e-12) the CAM16 solve loses its precision; hue and chroma are invisible.
  if (Math.abs(c.y) < 1e-12) return new Hct(0, 0, t, c.alpha);
  const { C, M, h } = fromXyz(Cam16.env, c.x, c.y, c.z, ACHROMATIC);
  return new Hct(Math.abs(M) <= ACHROMATIC ? 0 : h, C, t, c.alpha);
}

// colorjs `hct.js` (MIT) `fromHct`: a curve-fit seed for J, then Newton on J with dY/dJ ≈ 2Y/J, iterated to
// convergence. At high chroma Y(J) isn't monotonic: it has a singular stretch where the compressed
// response passes 400, and two J can give the tone. If Newton crosses it, roots are bracketed on a
// log-spaced grid of J (both signs, skipping jumps through the singularity), nearest the seed first,
// bisected, and kept only if they convert back to the same hue and chroma.
function solve(c: number, h: number, y: number, seed: number): [number, number, number] {
  const m = c * Cam16.env.flRoot;
  const at = (j: number) => toXyz(Cam16.env, j, m, h);
  // A root only counts if it converts back to this hue and chroma: imaginary colors (negative J or M) have
  // roots on other branches that reach the tone with a different chroma.
  const fits = (xyz: [number, number, number]) => {
    if (!(Math.abs(xyz[1] - y) <= 1e-12 * Math.abs(y))) return false;
    const back = fromXyz(Cam16.env, ...xyz, ACHROMATIC);
    const d = Math.abs(back.h - h) % 360;
    const arc = (Math.min(d, 360 - d) * Math.PI) / 180;
    return (
      Math.abs(back.C - c) <= 1e-9 * Math.max(1, Math.abs(c)) && arc * Math.abs(c) <= 1e-9 * Math.max(1, Math.abs(c))
    );
  };
  let j = seed;
  for (let i = 0; i < 64; i++) {
    const xyz = at(j);
    const delta = xyz[1] - y;
    if (!(Math.abs(delta) > 1e-15 * Math.abs(y))) {
      if (fits(xyz)) return xyz;
      break;
    }
    if (!Number.isFinite(delta) || xyz[1] === 0) break;
    j -= (delta * j) / (2 * xyz[1]);
  }
  const g = (v: number) => at(v)[1] - y;
  const grid = [0, seed];
  for (let v = 1e-6; v < 1e4; v *= 1.25) grid.push(v, -v);
  grid.sort((p, q) => p - q);
  const values = grid.map(g);
  const brackets: [number, number, number][] = [];
  for (let i = 0; i + 1 < grid.length; i++) {
    const [ga, gb] = [values[i]!, values[i + 1]!];
    if (!Number.isFinite(ga) || !Number.isFinite(gb) || Math.sign(ga) === Math.sign(gb)) continue;
    const mid = g((grid[i]! + grid[i + 1]!) / 2);
    // A pole between the samples shows as a midpoint larger than both ends: no root there.
    if (!(Math.abs(mid) <= Math.max(Math.abs(ga), Math.abs(gb)))) continue;
    brackets.push([grid[i]!, grid[i + 1]!, Math.abs((grid[i]! + grid[i + 1]!) / 2 - seed)]);
  }
  brackets.sort((p, q) => p[2] - q[2]);
  for (const [lo, hi] of brackets) {
    let a = lo;
    let b = hi;
    let ga = g(a);
    for (let i = 0; i < 200; i++) {
      const mid = a + (b - a) / 2;
      if (mid === a || mid === b) break;
      const gm = g(mid);
      if (Math.sign(gm) === Math.sign(ga)) [a, ga] = [mid, gm];
      else b = mid;
    }
    const xyz = at(Math.abs(g(a)) <= Math.abs(g(b)) ? a : b);
    if (fits(xyz)) return xyz;
  }
  throw new RangeError(`hct(${h} ${c} ...): no CAM16 lightness reaches this tone with this hue and chroma`);
}

function toXyzColor(c: Hct): Xyz65 {
  if (Math.abs(c.t) < 1e-12)
    return new Xyz65(...(D65_WHITE.map((v) => v * lightnessToY(c.t)) as [number, number, number]), c.alpha);
  const seed =
    c.t > 0
      ? 0.00379058511492914 * c.t ** 2 + 0.608983189401032 * c.t + 0.9155088574762233
      : 9.514440756550361e-6 * c.t ** 2 + 0.08693057439788597 * c.t - 21.928975842194614;
  return new Xyz65(...solve(c.c, c.h, lightnessToY(c.t), seed), c.alpha);
}

/**
 * HCT (Material Design 3): hue `h` and chroma `c` from {@link Cam16} under Material's viewing conditions,
 * tone `t` = CIE L* (0–100). Chroma's reference range is 0–145.
 *
 * Unbounded (grill 62): any h / c / t is stored as given, including colors outside sRGB, and converts
 * back through XYZ. Material's own `Hct` snaps to the nearest 8-bit sRGB color; for that,
 * `hct.to(Srgb).gamutMap()`. Not CSS: there is no `toCss()`.
 *
 * @example
 * ```ts
 * const brand = new Srgb(0.2, 0.4, 0.9).to(Hct);
 * brand.t = 90;                                  // a light tone of the same hue and chroma
 * brand.to(Srgb).gamutMap().to(Srgb8).toHex();
 * ```
 */
export class Hct extends HueColor {
  static readonly id = "hct";
  static readonly channels = {
    h: { range: [0, 360], hue: true },
    c: { range: [0, 145] },
    t: { range: [0, 100] },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Xyz65, toXyzColor, fromXyzColor)];
  static readonly terminal = false;

  private _h: number;
  private _c: number;
  private _t: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(h: number, c: number, t: number, alpha = 1) {
    super(alpha);
    this._h = wrapHue(h, "hct");
    this._c = finite(c, "hct", "c");
    this._t = finite(t, "hct", "t");
  }

  get model(): "hct" {
    return "hct";
  }

  /** CAM16 hue angle in degrees, wrapped into [0, 360) on write. 0 for greys. */
  get h(): number {
    return this._h;
  }
  set h(value: number) {
    this._h = wrapHue(value, "hct");
  }

  /** CAM16 chroma C: 0 is grey; reference range 0–145. */
  get c(): number {
    return this._c;
  }
  set c(value: number) {
    this._c = finite(value, "hct", "c");
  }

  /** Tone: CIE L*, 0 black to 100 white. */
  get t(): number {
    return this._t;
  }
  set t(value: number) {
    this._t = finite(value, "hct", "t");
  }

  get coords(): readonly [h: number, c: number, t: number] {
    return [this._h, this._c, this._t];
  }

  /** `true` when the CAM16 colorfulness c · F_L^¼ is at most 0.00105 (Cam16's threshold). */
  override isAchromatic(): boolean {
    return this._c * Cam16.env.flRoot <= ACHROMATIC;
  }

  /** Adds `amount` × the `t` range (0–100) to the tone and returns this color (mutates). Not clamped. */
  lighten(amount: number): this {
    return shift(this, "t", amount);
  }

  /** Subtracts `amount` × the `t` range (0–100) from the tone (mutates). Not clamped. */
  darken(amount: number): this {
    return shift(this, "t", -amount);
  }

  /** Adds `amount` × the `c` reference range (0–145) to `c` (mutates). Not clamped. */
  saturate(amount: number): this {
    return shift(this, "c", amount);
  }

  /** Subtracts `amount` × the `c` reference range (0–145) from `c` (mutates). Not clamped. */
  desaturate(amount: number): this {
    return shift(this, "c", -amount);
  }

  /**
   * `n` new colors with this one's hue and chroma and tones evenly spaced from `from` to `to` (fractions
   * of 0–100, default 0.05–0.95): a Material-style tonal palette before gamut mapping.
   *
   * @throws {RangeError} when `n` isn't an integer ≥ 2.
   */
  ramp(n: number, options: RampOptions = {}): this[] {
    return ramp(this, "t", n, options);
  }

  /**
   * Parses `hct(h c t [/ alpha])`: hue in degrees or angle units, `c` and `t` as numbers. Not CSS.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Hct {
    const { coords, alpha } = readFunction(input, ["hct"], Hct.channels);
    const [h = 0, c = 0, t = 0] = coords;
    return new Hct(h, c, t, alpha);
  }

  /** `hct(h c t)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("hct", Hct.channels, this.coords, this.alpha, "exact");
  }
}
