import { shift } from "../../core/adjust.js";
import { finite, wrapHue } from "../../core/channel.js";
import { HueColor } from "../../core/families/hue.js";
import { readHueFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { GREY_NOISE, rgbToHue } from "../../core/hue.js";
import type { Edge } from "../../core/model.js";
import { Srgb } from "../srgb/srgb.js";

// The saturation range / 100 000 (ADR-003).
const ACHROMATIC = 0.00001;

// Finley, "HSP Color Model — Alternative to HSV (HSB) and HSL" (2006), `#define Pr .299 / Pg .587 / Pb .114`.
// The page's samples and its "2.037,0,0" example come from his earlier .241 / .691 / .068 weights.
const PR = 0.299;
const PG = 0.587;
const PB = 0.114;

// Finley `RGBtoHSP`: P = √(Pr·R² + Pg·G² + Pb·B²); hue and saturation "work the same way as in the HSV/B
// and HSL systems", here in degrees.
function srgbToHsp(c: Srgb): Hsp {
  const max = Math.max(c.r, c.g, c.b);
  const min = Math.min(c.r, c.g, c.b);
  const p = Math.sqrt(PR * c.r * c.r + PG * c.g * c.g + PB * c.b * c.b);
  if (max - min < GREY_NOISE) return new Hsp(0, 0, p, c.alpha);
  const s = max === 0 ? 0 : (max - min) / max;
  return new Hsp(s <= ACHROMATIC ? 0 : rgbToHue(c.r, c.g, c.b), s, p, c.alpha);
}

// Finley `HSPtoRGB`, its two branches in one: per hue sector, min = m·max and mid = min + f·(max − min)
// with m = 1 − S, so P² = max²·(w_max + w_mid·(m + f(1 − m))² + w_min·m²). Finley divides by m instead and
// takes S ≥ 1 as S = 1; this form never divides by m, so S > 1 (a negative min) extrapolates (ADR-003).
function hspToSrgb(c: Hsp): Srgb {
  const h = c.h / 60;
  const sector = Math.floor(h);
  const m = 1 - c.s;
  const f = sector % 2 === 0 ? h - sector : sector + 1 - h;
  const mid = m + f * (1 - m);
  const [wMax, wMid, wMin] =
    sector === 0
      ? [PR, PG, PB]
      : sector === 1
        ? [PG, PR, PB]
        : sector === 2
          ? [PG, PB, PR]
          : sector === 3
            ? [PB, PG, PR]
            : sector === 4
              ? [PB, PR, PG]
              : [PR, PB, PG];
  const top = c.p / Math.sqrt(wMax + wMid * mid * mid + wMin * m * m);
  const [hi, md, lo] = [top, top * mid, top * m];
  const [r, g, b] =
    sector === 0
      ? [hi, md, lo]
      : sector === 1
        ? [md, hi, lo]
        : sector === 2
          ? [lo, hi, md]
          : sector === 3
            ? [lo, md, hi]
            : sector === 4
              ? [md, lo, hi]
              : [hi, lo, md];
  return new Srgb(r, g, b, c.alpha);
}

/**
 * HSP: hue, saturation, perceived brightness over sRGB (Finley 2006). Hue and saturation are HSV's; `p`
 * is √(0.299·R² + 0.587·G² + 0.114·B²), Rec. 601's luma weights under a square root. `s` and `p` are 0–1
 * fractions; Finley's hue in turns is degrees here.
 *
 * Not CSS: there is no `toCss()`; convert first, `hsp.to(Srgb).toCss()`. `toString()` writes
 * `hsp(h s% p%)`, which only {@link Hsp.parse} reads. `h` wraps into [0, 360) on write. In-range
 * channels can leave sRGB: `new Hsp(0, 1, 1)` is r 1.83.
 *
 * Squaring loses the sign, so sRGB with a negative channel doesn't come back from HSP.
 *
 * @example
 * ```ts
 * new Hsp(0, 0, 0.5).to(Srgb);              // r g b 0.5
 * Hsp.parse('hsp(30 100% 60%)');
 * ```
 */
export class Hsp extends HueColor {
  static readonly id = "hsp";
  static readonly channels = {
    h: { range: [0, 360], hue: true },
    s: { range: [0, 1], percent: 1 },
    p: { range: [0, 1], percent: 1 },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Srgb, hspToSrgb, srgbToHsp)];
  static readonly terminal = false;

  private _h: number;
  private _s: number;
  private _p: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(h: number, s: number, p: number, alpha = 1) {
    super(alpha);
    this._h = wrapHue(h, "hsp");
    this._s = finite(s, "hsp", "s");
    this._p = finite(p, "hsp", "p");
  }

  get model(): "hsp" {
    return "hsp";
  }

  /** Hue angle in degrees, wrapped into [0, 360) on write. 0 for greys. */
  get h(): number {
    return this._h;
  }
  set h(value: number) {
    this._h = wrapHue(value, "hsp");
  }

  /** Saturation (max − min) / max, as HSV, 0–1 (not 0–100). */
  get s(): number {
    return this._s;
  }
  set s(value: number) {
    this._s = finite(value, "hsp", "s");
  }

  /** Perceived brightness √(0.299·R² + 0.587·G² + 0.114·B²): 0 is black, 1 white. */
  get p(): number {
    return this._p;
  }
  set p(value: number) {
    this._p = finite(value, "hsp", "p");
  }

  get coords(): readonly [h: number, s: number, p: number] {
    return [this._h, this._s, this._p];
  }

  /** `true` when saturation is at most 0.00001: the hue is meaningless. */
  override isAchromatic(): boolean {
    return this._s <= ACHROMATIC;
  }

  /** Adds `amount` × the `p` range (0–1) to `p` and returns this color (mutates). Not clamped. */
  lighten(amount: number): this {
    return shift(this, "p", amount);
  }

  /** Subtracts `amount` × the `p` range (0–1) from `p` (mutates). Not clamped. */
  darken(amount: number): this {
    return shift(this, "p", -amount);
  }

  /** Adds `amount` × the `s` reference range (0–1) to `s` (mutates). Not clamped. */
  saturate(amount: number): this {
    return shift(this, "s", amount);
  }

  /** Subtracts `amount` × the `s` reference range (0–1) from `s` (mutates). Not clamped: below 0 is stored as is. */
  desaturate(amount: number): this {
    return shift(this, "s", -amount);
  }

  /**
   * Parses `hsp(h s p [/ alpha])` in the same shape as modern `hsl()`: `s` and `p` take percentages or
   * 0–100 numbers. Not a CSS syntax.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Hsp {
    const { coords, alpha } = readHueFunction(input, ["hsp"], Hsp.channels);
    const [h = 0, s = 0, p = 0] = coords;
    return new Hsp(h, s, p, alpha);
  }

  /** `hsp(h s% p%)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("hsp", Hsp.channels, this.coords, this.alpha, "exact", ["s", "p"]);
  }
}
