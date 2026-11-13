import { test, expect, describe } from 'bun:test';
import { evaluate } from '@lilbunnyrabbit/chromatics-dsl';
import { schemeFromEvalResult } from '../src/lib/scheme/adapter';

const SRC = `bg = Oklch(0.2, 0.02, 250)
fg = bg.to(Oklch).lighten(0.6)
brand = parse("#6c5ce7")
success = Hsl(140, 0.6, 0.4)
spacing = 8`;

function scheme(src: string) {
	return schemeFromEvalResult(evaluate(src), src);
}

describe('schemeFromEvalResult (studio groups)', () => {
	const s = scheme(SRC);

	test('groups by name heuristic, ordered', () => {
		const labels = s.groups.map((g) => g.label);
		expect(labels).toEqual(['Core', 'Background', 'Foreground', 'Semantic']);
		expect(s.groups.find((g) => g.label === 'Background')?.entries.map((e) => e.name)).toEqual([
			'bg'
		]);
		expect(s.groups.find((g) => g.label === 'Foreground')?.entries.map((e) => e.name)).toEqual([
			'fg'
		]);
		expect(s.groups.find((g) => g.label === 'Core')?.entries.map((e) => e.name)).toEqual(['brand']);
		expect(s.groups.find((g) => g.label === 'Semantic')?.entries.map((e) => e.name)).toEqual([
			'success'
		]);
	});
});
