import { shift, ramp, type RampOptions } from "../../core/adjust.js";
import { finite, wrapHue } from "../../core/channel.js";
import { HueColor } from "../../core/families/hue.js";
import { readFunction, serialize, type CssOptions } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import type { Edge } from "../../core/model.js";
import { clamp, fromPolar, toPolar } from "../../core/polar.js";
import { Lab } from "../lab/lab.js";

// CSS Color 4 sample code `Lab_to_LCH` epsilon: chroma reference range / 100 000 (ADR-003).
const ACHROMATIC = 0.0015;

/**
 * CIE LCh(ab): {@link Lab} in cylindrical form, D50. Lightness `l` 0–100, chroma `c` (0 is grey; CSS: "in practice
 * does not exceed 230"), hue `h` in degrees.
 *
 * `h` wraps into [0, 360) on every write. A grey's hue is 0, never `NaN`; check
 * {@link isAchromatic} when the hue matters. Prefer {@link Oklch} for perceptual edits.
 *
 * @example
 * ```ts
 * Lch.parse('lch(52.2 72.2 56.2)');
 * Lch.parse('lch(52% 48% 1rad)');          // percentages: l of 100, c of 150
 * ```
 */
export class Lch extends HueColor {
  static readonly id = "lch";
  static readonly channels = {
    l: { range: [0, 100], percent: 100 },
    c: { range: [0, 150], percent: 150 },
    h: { range: [0, 360], hue: true },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Lab,
      (c: Lch) => new Lab(c.l, ...fromPolar(c.c, c.h), c.alpha),
      (c) => new Lch(c.l, ...toPolar(c.a, c.b, ACHROMATIC), c.alpha)
    ),
  ];
  static readonly terminal = false;

  private _l: number;
  private _c: number;
  private _h: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(l: number, c: number, h: number, alpha = 1) {
    super(alpha);
    this._l = finite(l, "lch", "l");
    this._c = finite(c, "lch", "c");
    this._h = wrapHue(h, "lch");
  }

  get model(): "lch" {
    return "lch";
  }

  /** CIE lightness L\*, 0 (black) to 100 (diffuse white). Not 0–1. */
  get l(): number {
    return this._l;
  }
  set l(value: number) {
    this._l = finite(value, "lch", "l");
  }

  /** Chroma: 0 is grey; 150 is the CSS reference range maximum (`100%`). Unbounded. */
  get c(): number {
    return this._c;
  }
  set c(value: number) {
    this._c = finite(value, "lch", "c");
  }

  /** Hue angle in degrees, wrapped into [0, 360) on write. 0 for greys. */
  get h(): number {
    return this._h;
  }
  set h(value: number) {
    this._h = wrapHue(value, "lch");
  }

  get coords(): readonly [l: number, c: number, h: number] {
    return [this._l, this._c, this._h];
  }

  /** `true` when chroma is at most 0.0015, the CSS Color 4 threshold below which hue is meaningless. */
  override isAchromatic(): boolean {
    return this._c <= ACHROMATIC;
  }

  /** Adds `amount` × the `l` range (0–100) to `l` and returns this color (mutates). Not clamped. */
  lighten(amount: number): this {
    return shift(this, "l", amount);
  }

  /** Subtracts `amount` × the `l` range (0–100) from `l` (mutates). Not clamped. */
  darken(amount: number): this {
    return shift(this, "l", -amount);
  }

  /** Adds `amount` × the `c` reference range (0–150) to `c` (mutates). Not clamped. */
  saturate(amount: number): this {
    return shift(this, "c", amount);
  }

  /** Subtracts `amount` × the `c` reference range (0–150) from `c` (mutates). Not clamped: below 0 is stored as is. */
  desaturate(amount: number): this {
    return shift(this, "c", -amount);
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

  /**
   * Parses `lch(l c h [/ alpha])`. Percentages: `l` of 100, `c` of 150; hue takes degrees or any
   * angle unit. As in CSS, `l` clamps to 0–100 and a negative `c` to 0 at parse time.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Lch {
    const { coords, alpha } = readFunction(input, ["lch"], Lch.channels);
    const [l = 0, c = 0, h = 0] = coords;
    // CSS Color 4 #specifying-lab-lch: L clamps to [0%, 100%], negative C to 0, at parse time.
    return new Lch(clamp(l, 0, 100), Math.max(c, 0), h, alpha);
  }

  /** `lch(l c h)`, shortest exact numbers. */
  override toString(): string {
    return serialize("lch", Lch.channels, this.coords, this.alpha, "exact");
  }

  /** `lch(l c h)`, rounded per {@link CssOptions}. */
  toCss(options: CssOptions = {}): string {
    return serialize("lch", Lch.channels, this.coords, this.alpha, options);
  }
}
