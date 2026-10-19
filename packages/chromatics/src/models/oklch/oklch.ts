import { finite, wrapHue } from "../../core/channel.js";
import { Color } from "../../core/color.js";
import { readFunction, serialize, type CssOptions } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import type { Edge } from "../../core/model.js";
import { clamp, fromPolar, toPolar } from "../../core/polar.js";
import { Oklab } from "../oklab/oklab.js";

// CSS Color 4 sample code `OKLab_to_OKLCH` epsilon: chroma reference range / 100 000 (ADR-003).
const ACHROMATIC = 0.000004;

/**
 * OkLCh: {@link Oklab} in cylindrical form. Lightness `l` 0–1, chroma `c` (0 is grey; CSS: "in practice
 * does not exceed 0.5"), hue `h` in degrees. The model for picking and adjusting colors.
 *
 * `h` wraps into [0, 360) on every write. A grey's hue is 0, never `NaN`; check
 * {@link isAchromatic} when the hue matters.
 *
 * @example
 * ```ts
 * const c = new Oklch(0.7, 0.15, 30);
 * c.h = 400;                                // 40
 * Oklch.parse('oklch(70% 0.15 30deg / 50%)');
 * ```
 */
export class Oklch extends Color {
  static readonly id = "oklch";
  static readonly channels = {
    l: { range: [0, 1], percent: 1 },
    c: { range: [0, 0.4], percent: 0.4 },
    h: { range: [0, 360], hue: true },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Oklab,
      (c: Oklch) => new Oklab(c.l, ...fromPolar(c.c, c.h), c.alpha),
      (c) => new Oklch(c.l, ...toPolar(c.a, c.b, ACHROMATIC), c.alpha)
    ),
  ];
  static readonly terminal = false;

  private _l: number;
  private _c: number;
  private _h: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(l: number, c: number, h: number, alpha = 1) {
    super(alpha);
    this._l = finite(l, "oklch", "l");
    this._c = finite(c, "oklch", "c");
    this._h = wrapHue(h, "oklch");
  }

  get model(): "oklch" {
    return "oklch";
  }

  /** Perceptual lightness, 0 (black) to 1 (white). Not 0–100. */
  get l(): number {
    return this._l;
  }
  set l(value: number) {
    this._l = finite(value, "oklch", "l");
  }

  /** Chroma: 0 is grey; 0.4 is the CSS reference range maximum. Unbounded. */
  get c(): number {
    return this._c;
  }
  set c(value: number) {
    this._c = finite(value, "oklch", "c");
  }

  /** Hue angle in degrees, wrapped into [0, 360) on write. 0 for greys. */
  get h(): number {
    return this._h;
  }
  set h(value: number) {
    this._h = wrapHue(value, "oklch");
  }

  get coords(): readonly [l: number, c: number, h: number] {
    return [this._l, this._c, this._h];
  }

  /** `true` when chroma is at most 0.000004, the CSS Color 4 threshold below which hue is meaningless. */
  isAchromatic(): boolean {
    return this._c <= ACHROMATIC;
  }

  /**
   * Parses `oklch(l c h [/ alpha])`. Percentages: `l` of 1, `c` of 0.4; hue takes degrees or any
   * angle unit. As in CSS, `l` clamps to 0–1 and a negative `c` to 0 at parse time.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Oklch {
    const { coords, alpha } = readFunction(input, ["oklch"], Oklch.channels);
    const [l = 0, c = 0, h = 0] = coords;
    // CSS Color 4 #specifying-oklab-oklch: L clamps to [0%, 100%], negative C to 0, at parse time.
    return new Oklch(clamp(l, 0, 1), Math.max(c, 0), h, alpha);
  }

  /** `oklch(l c h)`, shortest exact numbers. */
  override toString(): string {
    return serialize("oklch", Oklch.channels, this.coords, this.alpha, "exact");
  }

  /** `oklch(l c h)`, rounded per {@link CssOptions}. */
  toCss(options: CssOptions = {}): string {
    return serialize("oklch", Oklch.channels, this.coords, this.alpha, options);
  }
}
