import type { ColorModel, OptionsArgs } from './model.js';
import { convert } from './router.js';

/**
 * Base class of every color model. A color is **mutable**: channel setters and single-result
 * operations change it in place and return `this`; operations that produce several colors, and
 * every conversion, return new instances.
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

	/** Opacity, 0–1 (0–255 on byte models). */
	abstract alpha: number;

	/** Channel values in the model's channel order, without alpha. */
	abstract readonly coords: readonly number[];

	/** A new, independent instance with the same channels and alpha. */
	abstract clone(): this;

	/**
	 * Lossless text in the model's own syntax (`'cam16(50 30 120)'`); round-trips through `parse`.
	 * Not always valid CSS: use {@link toCss} for stylesheets.
	 */
	abstract toString(): string;

	/** Valid CSS. Models CSS doesn't know convert to a CSS space first. */
	toCss(): string {
		return this.toString();
	}

	/**
	 * Converts to `model`, always returning a **new** instance (also when the model is the same).
	 * The receiver is never changed. Options are typed per target model.
	 *
	 * @throws {Error} when no conversion path exists.
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
	 * Converts any color into the calling model; a new instance.
	 *
	 * @example
	 * ```ts
	 * const lab = Lab.from(parse('#ff8000'));
	 * ```
	 */
	static from<M extends ColorModel>(
		this: M,
		color: Color,
		...options: OptionsArgs<M>
	): InstanceType<M> {
		return convert(color, this, options[0]) as InstanceType<M>;
	}
}
