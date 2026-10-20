/** CMY (subtractive, no key) and LMS (cone responses) — both real/experimental. */
import { register, defineModel, type CuloriColor } from '../registry';
import { mkDeltaEuclidean } from '../families';
import { ColorValue } from '../value';
import { method, str, p } from '../util';

register(
	defineModel({
		id: 'cmy',
		mode: 'cmy',
		label: 'CMY',
		family: 'subtractive',
		status: 'experimental',
		ctor: {
			name: 'CMY',
			params: [p('c'), p('m'), p('y')],
			build: ([c, m, y]) => ({ mode: 'cmy', c, m, y }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'cmy_c', localKey: 'c', label: 'Cyan', culoriField: 'c', range: [0, 1] },
			{ key: 'cmy_m', localKey: 'm', label: 'Magenta', culoriField: 'm', range: [0, 1] },
			{ key: 'cmy_y', localKey: 'y', label: 'Yellow', culoriField: 'y', range: [0, 1] }
		],
		ownMethods: [
			method('separations', [], 'colors', 'The three ink plates (C, M, Y)', (self) => {
				const c = self.project('cmy') as unknown as Record<string, number | undefined>;
				return [
					ColorValue.from({ mode: 'cmy', c: c.c ?? 0, m: 0, y: 0 } as unknown as CuloriColor),
					ColorValue.from({ mode: 'cmy', c: 0, m: c.m ?? 0, y: 0 } as unknown as CuloriColor),
					ColorValue.from({ mode: 'cmy', c: 0, m: 0, y: c.y ?? 0 } as unknown as CuloriColor)
				];
			})
		]
	})
);

register(
	defineModel({
		id: 'lms',
		mode: 'lms',
		label: 'LMS (cone)',
		family: 'tristimulus',
		status: 'experimental',
		ctor: {
			name: 'LMS',
			params: [p('l'), p('m'), p('s')],
			build: ([l, m, s]) => ({ mode: 'lms', l, m, s }) as unknown as CuloriColor
		},
		channels: [
			{
				key: 'lms_l',
				localKey: 'l',
				label: 'L (long / red cone)',
				culoriField: 'l',
				range: [0, 1]
			},
			{
				key: 'lms_m',
				localKey: 'm',
				label: 'M (medium / green cone)',
				culoriField: 'm',
				range: [0, 1]
			},
			{
				key: 'lms_s',
				localKey: 's',
				label: 'S (short / blue cone)',
				culoriField: 's',
				range: [0, 1]
			}
		],
		ownMethods: [
			method(
				'suppressCone',
				[p('type', 'string')],
				'color',
				'Zero a cone response (l/m/s) — a crude dichromacy model',
				(self, [t]) => {
					const c = self.project('lms') as unknown as Record<string, number | undefined>;
					const key = str(t).toLowerCase()[0];
					return ColorValue.from({
						mode: 'lms',
						l: key === 'l' ? 0 : (c.l ?? 0),
						m: key === 'm' ? 0 : (c.m ?? 0),
						s: key === 's' ? 0 : (c.s ?? 0)
					} as unknown as CuloriColor);
				}
			),
			mkDeltaEuclidean('deltaE', 'lms', 'Euclidean distance in cone-response space')
		]
	})
);
