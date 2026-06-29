/**
 * The DSL global environment: constructors (generated from the registry) +
 * free functions + math. Because constructors come from the manifest, adding a
 * model is a pure data change — no edit here.
 */
import { manifest } from './manifest.js';
import { getModel, hex, ColorValue, type DSLValue } from '../models/index.js';
import { num, color, lerpInMode, assertSameModel } from '../models/util.js';
import { wcagContrast, differenceCiede2000 } from '../models/registry.js';
import { preview } from './preview.js';
import { scale, tokenFn } from './tokens.js';
import { component } from './components.js';
import { themeFn } from './theme.js';

export function createEnvironment(): Map<string, DSLValue> {
	const env = new Map<string, DSLValue>();

	// Attach a static `.from(color)` to a constructor: reinterpret/convert any
	// color INTO this model (the symmetric partner of `color.to(model)`).
	const withFrom = (fn: DSLValue, modelId: string): DSLValue => {
		(fn as unknown as Record<string, unknown>).from = (x: DSLValue) => color(x).to(modelId);
		return fn;
	};

	// Color constructors — derived from each model's registered ctor.
	for (const c of manifest.constructors) {
		if (c.name === 'hex') {
			// hex(str) builds from a string; hex.from(color) → the color as sRGB.
			env.set('hex', withFrom(hex, 'srgb'));
			continue;
		}
		const def = getModel(c.model);
		if (!def?.ctor) continue;
		const build = def.ctor.build;
		env.set(
			c.name,
			withFrom((...args: DSLValue[]) => ColorValue.from(build(args.map(num))), def.id)
		);
	}

	// Free functions — binary color ops require both operands in the SAME model.
	// Generic same-model mix: interpolates in the operands' shared model
	// (oklch → shortest-arc OKLCH; lrgb → linear blend; etc.).
	env.set('mix', (a: DSLValue, b: DSLValue, r?: DSLValue) => {
		const ca = color(a);
		const cb = color(b);
		assertSameModel(ca, cb, 'mix');
		return lerpInMode(ca, cb, ca.model, r === undefined ? 0.5 : num(r));
	});
	env.set('contrast', (a: DSLValue, b: DSLValue) => {
		const ca = color(a);
		const cb = color(b);
		assertSameModel(ca, cb, 'contrast');
		return wcagContrast(ca.project('oklch'), cb.project('oklch'));
	});
	env.set('deltaE', (a: DSLValue, b: DSLValue) => {
		const ca = color(a);
		const cb = color(b);
		assertSameModel(ca, cb, 'deltaE');
		return differenceCiede2000()(ca.project('lab'), cb.project('lab'));
	});

	// Preview namespace — preview.gradient(a, b), preview.pair(fg, bg), …
	env.set('preview', preview as unknown as DSLValue);

	// Design-system namespaces — scale.text(16), token('font', …), component.button({…})
	env.set('scale', scale as unknown as DSLValue);
	env.set('token', tokenFn);
	env.set('component', component as unknown as DSLValue);
	env.set('theme', themeFn);

	// Math
	env.set('abs', (n: DSLValue) => Math.abs(num(n)));
	env.set('min', (...args: DSLValue[]) => Math.min(...args.map(num)));
	env.set('max', (...args: DSLValue[]) => Math.max(...args.map(num)));
	env.set('round', (n: DSLValue) => Math.round(num(n)));
	env.set('floor', (n: DSLValue) => Math.floor(num(n)));
	env.set('ceil', (n: DSLValue) => Math.ceil(num(n)));
	env.set('clamp', (v: DSLValue, lo: DSLValue, hi: DSLValue) =>
		Math.max(num(lo), Math.min(num(hi), num(v)))
	);

	return env;
}
