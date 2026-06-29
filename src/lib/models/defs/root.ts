/**
 * The root "model" — value-level, MODEL-AGNOSTIC queries available on every
 * color (c.hex, c.inGamut, …). OKLCH *math* (lighten/darken/rotate/mix/shift/
 * derive…) no longer lives here: ops belong to their model, so it moved to the
 * OKLCH view (c.oklch.lighten()). Reach it explicitly via `.oklch`.
 */
import { register, defineModel } from '../registry';
import { accessor } from '../util';

register(
	defineModel({
		id: 'root',
		label: 'Color',
		family: 'root',
		channels: [],
		ownMethods: [
			accessor('hex', 'string', 'Hex string "#rrggbb"', (self) => self.hex),
			accessor('inGamut', 'boolean', 'Displayable in sRGB', (self) => self.inGamut),
			accessor('inP3', 'boolean', 'Displayable in Display P3', (self) => self.inP3),
			accessor('gamutMapped', 'color', 'Chroma-clamped into sRGB', (self) => self.gamutMapped)
		]
	})
);
