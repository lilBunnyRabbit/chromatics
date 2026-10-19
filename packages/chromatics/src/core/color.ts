import { Optional } from "@lilbunnyrabbit/optional";
import { finite } from "./channel.js";
import type { ChannelValues, ColorModel, OptionsArgs } from "./model.js";
import { convert } from "./router.js";

/**
 * Base class of every color model. A color is **mutable**: channel setters and single-result
 * operations change it in place and return `this`; operations that produce several colors, and
 * every conversion, return new instances.
 *
 * Every channel write is checked: `NaN` / `Infinity` throw a `TypeError`, hues wrap into [0, 360).
 * Out-of-range values are otherwise stored as given; clamping is always explicit.
 *
 * @example
 * ```ts
 * const c = new Oklch(0.7, 0.15, 30);
 * c.to(Lab).a;          // read another model's channel by converting
 * c.is(Oklch);          // narrows a parsed `Color`
 * const copy = c.clone();
 * ```
 */
export abstract class Color {
  /** Model id, a literal per class (`'oklch'`). It's what keeps structurally identical models apart. */
  abstract readonly model: string;

  /** Channel values in the model's channel order, without alpha. */
  abstract readonly coords: readonly number[];

  private _alpha: number;

  protected constructor(alpha: number) {
    this._alpha = this.alphaOf(alpha);
  }

  /** Opacity, 0–1 (0–255 on byte models). Throws a `TypeError` on `NaN` / `Infinity`; stored unclamped. */
  get alpha(): number {
    return this._alpha;
  }

  set alpha(value: number) {
    this._alpha = this.alphaOf(value);
  }

  protected alphaOf(value: number): number {
    return finite(value, this.model, "alpha");
  }

  /**
   * Lossless text in the model's own syntax: shortest round-trip numbers, so
   * `M.parse(c.toString())` gives back `c` exactly for in-range values. CSS-native models also have
   * `toCss()`, which rounds.
   */
  abstract toString(): string;

  /** A new, independent instance with the same channels and alpha. */
  clone(): this {
    const model = this.constructor as ColorModel<this>;
    return new model(...this.coords, this.alpha);
  }

  /** `{ model, ...channels, alpha }`, so `JSON.stringify` shows channels by name. */
  toJSON(): { model: string; alpha: number } & Record<string, number | string> {
    const names = Object.keys((this.constructor as ColorModel).channels);
    const out: Record<string, number | string> = { model: this.model };
    this.coords.forEach((v, i) => (out[names[i]!] = v));
    out.alpha = this.alpha;
    return out as { model: string; alpha: number } & Record<string, number | string>;
  }

  /**
   * Converts to `model`, always returning a **new** instance (also when the model is the same).
   * The receiver is never changed. Options are typed per target model.
   *
   * @throws {Error} when no conversion path exists.
   * @throws {RangeError} when the true result lies beyond the number range (channels around 1e150 and
   *   up, or degenerate out-of-gamut values such as Hsv saturation from a subnormal maximum). Never for
   *   channels within a million times their reference range.
   * @example
   * ```ts
   * c.to(Lab);
   * c.to(Lab, { white: 'D65' });
   * ```
   */
  to<M extends ColorModel>(model: M, ...options: OptionsArgs<M>): InstanceType<M> {
    return convert(this, model, options[0]) as InstanceType<M>;
  }

  /**
   * Narrows to `model` by comparing model ids, so it also holds across two installed copies of the
   * package (where `instanceof` would not).
   */
  is<T extends Color>(model: ColorModel<T>): this is T {
    return this.model === model.id;
  }

  /**
   * Exact equality: same model, every channel and alpha `===`. Rarely true after a conversion; for
   * "looks the same" compare in Oklab: `a.to(Oklab).looksSame(b.to(Oklab))`.
   */
  equals(other: this): boolean {
    if (other.model !== this.model || other.alpha !== this.alpha) return false;
    const a = this.coords;
    const b = other.coords;
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }

  /**
   * Builds a color from channel names; alpha defaults to opaque.
   *
   * @throws {TypeError} when a channel is missing, `NaN` or infinite.
   * @example
   * ```ts
   * Oklch.of({ l: 0.7, c: 0.15, h: 30 });
   * Oklch.of({ l: 0.7, c: 0.15, h: 30, alpha: 0.5 });
   * ```
   */
  static of<M extends ColorModel>(this: M, values: ChannelValues<M>): InstanceType<M> {
    const record = values as Record<string, number | undefined>;
    const coords = Object.keys(this.channels).map((name) => {
      const v = record[name];
      if (typeof v !== "number") throw new TypeError(`${this.id}.${name} is missing`);
      return v;
    });
    const color = values.alpha === undefined ? new this(...coords) : new this(...coords, values.alpha);
    return color as InstanceType<M>;
  }

  /**
   * Converts any color into the calling model; a new instance.
   *
   * @example
   * ```ts
   * const lab = Lab.from(Srgb8.parse('#ff8000'));
   * ```
   */
  static from<M extends ColorModel>(this: M, color: Color, ...options: OptionsArgs<M>): InstanceType<M> {
    return convert(color, this, options[0]) as InstanceType<M>;
  }

  /**
   * `parse` without the throw: an empty `Optional` when the string isn't this model's syntax.
   *
   * @example
   * ```ts
   * Oklch.tryParse(input).map((c) => c.l).orElse(0);
   * ```
   */
  static tryParse<M extends { parse(input: string): Color }>(this: M, input: string): Optional<ReturnType<M["parse"]>> {
    try {
      return Optional(this.parse(input) as ReturnType<M["parse"]>);
    } catch (error) {
      if (error instanceof SyntaxError) return Optional.empty();
      throw error;
    }
  }
}
