/** CIE Lab — the ΔE workhorse (the difference family lives here via LAB_OPS). */
import { register, defineModel, type CuloriColor } from '../registry';
import { LAB_OPS } from '../families';
import { p } from '../util';

register(
	defineModel({
		id: 'lab',
		label: 'CIE Lab',
		family: 'lab',
		priority: 'critical',
		ctor: {
			name: 'LAB',
			params: [p('l'), p('a'), p('b')],
			build: ([l, a, b]) => ({ mode: 'lab', l, a, b }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'lab_l', localKey: 'l', label: 'L*', culoriField: 'l', range: [0, 100] },
			{ key: 'lab_a', localKey: 'a', label: 'a*', culoriField: 'a', range: [-128, 128] },
			{ key: 'lab_b', localKey: 'b', label: 'b*', culoriField: 'b', range: [-128, 128] }
		],
		inherit: LAB_OPS
	})
);
