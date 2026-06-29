/**
 * Direct hue-family edges (HSL ↔ HSV ↔ HWB) — the canonical proof that the
 * conversion graph bypasses culori's RGB hub. These are exact algebraic
 * identities for chromatic colors (so hex round-trips are unchanged) AND they
 * preserve the authored HUE for achromatic colors, which an RGB round-trip
 * silently discards. HSL↔HWB resolves automatically via BFS (HSL→HSV→HWB).
 */
import { registerEdge, type CuloriColor } from '../registry';

type Rec = Record<string, number | undefined>;

/** Carry hue and alpha through unchanged (preserves grey hue + opacity). */
function make(mode: string, src: Rec, fields: Rec): CuloriColor {
	const out: Record<string, unknown> = { mode, h: src.h, ...fields };
	if (src.alpha !== undefined) out.alpha = src.alpha;
	return out as unknown as CuloriColor;
}

// HSL → HSV
registerEdge('hsl', 'hsv', (c0) => {
	const c = c0 as unknown as Rec;
	const s = c.s ?? 0;
	const l = c.l ?? 0;
	const v = l + s * Math.min(l, 1 - l);
	const sv = v === 0 ? 0 : 2 * (1 - l / v);
	return make('hsv', c, { s: sv, v });
});

// HSV → HSL
registerEdge('hsv', 'hsl', (c0) => {
	const c = c0 as unknown as Rec;
	const s = c.s ?? 0;
	const v = c.v ?? 0;
	const l = v * (1 - s / 2);
	const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
	return make('hsl', c, { s: sl, l });
});

// HSV → HWB
registerEdge('hsv', 'hwb', (c0) => {
	const c = c0 as unknown as Rec;
	const s = c.s ?? 0;
	const v = c.v ?? 0;
	return make('hwb', c, { w: (1 - s) * v, b: 1 - v });
});

// HWB → HSV
registerEdge('hwb', 'hsv', (c0) => {
	const c = c0 as unknown as Rec;
	let w = c.w ?? 0;
	let b = c.b ?? 0;
	const sum = w + b;
	if (sum > 1) {
		w /= sum;
		b /= sum;
	}
	const v = 1 - b;
	const s = v === 0 ? 0 : 1 - w / v;
	return make('hsv', c, { s, v });
});
