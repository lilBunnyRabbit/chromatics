/** Linear sRGB — physically-correct blending/compositing (light-linear values). */
import { register, defineModel, type CuloriColor } from '../registry';
import { ColorValue } from '../value';
import { method, lerpInMode, color, num, assertSameModel, p } from '../util';

function scaleLrgb(self: ColorValue, factor: number): ColorValue {
	const c = self.project('lrgb') as unknown as Record<string, number | undefined>;
	return ColorValue.from({
		mode: 'lrgb',
		r: (c.r ?? 0) * factor,
		g: (c.g ?? 0) * factor,
		b: (c.b ?? 0) * factor
	} as unknown as CuloriColor);
}

register(
	defineModel({
		id: 'lin',
		mode: 'lrgb', // culori's linear-sRGB mode
		label: 'Linear sRGB',
		family: 'rgb',
		priority: 'high',
		channels: [
			{ key: 'lr', localKey: 'r', label: 'Red (linear)', culoriField: 'r', range: [0, 1] },
			{ key: 'lg', localKey: 'g', label: 'Green (linear)', culoriField: 'g', range: [0, 1] },
			{ key: 'lb', localKey: 'b', label: 'Blue (linear)', culoriField: 'b', range: [0, 1] }
		],
		ownMethods: [
			method(
				'blend',
				[p('other', 'color'), p('ratio', 'number', { optional: true })],
				'color',
				'Physically-correct linear blend (light-linear interpolation)',
				(self, [o, r]) => {
					const b = color(o);
					assertSameModel(self, b, 'blend');
					return lerpInMode(self, b, 'lrgb', r === undefined ? 0.5 : num(r));
				}
			),
			method('premultiply', [p('alpha')], 'color', 'Scale linear channels by alpha', (self, [a]) =>
				scaleLrgb(self, num(a))
			)
		]
	})
);
