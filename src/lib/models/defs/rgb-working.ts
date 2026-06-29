/**
 * RGB working-space models (ACES family, scRGB, SMPTE-C). Backed by the custom
 * modes in modes/rgb-working. Each gets the RGB a11y/CVD family ops plus an
 * `exposure()` — a scene-linear gain across all three channels (the signature
 * move of a working space, not a single-channel tweak).
 */
import { register, defineModel, type CuloriColor } from '../registry';
import { RGB_OPS } from '../families';
import { ColorValue } from '../value';
import { method, num, p } from '../util';
import { RGB_WORKING } from '../modes/rgb-working';

for (const w of RGB_WORKING) {
	register(
		defineModel({
			id: w.id,
			mode: w.id,
			label: w.label,
			family: 'rgb',
			status: 'experimental',
			ctor: {
				name: w.id.toUpperCase(),
				params: [p('r'), p('g'), p('b')],
				build: ([r, g, b]) => ({ mode: w.id, r, g, b }) as unknown as CuloriColor
			},
			channels: [
				{ key: `${w.id}_r`, localKey: 'r', label: 'R', culoriField: 'r', range: [0, 1] },
				{ key: `${w.id}_g`, localKey: 'g', label: 'G', culoriField: 'g', range: [0, 1] },
				{ key: `${w.id}_b`, localKey: 'b', label: 'B', culoriField: 'b', range: [0, 1] }
			],
			ownMethods: [
				method(
					'exposure',
					[p('stops')],
					'color',
					w.scene ? 'Scale scene-linear light by 2^stops' : 'Linear gain of 2^stops',
					(self, [s]) => {
						const c = self.project(w.id) as unknown as Record<string, number | undefined>;
						const f = 2 ** num(s);
						return ColorValue.from({
							mode: w.id,
							r: w.enc(w.dec(c.r ?? 0) * f),
							g: w.enc(w.dec(c.g ?? 0) * f),
							b: w.enc(w.dec(c.b ?? 0) * f)
						} as unknown as CuloriColor);
					}
				)
			],
			inherit: RGB_OPS
		})
	);
}
