import { ColorValue, isColorValue, type DSLValue, type PlainObject } from './value';
import { ModelView } from './view';
import { toMode, inGamut, type CuloriColor } from './registry';
import type { MethodDef, MethodImpl, ParamDef } from './types';

// --- coercions (the DSL contract; impls call these on their args) ---

export function num(v: DSLValue): number {
	if (typeof v === 'number') return v;
	throw new Error(`Expected number, got ${typeof v}`);
}
export function str(v: DSLValue): string {
	if (typeof v === 'string') return v;
	throw new Error(`Expected string, got ${typeof v}`);
}
/**
 * Accepts a ColorValue or a ModelView. A ModelView used as a VALUE converts to
 * its model (c.oklch as an operand means "c converted to oklch") — this is the
 * conversion-as-value form the same-model ops rely on.
 */
export function color(v: DSLValue): ColorValue {
	if (isColorValue(v)) return v;
	if (v instanceof ModelView) return v.self.to(v.def.id);
	throw new Error(`Expected color, got ${typeof v}`);
}
export function obj(v: DSLValue): PlainObject {
	if (
		v !== null &&
		typeof v === 'object' &&
		!Array.isArray(v) &&
		!isColorValue(v) &&
		!(v instanceof ModelView)
	) {
		return v as PlainObject;
	}
	throw new Error(`Expected object, got ${typeof v}`);
}
/** Optional numeric field of an options object. */
export function optNum(o: PlainObject, key: string): number | undefined {
	const v = o[key];
	return v === undefined ? undefined : num(v);
}

/**
 * Enforce that a binary color op's operands share a model. The redesign forbids
 * silently converting one operand to match the other — mix/contrast/deltaE
 * require both colors already in the same model; the caller converts first.
 */
export function assertSameModel(a: ColorValue, b: ColorValue, op: string): void {
	if (a.model !== b.model) {
		throw new Error(
			`${op}() expects both colors in the same model, got ${a.model} and ${b.model}. ` +
				`Convert one first, e.g. b.to("${a.model}").`
		);
	}
}

// --- scalar helpers ---

/** Thrown by methods/ctors on models that aren't culori-backed yet. */
export function unbacked(label: string): never {
	throw new Error(`${label} is not yet backed — needs the @lilbunnyrabbit/chromatics package`);
}

export function clamp01(n: number): number {
	return Math.max(0, Math.min(1, n));
}
export function wrapHue(h: number): number {
	return ((h % 360) + 360) % 360;
}
export function makeOklch(l: number, c: number, h: number): CuloriColor {
	return { mode: 'oklch', l, c, h } as unknown as CuloriColor;
}

// --- color helpers shared across families ---

/**
 * Hue interpolation strategy for cylindrical spaces — mirrors culori's hue
 * fixup. `shorter` takes the short arc (the historic default); `longer` the
 * long way round; `increasing`/`decreasing` force a monotonic sweep (full
 * spectrum even when the endpoints share a hue).
 */
export type HueStrategy = 'shorter' | 'longer' | 'increasing' | 'decreasing';

/** Signed hue delta from h1→h2 under the chosen fixup, in degrees. */
function hueDelta(h1: number, h2: number, strategy: HueStrategy): number {
	const fwd = wrapHue(h2 - h1); // 0..360 going forward (counter-clockwise)
	switch (strategy) {
		case 'longer':
			return fwd !== 0 && fwd < 180 ? fwd - 360 : fwd;
		case 'increasing':
			return fwd;
		case 'decreasing':
			// Match culori (and `increasing`): equal hues stay flat, not a full sweep.
			return fwd === 0 ? 0 : fwd - 360;
		case 'shorter':
		default:
			return fwd > 180 ? fwd - 360 : fwd;
	}
}

/** Channel-wise linear interpolation in a culori mode (hue per `strategy`). */
export function lerpInMode(
	a: ColorValue,
	b: ColorValue,
	mode: string,
	t: number,
	hue: HueStrategy = 'shorter'
): ColorValue {
	const ca = a.project(mode) as unknown as Record<string, number | undefined> & { mode: string };
	const cb = b.project(mode) as unknown as Record<string, number | undefined>;
	const out: Record<string, unknown> = { mode };
	for (const k of Object.keys(ca)) {
		if (k === 'mode') continue;
		const va = ca[k] ?? 0;
		const vb = cb[k] ?? 0;
		out[k] = k === 'h' ? lerpHue(va, vb, t, hue) : va * (1 - t) + vb * t;
	}
	return ColorValue.from(out as unknown as CuloriColor);
}
export function lerpHue(
	h1: number,
	h2: number,
	t: number,
	strategy: HueStrategy = 'shorter'
): number {
	return wrapHue(h1 + hueDelta(h1, h2, strategy) * t);
}

/**
 * Rotate a color's hue inside an arbitrary cylindrical model: project into
 * `mode`, bump its `h` field, rebuild as that mode (stays stored natively in
 * `mode`). The characteristic per-model move shared by harmony ops + the card.
 */
export function rotateHueInMode(self: ColorValue, mode: string, deg: number): ColorValue {
	const c = self.project(mode) as unknown as Record<string, number | undefined> & { mode: string };
	return ColorValue.from({ ...c, h: wrapHue((c.h ?? 0) + deg) } as unknown as CuloriColor);
}

/** OKLCH shortest-arc mix — the legacy `Color.mix` behaviour (parity). */
export function oklchMix(a: ColorValue, b: ColorValue, ratio: number): ColorValue {
	const l = a.channel('ok_l') * (1 - ratio) + b.channel('ok_l') * ratio;
	const c = a.channel('ok_c') * (1 - ratio) + b.channel('ok_c') * ratio;
	const h = lerpHue(a.channel('ok_h'), b.channel('ok_h'), ratio);
	return ColorValue.from(makeOklch(l, c, h));
}

/** Binary search for the highest in-gamut OKLCH chroma at a fixed L/H. */
export function maxChromaFor(l: number, h: number, space: string): number {
	const fits = (c: number) =>
		!!(inGamut(space as Parameters<typeof inGamut>[0]) as (x: CuloriColor) => boolean)(
			makeOklch(l, c, h)
		);
	let lo = 0;
	let hi = 0.5;
	if (fits(hi)) return hi;
	for (let i = 0; i < 24; i++) {
		const mid = (lo + hi) / 2;
		if (fits(mid)) lo = mid;
		else hi = mid;
	}
	return lo;
}

// --- MethodDef / ParamDef builders (keep the def files declarative) ---

export function p(
	name: string,
	kind: ParamDef['kind'] = 'number',
	extra: Partial<ParamDef> = {}
): ParamDef {
	return { name, kind, ...extra };
}
export function method(
	name: string,
	params: ParamDef[],
	returns: MethodDef['returns'],
	doc: string,
	impl: MethodImpl,
	inheritedFrom?: string
): MethodDef {
	return { name, kind: 'method', params, returns, doc, impl, inheritedFrom };
}
export function accessor(
	name: string,
	returns: MethodDef['returns'],
	doc: string,
	impl: MethodImpl,
	inheritedFrom?: string
): MethodDef {
	return { name, kind: 'accessor', params: [], returns, doc, impl, inheritedFrom };
}

export { toMode };
