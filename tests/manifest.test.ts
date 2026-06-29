import { test, expect, describe } from 'bun:test';
import { manifest } from '../src/lib/dsl/manifest';
import { OKLCH, getModel } from '../src/lib/models';

const probe = OKLCH(0.6, 0.12, 250);

describe('manifest <-> runtime (anti-drift)', () => {
	test('constructors cover registered ctors + hex', () => {
		const names = manifest.constructors.map((c) => c.name);
		expect(names).toContain('OKLCH');
		expect(names).toContain('HWB');
		expect(names).toContain('LAB');
		expect(names).toContain('hex');
	});

	test('every flat channel accessor resolves to a number on a value', () => {
		for (const m of manifest.valueMembers.filter((x) => x.kind === 'channel')) {
			expect(typeof probe.channel(m.name)).toBe('number');
		}
	});

	test('every flat shortcut resolves on a value', () => {
		for (const m of manifest.valueMembers.filter(
			(x) => x.kind === 'method' || x.kind === 'accessor'
		)) {
			const v = probe.member(m.name);
			expect(v).toBeDefined();
			if (m.kind === 'method') expect(typeof v).toBe('function');
		}
	});

	test('every view member resolves on its view', () => {
		for (const [id, members] of manifest.viewMembers) {
			const def = getModel(id);
			if (!def?.backed) continue;
			const view = probe.view(id);
			for (const m of members) {
				const v = view.member(m.name);
				expect(v).toBeDefined();
				if (m.kind === 'method') expect(typeof v).toBe('function');
			}
		}
	});

	test('token sets are populated and cover known tokens', () => {
		expect(manifest.methodNames.has('rotateHue')).toBe(true);
		expect(manifest.methodNames.has('deltaE2000')).toBe(true);
		expect(manifest.propertyNames.has('hwb_w')).toBe(true);
		expect(manifest.propertyNames.has('oklch')).toBe(true); // view name
		expect(manifest.constructorNames.has('OKLCH')).toBe(true);
		expect(manifest.constructorNames.has('hex')).toBe(false); // hex highlights as builtin
		expect(manifest.builtinNames.has('hex')).toBe(true);
		expect(manifest.builtinNames.has('mix')).toBe(true);
	});

	test('a registered model surfaces everywhere (adding a model = data only)', () => {
		expect(manifest.viewMembers.has('hwb')).toBe(true);
		expect(manifest.constructors.some((c) => c.name === 'HWB')).toBe(true);
		expect(manifest.viewMembers.get('hwb')!.map((x) => x.name)).toContain('addWhite');
	});
});
