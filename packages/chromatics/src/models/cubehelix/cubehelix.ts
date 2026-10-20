import { shift } from "../../core/adjust.js";
import { finite, wrapHue } from "../../core/channel.js";
import { HueColor } from "../../core/families/hue.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { GREY_NOISE } from "../../core/hue.js";
import type { Edge } from "../../core/model.js";
import { Srgb } from "../srgb/srgb.js";

// The largest s inside sRGB, at blue and yellow: coloraide `coloraide/spaces/cubehelix.py:43` `MAX_SAT`
// @4888fc2d, which d3-color 3.1.0 reproduces to the last digit.
const MAX_S = 4.614386868039719;

// The s range / 100 000 (ADR-003).
const ACHROMATIC = MAX_S / 100000;

// Green, "A colour scheme for the display of astronomical intensity images", Bull. Astr. Soc. India 39
// (2011) 289, eq. 2, with the constants of its Appendix A Fortran (`CUBHLX`). Eq. 2 prints the blue row as
// +1.97249; the Fortran's +1.97294 is the one that keeps the deviation at constant eq. 1 luma.
const A = -0.14861;
const B = 1.78277;
const C = -0.29227;
const D = -0.90649;
const E = 1.97294;

const RAD = Math.PI / 180;

// d3-color 3.1.0 `src/cubehelix.js` `rgb()`: Green's eq. 2 read as a space, with l = λ^γ, φ = h + 120° and
// amplitude s·l·(1 − l), s being Green's "hue" parameter / 2.
function cubehelixToSrgb(c: Cubehelix): Srgb {
  const h = (c.h + 120) * RAD;
  const a = c.s * c.l * (1 - c.l);
  const cos = Math.cos(h);
  const sin = Math.sin(h);
  return new Srgb(c.l + a * (A * cos + B * sin), c.l + a * (C * cos + D * sin), c.l + a * (E * cos), c.alpha);
}

// d3-color 3.1.0 `src/cubehelix.js` `cubehelixConvert`, the closed-form inverse of eq. 2 (Green gives
// none). At l(1 − l) below the grill 45 floor s divides by zero (black, white), so it is 0.
function srgbToCubehelix(c: Srgb): Cubehelix {
  const max = Math.max(c.r, c.g, c.b);
  const min = Math.min(c.r, c.g, c.b);
  const l = (B * C - D * A) * c.b + E * D * c.r - E * B * c.g;
  const lightness = l / (B * C - D * A + E * D - E * B);
  if (max - min < GREY_NOISE) return new Cubehelix(0, 0, lightness, c.alpha);
  const spread = lightness * (1 - lightness);
  if (Math.abs(spread) < 1e-12) return new Cubehelix(0, 0, lightness, c.alpha);
  const bl = c.b - lightness;
  const k = (E * (c.g - lightness) - C * bl) / D;
  const s = Math.sqrt(k * k + bl * bl) / (E * spread);
  return new Cubehelix(Math.abs(s) <= ACHROMATIC ? 0 : Math.atan2(k, bl) / RAD - 120, s, lightness, c.alpha);
}

/**
 * Cubehelix: Green's 2011 helix through the RGB cube, read as a hue, saturation, lightness space by
 * d3-color (Bostock & Davies). `l` is close to luma 0.30·R + 0.59·G + 0.11·B, `h` turns the deviation
 * around the grey axis at constant `l`, and `s` scales it by l·(1 − l). Over sRGB, `s` reaches
 * 4.614386868039719 (blue, yellow); there is no fixed upper bound.
 *
 * Green's colormap (start, rotations, γ) is a line through this space: h = 120·start − 120 + 360·rot·λ,
 * s = hue / 2, l = λ^γ.
 *
 * Not CSS: there is no `toCss()`; convert first, `cubehelix.to(Srgb).toCss()`. `toString()` writes
 * `cubehelix(h s l)`, which only {@link Cubehelix.parse} reads. `h` wraps into [0, 360) on write.
 *
 * @example
 * ```ts
 * new Cubehelix(300, 0.5, 0.5).to(Srgb);
 * Cubehelix.parse('cubehelix(300 0.5 50%)');
 * ```
 */
export class Cubehelix extends HueColor {
  static readonly id = "cubehelix";
  static readonly channels = {
    h: { range: [0, 360], hue: true },
    s: { range: [0, MAX_S] },
    l: { range: [0, 1], percent: 1 },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Srgb, cubehelixToSrgb, srgbToCubehelix)];
  static readonly terminal = false;

  private _h: number;
  private _s: number;
  private _l: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(h: number, s: number, l: number, alpha = 1) {
    super(alpha);
    this._h = wrapHue(h, "cubehelix");
    this._s = finite(s, "cubehelix", "s");
    this._l = finite(l, "cubehelix", "l");
  }

  get model(): "cubehelix" {
    return "cubehelix";
  }

  /** Hue angle in degrees, wrapped into [0, 360) on write. 0 for greys. */
  get h(): number {
    return this._h;
  }
  set h(value: number) {
    this._h = wrapHue(value, "cubehelix");
  }

  /** Saturation: the deviation from grey divided by l·(1 − l); 0 to about 4.6144 over sRGB. */
  get s(): number {
    return this._s;
  }
  set s(value: number) {
    this._s = finite(value, "cubehelix", "s");
  }

  /** Lightness: 0 is black, 1 white. */
  get l(): number {
    return this._l;
  }
  set l(value: number) {
    this._l = finite(value, "cubehelix", "l");
  }

  get coords(): readonly [h: number, s: number, l: number] {
    return [this._h, this._s, this._l];
  }

  /** `true` when |s| is at most the s range / 100 000 (about 0.000046): the hue is meaningless. */
  override isAchromatic(): boolean {
    return Math.abs(this._s) <= ACHROMATIC;
  }

  /** Adds `amount` × the `l` range (0–1) to `l` and returns this color (mutates). Not clamped. */
  lighten(amount: number): this {
    return shift(this, "l", amount);
  }

  /** Subtracts `amount` × the `l` range (0–1) from `l` (mutates). Not clamped. */
  darken(amount: number): this {
    return shift(this, "l", -amount);
  }

  /** Adds `amount` × the `s` reference range (0–4.6144) to `s` (mutates). Not clamped. */
  saturate(amount: number): this {
    return shift(this, "s", amount);
  }

  /** Subtracts `amount` × the `s` reference range (0–4.6144) from `s` (mutates). Not clamped. */
  desaturate(amount: number): this {
    return shift(this, "s", -amount);
  }

  /**
   * Parses `cubehelix(h s l [/ alpha])`. `l` takes a percentage; `s` is a plain number. Not a CSS syntax.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Cubehelix {
    const { coords, alpha } = readFunction(input, ["cubehelix"], Cubehelix.channels);
    const [h = 0, s = 0, l = 0] = coords;
    return new Cubehelix(h, s, l, alpha);
  }

  /** `cubehelix(h s l)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("cubehelix", Cubehelix.channels, this.coords, this.alpha, "exact");
  }
}
