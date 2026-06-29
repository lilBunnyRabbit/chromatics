/**
 * Video / broadcast model views, backed by the custom modes in modes/video.
 * The headline manipulation is `scaleChroma()` — video-domain saturation that
 * scales both chroma channels about their centre (touching the whole chroma
 * pair, not one slider). Rec.2100 instead gets a PQ-aware `exposure()`.
 */
import { register, defineModel, type CuloriColor } from '../registry';
import { ColorValue } from '../value';
import { method, num, p } from '../util';
import { VIDEO_SPACES } from '../modes/video';
import { pqDecode, pqEncode } from '../modes/video';

for (const s of VIDEO_SPACES) {
	const names = s.chan.map((c) => c.key);
	const [i1, i2] = s.chroma;
	register(
		defineModel({
			id: s.id,
			mode: s.id,
			label: s.label,
			family: 'video',
			status: 'experimental',
			ctor: {
				name: s.id.toUpperCase(),
				params: names.map((n) => p(n)),
				build: (vals) =>
					({
						mode: s.id,
						[names[0]]: vals[0],
						[names[1]]: vals[1],
						[names[2]]: vals[2]
					}) as unknown as CuloriColor
			},
			channels: s.chan.map((c, idx) => ({
				key: `${s.id}_${c.key}`,
				localKey: c.key,
				label: c.label,
				culoriField: c.key,
				range: idx === 0 ? ([0, 1] as [number, number]) : ([-0.6, 1.1] as [number, number])
			})),
			ownMethods: [
				method(
					'scaleChroma',
					[p('factor')],
					'color',
					'Scale both chroma channels about their centre (video saturation)',
					(self, [f]) => {
						const c = self.project(s.id) as unknown as Record<string, number | undefined>;
						const k = num(f);
						const o1 = s.chan[i1].key === 'cb' || s.chan[i1].key === 'cr' ? 0.5 : 0;
						const o2 = s.chan[i2].key === 'cb' || s.chan[i2].key === 'cr' ? 0.5 : 0;
						const out: Record<string, number> = { [names[0]]: c[names[0]] ?? 0 };
						out[names[i1]] = o1 + ((c[names[i1]] ?? 0) - o1) * k;
						out[names[i2]] = o2 + ((c[names[i2]] ?? 0) - o2) * k;
						return ColorValue.from({ mode: s.id, ...out } as unknown as CuloriColor);
					}
				)
			]
		})
	);
}

// Rec.2100 (HDR, PQ-encoded Rec.2020)
register(
	defineModel({
		id: 'rec2100',
		mode: 'rec2100',
		label: 'Rec.2100 (PQ)',
		family: 'video',
		status: 'experimental',
		ctor: {
			name: 'REC2100',
			params: [p('r'), p('g'), p('b')],
			build: ([r, g, b]) => ({ mode: 'rec2100', r, g, b }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'rec2100_r', localKey: 'r', label: "R' (PQ)", culoriField: 'r', range: [0, 1] },
			{ key: 'rec2100_g', localKey: 'g', label: "G' (PQ)", culoriField: 'g', range: [0, 1] },
			{ key: 'rec2100_b', localKey: 'b', label: "B' (PQ)", culoriField: 'b', range: [0, 1] }
		],
		ownMethods: [
			method(
				'exposure',
				[p('stops')],
				'color',
				'Scale linear light by 2^stops (through the PQ curve)',
				(self, [s]) => {
					const c = self.project('rec2100') as unknown as Record<string, number | undefined>;
					const f = 2 ** num(s);
					return ColorValue.from({
						mode: 'rec2100',
						r: pqEncode(pqDecode(c.r ?? 0) * f),
						g: pqEncode(pqDecode(c.g ?? 0) * f),
						b: pqEncode(pqDecode(c.b ?? 0) * f)
					} as unknown as CuloriColor);
				}
			)
		]
	})
);
