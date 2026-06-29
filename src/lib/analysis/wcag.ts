/** WCAG level classification, ported verbatim from master:oklch.ts. */
export type WcagLevel = 'AAA' | 'AA' | 'Fail';

export function wcagLevels(ratio: number): { normal: WcagLevel; large: WcagLevel } {
	return {
		normal: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Fail',
		large: ratio >= 4.5 ? 'AAA' : ratio >= 3 ? 'AA' : 'Fail'
	};
}

export function wcagColor(level: WcagLevel): string {
	switch (level) {
		case 'AAA':
			return '#22c55e';
		case 'AA':
			return '#eab308';
		case 'Fail':
			return '#ef4444';
	}
}
