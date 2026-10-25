import { test, expect, describe } from 'bun:test';
import { Color, Srgb, Srgb8 } from '@lilbunnyrabbit/chromatics';
import { models } from '@lilbunnyrabbit/chromatics/all';
import {
	mixerModels,
	orderedMixerModels,
	seedVals,
	buildFromVals,
	channelGradient,
	readableText,
	fmtChannel,
	lightIndex
} from '../src/lib/mixer/engine';

const hexOf = (c: Color) => c.to(Srgb).gamutMap().to(Srgb8).toHex();
const byName = (name: string) => mixerModels().find((m) => m.name === name)!;

describe('mixer/engine — model set', () => {
	test('exposes exactly the package models, each with channels', () => {
		const ms = mixerModels();
		expect(ms.length).toBe(models.length);
		for (const m of ms) expect(m.channels.length).toBeGreaterThan(0);
		const names = new Set(ms.map((m) => m.name));
		expect(names.has('Srgb')).toBe(true);
		expect(names.has('Pantone')).toBe(false);
		expect(names.has('Ral')).toBe(false);
	});

	test('ordered view pulls well-known spaces to the front and keeps the full set', () => {
		const ordered = orderedMixerModels();
		expect(ordered.length).toBe(mixerModels().length);
		expect(ordered[0].name).toBe('Srgb');
		expect(new Set(ordered.map((m) => m.name)).size).toBe(ordered.length);
	});
});

describe('mixer/engine — round-trip seed/build', () => {
	const seed = Srgb8.parse('#cf65c3');

	test('every model rebuilds losslessly from its seeded channels (except RYB)', () => {
		for (const m of mixerModels()) {
			const vals = seedVals(seed, m);
			expect(vals.length).toBe(m.channels.length);
			const rebuilt = buildFromVals(m, vals);
			expect(rebuilt).not.toBeNull();
			if (m.name === 'Ryb') continue; // Newton-solved inverse, drift is inherent
			expect(hexOf(rebuilt!)).toBe('#cf65c3');
		}
	});

	test('achromatic colors seed finite values (no NaN hue leaks)', () => {
		const gray = Srgb8.parse('#808080');
		for (const m of mixerModels()) {
			for (const v of seedVals(gray, m)) expect(Number.isFinite(v)).toBe(true);
		}
	});

	test('a conversion that throws seeds the channel midpoints', () => {
		const ryb = byName('Ryb');
		const darkBlue = new Srgb(0, 0, 0.75); // package README: about 0.4% of sRGB has no Ryb
		expect(seedVals(darkBlue, ryb)).toEqual(ryb.channels.map((c) => (c.range[0] + c.range[1]) / 2));
	});

	test('moving one channel changes the resulting color', () => {
		const hsl = byName('Hsl');
		const base = seedVals(seed, hsl);
		const bumped = base.slice();
		bumped[0] = (bumped[0] + 40) % 360;
		expect(hexOf(buildFromVals(hsl, bumped)!)).not.toBe('#cf65c3');
	});

	test('a set the model rejects builds null', () => {
		expect(buildFromVals(byName('Hsl'), [NaN, 0.5, 0.5])).toBeNull();
	});
});

describe('mixer/engine — presentation helpers', () => {
	test('channelGradient yields a multi-stop linear-gradient', () => {
		const hsl = byName('Hsl');
		const g = channelGradient(hsl, seedVals(Srgb8.parse('#3aa0ff'), hsl), 0, 8);
		expect(g.startsWith('linear-gradient(to right, ')).toBe(true);
		expect(g.split(',').length).toBeGreaterThan(8);
	});

	test('readableText picks dark ink on light, light ink on dark', () => {
		expect(readableText(Srgb8.parse('#ffffff'))).toBe('#000000');
		expect(readableText(Srgb8.parse('#000000'))).toBe('#ffffff');
		expect(readableText(new Srgb(1, 1, 0))).toBe('#000000');
	});

	test('fmtChannel scales precision to magnitude', () => {
		expect(fmtChannel(0.811764)).toBe('0.812');
		expect(fmtChannel(26.526)).toBe('26.5');
		expect(fmtChannel(54.27)).toBe('54');
		expect(fmtChannel(207)).toBe('207');
		expect(fmtChannel(NaN)).toBe('–');
	});

	test('lightIndex finds the lightness axis and never a hue', () => {
		expect(lightIndex(byName('Oklch'))).toBe(0);
		expect(lightIndex(byName('Hsv'))).toBe(2);
		expect(lightIndex(byName('Xyy'))).toBe(2);
		expect(lightIndex(byName('Tsl'))).toBe(2);
		expect(lightIndex(byName('Hpluv'))).toBe(2);
		expect(lightIndex(byName('Hwb'))).toBe(-1);
	});
});
