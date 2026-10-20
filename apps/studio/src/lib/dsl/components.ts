/**
 * The `component.*` builtins — the DSL surface for component specs. Each takes a
 * config object/array and returns a tagged spec (parallels `preview.*`). Every
 * color/size field is coerced to a Ref string; bindings resolve late through the
 * shared resolver, so a bad reference renders an "unresolved" badge instead of
 * throwing and killing the whole eval pass.
 */
import { str } from '../models/util.js';
import type { DSLValue, DSLFunction, PlainObject } from '../models/index.js';
import type {
	ButtonSpec,
	ButtonVariant,
	ButtonSize,
	CardSpec,
	TypeSpec,
	TypeStep
} from '../scheme/components.js';

const asObj = (v: DSLValue): PlainObject =>
	v && typeof v === 'object' && !Array.isArray(v) ? (v as PlainObject) : {};
const asArr = (v: DSLValue | undefined): DSLValue[] => (Array.isArray(v) ? v : []);

/** A color reference: strings pass through, bare numbers become px. */
const ref = (v: DSLValue): string => {
	if (typeof v === 'string') return v;
	if (typeof v === 'number') return `${v}px`;
	throw new Error('Expected a token/color reference (string)');
};

// A bare token step ("lg", "bold", "4") on a token-typed field expands to its
// family ("radius.lg", "weight.bold", "space.4") — so `radius: "lg"` just works.
const STEP_RE = /^[A-Za-z][A-Za-z0-9]*$/;
const NUM_RE = /^\d+$/;
const tokenRef = (v: DSLValue, family: string): string => {
	if (typeof v === 'number') return `${v}px`;
	const s = str(v);
	if (s.includes('.')) return s;
	if (STEP_RE.test(s) || NUM_RE.test(s)) return `${family}.${s}`;
	return s;
};
const optTokenRef = (v: DSLValue | undefined, family: string, d: string): string =>
	v === undefined ? d : tokenRef(v, family);
const optStr = (v: DSLValue | undefined, d: string): string => (v === undefined ? d : str(v));

function button(...a: DSLValue[]): ButtonSpec {
	const cfg = asObj(a[0]);
	const variants: ButtonVariant[] = asArr(cfg.variants).map((vv) => {
		const v = asObj(vv);
		const out: ButtonVariant = { name: optStr(v.name, 'variant'), bg: ref(v.bg), fg: ref(v.fg) };
		if (v.border !== undefined) out.border = ref(v.border);
		return out;
	});
	const sizes: ButtonSize[] = asArr(cfg.sizes).map((sv) => {
		const s = asObj(sv);
		const out: ButtonSize = {
			name: optStr(s.name, 'md'),
			padY: optTokenRef(s.padY, 'space', 'space.2'),
			padX: optTokenRef(s.padX, 'space', 'space.4'),
			text: optTokenRef(s.text, 'text', 'text.base')
		};
		if (s.radius !== undefined) out.radius = tokenRef(s.radius, 'radius');
		if (s.weight !== undefined) out.weight = tokenRef(s.weight, 'weight');
		return out;
	});
	const states = asArr(cfg.states).map((x) => str(x));
	return {
		__component: 'button',
		variants,
		sizes: sizes.length
			? sizes
			: [{ name: 'md', padY: 'space.2', padX: 'space.4', text: 'text.base' }],
		states: states.length ? states : ['default']
	};
}

function card(...a: DSLValue[]): CardSpec {
	const c = asObj(a[0]);
	const out: CardSpec = {
		__component: 'card',
		bg: c.bg === undefined ? 'surface' : ref(c.bg),
		fg: c.fg === undefined ? 'surface-fg' : ref(c.fg),
		radius: optTokenRef(c.radius, 'radius', 'radius.lg'),
		pad: optTokenRef(c.pad, 'space', 'space.6')
	};
	if (c.border !== undefined) out.border = ref(c.border);
	if (c.shadow !== undefined) out.shadow = tokenRef(c.shadow, 'shadow');
	if (c.title !== undefined) out.title = str(c.title);
	return out;
}

function type(...a: DSLValue[]): TypeSpec {
	const stepsRaw = Array.isArray(a[0]) ? (a[0] as DSLValue[]) : asArr(asObj(a[0]).steps);
	const steps: TypeStep[] = stepsRaw.map((sv) => {
		const s = asObj(sv);
		const out: TypeStep = { text: optTokenRef(s.text, 'text', 'text.base') };
		if (s.weight !== undefined) out.weight = tokenRef(s.weight, 'weight');
		if (s.leading !== undefined) out.leading = tokenRef(s.leading, 'leading');
		if (s.sample !== undefined) out.sample = str(s.sample);
		return out;
	});
	return { __component: 'type', steps };
}

export const component = { button, card, type } as unknown as Record<string, DSLFunction>;

export const COMPONENT_SIGNATURES: Record<string, { sig: string; doc: string }> = {
	button: {
		sig: '({ variants, sizes, states })',
		doc: 'Button matrix — variants × sizes × states'
	},
	card: { sig: '({ bg, fg, radius, pad, … })', doc: 'Surface card spec' },
	type: { sig: '([{ text, weight, sample }])', doc: 'Type specimen ramp' }
};
