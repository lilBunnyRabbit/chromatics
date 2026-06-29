/** CIE LCh — cylindrical CIE Lab. Carries the ΔE family too. */
import { register, defineModel, type CuloriColor } from '../registry';
import { LAB_OPS } from '../families';
import { p } from '../util';

register(
	defineModel({
		id: 'lch',
		label: 'CIE LCh',
		family: 'lab',
		priority: 'high',
		ctor: {
			name: 'LCH',
			params: [p('l'), p('c'), p('h')],
			build: ([l, c, h]) => ({ mode: 'lch', l, c, h }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'lch_l', localKey: 'l', label: 'L*', culoriField: 'l', range: [0, 100] },
			{ key: 'lch_c', localKey: 'c', label: 'C*', culoriField: 'c', range: [0, 150] },
			{ key: 'lch_h', localKey: 'h', label: 'h', culoriField: 'h', range: [0, 360] }
		],
		inherit: LAB_OPS
	})
);
