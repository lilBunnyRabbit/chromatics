/** OKLCH — perceptual cylindrical. The perceptual workhorse for color math + gamut mapping. */
import { register, defineModel, toGamut, formatCss, type CuloriColor } from '../registry';
import { PERCEPTUAL_CYL_OPS, OKLCH_OPS } from '../families';
import { ColorValue } from '../value';
import { method, accessor, makeOklch, clamp01, num, str, maxChromaFor, p } from '../util';

register(
	defineModel({
		id: 'oklch',
		label: 'OKLCH',
		family: 'perceptual-cylindrical',
		priority: 'critical',
		ctor: {
			name: 'OKLCH',
			params: [p('l'), p('c'), p('h')],
			build: ([l, c, h]) => makeOklch(l, c, h)
		},
		channels: [
			{ key: 'ok_l', localKey: 'l', label: 'Lightness', culoriField: 'l', range: [0, 1] },
			{ key: 'ok_c', localKey: 'c', label: 'Chroma', culoriField: 'c', range: [0, 0.4] },
			{ key: 'ok_h', localKey: 'h', label: 'Hue', culoriField: 'h', range: [0, 360] }
		],
		ownMethods: [
			method('atLightness', [p('l')], 'color', 'Set the OKLCH lightness', (self, [l]) =>
				ColorValue.from(makeOklch(num(l), self.channel('ok_c'), self.channel('ok_h')))
			),
			method('atChroma', [p('c')], 'color', 'Set the OKLCH chroma', (self, [c]) =>
				ColorValue.from(makeOklch(self.channel('ok_l'), num(c), self.channel('ok_h')))
			),
			method(
				'gamutMap',
				[p('space', 'string', { optional: true })],
				'color',
				'Map into gamut via the CSS Color 4 chroma reduction',
				(self, [s]) => {
					const dest = (s === undefined ? 'rgb' : str(s)) as Parameters<typeof toGamut>[0];
					const mapped = toGamut(dest, 'oklch')(self.project('oklch')) as unknown as Record<
						string,
						number | undefined
					> & { mode: string };
					// toGamut can leave sub-epsilon noise (e.g. g = -4e-16); clean it.
					for (const k of ['r', 'g', 'b'] as const) {
						if (typeof mapped[k] === 'number') mapped[k] = clamp01(mapped[k] as number);
					}
					return ColorValue.from(mapped as unknown as CuloriColor).to('oklch');
				}
			),
			method(
				'maxChroma',
				[p('space', 'string', { optional: true })],
				'number',
				'Highest in-gamut chroma at this lightness/hue',
				(self, [s]) =>
					maxChromaFor(self.channel('ok_l'), self.channel('ok_h'), s === undefined ? 'rgb' : str(s))
			),
			accessor('isInGamut', 'boolean', 'Displayable in sRGB', (self) => self.inGamut)
		],
		inherit: [...PERCEPTUAL_CYL_OPS, ...OKLCH_OPS],
		toCSS: (self) => formatCss(self.project('oklch')) ?? self.hex
	})
);
