import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";
import { Srgb } from "../srgb/srgb.js";

type Rgb = readonly [r: number, g: number, b: number];

// Gossett & Chen, "Paint Inspired Color Mixing and Compositing for Visualization", IEEE InfoVis 2004, Fig. 3:
// the sRGB color at each corner of the RYB cube, after Itten. The figure prints purple as (0.5, 0.5, 0); the
// paper's §2.2 worked example, RYB (1, 0.5, 0.25) → (0.8375, 0.19925, 0.0625), holds only with (0.5, 0, 0.5).
const WHITE: Rgb = [1, 1, 1];
const RED: Rgb = [1, 0, 0];
const YELLOW: Rgb = [1, 1, 0];
const ORANGE: Rgb = [1, 0.5, 0];
const BLUE: Rgb = [0.163, 0.373, 0.6];
const PURPLE: Rgb = [0.5, 0, 0.5];
const GREEN: Rgb = [0, 0.66, 0.2];
const BLACK: Rgb = [0.2, 0.094, 0];

// §2.2: trilinear interpolation of the corners (the paper's linear form, not its smoothstep variant).
function forward(r: number, y: number, b: number): [number, number, number] {
  const out: [number, number, number] = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    const near = (WHITE[i]! * (1 - r) + RED[i]! * r) * (1 - y) + (YELLOW[i]! * (1 - r) + ORANGE[i]! * r) * y;
    const far = (BLUE[i]! * (1 - r) + PURPLE[i]! * r) * (1 - y) + (GREEN[i]! * (1 - r) + BLACK[i]! * r) * y;
    out[i] = near * (1 - b) + far * b;
  }
  return out;
}

function jacobian(r: number, y: number, b: number): number[] {
  const m: number[] = [];
  for (let i = 0; i < 3; i++) {
    const dr =
      (1 - y) * (1 - b) * (RED[i]! - WHITE[i]!) +
      y * (1 - b) * (ORANGE[i]! - YELLOW[i]!) +
      (1 - y) * b * (PURPLE[i]! - BLUE[i]!) +
      y * b * (BLACK[i]! - GREEN[i]!);
    const dy =
      (1 - r) * (1 - b) * (YELLOW[i]! - WHITE[i]!) +
      r * (1 - b) * (ORANGE[i]! - RED[i]!) +
      (1 - r) * b * (GREEN[i]! - BLUE[i]!) +
      r * b * (BLACK[i]! - PURPLE[i]!);
    const db =
      (1 - r) * (1 - y) * (BLUE[i]! - WHITE[i]!) +
      r * (1 - y) * (PURPLE[i]! - RED[i]!) +
      (1 - r) * y * (GREEN[i]! - YELLOW[i]!) +
      r * y * (BLACK[i]! - ORANGE[i]!);
    m.push(dr, dy, db);
  }
  return m;
}

// Cramer's rule for the 3×3 Newton step.
function solve(m: readonly number[], v: Rgb): [number, number, number] | undefined {
  const [a, b, c, d, e, f, g, h, i] = m as [number, number, number, number, number, number, number, number, number];
  const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  if (!Number.isFinite(det) || det === 0) return undefined;
  return [
    (v[0] * (e * i - f * h) - b * (v[1] * i - f * v[2]) + c * (v[1] * h - e * v[2])) / det,
    (a * (v[1] * i - f * v[2]) - v[0] * (d * i - f * g) + c * (d * v[2] - v[1] * g)) / det,
    (a * (e * v[2] - v[1] * h) - b * (d * v[2] - v[1] * g) + v[0] * (d * h - e * g)) / det,
  ];
}

function residual(x: Rgb, target: Rgb): number {
  const q = forward(x[0], x[1], x[2]);
  return Math.hypot(q[0] - target[0], q[1] - target[1], q[2] - target[2]);
}

const ITERATIONS = 64;

// Gossett & Chen give no inverse ("it would be difficult to try to define a rigorous mathematical
// conversion"). Damped Newton from the cube centre (ADR-015): inside the cube the map is one-to-one and this
// lands on the original. Outside it the polynomial extends (pure sRGB blue is RYB 1, 0, 2), and colors Newton
// can't reach from the centre (0.4% of an sRGB grid, around rgb(0 0 0.75)) throw instead of returning
// a different color.
function inverse(target: Rgb): [number, number, number] {
  let x: [number, number, number] = [0.5, 0.5, 0.5];
  let err = residual(x, target);
  const scale = Math.max(1, Math.hypot(...target));
  for (let n = 0; n < ITERATIONS && err > 0; n++) {
    const q = forward(x[0], x[1], x[2]);
    const step = solve(jacobian(x[0], x[1], x[2]), [target[0] - q[0], target[1] - q[1], target[2] - q[2]]);
    if (step === undefined) break;
    let t = 1;
    for (;;) {
      const next: [number, number, number] = [x[0] + t * step[0], x[1] + t * step[1], x[2] + t * step[2]];
      const e = residual(next, target);
      if (e < err || t < 1e-10) {
        if (e < err) [x, err] = [next, e];
        break;
      }
      t /= 2;
    }
    if (t < 1e-10) break;
  }
  if (!(err <= 1e-12 * scale)) {
    throw new RangeError(`rgb(${target.join(" ")}) is outside the reach of the RYB cube's inverse`);
  }
  return x;
}

/**
 * RYB: red, yellow, blue as paint primaries (Gossett & Chen 2004): trilinear interpolation of eight sRGB
 * corner colors chosen after Itten, so mixing in RYB behaves like paint (red + yellow is orange, yellow
 * + blue is green, all three are near black). Channels are 0–1 amounts; (0, 0, 0) is white paper.
 *
 * The paper gives only RYB → sRGB. The inverse is solved numerically and is exact where it succeeds;
 * colors it can't reach (dark blues such as `rgb(0 0 0.75)`) throw a RangeError when converted to RYB (ADR-015).
 *
 * Not CSS: there is no `toCss()`; convert first, `ryb.to(Srgb).toCss()`. `toString()` writes
 * `ryb(r y b)`, which only {@link Ryb.parse} reads.
 *
 * @example
 * ```ts
 * new Ryb(1, 0.5, 0.25).to(Srgb);           // r 0.8375, g 0.19925, b 0.0625
 * new Srgb(1, 0.5, 0).to(Ryb);              // r 1, y 1, b 0
 * new Srgb(0, 0, 1).to(Ryb);                // r 1, y 0, b 2: outside the cube
 * ```
 */
export class Ryb extends RectangularColor {
  static readonly id = "ryb";
  static readonly channels = {
    r: { range: [0, 1], percent: 1 },
    y: { range: [0, 1], percent: 1 },
    b: { range: [0, 1], percent: 1 },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Srgb,
      (c: Ryb) => new Srgb(...forward(c.r, c.y, c.b), c.alpha),
      (c) => new Ryb(...inverse([c.r, c.g, c.b]), c.alpha)
    ),
  ];
  static readonly terminal = false;

  private _r: number;
  private _y: number;
  private _b: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(r: number, y: number, b: number, alpha = 1) {
    super(alpha);
    this._r = finite(r, "ryb", "r");
    this._y = finite(y, "ryb", "y");
    this._b = finite(b, "ryb", "b");
  }

  get model(): "ryb" {
    return "ryb";
  }

  /** Red paint, 0–1. */
  get r(): number {
    return this._r;
  }
  set r(value: number) {
    this._r = finite(value, "ryb", "r");
  }

  /** Yellow paint, 0–1. */
  get y(): number {
    return this._y;
  }
  set y(value: number) {
    this._y = finite(value, "ryb", "y");
  }

  /** Blue paint, 0–1. */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "ryb", "b");
  }

  get coords(): readonly [r: number, y: number, b: number] {
    return [this._r, this._y, this._b];
  }

  /**
   * Parses `ryb(r y b [/ alpha])`: numbers 0–1 or percentages. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Ryb {
    const { coords, alpha } = readFunction(input, ["ryb"], Ryb.channels);
    const [r = 0, y = 0, b = 0] = coords;
    return new Ryb(r, y, b, alpha);
  }

  /** `ryb(r y b)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("ryb", Ryb.channels, this.coords, this.alpha, "exact");
  }
}
