import { LinearSrgb, Srgb, type Color } from '@lilbunnyrabbit/chromatics';

export function contrastRatio(a: Color, b: Color): number {
	return a.to(Srgb).contrast(b.to(Srgb));
}

/** Contrast of fg over bg with fg at `alpha` (0–1), composited in linear sRGB. */
export function contrastRatioAlpha(fg: Color, bg: Color, alpha: number): number {
	if (alpha >= 1) return contrastRatio(fg, bg);
	const backdrop = bg.to(LinearSrgb);
	const shown = fg.to(LinearSrgb).set({ alpha }).over(backdrop);
	return shown.to(Srgb).contrast(backdrop.to(Srgb));
}
