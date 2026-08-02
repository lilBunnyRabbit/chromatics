/**
 * The candidate-combination engine (analysis/combinations.ts) — the pure half of
 * the Compare tool. These lock the contract the UI leans on: the precomputed
 * matrices agree with the primitives they replace, enumeration only ever emits
 * combinations that actually pass the requested target, ranking is deterministic,
 * and the composite score orders an obviously-good trio above an obviously-bad one.
 */
import { test, expect, describe } from 'bun:test';
import { evaluate } from '../src/lib/dsl/evaluator';
import { schemeFromEvalResult } from '../src/lib/scheme/adapter';
import {
	combinationCtx,
	rankCombinations,
	scoreCombination,
	autoPrimaryFg,
	combinationId,
	CONTRAST_TARGETS
} from '../src/lib/analysis/combinations';
import { contrastRatio } from '../src/lib/analysis/contrast';
import { deltaE2000 } from '../src/lib/analysis/similarity';
import { source as brandDark } from './fixtures/brand-dark';

const scheme = (src: string) => schemeFromEvalResult(evaluate(src), src);

const SRC = `
white = OKLCH(1, 0, 0)
near_white = OKLCH(0.97, 0.005, 250)
ink = OKLCH(0.18, 0.02, 250)
mid_gray = OKLCH(0.62, 0.01, 250)
brand = OKLCH(0.55, 0.16, 250)
brand_soft = OKLCH(0.72, 0.10, 250)
`;

describe('combinationCtx precomputation', () => {
	const s = scheme(SRC);
	const ctx = combinationCtx(s.entries);

	test('the contrast matrix agrees with contrastRatio', () => {
		const i = ctx.index.get('ink')!;
		const j = ctx.index.get('white')!;
		expect(ctx.ratio[i][j]).toBeCloseTo(
			contrastRatio(s.byName.get('ink')!.color, s.byName.get('white')!.color),
			10
		);
	});

	test('the ΔE matrix is symmetric and agrees with deltaE2000', () => {
		const i = ctx.index.get('brand')!;
		const j = ctx.index.get('brand_soft')!;
		expect(ctx.dE[i][j]).toBeCloseTo(ctx.dE[j][i], 10);
		expect(ctx.dE[i][j]).toBeCloseTo(
			deltaE2000(s.byName.get('brand')!.color, s.byName.get('brand_soft')!.color),
			10
		);
	});

	test('the CVD matrices are symmetric', () => {
		for (let i = 0; i < s.entries.length; i++) {
			for (let j = 0; j < s.entries.length; j++) {
				expect(ctx.cvdDE[i][j]).toBeCloseTo(ctx.cvdDE[j][i], 10);
				expect(ctx.cvdRatio[i][j]).toBeCloseTo(ctx.cvdRatio[j][i], 10);
			}
		}
	});

	test('the CVD worst case catches a red/green pair that normal vision separates', () => {
		const rg = scheme(`red = OKLCH(0.55, 0.19, 25)\ngreen = OKLCH(0.55, 0.19, 145)`);
		const c = combinationCtx(rg.entries);
		expect(c.dE[0][1]).toBeGreaterThan(30); // obviously different to normal vision
		expect(c.cvdDE[0][1]).toBeLessThan(10); // …and near-identical to a dichromat
	});

	test('autoPrimaryFg picks the palette-best label for a fill', () => {
		const label = autoPrimaryFg(ctx, 'brand');
		const k = ctx.index.get('brand')!;
		const best = Math.max(
			...s.entries
				.filter((e) => e.name !== 'brand')
				.map((e) => ctx.ratio[ctx.index.get(e.name)!][k])
		);
		expect(ctx.ratio[ctx.index.get(label)!][k]).toBeCloseTo(best, 10);
	});

	test('an empty palette produces an empty context, not a crash', () => {
		const empty = combinationCtx([]);
		expect(empty.entries).toEqual([]);
		expect(rankCombinations(empty)).toEqual([]);
	});
});

describe('scoreCombination', () => {
	const s = scheme(SRC);
	const ctx = combinationCtx(s.entries);

	test('measures the three load-bearing pairs', () => {
		const r = scoreCombination(ctx, {
			bg: 'white',
			fg: 'ink',
			primary: 'brand',
			primaryFg: 'white'
		})!;
		expect(r.body.fg).toBe('ink');
		expect(r.body.bg).toBe('white');
		expect(r.button.bg).toBe('brand');
		expect(r.accent.fg).toBe('brand');
		expect(r.body.ratio).toBeGreaterThan(7);
		expect(r.passes).toBe(true);
	});

	test('minDeltaE is the smallest of the three pairwise distances', () => {
		const r = scoreCombination(ctx, {
			bg: 'white',
			fg: 'ink',
			primary: 'brand',
			primaryFg: 'white'
		})!;
		const d = (a: string, b: string) => deltaE2000(s.byName.get(a)!.color, s.byName.get(b)!.color);
		expect(r.minDeltaE).toBeCloseTo(
			Math.min(d('ink', 'white'), d('brand', 'white'), d('brand', 'ink')),
			10
		);
	});

	test('a washed-out trio fails the target and scores below a legible one', () => {
		const good = scoreCombination(ctx, {
			bg: 'white',
			fg: 'ink',
			primary: 'brand',
			primaryFg: 'white'
		})!;
		const bad = scoreCombination(ctx, {
			bg: 'white',
			fg: 'mid_gray',
			primary: 'brand_soft',
			primaryFg: 'near_white'
		})!;
		expect(bad.passes).toBe(false);
		expect(bad.score).toBeLessThan(good.score);
	});

	test('a renamed-away color drops the candidate instead of poisoning it', () => {
		expect(
			scoreCombination(ctx, { bg: 'white', fg: 'gone', primary: 'brand', primaryFg: 'white' })
		).toBeNull();
	});

	test('out-of-sRGB colors are named, and cost score', () => {
		const wide = scheme(`${SRC}\nneon = OKLCH(0.75, 0.36, 145)`);
		const wctx = combinationCtx(wide.entries);
		const r = scoreCombination(wctx, {
			bg: 'ink',
			fg: 'white',
			primary: 'neon',
			primaryFg: 'ink'
		})!;
		expect(r.inGamut).toBe(false);
		expect(r.outOfGamut).toContain('neon');
	});

	test('the id is stable and round-trips through combinationId', () => {
		const combo = { bg: 'white', fg: 'ink', primary: 'brand', primaryFg: 'white' };
		expect(scoreCombination(ctx, combo)!.id).toBe(combinationId(combo));
	});
});

describe('rankCombinations', () => {
	const s = scheme(SRC);
	const ctx = combinationCtx(s.entries);

	test('every returned candidate clears the target on body AND button', () => {
		for (const t of CONTRAST_TARGETS) {
			const ranked = rankCombinations(ctx, { target: t.ratio, limit: 100 });
			expect(ranked.length).toBeGreaterThan(0);
			for (const c of ranked) {
				expect(c.passes).toBe(true);
				expect(c.body.ratio).toBeGreaterThanOrEqual(t.ratio);
				expect(c.button.ratio).toBeGreaterThanOrEqual(t.ratio);
			}
		}
	});

	test('a stricter target can only shrink the shortlist', () => {
		const aa = rankCombinations(ctx, { target: 4.5, limit: 500 });
		const aaa = rankCombinations(ctx, { target: 7, limit: 500 });
		expect(aaa.length).toBeLessThanOrEqual(aa.length);
	});

	test('results are sorted by descending score', () => {
		const ranked = rankCombinations(ctx, { limit: 100 });
		for (let i = 1; i < ranked.length; i++) {
			expect(ranked[i - 1].score).toBeGreaterThanOrEqual(ranked[i].score);
		}
	});

	test('deterministic for a fixed scheme + options', () => {
		const a = rankCombinations(ctx, { limit: 12 }).map((c) => c.id);
		const b = rankCombinations(combinationCtx(s.entries), { limit: 12 }).map((c) => c.id);
		expect(a).toEqual(b);
	});

	test('respects the limit and never repeats a combination', () => {
		const ranked = rankCombinations(ctx, { limit: 5 });
		expect(ranked.length).toBe(5);
		expect(new Set(ranked.map((c) => c.id)).size).toBe(5);
	});

	test('bg / fg / primary are always three distinct colors', () => {
		for (const c of rankCombinations(ctx, { limit: 100 })) {
			expect(new Set([c.combo.bg, c.combo.fg, c.combo.primary]).size).toBe(3);
		}
	});

	test('requirePass:false keeps failing candidates and flags them', () => {
		const all = rankCombinations(ctx, { requirePass: false, limit: 500 });
		const passing = rankCombinations(ctx, { limit: 500 });
		expect(all.length).toBeGreaterThan(passing.length);
		expect(all.some((c) => !c.passes)).toBe(true);
	});

	test('a single color yields no combinations', () => {
		expect(rankCombinations(combinationCtx(scheme('only = OKLCH(0.5,0,0)').entries))).toEqual([]);
	});
});

describe('on the brand-dark palette (a real scheme)', () => {
	const s = scheme(brandDark);
	const ctx = combinationCtx(s.entries);
	const ranked = rankCombinations(ctx, { target: 4.5, limit: 24 });

	test('produces a usable shortlist', () => {
		expect(ranked.length).toBe(24);
		expect(ranked[0].score).toBeGreaterThan(50);
	});

	test('the shortlist beats the palette median on body contrast', () => {
		const all = rankCombinations(ctx, { requirePass: false, limit: 5000 });
		const median = [...all].sort((a, b) => a.body.ratio - b.body.ratio)[Math.floor(all.length / 2)];
		expect(ranked[0].body.ratio).toBeGreaterThan(median.body.ratio);
	});
});
