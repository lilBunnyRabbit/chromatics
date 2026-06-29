/** Display P3 — wide-gamut display space. Carries the RGB family (a11y + CVD). */
import { register, defineModel, type CuloriColor } from '../registry';
import { RGB_OPS } from '../families';
import { accessor, p } from '../util';

register(
	defineModel({
		id: 'p3',
		label: 'Display P3',
		family: 'rgb',
		priority: 'critical',
		ctor: {
			name: 'P3',
			params: [p('r'), p('g'), p('b')],
			build: ([r, g, b]) => ({ mode: 'p3', r, g, b }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'p3_r', localKey: 'r', label: 'Red', culoriField: 'r', range: [0, 1] },
			{ key: 'p3_g', localKey: 'g', label: 'Green', culoriField: 'g', range: [0, 1] },
			{ key: 'p3_b', localKey: 'b', label: 'Blue', culoriField: 'b', range: [0, 1] }
		],
		ownMethods: [
			accessor('isInGamut', 'boolean', 'Displayable in Display P3', (self) => self.inP3)
		],
		inherit: RGB_OPS
	})
);
