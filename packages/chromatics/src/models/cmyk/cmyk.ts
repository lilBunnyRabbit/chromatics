import { finite } from "../../core/channel.js";
import { invalid, parseFunction, readFunction, serialize, type CssOptions } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";
import { Cmy } from "../cmy/cmy.js";
import { Srgb } from "../srgb/srgb.js";

// CSS Color 5 ED 2026-10-08 §6.1 "Naively Converting Between Uncalibrated CMYK and sRGB-Based Color":
// red = 1 − min(1, cyan·(1 − black) + black). Without the min (ADR-003) that is (1 − c)(1 − k), equal on
// [0, 1].
function cmykToSrgb(c: Cmyk): Srgb {
  const w = 1 - c.k;
  return new Srgb((1 - c.c) * w, (1 - c.m) * w, (1 - c.y) * w, c.alpha);
}

// §6.1: black = 1 − max(r, g, b), cyan = (1 − red − black) / (1 − black), "or 0 if black is 1". Within the
// grill 45 floor of black = 1 the inks divide by noise, so they are 0 there too.
function srgbToCmyk(c: Srgb): Cmyk {
  const w = Math.max(c.r, c.g, c.b);
  if (Math.abs(w) < 1e-12) return new Cmyk(0, 0, 0, 1 - w, c.alpha);
  return new Cmyk((w - c.r) / w, (w - c.g) / w, (w - c.b) / w, 1 - w, c.alpha);
}

// colour-science `colour/models/rgb/cmyk.py` `CMYK_to_CMY`: X = X·(1 − K) + K.
function cmykToCmy(c: Cmyk): Cmy {
  const w = 1 - c.k;
  return new Cmy(c.c * w + c.k, c.m * w + c.k, c.y * w + c.k, c.alpha);
}

// `CMY_to_CMYK`: K = min(C, M, Y), X = (X − K) / (1 − K), 0 when K is 1. colour also caps K at 1, which
// ADR-003 leaves out; the floor matches srgbToCmyk.
function cmyToCmyk(c: Cmy): Cmyk {
  const k = Math.min(c.c, c.m, c.y);
  const w = 1 - k;
  if (Math.abs(w) < 1e-12) return new Cmyk(0, 0, 0, k, c.alpha);
  return new Cmyk((c.c - k) / w, (c.m - k) / w, (c.y - k) / w, k, c.alpha);
}

/**
 * CMYK: cyan, magenta, yellow, black, CSS Color 5's uncalibrated `device-cmyk()` with its naive
 * conversion to encoded sRGB (§6.1). Not a print profile: real presses go through ICC. Channels are 0–1
 * fractions. Black takes the shared part of the inks, so sRGB never needs more than two of c, m, y.
 *
 * CSS clamps out-of-range channels at computed-value time; this class stores them as given (ADR-003).
 *
 * @example
 * ```ts
 * new Cmyk(0, 0.81, 0.81, 0.3).to(Srgb);    // ≈ firebrick
 * Cmyk.parse('device-cmyk(0 81% 81% 30%)');
 * ```
 */
export class Cmyk extends RectangularColor {
  static readonly id = "cmyk";
  static readonly channels = {
    c: { range: [0, 1], percent: 1 },
    m: { range: [0, 1], percent: 1 },
    y: { range: [0, 1], percent: 1 },
    k: { range: [0, 1], percent: 1 },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Srgb, cmykToSrgb, srgbToCmyk), edge(Cmy, cmykToCmy, cmyToCmyk)];
  static readonly terminal = false;

  private _c: number;
  private _m: number;
  private _y: number;
  private _k: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(c: number, m: number, y: number, k: number, alpha = 1) {
    super(alpha);
    this._c = finite(c, "cmyk", "c");
    this._m = finite(m, "cmyk", "m");
    this._y = finite(y, "cmyk", "y");
    this._k = finite(k, "cmyk", "k");
  }

  get model(): "cmyk" {
    return "cmyk";
  }

  /** Cyan ink, 0–1. */
  get c(): number {
    return this._c;
  }
  set c(value: number) {
    this._c = finite(value, "cmyk", "c");
  }

  /** Magenta ink, 0–1. */
  get m(): number {
    return this._m;
  }
  set m(value: number) {
    this._m = finite(value, "cmyk", "m");
  }

  /** Yellow ink, 0–1. */
  get y(): number {
    return this._y;
  }
  set y(value: number) {
    this._y = finite(value, "cmyk", "y");
  }

  /** Black ink, 0–1: 1 is black whatever c, m and y say. */
  get k(): number {
    return this._k;
  }
  set k(value: number) {
    this._k = finite(value, "cmyk", "k");
  }

  get coords(): readonly [c: number, m: number, y: number, k: number] {
    return [this._c, this._m, this._y, this._k];
  }

  /** Total area coverage, `c + m + y + k`, as a fraction: 2.4 is a 240 % TAC. */
  totalInk(): number {
    return this._c + this._m + this._y + this._k;
  }

  /**
   * Scales all four inks by one factor so that {@link totalInk} is `max` (a fraction: 2.4 for 240 %), and
   * returns this color (mutates). Unchanged when already at or under the limit. A proportional
   * heuristic, not a print standard's black generation (GCR): it changes the color.
   *
   * @throws {RangeError} when `max` isn't a finite number ≥ 0.
   */
  limitInk(max: number): this {
    if (!(Number.isFinite(max) && max >= 0)) throw new RangeError(`cmyk.limitInk: max must be ≥ 0, got ${max}`);
    const total = this.totalInk();
    if (total <= max) return this;
    const f = max / total;
    return this.assign([this._c * f, this._m * f, this._y * f, this._k * f], this.alpha);
  }

  /**
   * Parses CSS Color 5 §6 `device-cmyk()`: the modern form `device-cmyk(c m y k [/ alpha])` with numbers
   * 0–1, percentages or `none`, and the legacy `device-cmyk(c, m, y, k)` with numbers only and no alpha.
   * Out-of-range channels are stored, not clamped.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Cmyk {
    const fn = parseFunction(input);
    if (fn.legacy && fn.name === "device-cmyk") {
      // parseFunction reads a fourth comma part as alpha, as in rgba().
      const parts = fn.alpha === undefined ? fn.args : [...fn.args, fn.alpha];
      const values = parts.map((p) => (p.kind === "number" ? p.value : NaN));
      if (values.length !== 4 || values.some(Number.isNaN)) throw invalid(input, "comma syntax takes four numbers");
      return new Cmyk(values[0]!, values[1]!, values[2]!, values[3]!);
    }
    const { coords, alpha } = readFunction(input, ["device-cmyk"], Cmyk.channels);
    const [c = 0, m = 0, y = 0, k = 0] = coords;
    return new Cmyk(c, m, y, k, alpha);
  }

  /** `device-cmyk(c m y k)`, shortest exact numbers. */
  override toString(): string {
    return serialize("device-cmyk", Cmyk.channels, this.coords, this.alpha, "exact");
  }

  /**
   * `device-cmyk(c m y k)`, rounded per {@link CssOptions}: numbers, never percentages (CSS Color 5
   * §11.5). Valid CSS Color 5; browsers may not support it yet.
   */
  toCss(options: CssOptions = {}): string {
    return serialize("device-cmyk", Cmyk.channels, this.coords, this.alpha, options);
  }
}
