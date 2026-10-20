/**
 * Candidate combination search — the answer to "which background / foreground /
 * primary do I actually pick?".
 *
 * Choosing a base trio by eye is the one step the studio had no system for: the
 * audit tells you whether the trio you already picked is legal, never which of
 * the N legal trios is *better*. This module enumerates every bg × fg × primary
 * the palette can form, measures each on the metrics that matter (WCAG 2 + APCA
 * for the three load-bearing pairs, CIEDE2000 separation, gamut safety, and how
 * all of that survives dichromacy), and ranks them into a shortlist.
 *
 * It is pure and Svelte-free: build a `CombinationCtx` once per scheme (it
 * precomputes the O(n²) contrast / ΔE / CVD matrices) and the enumeration is
 * table lookups. `primaryFg` is not enumerated — it is auto-picked as the
 * palette's most legible label on that primary, because a combination the user
 * has to hand-fix isn't a candidate.
 */
import type { SchemeEntry } from '../scheme/types.js';
import { contrastRatio } from './contrast.js';
import { apcaContrast, apcaUse, type ApcaUse } from './apca.js';
import { wcagLevels, type WcagLevel } from './wcag.js';
import { deltaE2000 } from './similarity.js';
import { simulateVision, type VisionSimulation } from './cvd.js';

/** The role slots a candidate pins; every other role stays on auto. */
export interface Combination {
	bg: string;
	fg: string;
	primary: string;
	/** Label color on the primary fill — auto-picked, not enumerated. */
	primaryFg: string;
}

/** One measured fg/bg pair, on both contrast models. */
export interface PairMetric {
	fg: string;
	bg: string;
	ratio: number;
	/** WCAG band for the text size this pair represents. */
	level: WcagLevel;
	/** Signed APCA Lc (polarity-aware). */
	lc: number;
	use: ApcaUse;
}

export interface ScoredCombination {
	/** `bg|fg|primary|primaryFg` — stable across re-derivations; safe as a key. */
	id: string;
	combo: Combination;
	/** Body text: fg on bg, normal size. */
	body: PairMetric;
	/** Button label: primaryFg on primary, normal size. */
	button: PairMetric;
	/** Primary on bg — links, icons, focus rings. Judged on the large-text band. */
	accent: PairMetric;
	/** Smallest CIEDE2000 among bg/fg/primary — how separable the trio is. */
	minDeltaE: number;
	/** Worst body ratio across the three dichromacy simulations. */
	cvdBodyRatio: number;
	/** Worst primary-vs-bg ΔE across the three dichromacy simulations. */
	cvdMinDeltaE: number;
	inGamut: boolean;
	/** Which of the combination's colors fall outside sRGB. */
	outOfGamut: string[];
	/** Body AND button both clear the requested target ratio. */
	passes: boolean;
	/** 0–100 composite (see `scoreCombination`). */
	score: number;
}

export const CONTRAST_TARGETS: { id: string; label: string; ratio: number }[] = [
	{ id: 'AA', label: 'AA (4.5)', ratio: 4.5 },
	{ id: 'AAA', label: 'AAA (7)', ratio: 7 },
	{ id: 'AA-large', label: 'AA large (3)', ratio: 3 }
];

/** The dichromacies the CVD-robustness score is the worst case over. */
const CVD_SIMS: VisionSimulation[] = ['protanopia', 'deuteranopia', 'tritanopia'];

export interface CombinationCtx {
	entries: SchemeEntry[];
	index: Map<string, number>;
	/** `ratio[fg][bg]` — WCAG 2 contrast ratio. */
	ratio: number[][];
	/** `lc[fg][bg]` — signed APCA. */
	lc: number[][];
	/** `dE[a][b]` — CIEDE2000. */
	dE: number[][];
	/** Worst-case (over CVD_SIMS) `ratio[fg][bg]`. */
	cvdRatio: number[][];
	/** Worst-case (over CVD_SIMS) `dE[a][b]`. */
	cvdDE: number[][];
	/** Per-primary index of the palette's most legible label. */
	bestLabel: number[];
	outOfGamut: boolean[];
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

function square(n: number, fill = 0): number[][] {
	return Array.from({ length: n }, () => new Array<number>(n).fill(fill));
}

/**
 * Precompute every pairwise measurement once. O(n²) contrast/ΔE calls plus the
 * same again per CVD sim — everything downstream is a table lookup, which is
 * what makes the O(n³) enumeration cheap enough to run on every keystroke.
 */
export function combinationCtx(entries: SchemeEntry[]): CombinationCtx {
	const n = entries.length;
	const ctx: CombinationCtx = {
		entries,
		index: new Map(entries.map((e, i) => [e.name, i])),
		ratio: square(n, 1),
		lc: square(n),
		dE: square(n),
		cvdRatio: square(n, 1),
		cvdDE: square(n),
		bestLabel: new Array<number>(n).fill(-1),
		outOfGamut: entries.map((e) => !e.color.inGamut)
	};
	if (n === 0) return ctx;

	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			if (i === j) continue;
			ctx.ratio[i][j] = contrastRatio(entries[i].color, entries[j].color);
			ctx.lc[i][j] = apcaContrast(entries[i].color, entries[j].color);
			if (i < j) {
				const d = deltaE2000(entries[i].color, entries[j].color);
				ctx.dE[i][j] = d;
				ctx.dE[j][i] = d;
			}
		}
	}

	// Worst case across the dichromacies — a trio that collapses for one of them
	// is not a safe pick even when it audits clean for normal vision.
	for (let s = 0; s < CVD_SIMS.length; s++) {
		const sc = entries.map((e) => simulateVision(e.color, CVD_SIMS[s]));
		for (let i = 0; i < n; i++) {
			for (let j = i + 1; j < n; j++) {
				const r = contrastRatio(sc[i], sc[j]);
				const d = deltaE2000(sc[i], sc[j]);
				if (s === 0 || r < ctx.cvdRatio[i][j]) {
					ctx.cvdRatio[i][j] = r;
					ctx.cvdRatio[j][i] = r;
				}
				if (s === 0 || d < ctx.cvdDE[i][j]) {
					ctx.cvdDE[i][j] = d;
					ctx.cvdDE[j][i] = d;
				}
			}
		}
	}

	for (let k = 0; k < n; k++) {
		let best = -1;
		for (let m = 0; m < n; m++) {
			if (m === k) continue;
			if (best === -1 || ctx.ratio[m][k] > ctx.ratio[best][k]) best = m;
		}
		ctx.bestLabel[k] = best;
	}
	return ctx;
}

/** The palette's most legible label on `primary` (`''` when there is no other color). */
export function autoPrimaryFg(ctx: CombinationCtx, primary: string): string {
	const k = ctx.index.get(primary);
	if (k === undefined) return '';
	const best = ctx.bestLabel[k];
	return best >= 0 ? ctx.entries[best].name : '';
}

export function combinationId(c: Combination): string {
	return `${c.bg}|${c.fg}|${c.primary}|${c.primaryFg}`;
}

function pair(ctx: CombinationCtx, f: number, b: number, large: boolean): PairMetric {
	const ratio = ctx.ratio[f][b];
	const lc = ctx.lc[f][b];
	return {
		fg: ctx.entries[f].name,
		bg: ctx.entries[b].name,
		ratio,
		level: large ? wcagLevels(ratio).large : wcagLevels(ratio).normal,
		lc,
		use: apcaUse(lc)
	};
}

/**
 * The 0–100 composite. Deliberately opinionated and documented rather than
 * tuned: it is a shortlist ranking, not a verdict, and every input is shown
 * alongside it so a user can disagree with the weights.
 *
 *   34%  body legibility   — WCAG vs the AAA bar, APCA vs the fluent-body bar
 *   22%  button legibility — the same, on the AA / large-text bars
 *   16%  accent visibility — primary readable *on* bg (links, icons)
 *   14%  separation        — the trio's smallest ΔE2000
 *   14%  CVD robustness    — the worst dichromacy case of both of the above
 *   −8   per out-of-sRGB color (it will not render as authored)
 */
function composite(m: Omit<ScoredCombination, 'score'>): number {
	const body = 0.5 * clamp01(m.body.ratio / 7) + 0.5 * clamp01(Math.abs(m.body.lc) / 75);
	const button = 0.5 * clamp01(m.button.ratio / 4.5) + 0.5 * clamp01(Math.abs(m.button.lc) / 60);
	const accent = 0.5 * clamp01(m.accent.ratio / 4.5) + 0.5 * clamp01(Math.abs(m.accent.lc) / 45);
	const separation = clamp01(m.minDeltaE / 25);
	const cvd = 0.5 * clamp01(m.cvdBodyRatio / 7) + 0.5 * clamp01(m.cvdMinDeltaE / 20);
	const raw =
		100 * (0.34 * body + 0.22 * button + 0.16 * accent + 0.14 * separation + 0.14 * cvd) -
		8 * m.outOfGamut.length;
	return Math.max(0, Math.round(raw * 10) / 10);
}

/**
 * Measure one combination. Returns `null` when any of its names is not in the
 * scheme — a pinned candidate whose color was renamed away simply drops out
 * instead of poisoning the comparison.
 */
export function scoreCombination(
	ctx: CombinationCtx,
	combo: Combination,
	target = 4.5
): ScoredCombination | null {
	const b = ctx.index.get(combo.bg);
	const f = ctx.index.get(combo.fg);
	const p = ctx.index.get(combo.primary);
	const pf = ctx.index.get(combo.primaryFg);
	if (b === undefined || f === undefined || p === undefined || pf === undefined) return null;

	const body = pair(ctx, f, b, false);
	const button = pair(ctx, pf, p, false);
	const accent = pair(ctx, p, b, true);
	const outOfGamut = [...new Set([combo.bg, combo.fg, combo.primary, combo.primaryFg])].filter(
		(name) => ctx.outOfGamut[ctx.index.get(name)!]
	);
	const base: Omit<ScoredCombination, 'score'> = {
		id: combinationId(combo),
		combo,
		body,
		button,
		accent,
		minDeltaE: Math.min(ctx.dE[f][b], ctx.dE[p][b], ctx.dE[p][f]),
		cvdBodyRatio: ctx.cvdRatio[f][b],
		cvdMinDeltaE: Math.min(ctx.cvdDE[f][b], ctx.cvdDE[p][b], ctx.cvdDE[p][f]),
		inGamut: outOfGamut.length === 0,
		outOfGamut,
		passes: body.ratio >= target && button.ratio >= target
	};
	return { ...base, score: composite(base) };
}

export interface RankOptions {
	/** Minimum WCAG ratio body + button text must reach (default 4.5 = AA). */
	target?: number;
	/** Drop candidates that miss the target (default true). */
	requirePass?: boolean;
	/** How many ranked candidates to return (default 24). */
	limit?: number;
	/** Guard on the O(n³) sweep: palettes longer than this are truncated (default 48). */
	maxColors?: number;
}

/**
 * Every bg × fg × primary the palette can form, measured, filtered and ranked.
 * Deterministic: ties break on body ratio, then on id, so the same scheme always
 * produces the same shortlist in the same order.
 */
export function rankCombinations(ctx: CombinationCtx, opts: RankOptions = {}): ScoredCombination[] {
	const { target = 4.5, requirePass = true, limit = 24, maxColors = 48 } = opts;
	const n = Math.min(ctx.entries.length, maxColors);
	if (n < 2) return [];

	const out: ScoredCombination[] = [];
	for (let b = 0; b < n; b++) {
		for (let f = 0; f < n; f++) {
			if (f === b) continue;
			// Cheapest possible rejection first — most (bg, fg) pairs die here.
			if (requirePass && ctx.ratio[f][b] < target) continue;
			for (let p = 0; p < n; p++) {
				if (p === b || p === f) continue;
				const label = ctx.bestLabel[p];
				if (label < 0) continue;
				if (requirePass && ctx.ratio[label][p] < target) continue;
				const scored = scoreCombination(
					ctx,
					{
						bg: ctx.entries[b].name,
						fg: ctx.entries[f].name,
						primary: ctx.entries[p].name,
						primaryFg: ctx.entries[label].name
					},
					target
				);
				if (scored && (!requirePass || scored.passes)) out.push(scored);
			}
		}
	}

	out.sort((x, y) => y.score - x.score || y.body.ratio - x.body.ratio || x.id.localeCompare(y.id));
	return out.slice(0, limit);
}
