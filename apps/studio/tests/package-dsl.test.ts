// ADR-016 78f/h/i: the DSL is the package's API, with JS semantics inside a program and frozen
// colours once it returns.
import { describe, expect, test } from 'bun:test';
import { Hsl, Oklch, Srgb8 } from '@lilbunnyrabbit/chromatics';
import { evaluate } from '../src/lib/dsl/evaluator';

const run = (src: string) => evaluate(src);
const value = (src: string, name: string) => run(src).variables.get(name)?.value;

describe('classes', () => {
	test('callable with or without new', () => {
		const a = value('a = Oklch(0.5, 0.1, 30)', 'a');
		const b = value('b = new Oklch(0.5, 0.1, 30)', 'b');
		expect(a).toBeInstanceOf(Oklch);
		expect((a as Oklch).equals(b as Oklch)).toBe(true);
	});

	test('statics and parse', () => {
		expect(value('a = Oklch.parse("oklch(50% 0.1 30)")', 'a')).toBeInstanceOf(Oklch);
		expect(value('a = Hsl.from(Oklch(0.5, 0.1, 30))', 'a')).toBeInstanceOf(Hsl);
		expect(value('a = parse("#ff8000")', 'a')).toBeInstanceOf(Srgb8);
	});

	test('new on something that is not a model is an error', () => {
		expect(run('a = new parse("#fff")').errors[0].message).toContain('color model');
	});
});

describe('members', () => {
	test('channels, conversions and methods are the instance’s own', () => {
		expect(value('a = Oklch(0.5, 0.1, 30)\nl = a.l', 'l')).toBe(0.5);
		expect(value('a = Oklch(0.5, 0.1, 30)\nh = a.to(Hsl).h', 'h')).toBeTypeOf('number');
		expect(
			(value('a = Oklch(0.5, 0.1, 30)\nb = a.clone().lighten(0.1)', 'b') as Oklch).l
		).toBeCloseTo(0.6, 12);
	});

	test('no flat keys, no views', () => {
		expect(run('a = Oklch(0.5, 0.1, 30)\nb = a.ok_l').errors[0].message).toContain(
			'no property: ok_l'
		);
		expect(run('a = Oklch(0.5, 0.1, 30)\nb = a.oklch').errors[0].message).toContain(
			'no property: oklch'
		);
	});

	test('package internals stay hidden', () => {
		for (const name of ['_l', 'assign', 'write', 'alphaOf', 'constructor', '__proto__']) {
			expect(run(`a = Oklch(0.5, 0.1, 30)\nb = a.${name}`).errors[0].message).toContain(
				'no property'
			);
		}
		expect(run('e = Oklch.edges').errors[0].message).toContain('no property');
	});

	test('channel assignment, plain and compound', () => {
		const src = 'a = Oklch(0.5, 0.1, 30)\na.l = 0.7\na.h += 340';
		const a = value(src, 'a') as Oklch;
		expect(a.l).toBe(0.7);
		expect(a.h).toBe(10);
		expect(run('a = Oklch(0.5, 0.1, 30)\na.nope = 1').errors[0].message).toContain('no property');
	});
});

describe('mutation semantics', () => {
	test('a method mutates its receiver, like JS', () => {
		const r = run('brand = Oklch(0.5, 0.1, 30)\nbg = brand.lighten(0.3)');
		expect(r.variables.get('bg')?.value).toBe(r.variables.get('brand')?.value);
		expect((r.variables.get('brand')?.value as Oklch).l).toBeCloseTo(0.8, 12);
	});

	test('clone() and to() keep the original', () => {
		const r = run(
			'brand = Oklch(0.5, 0.1, 30)\nbg = brand.clone().lighten(0.3)\nh = brand.to(Hsl)'
		);
		expect((r.variables.get('brand')?.value as Oklch).l).toBe(0.5);
	});

	test('colours are frozen once the program returns', () => {
		const a = value('a = Oklch(0.5, 0.1, 30)\nlist = [a, Oklch(0.2, 0, 0)]', 'a') as Oklch;
		expect(Object.isFrozen(a)).toBe(true);
		expect(() => a.lighten(0.1)).toThrow(TypeError);
		expect(a.clone().lighten(0.1).l).toBeCloseTo(0.6, 12);
		const list = value('a = Oklch(0.5, 0.1, 30)\nlist = [a, Oklch(0.2, 0, 0)]', 'list') as Oklch[];
		expect(list.every((c) => Object.isFrozen(c))).toBe(true);
	});
});

describe('removed names are errors', () => {
	test.each([
		['hex("#fff")', 'hex'],
		['OKLCH(0.5, 0.1, 30)', 'OKLCH'],
		['mix(Oklch(0.5, 0.1, 30), Oklch(0.5, 0.1, 90))', 'mix'],
		['scale.text(16)', 'scale']
	])('%s', (expr, name) => {
		expect(run(`a = ${expr}`).errors[0].message).toContain(`Undefined variable: ${name}`);
	});
});
