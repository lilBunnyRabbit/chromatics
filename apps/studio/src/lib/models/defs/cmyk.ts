/**
 * CMYK — process-ink subtractive. Real but naive (no ICC profile / dot gain),
 * so it ships as experimental. Backed by the custom `cmyk` culori mode.
 */
import { register, defineModel, type CuloriColor } from '../registry';
import { ColorValue } from '../value';
import { method, accessor, num, clamp01, p } from '../util';

type Cmyk = { c: number; m: number; y: number; k: number };
function cmykOf(self: ColorValue): Cmyk {
	const c = self.project('cmyk') as unknown as Record<string, number | undefined>;
	return { c: c.c ?? 0, m: c.m ?? 0, y: c.y ?? 0, k: c.k ?? 0 };
}
function fromCmyk(o: Cmyk): ColorValue {
	return ColorValue.from({ mode: 'cmyk', ...o } as unknown as CuloriColor);
}

register(
	defineModel({
		id: 'cmyk',
		mode: 'cmyk',
		label: 'CMYK',
		family: 'subtractive',
		status: 'experimental',
		ctor: {
			name: 'CMYK',
			params: [p('c'), p('m'), p('y'), p('k')],
			build: ([c, m, y, k]) => ({ mode: 'cmyk', c, m, y, k }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'cmyk_c', localKey: 'c', label: 'Cyan', culoriField: 'c', range: [0, 1] },
			{ key: 'cmyk_m', localKey: 'm', label: 'Magenta', culoriField: 'm', range: [0, 1] },
			{ key: 'cmyk_y', localKey: 'y', label: 'Yellow', culoriField: 'y', range: [0, 1] },
			{ key: 'cmyk_k', localKey: 'k', label: 'Key (black)', culoriField: 'k', range: [0, 1] }
		],
		ownMethods: [
			accessor('totalInk', 'number', 'Total ink coverage (TAC), in percent', (self) => {
				const { c, m, y, k } = cmykOf(self);
				return (c + m + y + k) * 100;
			}),
			accessor(
				'isRichBlack',
				'boolean',
				'Black built with supporting CMY ink (TAC > 100%)',
				(self) => {
					const { c, m, y, k } = cmykOf(self);
					return k > 0.5 && c + m + y > 0.1;
				}
			),
			method('separations', [], 'colors', 'The four single-ink plates (C, M, Y, K)', (self) => {
				const { c, m, y, k } = cmykOf(self);
				return [
					fromCmyk({ c, m: 0, y: 0, k: 0 }),
					fromCmyk({ c: 0, m, y: 0, k: 0 }),
					fromCmyk({ c: 0, m: 0, y, k: 0 }),
					fromCmyk({ c: 0, m: 0, y: 0, k })
				];
			}),
			method(
				'limitInk',
				[p('maxPercent')],
				'color',
				'Scale inks down to a total-area-coverage limit (e.g. 240 for newsprint)',
				(self, [maxP]) => {
					const max = num(maxP) / 100;
					const { c, m, y, k } = cmykOf(self);
					const total = c + m + y + k;
					if (total <= max || total === 0) return self;
					const f = max / total;
					return fromCmyk({ c: c * f, m: m * f, y: y * f, k: k * f });
				}
			),
			method('setKey', [p('k')], 'color', 'Replace the black (key) component', (self, [kk]) => {
				const { c, m, y } = cmykOf(self);
				return fromCmyk({ c, m, y, k: clamp01(num(kk)) });
			})
		]
	})
);
