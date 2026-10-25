import { shift } from "../../core/adjust.js";
import { finite, wrapHue } from "../../core/channel.js";
import { HueColor } from "../../core/families/hue.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { GREY_NOISE } from "../../core/hue.js";
import type { Edge } from "../../core/model.js";
import { Srgb } from "../srgb/srgb.js";

// The saturation range / 100 000 (ADR-003).
const ACHROMATIC = 0.00001;

const RAD = Math.PI / 180;

function luma(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Terrillon et al., FG 2000, as Wikipedia "TSL color space" revid 1364394952 restates it: r′ = r − ⅓ and
// g′ = g − ⅓ of the chromaticities, S = √(9/5·(r′² + g′²)), L = Rec. 601 luma, and the atan2 tint
// T = 0.5 − atan2(g′, r′) / 2π, here × 360°. Terrillon's own "T = 0 at g′ = 0" maps r′ > 0 and r′ < 0 to
// one tint, so it can't be inverted; atan2 is the continuous form.
function srgbToTsl(c: Srgb): Tsl {
  const l = luma(c.r, c.g, c.b);
  const sum = c.r + c.g + c.b;
  if (Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b) < GREY_NOISE || Math.abs(sum) < 1e-12) {
    return new Tsl(0, 0, l, c.alpha);
  }
  const r = c.r / sum - 1 / 3;
  const g = c.g / sum - 1 / 3;
  const s = Math.sqrt((9 / 5) * (r * r + g * g));
  return new Tsl(s <= ACHROMATIC ? 0 : 180 - Math.atan2(g, r) / RAD, s, l, c.alpha);
}

// The polar inverse of the atan2 tint (color-space `spaces/tsl.js` @1952e63c): atan2(g′, r′) = 180° − T and
// √(r′² + g′²) = S·√5 / 3, then RGB = k·(r, g, 1 − r − g) with k = L / luma(r, g, 1 − r − g). Wikipedia's
// printed inverse squares the tangent and loses both signs. A zero chromaticity luma is black.
function tslToSrgb(c: Tsl): Srgb {
  const theta = (180 - c.t) * RAD;
  const m = (c.s * Math.sqrt(5)) / 3;
  const r = m * Math.cos(theta) + 1 / 3;
  const g = m * Math.sin(theta) + 1 / 3;
  const b = 1 - r - g;
  const y = luma(r, g, b);
  if (Math.abs(y) < 1e-12) return new Srgb(0, 0, 0, c.alpha);
  const k = c.l / y;
  return new Srgb(k * r, k * g, k * b, c.alpha);
}

/**
 * TSL: tint, saturation, lightness over sRGB (Terrillon et al. 2000), built for skin detection. Tint and
 * saturation are the angle and radius of the chromaticity (r, g) around grey ⅓, ⅓; lightness is Rec. 601
 * luma. `t` is a hue in degrees (Terrillon's turns × 360), `s` and `l` 0–1.
 *
 * Not CSS: there is no `toCss()`; convert first, `tsl.to(Srgb).toCss()`. `toString()` writes
 * `tsl(t s l)`, which only {@link Tsl.parse} reads. `t` wraps into [0, 360) on write.
 *
 * @example
 * ```ts
 * new Srgb(1, 0, 0).to(Tsl);                // t ≈ 206.57, s 1, l 0.299
 * Tsl.parse('tsl(315 0.63 0.114)');
 * ```
 */
export class Tsl extends HueColor {
  static readonly id = "tsl";
  static readonly channels = {
    t: { range: [0, 360], hue: true },
    s: { range: [0, 1], percent: 1 },
    l: { range: [0, 1], percent: 1 },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Srgb, tslToSrgb, srgbToTsl)];
  static readonly terminal = false;

  private _t: number;
  private _s: number;
  private _l: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(t: number, s: number, l: number, alpha = 1) {
    super(alpha);
    this._t = wrapHue(t, "tsl", "t");
    this._s = finite(s, "tsl", "s");
    this._l = finite(l, "tsl", "l");
  }

  get model(): "tsl" {
    return "tsl";
  }

  /** Tint, the chromaticity angle in degrees, wrapped into [0, 360) on write. 0 for greys. */
  get t(): number {
    return this._t;
  }
  set t(value: number) {
    this._t = wrapHue(value, "tsl", "t");
  }

  /** Saturation √(9/5·(r′² + g′²)), 0–1 over sRGB (red and green reach 1). */
  get s(): number {
    return this._s;
  }
  set s(value: number) {
    this._s = finite(value, "tsl", "s");
  }

  /** Lightness, Rec. 601 luma 0.299·R + 0.587·G + 0.114·B: 0 is black, 1 white. */
  get l(): number {
    return this._l;
  }
  set l(value: number) {
    this._l = finite(value, "tsl", "l");
  }

  get coords(): readonly [t: number, s: number, l: number] {
    return [this._t, this._s, this._l];
  }

  /** `true` when saturation is at most 0.00001: the tint is meaningless. */
  override isAchromatic(): boolean {
    return this._s <= ACHROMATIC;
  }

  /** Adds `amount` × the `l` range (0–1) to `l` and returns this color (mutates). Not clamped. */
  lighten(amount: number): this {
    return shift(this, "l", amount);
  }

  /** Subtracts `amount` × the `l` range (0–1) from `l` (mutates). Not clamped. */
  darken(amount: number): this {
    return shift(this, "l", -amount);
  }

  /** Adds `amount` × the `s` reference range (0–1) to `s` (mutates). Not clamped. */
  saturate(amount: number): this {
    return shift(this, "s", amount);
  }

  /** Subtracts `amount` × the `s` reference range (0–1) from `s` (mutates). Not clamped. */
  desaturate(amount: number): this {
    return shift(this, "s", -amount);
  }

  /**
   * Parses `tsl(t s l [/ alpha])`: `t` a number (degrees) or angle, `s` and `l` numbers 0–1 or
   * percentages. Not a CSS syntax.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Tsl {
    const { coords, alpha } = readFunction(input, ["tsl"], Tsl.channels);
    const [t = 0, s = 0, l = 0] = coords;
    return new Tsl(t, s, l, alpha);
  }

  /** `tsl(t s l)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("tsl", Tsl.channels, this.coords, this.alpha, "exact");
  }
}
