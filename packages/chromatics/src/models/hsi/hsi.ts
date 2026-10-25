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

// Wikipedia "HSL and HSV" oldid 1378989624 §"Hue and chroma" (the hexagonal hue, as in Hsv), §"Lightness"
// (I = (R + G + B) / 3) and §"Saturation" (S_I = 1 − m / I). Gonzalez & Woods's circular arccos hue is
// not used: see ADR-015.
function srgbToHsi(c: Srgb): Hsi {
  const max = Math.max(c.r, c.g, c.b);
  const min = Math.min(c.r, c.g, c.b);
  const i = (c.r + c.g + c.b) / 3;
  if (max - min < GREY_NOISE) return new Hsi(0, 0, i, c.alpha);
  const s = i === 0 ? 0 : 1 - min / i;
  return new Hsi(s <= ACHROMATIC ? 0 : rgbToHue(c.r, c.g, c.b), s, i, c.alpha);
}

// Wikipedia "HSL and HSV" oldid 1378989624 §"HSI to RGB".
function hsiToSrgb(c: Hsi): Srgb {
  const h = c.h / 60;
  const z = 1 - Math.abs((h % 2) - 1);
  const chroma = (3 * c.i * c.s) / (1 + z);
  const x = chroma * z;
  const m = c.i * (1 - c.s);
  const sector = Math.floor(h);
  const [r, g, b] =
    sector === 0
      ? [chroma, x, 0]
      : sector === 1
        ? [x, chroma, 0]
        : sector === 2
          ? [0, chroma, x]
          : sector === 3
            ? [0, x, chroma]
            : sector === 4
              ? [x, 0, chroma]
              : [chroma, 0, x];
  return new Srgb(r + m, g + m, b + m, c.alpha);
}

/**
 * HSI: hue, saturation, intensity over sRGB (Kender 1976; Gonzalez & Woods). Intensity is the plain
 * channel mean (R + G + B) / 3, and saturation is 1 − min / I, so a pure primary has I = 1/3. `s` and `i`
 * are 0–1 fractions. The hue is the hexagonal one HSV and HSL use.
 *
 * Not CSS: there is no `toCss()`; convert first, `hsi.to(Srgb).toCss()`. `toString()` writes
 * `hsi(h s% i%)`, which only {@link Hsi.parse} reads. `h` wraps into [0, 360) on write. In-range
 * channels can leave sRGB: `new Hsi(0, 1, 0.5)` is r 1.5.
 *
 * @example
 * ```ts
 * new Hsi(0, 1, 1 / 3).to(Srgb);            // r 1, g 0, b 0
 * Hsi.parse('hsi(0 100% 33.3%)');
 * ```
 */
export class Hsi extends HueColor {
  static readonly id = "hsi";
  static readonly channels = {
    h: { range: [0, 360], hue: true },
    s: { range: [0, 1], percent: 1 },
    i: { range: [0, 1], percent: 1 },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Srgb, hsiToSrgb, srgbToHsi)];
  static readonly terminal = false;

  private _h: number;
  private _s: number;
  private _i: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(h: number, s: number, i: number, alpha = 1) {
    super(alpha);
    this._h = wrapHue(h, "hsi");
    this._s = finite(s, "hsi", "s");
    this._i = finite(i, "hsi", "i");
  }

  get model(): "hsi" {
    return "hsi";
  }

  /** Hue angle in degrees, wrapped into [0, 360) on write. 0 for greys. */
  get h(): number {
    return this._h;
  }
  set h(value: number) {
    this._h = wrapHue(value, "hsi");
  }

  /** Saturation 1 − min / I, 0–1 (not 0–100). */
  get s(): number {
    return this._s;
  }
  set s(value: number) {
    this._s = finite(value, "hsi", "s");
  }

  /** Intensity, the mean of the sRGB channels: 0 is black, 1 white. */
  get i(): number {
    return this._i;
  }
  set i(value: number) {
    this._i = finite(value, "hsi", "i");
  }

  get coords(): readonly [h: number, s: number, i: number] {
    return [this._h, this._s, this._i];
  }

  /** `true` when saturation is at most 0.00001: the hue is meaningless. */
  override isAchromatic(): boolean {
    return this._s <= ACHROMATIC;
  }

  /** Adds `amount` × the `i` range (0–1) to `i` and returns this color (mutates). Not clamped. */
  lighten(amount: number): this {
    return shift(this, "i", amount);
  }

  /** Subtracts `amount` × the `i` range (0–1) from `i` (mutates). Not clamped. */
  darken(amount: number): this {
    return shift(this, "i", -amount);
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
   * Parses `hsi(h s i [/ alpha])` in the same shape as modern `hsl()`: `s` and `i` take percentages or
   * 0–100 numbers. Not a CSS syntax.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Hsi {
    const { coords, alpha } = readHueFunction(input, ["hsi"], Hsi.channels);
    const [h = 0, s = 0, i = 0] = coords;
    return new Hsi(h, s, i, alpha);
  }

  /** `hsi(h s% i%)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("hsi", Hsi.channels, this.coords, this.alpha, "exact", ["s", "i"]);
  }
}
