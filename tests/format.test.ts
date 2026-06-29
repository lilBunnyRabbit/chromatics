import { test, expect } from 'bun:test';
import { HSL, OKLCH, hex, formatOwnModel } from '../src/lib/models';

// formatOwnModel powers the Inspector's own-model readout and the editor hover
// tooltip: a color is shown in the model it was authored in, not always OKLCH.

test('shows an HSL color in its own hsl() model', () => {
	const s = formatOwnModel(HSL(155, 0.5, 0.55));
	expect(s.startsWith('hsl(')).toBe(true);
	expect(s).not.toContain('oklch');
});

test('shows an OKLCH color in oklch()', () => {
	expect(formatOwnModel(OKLCH(0.6, 0.2, 30)).startsWith('oklch(')).toBe(true);
});

test('falls back to the hex string for a hex-authored color', () => {
	const c = hex('#e74c3c');
	expect(formatOwnModel(c, 'hex')).toBe(c.hex);
});
