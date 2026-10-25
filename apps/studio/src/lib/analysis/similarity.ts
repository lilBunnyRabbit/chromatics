/**
 * Perceptual color distance (CIEDE2000) over a scheme — surfaces brand colors
 * that are too close to tell apart. A palette with two near-identical colors
 * reads as a mistake; this finds those pairs before a user ships them.
 */
import { Lab65, type Color } from '@lilbunnyrabbit/chromatics';
import type { SchemeEntry } from '../scheme/types.js';

/** CIEDE2000 ΔE between two colors (0 = identical; ~2.3 = just noticeable). */
export function deltaE2000(a: Color, b: Color): number {
	return a.to(Lab65).deltaE2000(b.to(Lab65));
}

export type SimilarityLevel = 'identical' | 'imperceptible' | 'very-close' | 'close' | 'distinct';

export function similarityLevel(dE: number): SimilarityLevel {
	if (dE < 1) return 'identical';
	if (dE < 2.3) return 'imperceptible';
	if (dE < 5) return 'very-close';
	if (dE < 10) return 'close';
	return 'distinct';
}

export interface SimilarPair {
	a: string;
	b: string;
	deltaE: number;
	level: SimilarityLevel;
}

/**
 * Every unordered pair of entries, sorted by ascending ΔE. Pass `maxDeltaE` to
 * keep only the confusable ones (default 10).
 */
export function similarPairs(entries: SchemeEntry[], maxDeltaE = 10): SimilarPair[] {
	const out: SimilarPair[] = [];
	for (let i = 0; i < entries.length; i++) {
		for (let j = i + 1; j < entries.length; j++) {
			const dE = deltaE2000(entries[i].color, entries[j].color);
			if (dE <= maxDeltaE) {
				out.push({
					a: entries[i].name,
					b: entries[j].name,
					deltaE: dE,
					level: similarityLevel(dE)
				});
			}
		}
	}
	return out.sort((x, y) => x.deltaE - y.deltaE);
}
