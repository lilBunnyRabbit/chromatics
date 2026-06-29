import { test, expect, describe } from 'bun:test';
import { evaluate } from '../src/lib/dsl/evaluator';
import { schemeFromEvalResult } from '../src/lib/scheme/adapter';

const SRC = `bg = OKLCH(0.2, 0.02, 250)
fg = bg.oklch.lighten(0.6)
brand = hex("#6c5ce7")
success = HSL(140, 0.6, 0.4)
spacing = 8`;

function scheme(src: string) {
	return schemeFromEvalResult(evaluate(src), src);
}

describe('schemeFromEvalResult', () => {
	const s = scheme(SRC);

	test('partitions colors from non-color vars', () => {
		expect(s.entries.map((e) => e.name)).toEqual(['bg', 'fg', 'brand', 'success']);
		expect(s.nonColorVars.map((v) => v.name)).toEqual(['spacing']);
	});

	test('byName lookup + flat index space', () => {
		expect(s.byName.get('brand')?.color.hex).toBe('#6c5ce7');
		expect(s.entries.map((e) => e.index)).toEqual([0, 1, 2, 3]);
	});

	test('infers the authoring model from a constructor call', () => {
		expect(s.byName.get('bg')?.model).toBe('oklch');
		expect(s.byName.get('brand')?.model).toBe('hex');
		expect(s.byName.get('success')?.model).toBe('hsl');
		expect(s.byName.get('fg')?.model).toBe('unknown'); // method chain
	});

	test('description = source slice of the RHS', () => {
		expect(s.byName.get('bg')?.description).toBe('OKLCH(0.2, 0.02, 250)');
		expect(s.byName.get('fg')?.description).toBe('bg.oklch.lighten(0.6)');
	});

	test('preserves the dependency graph', () => {
		expect(s.byName.get('fg')?.deps).toEqual(['bg']);
	});

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

	test('carries evaluator errors through', () => {
		const bad = scheme('a = OKLCH(0.5, 0.1, 200)\nb = nope.x');
		expect(bad.errors.length).toBe(1);
		expect(bad.errors[0].line).toBe(2);
		expect(bad.entries.map((e) => e.name)).toEqual(['a']);
	});
});
