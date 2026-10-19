import type { Color } from './color.js';

export type ConversionOptions = Readonly<Record<string, unknown>>;

// Declared once, on the more derived model: declaring both sides is a circular ES-module import (ADR-002).
export interface Edge<S extends Color = Color, T extends Color = Color> {
	readonly target: ColorModel<T>;
	forward(color: S, options?: ConversionOptions): T;
	backward(color: T, options?: ConversionOptions): S;
}

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
	new (...args: never[]): T;
	/** Stable model id, the same string as every instance's `model` tag. */
	readonly id: string;
	readonly edges: readonly Edge[];
	/**
	 * `true` for quantized models (`Srgb8`): the router converts to and from them but never routes a
	 * path through one, since every pass would round.
	 */
	readonly terminal: boolean;
}

/** The options object a target model accepts in `to()` / `from()`, or `undefined` when it takes none. */
export type OptionsOf<M> = '__options' extends keyof M
	? NonNullable<M['__options' & keyof M]>
	: undefined;

/** Rest-argument form of {@link OptionsOf}: no argument allowed for models without options. */
export type OptionsArgs<M> = OptionsOf<M> extends undefined ? [] : [options?: OptionsOf<M>];
