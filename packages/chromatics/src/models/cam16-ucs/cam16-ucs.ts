import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";
import { fromPolar, toPolar } from "../../core/polar.js";
import { Cam16 } from "../cam16/cam16.js";

// Luo, Cui & Li 2006 (Color Res. Appl. 31(4)), reused by Li et al. 2017 for CAM16-UCS, as in
// colour-science `colour/models/cam02_ucs.py` @ 248121e3: (K_L, c1, c2) = (1, 0.007, 0.0228).
const KL = 1;
const C1 = 0.007;
const C2 = 0.0228;
// Cam16's achromatic threshold (ADR-003), carried over so a grey keeps hue 0 both ways.
const ACHROMATIC = 105 / 100000;

function fromCam16(c: Cam16): Cam16Ucs {
  const j = ((1 + 100 * C1) * c.J) / (1 + C1 * c.J);
  const m = (Math.sign(c.M) * Math.log(1 + C2 * Math.abs(c.M))) / C2;
  return new Cam16Ucs(j, ...fromPolar(m, c.h), c.alpha);
}

function toCam16(c: Cam16Ucs): Cam16 {
  const [m, h] = toPolar(c.a, c.b, 0);
  const M = (Math.exp(C2 * m) - 1) / C2;
  return new Cam16(c.J / (1 + 100 * C1 - C1 * c.J), M, M <= ACHROMATIC ? 0 : h, c.alpha);
}

/**
 * CAM16-UCS (Li et al. 2017): {@link Cam16} made uniform for color differences of any size. `J` is J′,
 * `a` / `b` are a′ / b′. For small differences see {@link Cam16Scd}, for large ones {@link Cam16Lcd}.
 * Built on Cam16's default (Material) viewing conditions. Not CSS.
 *
 * @example
 * ```ts
 * a.to(Cam16Ucs).deltaE(b.to(Cam16Ucs));
 * ```
 */
export class Cam16Ucs extends RectangularColor {
  static readonly id = "cam16-ucs";
  static readonly channels = {
    J: { range: [0, 100] },
    a: { range: [-50, 50] },
    b: { range: [-50, 50] },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Cam16, toCam16, fromCam16)];
  static readonly terminal = false;

  private _J: number;
  private _a: number;
  private _b: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(J: number, a: number, b: number, alpha = 1) {
    super(alpha);
    this._J = finite(J, "cam16-ucs", "J");
    this._a = finite(a, "cam16-ucs", "a");
    this._b = finite(b, "cam16-ucs", "b");
  }

  get model(): "cam16-ucs" {
    return "cam16-ucs";
  }

  /** J′ = 1.7·J / (1 + 0.007·J): 0 black, 100 the adopted white. */
  get J(): number {
    return this._J;
  }
  set J(value: number) {
    this._J = finite(value, "cam16-ucs", "J");
  }

  /** a′ = M′·cos h, with M′ = ln(1 + c2·M) / c2. */
  get a(): number {
    return this._a;
  }
  set a(value: number) {
    this._a = finite(value, "cam16-ucs", "a");
  }

  /** b′ = M′·sin h. */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "cam16-ucs", "b");
  }

  get coords(): readonly [J: number, a: number, b: number] {
    return [this._J, this._a, this._b];
  }

  /** ΔE′ = √((ΔJ′ / K_L)² + Δa′² + Δb′²), K_L = 1 (Luo et al. 2006). Symmetric. */
  deltaE(other: Cam16Ucs): number {
    return Math.hypot((this._J - other._J) / KL, this._a - other._a, this._b - other._b);
  }

  /**
   * Parses `cam16-ucs(J a b [/ alpha])`, numbers only. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Cam16Ucs {
    const { coords, alpha } = readFunction(input, ["cam16-ucs"], Cam16Ucs.channels);
    const [J = 0, a = 0, b = 0] = coords;
    return new Cam16Ucs(J, a, b, alpha);
  }

  /** `cam16-ucs(J a b)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("cam16-ucs", Cam16Ucs.channels, this.coords, this.alpha, "exact");
  }
}
