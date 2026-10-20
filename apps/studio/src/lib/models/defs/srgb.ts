/** sRGB — the display space. Carries the RGB family (a11y + CVD). */
import { register, defineModel, formatCss, type CuloriColor } from '../registry';
import { RGB_OPS } from '../families';
import { p } from '../util';

register(
	defineModel({
		id: 'srgb',
		mode: 'rgb', // culori's sRGB mode is "rgb"
		label: 'sRGB',
		family: 'rgb',
		priority: 'critical',
		ctor: {
			name: 'RGB',
			params: [p('r'), p('g'), p('b')],
			build: ([r, g, b]) => ({ mode: 'rgb', r, g, b }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'r', localKey: 'r', label: 'Red', culoriField: 'r', range: [0, 1] },
			{ key: 'g', localKey: 'g', label: 'Green', culoriField: 'g', range: [0, 1] },
			{ key: 'b', localKey: 'b', label: 'Blue', culoriField: 'b', range: [0, 1] }
		],
		inherit: RGB_OPS,
		toCSS: (self) => formatCss(self.project('rgb')) ?? self.hex
	})
);
