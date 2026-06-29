import { test, expect, describe } from 'bun:test';
import { evaluate } from '../src/lib/dsl/evaluator';
import { ColorValue } from '../src/lib/models';

function run(src: string) {
	return evaluate(src);
}

function colorOf(src: string, name: string): ColorValue {
	const r = run(src);
	const v = r.variables.get(name);
	if (!v) throw new Error(`no var ${name}; errors: ${JSON.stringify(r.errors)}`);
	return v.value as ColorValue;
}

describe('object literals — un-deads shift/derive (color.ts:139,149)', () => {
	test('shift({ l }) adds to OKLCH lightness', () => {
		const r = run('a = OKLCH(0.5, 0.1, 200)\nb = a.oklch.shift({ l: 0.1 })');
		expect(r.errors).toEqual([]);
		const b = r.variables.get('b')!.value as ColorValue;
		expect(b.channel('ok_l')).toBeCloseTo(0.6, 6);
		expect(b.channel('ok_c')).toBeCloseTo(0.1, 6);
		expect(b.channel('ok_h')).toBeCloseTo(200, 4);
	});

	test('shift with multiple keys updates each channel', () => {
		const b = colorOf(
			'a = OKLCH(0.5, 0.1, 100)\nb = a.oklch.shift({ l: 0.1, c: 0.05, h: 20 })',
			'b'
		);
		expect(b.channel('ok_l')).toBeCloseTo(0.6, 6);
		expect(b.channel('ok_c')).toBeCloseTo(0.15, 6);
		expect(b.channel('ok_h')).toBeCloseTo(120, 4);
	});

	test('derive({ l }) replaces OKLCH lightness, leaves c/h', () => {
		const b = colorOf('a = OKLCH(0.5, 0.1, 200)\nb = a.oklch.derive({ l: 0.2 })', 'b');
		expect(b.channel('ok_l')).toBeCloseTo(0.2, 6);
		expect(b.channel('ok_c')).toBeCloseTo(0.1, 6);
		expect(b.channel('ok_h')).toBeCloseTo(200, 4);
	});

	test('string and computed object keys', () => {
		const r = run('k = "l"\na = OKLCH(0.5, 0.1, 200)\nb = a.oklch.shift({ "c": 0.05, [k]: 0.1 })');
		expect(r.errors).toEqual([]);
		const b = r.variables.get('b')!.value as ColorValue;
		expect(b.channel('ok_l')).toBeCloseTo(0.6, 6);
		expect(b.channel('ok_c')).toBeCloseTo(0.15, 6);
	});
});

describe('array literals + indexing', () => {
	test('color array literal and positive index', () => {
		const pick = colorOf(
			'a = OKLCH(0.4, 0.1, 10)\nb = OKLCH(0.7, 0.1, 10)\npick = [a, b][1]',
			'pick'
		);
		expect(pick.channel('ok_l')).toBeCloseTo(0.7, 6);
	});

	test('numeric array, .length, positive and negative index', () => {
		const r = run('nums = [10, 20, 30]\nn = nums.length\nfirst = nums[0]\nlast = nums[-1]');
		expect(r.errors).toEqual([]);
		expect(r.variables.get('n')!.value).toBe(3);
		expect(r.variables.get('first')!.value).toBe(10);
		expect(r.variables.get('last')!.value).toBe(30);
	});

	test('out-of-bounds index errors per-statement without killing the run', () => {
		const r = run('a = OKLCH(0.5, 0.1, 200)\nb = [a][5]\nc = 1');
		expect(r.errors.length).toBe(1);
		expect(r.errors[0].line).toBe(2);
		expect(r.variables.get('c')!.value).toBe(1);
	});
});

describe('dependency capture is unchanged', () => {
	test('method call captures the receiver as a dep', () => {
		const r = run('a = OKLCH(0.5, 0.1, 200)\nb = a.oklch.lighten(0.1)');
		expect(r.errors).toEqual([]);
		expect(r.variables.get('b')!.deps).toEqual(['a']);
	});

	test('deps flow through object and array literals + indexing', () => {
		const r = run(
			'a = OKLCH(0.5, 0.1, 200)\nd = 0.1\nb = a.oklch.shift({ l: d })\narr = [a, b]\nc = arr[0]'
		);
		expect(r.errors).toEqual([]);
		expect(r.variables.get('b')!.deps.sort()).toEqual(['a', 'd']);
		expect(r.variables.get('arr')!.deps.sort()).toEqual(['a', 'b']);
		expect(r.variables.get('c')!.deps).toEqual(['arr']);
	});
});

describe('error model', () => {
	test('parse error is terminal and single (no variables produced)', () => {
		const r = run('a = OKLCH(0.5, 0.1, 200\nb = 3');
		expect(r.errors.length).toBe(1);
		expect(r.variables.size).toBe(0);
	});

	test('runtime error is per-statement with a line; other lines still evaluate', () => {
		const r = run('a = OKLCH(0.5, 0.1, 200)\nbad = nope.foo\nc = OKLCH(0.7, 0.1, 200)');
		expect(r.errors.length).toBe(1);
		expect(r.errors[0].line).toBe(2);
		expect(r.variables.get('a')).toBeDefined();
		expect(r.variables.get('c')).toBeDefined();
		expect(r.variables.get('bad')).toBeUndefined();
	});
});
