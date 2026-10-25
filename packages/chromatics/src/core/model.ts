import type { Color } from "./color.js";

export type ConversionOptions = Readonly<Record<string, unknown>>;

// Declared once, on the more derived model: declaring both sides is a circular ES-module import (ADR-002).
export interface Edge<S extends Color = Color, T extends Color = Color> {
  readonly target: ColorModel<T>;
  forward(color: S, options?: ConversionOptions): T;
  backward(color: T, options?: ConversionOptions): S;
}

/**
 * What a model declares about one channel. Read it for sliders, pickers and generic math.
 *
 * @example
 * ```ts
 * Oklch.channels.c.range; // [0, 0.4]
 * for (const [name, ch] of Object.entries(Lab.channels)) slider(name, ...ch.range);
 * ```
 */
export interface Channel {
  /**
   * The reference range in the model's own units (CSS Color 4 "reference range" where CSS defines
   * one). **Not enforced:** values outside it are stored as given, and Lab `a` / Oklch `c` have no
   * hard limit at all.
   */
  readonly range: readonly [min: number, max: number];
  /** `true` for an angle in degrees, wrapped into [0, 360) on every write. */
  readonly hue?: true;
  /** The value CSS `100%` stands for in this channel (`0.4` for Oklch `c`). Absent when CSS takes no percentage. */
  readonly percent?: number;
}

export type Channels = Readonly<Record<string, Channel>>;

/**
 * A color model class: what `to()`, `from()` and `is()` take.
 *
 * @example
 * ```ts
 * function describe<M extends ColorModel>(model: M, color: Color) {
 *   return color.to(model).toString();
 * }
 * ```
 */
export interface ColorModel<T extends Color = Color> {
  new (...args: number[]): T;
  /** Stable model id, the same string as every instance's `model` tag: the CSS ident where one exists (`'display-p3'`). */
  readonly id: string;
  /** Channel metadata in constructor order. */
  readonly channels: Channels;
  readonly edges: readonly Edge[];
  /**
   * `true` for quantized models (`Srgb8`): the router converts to and from them but never routes a
   * path through one, since every pass would round.
   */
  readonly terminal: boolean;
}

/** The channel names of a model, in constructor order: `ChannelName<typeof Oklch>` is `'l' | 'c' | 'h'`. */
export type ChannelName<M extends ColorModel> = keyof M["channels"] & string;

/** A plain object with every channel of `M`, plus optional alpha: what `M.of()` takes and `toJSON()` mirrors. */
export type ChannelValues<M extends ColorModel> = { [K in ChannelName<M>]: number } & {
  alpha?: number;
};

type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;

/**
 * The writable number properties of a color instance (its channels and alpha), all optional: what
 * `set()` and `shift()` take. `ChannelPatch<Oklch>` is `{ l?: number; c?: number; h?: number; alpha?: number }`.
 */
export type ChannelPatch<T> = {
  [K in keyof T as T[K] extends number
    ? IfEquals<{ [Q in K]: T[K] }, { -readonly [Q in K]: T[K] }, K, never>
    : never]?: number;
};

/** The options object a target model accepts in `to()` / `from()`, or `undefined` when it takes none. */
export type OptionsOf<M> = "__options" extends keyof M ? NonNullable<M["__options" & keyof M]> : undefined;

/** Rest-argument form of {@link OptionsOf}: no argument allowed for models without options. */
export type OptionsArgs<M> = OptionsOf<M> extends undefined ? [] : [options?: OptionsOf<M>];
