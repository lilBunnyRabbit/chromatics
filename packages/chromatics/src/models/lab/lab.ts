import { finite } from "../../core/channel.js";
import { Color } from "../../core/color.js";
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
export class Lab extends Color {
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
