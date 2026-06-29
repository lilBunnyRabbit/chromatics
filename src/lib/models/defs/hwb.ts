/** HWB — hue/whiteness/blackness. The intuitive tint/shade space. */
import { register, defineModel, type CuloriColor } from '../registry';
import { HUE_OPS } from '../families';
import { ColorValue } from '../value';
import { method, accessor, clamp01, num, p } from '../util';

function fromHwb(self: ColorValue, over: { h?: number; w?: number; b?: number }): ColorValue {
	const c = self.project('hwb') as unknown as Record<string, number | undefined>;
	return ColorValue.from({
		mode: 'hwb',
		h: over.h ?? c.h ?? 0,
		w: over.w ?? c.w ?? 0,
		b: over.b ?? c.b ?? 0
	} as unknown as CuloriColor);
}

register(
	defineModel({
		id: 'hwb',
		label: 'HWB',
		family: 'hue',
		priority: 'high',
		ctor: {
			name: 'HWB',
			params: [p('h'), p('w'), p('b')],
			build: ([h, w, b]) => ({ mode: 'hwb', h, w, b }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'hwb_h', localKey: 'h', label: 'Hue', culoriField: 'h', range: [0, 360] },
			{ key: 'hwb_w', localKey: 'w', label: 'Whiteness', culoriField: 'w', range: [0, 1] },
			{ key: 'hwb_b', localKey: 'b', label: 'Blackness', culoriField: 'b', range: [0, 1] }
		],
		ownMethods: [
			method(
				'addWhite',
				[p('amount')],
				'color',
				'Raise whiteness (tint toward white)',
				(self, [a]) => fromHwb(self, { w: clamp01(self.channel('hwb_w') + num(a)) })
			),
			method(
				'addBlack',
				[p('amount')],
				'color',
				'Raise blackness (shade toward black)',
				(self, [a]) => fromHwb(self, { b: clamp01(self.channel('hwb_b') + num(a)) })
			),
			method('pureHue', [], 'color', 'Set whiteness and blackness to 0', (self) =>
				fromHwb(self, { w: 0, b: 0 })
			),
			accessor(
				'isGray',
				'boolean',
				'Whiteness + blackness ≥ 1',
				(self) => self.channel('hwb_w') + self.channel('hwb_b') >= 1
			)
		],
		inherit: HUE_OPS
	})
);
