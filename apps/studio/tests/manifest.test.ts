import { test, expect, describe } from 'bun:test';
import { Oklch } from '@lilbunnyrabbit/chromatics';
import { models } from '@lilbunnyrabbit/chromatics/all';
import { manifest } from '../src/lib/dsl/manifest';
import { createEnvironment, evaluate, MODEL_CLASSES } from '@lilbunnyrabbit/chromatics-dsl';

const PROBE = 'Oklch(0.6, 0.12, 250)';

function reach(prelude: string, expr: string): { value: unknown; error?: string } {
	const r = evaluate(`${prelude}\nx = ${expr}`);
	return { value: r.variables.get('x')?.value, error: r.errors[0]?.message };
}

describe('manifest <-> runtime (anti-drift)', () => {
	test('constructors are exactly the package models, by export name', () => {
		expect(manifest.constructors.map((c) => c.name)).toEqual(MODEL_CLASSES.map(([n]) => n));
		expect(manifest.constructors).toHaveLength(models.length);
		expect(manifest.constructorNames.has('Oklch')).toBe(true);
		expect(manifest.constructorNames.has('Hwb')).toBe(true);
	});

	test('every constructor is callable in the DSL', () => {
		for (const { name } of manifest.constructors) {
			const { value, error } = reach('', `${PROBE}.to(${name})`);
			expect(error, name).toBeUndefined();
			expect(value, name).toBeDefined();
		}
	});

	test('every documented instance member resolves on an instance of its model', () => {
		for (const [name, members] of manifest.modelMembers) {
			const prelude = `c = ${PROBE}.to(${name})`;
			for (const m of members) {
				const { value, error } = reach(prelude, `c.${m.name}`);
				expect(error, `${name}.${m.name}`).toBeUndefined();
				if (m.kind === 'method') expect(typeof value, `${name}.${m.name}`).toBe('function');
				else expect(value, `${name}.${m.name}`).toBeDefined();
			}
		}
	});

	test('every documented static resolves on its class', () => {
		for (const { name } of manifest.constructors) {
			for (const m of manifest.viewMembers.get(name) ?? []) {
				const { error } = reach('', `${name}.${m.name}`);
				expect(error, `${name}.${m.name}`).toBeUndefined();
			}
		}
	});

	test('every namespace member resolves', () => {
		for (const ns of ['preview', 'tokens', 'component', 'theme']) {
			const members = manifest.viewMembers.get(ns);
			expect(members?.length, ns).toBeGreaterThan(0);
			for (const m of members ?? []) {
				const { value, error } = reach('', `${ns}.${m.name}`);
				expect(error, `${ns}.${m.name}`).toBeUndefined();
				expect(typeof value, `${ns}.${m.name}`).toBe('function');
			}
		}
	});

	test('the documented namespaces and builtins are exactly the package environment', () => {
		const env = createEnvironment();
		for (const ns of ['preview', 'tokens', 'component', 'theme']) {
			const documented = (manifest.viewMembers.get(ns) ?? []).map((m) => m.name).sort();
			const real = env.get(ns);
			expect(documented, ns).toEqual(Object.keys(real as object).sort());
		}
		const models = new Set(MODEL_CLASSES.map(([n]) => n));
		const builtins = [...env.keys()].filter((k) => !models.has(k)).sort();
		expect(manifest.builtins.filter((b) => b !== 'roles').sort()).toEqual(builtins);
	});

	test('every builtin is defined in the environment', () => {
		for (const b of manifest.builtins) {
			if (b === 'roles') continue;
			const { error } = reach('', b);
			expect(error, b).toBeUndefined();
		}
	});

	test('token sets are populated and cover known tokens', () => {
		expect(manifest.methodNames.has('rotateHue')).toBe(true);
		expect(manifest.methodNames.has('deltaE2000')).toBe(true);
		expect(manifest.methodNames.has('to')).toBe(true);
		expect(manifest.propertyNames.has('w')).toBe(true);
		expect(manifest.builtinNames.has('parse')).toBe(true);
		expect(manifest.builtinNames.has('ensureContrast')).toBe(true);
	});

	test('the old names are not in the manifest (ADR-016 78f, 78k)', () => {
		for (const old of ['OKLCH', 'HWB', 'LAB', 'hex'])
			expect(manifest.constructorNames.has(old), old).toBe(false);
		for (const old of ['hex', 'mix', 'contrast', 'deltaE', 'token'])
			expect(manifest.builtinNames.has(old), old).toBe(false);
		expect(manifest.propertyNames.has('hwb_w')).toBe(false);
		expect(manifest.propertyNames.has('oklch')).toBe(false);
		expect(manifest.viewMembers.has('scale')).toBe(false);
	});

	test('package internals are not documented as members', () => {
		for (const members of manifest.modelMembers.values()) {
			for (const m of members) {
				expect(m.name.startsWith('_'), m.name).toBe(false);
				expect(['assign', 'write', 'alphaOf', 'constructor']).not.toContain(m.name);
			}
		}
	});

	test('a model surfaces everywhere from the package alone', () => {
		expect(manifest.modelMembers.get('Hwb')!.map((x) => x.name)).toContain('w');
		expect(manifest.modelMembers.get('Oklch')!.map((x) => x.name)).toContain('lighten');
		expect(manifest.viewMembers.get('Oklch')!.map((x) => x.name)).toContain('parse');
		expect(manifest.models.some((m) => m.model === Oklch)).toBe(true);
	});
});
