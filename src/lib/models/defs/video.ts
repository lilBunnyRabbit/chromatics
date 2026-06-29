/** Video / broadcast luma-chroma encodings. */
import { register, defineModel, type CuloriColor } from '../registry';
import { LAB_OPS } from '../families';
import { ColorValue } from '../value';
import { method, num, p } from '../util';

register(
	defineModel({
		id: 'yiq',
		label: 'YIQ (NTSC)',
		family: 'video',
		ctor: {
			name: 'YIQ',
			params: [p('y'), p('i'), p('q')],
			build: ([y, i, q]) => ({ mode: 'yiq', y, i, q }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'yiq_y', localKey: 'y', label: 'Luma', culoriField: 'y', range: [0, 1] },
			{ key: 'yiq_i', localKey: 'i', label: 'In-phase', culoriField: 'i', range: [-0.6, 0.6] },
			{ key: 'yiq_q', localKey: 'q', label: 'Quadrature', culoriField: 'q', range: [-0.6, 0.6] }
		],
		ownMethods: [
			method(
				'scaleChroma',
				[p('factor')],
				'color',
				'Scale the I/Q chroma channels (NTSC saturation)',
				(self, [f]) => {
					const c = self.project('yiq') as unknown as Record<string, number | undefined>;
					const k = num(f);
					return ColorValue.from({
						mode: 'yiq',
						y: c.y ?? 0,
						i: (c.i ?? 0) * k,
						q: (c.q ?? 0) * k
					} as unknown as CuloriColor);
				}
			)
		],
		inherit: LAB_OPS
	})
);
