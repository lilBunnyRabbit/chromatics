/** HSL — the web's cylindrical workhorse. Naive hue harmony + tint/shade/tone. */
import { register, defineModel, type CuloriColor } from '../registry';
import { HUE_OPS } from '../families';
import { ColorValue } from '../value';
import { method, clamp01, num, p } from '../util';

/** Rebuild a ColorValue from this color's HSL projection with overrides. */
function fromHsl(self: ColorValue, over: { h?: number; s?: number; l?: number }): ColorValue {
	const c = self.project('hsl') as unknown as Record<string, number | undefined>;
	return ColorValue.from({
		mode: 'hsl',
		h: over.h ?? c.h ?? 0,
		s: over.s ?? c.s ?? 0,
		l: over.l ?? c.l ?? 0
	} as unknown as CuloriColor);
}

register(
	defineModel({
		id: 'hsl',
		label: 'HSL',
		family: 'hue',
		priority: 'critical',
		ctor: {
			name: 'HSL',
			params: [p('h'), p('s'), p('l')],
			build: ([h, s, l]) => ({ mode: 'hsl', h, s, l }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'h', localKey: 'h', label: 'Hue', culoriField: 'h', range: [0, 360] },
			{ key: 's', localKey: 's', label: 'Saturation', culoriField: 's', range: [0, 1] },
			{ key: 'l', localKey: 'l', label: 'Lightness', culoriField: 'l', range: [0, 1] }
		],
		ownMethods: [
			method('tint', [p('amount')], 'color', 'Move HSL lightness toward white', (self, [a]) => {
				const l = self.project('hsl') as unknown as Record<string, number | undefined>;
				const cur = l.l ?? 0;
				return fromHsl(self, { l: clamp01(cur + (1 - cur) * num(a)) });
			}),
			method('shade', [p('amount')], 'color', 'Move HSL lightness toward black', (self, [a]) => {
				const l = self.project('hsl') as unknown as Record<string, number | undefined>;
				return fromHsl(self, { l: clamp01((l.l ?? 0) * (1 - num(a))) });
			}),
			method('tone', [p('amount')], 'color', 'Move HSL saturation toward gray', (self, [a]) => {
				const s = self.project('hsl') as unknown as Record<string, number | undefined>;
				return fromHsl(self, { s: clamp01((s.s ?? 0) * (1 - num(a))) });
			})
		],
		inherit: HUE_OPS
	})
);
