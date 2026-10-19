import { Color } from "../color.js";
import { interpolate, segment, stepCount } from "../interpolate.js";
import type { ColorModel } from "../model.js";

/**
 * Models whose channels are independent axes (XYZ, RGB, Lab, Oklab): interpolation is per channel.
 * Internal (grill 42): users name the concrete classes.
 */
export abstract class RectangularColor extends Color {
  /**
   * Moves this color toward `other` by `t` and returns it (mutates). `t` = 0 keeps this color, 1 lands
   * on `other`, values outside [0, 1] extrapolate. Interpolates in premultiplied alpha, like CSS
   * `color-mix()`.
   *
   * @example
   * ```ts
   * a.mix(b, 0.25);
   * a.to(Oklab).mix(b.to(Oklab), 0.5); // mix in the space that suits the job
   * ```
   */
  mix(other: this, t: number): this {
    const [coords, alpha] = interpolate(this, other, t);
    return this.assign(coords, alpha);
  }

  /**
   * `n` evenly spaced colors from this one to `other`, both included (new instances; this one is
   * untouched).
   *
   * @throws {RangeError} when `n` isn't an integer ≥ 2.
   */
  steps(other: this, n: number): this[] {
    stepCount(n);
    return Array.from({ length: n }, (_, i) => this.clone().mix(other, i / (n - 1)));
  }

  /** A function of `t` returning a new color between this one and `other`, as `mix` would. Both ends are copied now. */
  interpolator(other: this): (t: number) => this {
    const a = this.clone();
    const b = other.clone();
    return (t) => a.clone().mix(b, t);
  }

  /**
   * `n` colors evenly spaced along `stops` (each stop at an equal share of the way), both ends included.
   *
   * @throws {RangeError} when there are fewer than 2 stops or `n` isn't an integer ≥ 2.
   * @example
   * ```ts
   * Oklab.gradient([a, b, c], 9);
   * ```
   */
  static gradient<M extends ColorModel>(this: M, stops: readonly InstanceType<M>[], n: number): InstanceType<M>[] {
    if (stops.length < 2) throw new RangeError(`gradient needs at least 2 stops, got ${stops.length}`);
    stepCount(n);
    return Array.from({ length: n }, (_, i) => {
      const [index, t] = segment(i, n, stops.length);
      const from = stops[index] as unknown as RectangularColor;
      return from.clone().mix(stops[index + 1] as unknown as RectangularColor, t) as unknown as InstanceType<M>;
    });
  }
}
