import { finite, wrapHue } from "../../core/channel.js";
import { Color } from "../../core/color.js";
import { readHueFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { rgbToHue } from "../../core/hue.js";
import type { Edge } from "../../core/model.js";
import { Hsl } from "../hsl/hsl.js";
import { Srgb } from "../srgb/srgb.js";

// Same rule as Hsl: saturation range / 100 000 (ADR-003).
const ACHROMATIC = 0.00001;

// Smith, "Color Gamut Transform Pairs", SIGGRAPH 1978 (hexcone model). Formula as written in Wikipedia
// "HSL and HSV" §"HSV to RGB alternative", revision 1378989624: the primary paper isn't freely
// available, so the reference vectors are the source of truth here.
function hsvToSrgb(c: Hsv): Srgb {
  const f = (n: number) => {
    const k = (n + c.h / 60) % 6;
    return c.v - c.v * c.s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return new Srgb(f(5), f(3), f(1), c.alpha);
}

function srgbToHsv(c: Srgb): Hsv {
  const max = Math.max(c.r, c.g, c.b);
  const min = Math.min(c.r, c.g, c.b);
  const s = max === 0 ? 0 : (max - min) / max;
  return new Hsv(s <= ACHROMATIC ? 0 : rgbToHue(c.r, c.g, c.b), s, max, c.alpha);
}

// Wikipedia "HSL and HSV" §"Interconversion", revision 1378989624.
function hsvToHsl(c: Hsv): Hsl {
  const l = c.v * (1 - c.s / 2);
  const s = l === 0 || l === 1 ? 0 : (c.v - l) / Math.min(l, 1 - l);
  return new Hsl(c.h, s, l, c.alpha);
}

function hslToHsv(c: Hsl): Hsv {
  const v = c.l + c.s * Math.min(c.l, 1 - c.l);
  const s = v === 0 ? 0 : 2 * (1 - c.l / v);
  return new Hsv(c.h, s, v, c.alpha);
}

/**
 * HSV (also called HSB): hue, saturation, value over sRGB (Smith 1978). The model of most color
 * pickers' square. `s` and `v` are 0–1 fractions.
 *
 * Not CSS: there is no `toCss()`; convert first, `hsv.to(Srgb).toCss()`. `toString()` writes
 * `hsv(h s% v%)`, which only {@link Hsv.parse} reads. `h` wraps into [0, 360) on write.
 *
 * @example
 * ```ts
 * new Hsv(30, 1, 1).to(Srgb);               // r 1, g 0.5, b 0
 * Hsv.parse('hsv(30 100% 100%)');
 * ```
 */
export class Hsv extends Color {
  static readonly id = "hsv";
  static readonly channels = {
    h: { range: [0, 360], hue: true },
    s: { range: [0, 1], percent: 1 },
    v: { range: [0, 1], percent: 1 },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Srgb, hsvToSrgb, srgbToHsv), edge(Hsl, hsvToHsl, hslToHsv)];
  static readonly terminal = false;

  private _h: number;
  private _s: number;
  private _v: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(h: number, s: number, v: number, alpha = 1) {
    super(alpha);
    this._h = wrapHue(h, "hsv");
    this._s = finite(s, "hsv", "s");
    this._v = finite(v, "hsv", "v");
  }

  get model(): "hsv" {
    return "hsv";
  }

  /** Hue angle in degrees, wrapped into [0, 360) on write. 0 for greys. */
  get h(): number {
    return this._h;
  }
  set h(value: number) {
    this._h = wrapHue(value, "hsv");
  }

  /** Saturation, 0–1 (not 0–100). */
  get s(): number {
    return this._s;
  }
  set s(value: number) {
    this._s = finite(value, "hsv", "s");
  }

  /** Value (brightness): 0 is black, 1 the brightest color of this hue and saturation. */
  get v(): number {
    return this._v;
  }
  set v(value: number) {
    this._v = finite(value, "hsv", "v");
  }

  get coords(): readonly [h: number, s: number, v: number] {
    return [this._h, this._s, this._v];
  }

  /** `true` when saturation is at most 0.00001: the hue is meaningless. */
  isAchromatic(): boolean {
    return this._s <= ACHROMATIC;
  }

  /**
   * Parses `hsv(h s v [/ alpha])` in the same shape as modern `hsl()`: `s` and `v` take percentages or
   * 0–100 numbers. Not a CSS syntax.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Hsv {
    const { coords, alpha } = readHueFunction(input, ["hsv"], Hsv.channels);
    const [h = 0, s = 0, v = 0] = coords;
    return new Hsv(h, s, v, alpha);
  }

  /** `hsv(h s% v%)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("hsv", Hsv.channels, this.coords, this.alpha, "exact", ["s", "v"]);
  }
}
