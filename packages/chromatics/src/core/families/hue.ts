import { Color } from "../color.js";
import { interpolate, segment, stepCount, type HueOptions } from "../interpolate.js";
import type { ColorModel } from "../model.js";

function hueIndexOf(color: Color): number {
  return Object.values((color.constructor as ColorModel).channels).findIndex((ch) => ch.hue === true);
}

/**
 * Models with a hue angle in degrees, the channel flagged `hue` (`h` in Oklch, Lch, Hsl; `t` in Tsl):
 * hue-aware interpolation, rotation and harmonies. Internal (grill 42): users name the concrete classes.
 */
export abstract class HueColor extends Color {
  /** `true` when the hue is meaningless (chroma or saturation at or below the model's CSS threshold). */
  abstract isAchromatic(): boolean;

  /**
   * Moves this color toward `other` by `t` and returns it (mutates). `t` = 0 keeps this color, 1 lands
   * on `other`, values outside [0, 1] extrapolate. Interpolates in premultiplied alpha (hue is never
   * premultiplied), like CSS `color-mix()`. A grey end takes the other end's hue, so white → blue
   * doesn't pass through red.
   *
   * @example
   * ```ts
   * a.mix(b, 0.5);
   * a.mix(b, 0.5, { hue: "longer" });   // the long way round the wheel
   * ```
   */
  mix(other: this, t: number, options: HueOptions = {}): this {
    const [coords, alpha] = interpolate(
      { coords: this.coords, alpha: this.alpha, hueMissing: this.isAchromatic() },
      { coords: other.coords, alpha: other.alpha, hueMissing: other.isAchromatic() },
      t,
      hueIndexOf(this),
      options.hue ?? "shorter"
    );
    return this.assign(coords, alpha);
  }

  /**
   * `n` evenly spaced colors from this one to `other`, both included (new instances; this one is
   * untouched).
   *
   * @throws {RangeError} when `n` isn't an integer ≥ 2.
   */
  steps(other: this, n: number, options: HueOptions = {}): this[] {
    stepCount(n);
    return Array.from({ length: n }, (_, i) => this.clone().mix(other, i / (n - 1), options));
  }

  /** A function of `t` returning a new color between this one and `other`, as `mix` would. Both ends are copied now. */
  interpolator(other: this, options: HueOptions = {}): (t: number) => this {
    const a = this.clone();
    const b = other.clone();
    return (t) => a.clone().mix(b, t, options);
  }

  /**
   * `n` colors evenly spaced along `stops`, both ends included.
   *
   * @throws {RangeError} when there are fewer than 2 stops or `n` isn't an integer ≥ 2.
   * @example
   * ```ts
   * Oklch.gradient([a, b, c], 9, { hue: "increasing" });
   * ```
   */
  static gradient<M extends ColorModel>(
    this: M,
    stops: readonly InstanceType<M>[],
    n: number,
    options: HueOptions = {}
  ): InstanceType<M>[] {
    if (stops.length < 2) throw new RangeError(`gradient needs at least 2 stops, got ${stops.length}`);
    stepCount(n);
    return Array.from({ length: n }, (_, i) => {
      const [index, t] = segment(i, n, stops.length);
      const from = stops[index] as unknown as HueColor;
      return from.clone().mix(stops[index + 1] as unknown as HueColor, t, options) as unknown as InstanceType<M>;
    });
  }

  /** Adds `degrees` to the hue (wrapping) and returns this color (mutates). */
  rotateHue(degrees: number): this {
    const coords = [...this.coords];
    const i = hueIndexOf(this);
    coords[i] = coords[i]! + degrees;
    return this.assign(coords, this.alpha);
  }

  /** Rotates the hue by 180° (mutates). For the pair, `[c, c.clone().complement()]`. */
  complement(): this {
    return this.rotateHue(180);
  }

  private rotated(offsets: readonly number[]): this[] {
    return offsets.map((d) => this.clone().rotateHue(d));
  }

  /** `[this, +120°, +240°]` as new colors, starting with a copy of this one. */
  triadic(): this[] {
    return this.rotated([0, 120, 240]);
  }

  /**
   * Rectangle on the wheel: `[this, +angle, +180°, +180° + angle]`, starting with a copy of this one.
   * `angle` defaults to 60°; 90° gives {@link square}.
   */
  tetradic(angle = 60): this[] {
    return this.rotated([0, angle, 180, 180 + angle]);
  }

  /** `[this, +90°, +180°, +270°]`, starting with a copy of this one. */
  square(): this[] {
    return this.rotated([0, 90, 180, 270]);
  }

  /** `[this, 180° − angle, 180° + angle]`, starting with a copy of this one. `angle` defaults to 30°. */
  splitComplementary(angle = 30): this[] {
    return this.rotated([0, 180 - angle, 180 + angle]);
  }

  /**
   * `count` colors `angle` degrees apart, centred on this one (which is in the middle for an odd count):
   * `analogous(30, 5)` is `[−60°, −30°, this, +30°, +60°]`.
   *
   * @throws {RangeError} when `count` isn't a positive integer.
   */
  analogous(angle = 30, count = 3): this[] {
    if (!Number.isInteger(count) || count < 1)
      throw new RangeError(`analogous needs a positive integer count, got ${count}`);
    return this.rotated(Array.from({ length: count }, (_, i) => (i - (count - 1) / 2) * angle));
  }
}
