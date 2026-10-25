import { shift, ramp, type RampOptions } from "../adjust.js";
import { brightness, fromXyz, quadrature, toXyz, type Environment } from "../cam.js";
import { finite, wrapHue } from "../channel.js";
import { readFunction, serialize } from "../css.js";
import type { ColorModel } from "../model.js";
import { HueColor } from "./hue.js";

// ADR-003: a grey's hue is 0 below the chroma reference range / 100 000; M's reference range is 0–105.
export const ACHROMATIC = 105 / 100000;

export interface CamModel extends ColorModel {
  readonly env: Environment;
}

/**
 * Appearance models with channels J (lightness), M (colorfulness), h (hue) under fixed viewing conditions:
 * Cam16, Ciecam02 and their `viewedIn` classes. Internal (grill 42).
 */
export abstract class CamColor extends HueColor {
  private _J: number;
  private _M: number;
  private _h: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(J: number, M: number, h: number, alpha = 1) {
    super(alpha);
    const id = (new.target as unknown as ColorModel).id;
    this._J = finite(J, id, "J");
    this._M = finite(M, id, "M");
    this._h = wrapHue(h, id);
  }

  private get env(): Environment {
    return (this.constructor as CamModel).env;
  }

  get model(): string {
    return (this.constructor as ColorModel).id;
  }

  /** Lightness J: 0 black, 100 the adopted white. */
  get J(): number {
    return this._J;
  }
  set J(value: number) {
    this._J = finite(value, this.model, "J");
  }

  /** Colorfulness M: 0 is grey; reference range 0–105. */
  get M(): number {
    return this._M;
  }
  set M(value: number) {
    this._M = finite(value, this.model, "M");
  }

  /** Hue angle h in degrees, wrapped into [0, 360) on write. 0 for greys. */
  get h(): number {
    return this._h;
  }
  set h(value: number) {
    this._h = wrapHue(value, this.model);
  }

  /** Chroma C = M / F_L^¼ (read-only). */
  get C(): number {
    return this._M / this.env.flRoot;
  }

  /** Brightness Q (read-only). */
  get Q(): number {
    return brightness(this.env, this._J);
  }

  /** Saturation s = 100 · √(M / Q) (read-only). */
  get s(): number {
    const q = this.Q;
    return q === 0 ? 0 : 100 * Math.sign(this._M) * Math.sqrt(Math.abs(this._M) / q);
  }

  /** Hue quadrature H, 0–400: red 0 / 400, yellow 100, green 200, blue 300 (read-only). */
  get H(): number {
    return quadrature(this._h);
  }

  get coords(): readonly [J: number, M: number, h: number] {
    return [this._J, this._M, this._h];
  }

  /** `true` when M is at most 0.00105 (ADR-003: the reference range 0–105 / 100 000). */
  override isAchromatic(): boolean {
    return this._M <= ACHROMATIC;
  }

  /** Adds `amount` × the `J` range (0–100) to `J` and returns this color (mutates). Not clamped. */
  lighten(amount: number): this {
    return shift(this, "J", amount);
  }

  /** Subtracts `amount` × the `J` range (0–100) from `J` (mutates). Not clamped. */
  darken(amount: number): this {
    return shift(this, "J", -amount);
  }

  /** Adds `amount` × the `M` reference range (0–105) to `M` (mutates). Not clamped. */
  saturate(amount: number): this {
    return shift(this, "M", amount);
  }

  /** Subtracts `amount` × the `M` reference range (0–105) from `M` (mutates). Not clamped. */
  desaturate(amount: number): this {
    return shift(this, "M", -amount);
  }

  /**
   * `n` new colors with this one's other channels and `J` evenly spaced from `from` to `to` (fractions
   * of the range, default 0.05–0.95).
   *
   * @throws {RangeError} when `n` isn't an integer ≥ 2.
   */
  ramp(n: number, options: RampOptions = {}): this[] {
    return ramp(this, "J", n, options);
  }

  /** `id(J M h)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    const model = this.constructor as ColorModel;
    return serialize(model.id, model.channels, this.coords, this.alpha, "exact");
  }

  /** Reads `id(J M h [/ alpha])` with this class's own id. */
  protected static read<T extends CamColor>(model: CamModel & (new (...a: number[]) => T), input: string): T {
    const { coords, alpha } = readFunction(input, [model.id], model.channels);
    const [J = 0, M = 0, h = 0] = coords;
    return new model(J, M, h, alpha) as T;
  }
}

export const CAM_CHANNELS = {
  J: { range: [0, 100] },
  M: { range: [0, 105] },
  h: { range: [0, 360], hue: true },
} as const;

/** Relative XYZ → this model's J M h. */
export function camFromXyz<T extends CamColor>(
  model: CamModel & (new (...a: number[]) => T),
  x: number,
  y: number,
  z: number,
  alpha: number
): T {
  const { J, M, h } = fromXyz(model.env, x, y, z, ACHROMATIC);
  return new model(J, M, h, alpha) as T;
}

export function camToXyz(c: CamColor): [number, number, number] {
  return toXyz((c.constructor as CamModel).env, c.J, c.M, c.h);
}
