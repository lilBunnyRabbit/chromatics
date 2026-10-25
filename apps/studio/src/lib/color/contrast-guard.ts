/**
 * The engine half of the `ensureContrast` DSL builtin (CD-13): a value defined as "the nearest colour
 * to my seed that stays legible on a reference", re-solved on every edit because the DSL re-evaluates.
 * Holds hue and searches OKLCH lightness, then chroma, against WCAG contrast of the displayed colour.
 */
import { Oklch, Srgb, type Color } from '@lilbunnyrabbit/chromatics';

const WCAG_TARGETS: Record<string, number> = {
	aa: 4.5,
	aaa: 7,
	'aa-large': 3,
	'aaa-large': 4.5
};

/** `"AA"` | `"AAA"` | `"AA-large"` | `"AAA-large"` (case and space insensitive) or a ratio 1–21. */
export function wcagTargetRatio(target: string | number): number {
	if (typeof target === 'number') {
		if (!(target >= 1 && target <= 21)) {
			throw new Error(`contrast target must be a ratio 1–21 or "AA"/"AAA", got ${target}`);
		}
		return target;
	}
	const ratio = WCAG_TARGETS[target.trim().toLowerCase().replace(/\s+/g, '-')];
	if (ratio === undefined) {
		throw new Error(
			`unknown contrast target "${target}" — use "AA", "AAA", "AA-large", "AAA-large", or a ratio 1–21`
		);
	}
	return ratio;
}

export interface EnsureContrastOptions {
	/** Also relax OKLCH chroma when that lands closer to the seed. Default true. */
	allowChroma?: boolean;
	/** Lightness scan granularity, default 0.005. */
	step?: number;
}

const shown = (c: Color): Srgb => c.to(Srgb).gamutMap();

/**
 * A new colour nearest to `fg` (OKLCH lightness first, then chroma, hue kept) whose gamut-mapped form
 * meets `targetRatio` against `bg`. A copy of `fg` when it already passes; the better of black and
 * white when the target is unreachable. Never mutates its arguments.
 */
export function ensureContrast(
	fg: Color,
	bg: Color,
	targetRatio: number,
	opts: EnsureContrastOptions = {}
): Color {
	const step = opts.step && opts.step > 0 ? opts.step : 0.005;
	const allowChroma = opts.allowChroma ?? true;
	const { l: l0, c: c0, h } = fg.to(Oklch);
	const background = shown(bg);
	const ratio = (s: Srgb) => s.contrast(background);

	if (ratio(shown(fg)) >= targetRatio) return fg.clone();

	const at = (l: number, c: number) =>
		shown(new Oklch(Math.min(1, Math.max(0, l)), Math.max(0, c), h));
	const white = at(1, 0);
	const black = at(0, 0);
	const fallback = ratio(white) >= ratio(black) ? white : black;

	const nearestLightness = (c: number): { srgb: Srgb; l: number } | null => {
		for (let i = 0; i * step <= 1 + 1e-9; i++) {
			const d = i * step;
			for (const l of d === 0 ? [l0] : [l0 - d, l0 + d]) {
				if (l < 0 || l > 1) continue;
				const srgb = at(l, c);
				if (ratio(srgb) >= targetRatio) return { srgb, l };
			}
		}
		return null;
	};

	let best: { srgb: Srgb; dist: number } | null = null;
	for (const s of allowChroma ? [1, 0.75, 0.5, 0.25, 0] : [1]) {
		const c = c0 * s;
		const hit = nearestLightness(c);
		if (!hit) continue;
		const dist = Math.hypot(hit.l - l0, c - c0);
		if (!best || dist < best.dist) best = { srgb: hit.srgb, dist };
	}
	return (best ? best.srgb : fallback).to(Oklch);
}
