/** WCAG contrast, ported from master:oklch.ts and re-typed against ColorValue. */
import type { ColorValue } from '../models/index.js';
import { wcagContrast, blend, type CuloriColor } from '../models/registry.js';

export function contrastRatio(a: ColorValue, b: ColorValue): number {
	return wcagContrast(a.project('oklch'), b.project('oklch'));
}

/** Contrast ratio of fg over bg with fg at a given alpha (0–1), composited in linear sRGB. */
export function contrastRatioAlpha(fg: ColorValue, bg: ColorValue, alpha: number): number {
	if (alpha >= 1) return contrastRatio(fg, bg);
	const bgC = bg.project('oklch');
	const fgC = { ...fg.project('oklch'), alpha } as CuloriColor;
	const blended = blend([bgC, fgC], 'normal', 'lrgb');
	return wcagContrast(blended, bgC);
}
