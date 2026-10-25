import { parse } from '@lilbunnyrabbit/chromatics/all';
import { ensureContrast, wcagTargetRatio } from '../color/contrast-guard.js';
import { MODEL_CLASSES, color, num, str, type DSLValue } from './values.js';
import { preview } from './preview.js';
import { tokens } from './tokens.js';
import { component } from './components.js';
import { themeFn } from './theme.js';

export function createEnvironment(): Map<string, DSLValue> {
	const env = new Map<string, DSLValue>();

	for (const [name, model] of MODEL_CLASSES) env.set(name, model);
	env.set('parse', (s: DSLValue) => parse(str(s)));

	// Unlike the colour methods, the reference needs no shared model: bg is only measured against.
	env.set('ensureContrast', (fg: DSLValue, bg: DSLValue, target?: DSLValue) => {
		const t = target === undefined ? 'AA' : target;
		return ensureContrast(
			color(fg),
			color(bg),
			wcagTargetRatio(typeof t === 'number' ? t : str(t))
		);
	});

	env.set('preview', preview as unknown as DSLValue);
	env.set('tokens', tokens as unknown as DSLValue);
	env.set('component', component as unknown as DSLValue);
	env.set('theme', themeFn);

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
