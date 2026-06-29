import { test, expect, describe } from 'bun:test';
import { hex, OKLCH } from '../src/lib/models';
import { contrastRatio, contrastRatioAlpha } from '../src/lib/analysis/contrast';
import { wcagLevels, wcagColor } from '../src/lib/analysis/wcag';
import { simulateVision, visionSimulations } from '../src/lib/analysis/cvd';

const white = hex('#ffffff');
const black = hex('#000000');

describe('contrast', () => {
	test('white vs black ≈ 21:1', () => {
		expect(contrastRatio(white, black)).toBeCloseTo(21, 1);
	});

	test('a color with itself is 1:1', () => {
		expect(contrastRatio(white, white)).toBeCloseTo(1, 6);
	});

	test('alpha < 1 reduces effective contrast', () => {
		const full = contrastRatio(white, black);
		const faded = contrastRatioAlpha(white, black, 0.5);
		expect(faded).toBeLessThan(full);
		expect(faded).toBeGreaterThan(1);
	});

	test('alpha >= 1 equals the opaque ratio', () => {
		expect(contrastRatioAlpha(white, black, 1)).toBeCloseTo(contrastRatio(white, black), 6);
	});
});

describe('wcag levels', () => {
	test('thresholds (7 / 4.5 / 3)', () => {
		expect(wcagLevels(21)).toEqual({ normal: 'AAA', large: 'AAA' });
		expect(wcagLevels(5)).toEqual({ normal: 'AA', large: 'AAA' });
		expect(wcagLevels(3.5)).toEqual({ normal: 'Fail', large: 'AA' });
		expect(wcagLevels(2)).toEqual({ normal: 'Fail', large: 'Fail' });
	});
	test('level colors', () => {
		expect(wcagColor('AAA')).toBe('#22c55e');
		expect(wcagColor('AA')).toBe('#eab308');
		expect(wcagColor('Fail')).toBe('#ef4444');
	});
});

describe('vision simulation', () => {
	test('there are 10 modes', () => {
		expect(visionSimulations.length).toBe(10);
	});
	test('"none" is identity', () => {
		const c = OKLCH(0.6, 0.12, 250);
		expect(simulateVision(c, 'none').hex).toBe(c.hex);
	});
	test('deuteranopia and grayscale transform the color', () => {
		const c = OKLCH(0.6, 0.2, 30);
		expect(simulateVision(c, 'deuteranopia').hex).not.toBe(c.hex);
		expect(simulateVision(c, 'grayscale').hex).not.toBe(c.hex);
	});
});
