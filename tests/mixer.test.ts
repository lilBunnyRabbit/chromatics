import { test, expect, describe } from 'bun:test';
import { hex, ColorValue } from '../src/lib/models';
import {
	mixerModels,
	orderedMixerModels,
	seedVals,
	buildFromVals,
	channelGradient,
	readableText,
	fmtChannel
} from '../src/lib/mixer/engine';

describe('mixer/engine — model set', () => {
	test('exposes only backed models that have channels', () => {
		const ms = mixerModels();
		expect(ms.length).toBeGreaterThan(50);
		for (const m of ms) {
			expect(m.backed).toBe(true);
			expect(m.channels.length).toBeGreaterThan(0);
			expect(m.id).not.toBe('root');
		}
		// stubs / lookups are excluded
		const ids = new Set(ms.map((m) => m.id));
		expect(ids.has('pantone')).toBe(false); // coming-soon
		expect(ids.has('ral')).toBe(false); // zero-channel lookup
		expect(ids.has('srgb')).toBe(true);
	});

	test('ordered view pulls well-known spaces to the front and keeps the full set', () => {
		const ordered = orderedMixerModels();
		expect(ordered.length).toBe(mixerModels().length);
		expect(ordered[0].id).toBe('srgb');
		expect(new Set(ordered.map((m) => m.id)).size).toBe(ordered.length); // no dupes
	});
});

describe('mixer/engine — round-trip seed/build', () => {
	const seed = hex('#cf65c3');

	test('every model rebuilds losslessly from its seeded channels (except RYB)', () => {
		for (const m of mixerModels()) {
			const vals = seedVals(seed, m);
			expect(vals.length).toBe(m.channels.length);
			const rebuilt = buildFromVals(m, vals);
			expect(rebuilt).not.toBeNull();
			if (m.id === 'ryb') continue; // non-bijective artistic model, drift is inherent
			expect(rebuilt!.hex).toBe(seed.hex);
		}
	});

	test('achromatic colors seed finite values (no NaN hue leaks)', () => {
		const gray = hex('#808080');
		for (const m of mixerModels()) {
			for (const v of seedVals(gray, m)) expect(Number.isFinite(v)).toBe(true);
		}
	});

	test('moving one channel changes the resulting color', () => {
		const hsl = mixerModels().find((m) => m.id === 'hsl')!;
		const base = seedVals(seed, hsl);
		const bumped = base.slice();
		bumped[0] = (bumped[0] + 40) % 360; // rotate hue
		expect(buildFromVals(hsl, bumped)!.hex).not.toBe(seed.hex);
	});
});

describe('mixer/engine — presentation helpers', () => {
	test('channelGradient yields a multi-stop linear-gradient', () => {
		const hsl = mixerModels().find((m) => m.id === 'hsl')!;
		const g = channelGradient(hsl, seedVals(hex('#3aa0ff'), hsl), 0, 8);
		expect(g.startsWith('linear-gradient(to right, ')).toBe(true);
		expect(g.split(',').length).toBeGreaterThan(8);
	});

	test('readableText picks dark ink on light, light ink on dark', () => {
		expect(readableText(hex('#ffffff'))).toBe('#000000');
		expect(readableText(hex('#000000'))).toBe('#ffffff');
		expect(readableText(ColorValue.from({ mode: 'rgb', r: 1, g: 1, b: 0 } as never))).toBe(
			'#000000'
		); // yellow is bright
	});

	test('fmtChannel scales precision to magnitude', () => {
		expect(fmtChannel(0.811764)).toBe('0.812');
		expect(fmtChannel(26.526)).toBe('26.5');
		expect(fmtChannel(54.27)).toBe('54');
		expect(fmtChannel(207)).toBe('207');
		expect(fmtChannel(NaN)).toBe('–');
	});
});
