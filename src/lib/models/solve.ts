/**
 * Contrast guarding — the engine half of the `ensureContrast` DSL builtin.
 *
 * Resolves the CD-13 "auto-adjust values to preserve accessibility scores"
 * question as a *reactive combinator* instead of a global role-graph solver:
 * a value is DEFINED as "the nearest color to my seed that stays legible on a
 * reference", and because the DSL re-evaluates the whole source on every edit,
 * changing the seed re-solves it. No persisted state, no source rewrite — the
 * single-source invariant (CD-02) holds because the value *is* the relationship.
 *
 * The solver is the gamut mapper with the predicate swapped: where `maxChromaFor`
 * (util.ts) holds L/H and binary-searches chroma against `inGamut`, this holds
 * hue and searches lightness (then chroma) against `contrast >= target`. The
 * `meets`/`score` seam keeps it open to other checks (APCA, …) — same machine.
 */
import { ColorValue } from './value';
import { wcagContrast } from './registry';
import { makeOklch, clamp01 } from './util';

/** WCAG 2.x target presets → minimum contrast ratio. */
const WCAG_TARGETS: Record<string, number> = {
	aa: 4.5,
	aaa: 7,
	'aa-large': 3,
	'aaa-large': 4.5
};

/**
 * Resolve a target argument into a minimum WCAG ratio.
 * Accepts `"AA"` | `"AAA"` | `"AA-large"` | `"AAA-large"` (case / space
 * insensitive) or a raw ratio in `1..21`.
 */
export function wcagTargetRatio(target: string | number): number {
	if (typeof target === 'number') {
		if (!(target >= 1 && target <= 21)) {
			throw new Error(`contrast target must be a ratio 1–21 or "AA"/"AAA", got ${target}`);
		}
		return target;
	}
	const key = target.trim().toLowerCase().replace(/\s+/g, '-');
	const ratio = WCAG_TARGETS[key];
	if (ratio === undefined) {
		throw new Error(
			`unknown contrast target "${target}" — use "AA", "AAA", "AA-large", "AAA-large", or a ratio 1–21`
		);
	}
	return ratio;
}

export interface EnsureContrastOptions {
	/** Also desaturate (relax OKLCH chroma) when it lands closer to the seed. Default true. */
	allowChroma?: boolean;
	/** Lightness scan granularity (default 0.005 → ≤200 samples per side). */
	step?: number;
}

/**
 * Return the nearest color to `fg` — by OKLCH lightness first, then chroma —
 * whose *displayed* (gamut-mapped) form meets `targetRatio` WCAG contrast
 * against `bg`. Pure; never mutates.
 *
 * - If `fg` already clears the target, it is returned unchanged (you get exactly
 *   what you authored).
 * - Hue is always preserved. Candidates are gamut-mapped before measuring, so the
 *   returned color's *visible* contrast is the one guaranteed.
 * - If the target is unreachable even at black/white (e.g. a mid-grey `bg` vs
 *   AAA), the highest-contrast achromatic extreme is returned (best effort) so
 *   the scheme still renders rather than throwing.
 */
export function ensureContrastValue(
	fg: ColorValue,
	bg: ColorValue,
	targetRatio: number,
	opts: EnsureContrastOptions = {}
): ColorValue {
	const step = opts.step && opts.step > 0 ? opts.step : 0.005;
	const allowChroma = opts.allowChroma ?? true;
	const h = fg.channel('ok_h');
	const l0 = fg.channel('ok_l');
	const c0 = fg.channel('ok_c');
	const bgOklch = bg.project('oklch');

	const at = (l: number, c: number): ColorValue =>
		ColorValue.from(makeOklch(clamp01(l), Math.max(0, c), h)).gamutMapped;
	const ratio = (cv: ColorValue): number => wcagContrast(cv.project('oklch'), bgOklch);

	// Already legible once DISPLAYED → hand back the original, untouched. Measured
	// on the gamut-mapped form (like every candidate below) so an out-of-gamut fg
	// that only "passes" on its raw/clipped luminance isn't waved through.
	if (ratio(fg.gamutMapped) >= targetRatio) return fg;

	// Best effort: WCAG contrast is maximised at a luminance extreme, so the
	// better of pure white / pure black is the most legible achievable color.
	const white = at(1, 0);
	const black = at(0, 0);
	const fallback = ratio(white) >= ratio(black) ? white : black;

	/** Nearest lightness to the seed (outward, both directions) that clears the target. */
	const nearestLightness = (c: number): { cv: ColorValue; l: number } | null => {
		for (let i = 0; i * step <= 1 + 1e-9; i++) {
			const d = i * step;
			const sides = d === 0 ? [l0] : [l0 - d, l0 + d];
			for (const l of sides) {
				if (l < 0 || l > 1) continue;
				const cv = at(l, c);
				if (ratio(cv) >= targetRatio) return { cv, l };
			}
		}
		return null;
	};

	// Lightness first; then progressively desaturate, keeping whichever result is
	// perceptually closest to the seed (ΔL/ΔC in OKLCH). Chroma==full has ΔC=0, so
	// a pure-lightness fix wins unless a desaturated one is clearly nearer.
	const chromaScales = allowChroma ? [1, 0.75, 0.5, 0.25, 0] : [1];
	let best: { cv: ColorValue; dist: number } | null = null;
	for (const s of chromaScales) {
		const c = c0 * s;
		const hit = nearestLightness(c);
		if (!hit) continue;
		const dist = Math.hypot(hit.l - l0, c - c0);
		if (!best || dist < best.dist) best = { cv: hit.cv, dist };
	}

	return best ? best.cv : fallback;
}
