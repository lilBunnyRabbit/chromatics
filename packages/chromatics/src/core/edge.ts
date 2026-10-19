import type { Color } from './color.js';
import type { ColorModel, ConversionOptions, Edge } from './model.js';

export function edge<S extends Color, T extends Color>(
	target: ColorModel<T>,
	forward: (color: S, options?: ConversionOptions) => T,
	backward: (color: T, options?: ConversionOptions) => S
): Edge {
	return { target, forward, backward };
}
