/** HSV — hue/saturation/value. Naive hue harmony (inherited). */
import { register, defineModel, type CuloriColor } from '../registry';
import { HUE_OPS } from '../families';
import { p } from '../util';

register(
	defineModel({
		id: 'hsv',
		label: 'HSV',
		family: 'hue',
		priority: 'high',
		ctor: {
			name: 'HSV',
			params: [p('h'), p('s'), p('v')],
			build: ([h, s, v]) => ({ mode: 'hsv', h, s, v }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'hsv_h', localKey: 'h', label: 'Hue', culoriField: 'h', range: [0, 360] },
			{ key: 'hsv_s', localKey: 's', label: 'Saturation', culoriField: 's', range: [0, 1] },
			{ key: 'hsv_v', localKey: 'v', label: 'Value', culoriField: 'v', range: [0, 1] }
		],
		inherit: HUE_OPS
	})
);
