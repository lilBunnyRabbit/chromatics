import { test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { generate } from '../scripts/baseline';

// The package/ records are regenerated on whichever machine runs the tests: libm's last bits and a
// channel landing exactly on 127.5 differ between platforms, so floats compare to 1e-9 and hex bytes
// to ±1. review.md summarises them and is only checked to regenerate.
const NUM = /-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/gi;

function close(a: unknown, b: unknown, path: string): string | null {
	if (typeof a === 'number' && typeof b === 'number') {
		return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a)) ? null : `${path}: ${a} vs ${b}`;
	}
	if (typeof a === 'string' && typeof b === 'string') {
		if (/^#[0-9a-f]{6}$/.test(a) && /^#[0-9a-f]{6}$/.test(b)) {
			const off = [1, 3, 5].some(
				(i) => Math.abs(parseInt(a.slice(i, i + 2), 16) - parseInt(b.slice(i, i + 2), 16)) > 1
			);
			return off ? `${path}: ${a} vs ${b}` : null;
		}
		const na = a.match(NUM) ?? [];
		const nb = b.match(NUM) ?? [];
		if (a.replace(NUM, '#') !== b.replace(NUM, '#') || na.length !== nb.length)
			return a === b ? null : `${path}: ${a} vs ${b}`;
		for (let i = 0; i < na.length; i++) {
			const d = close(Number(na[i]), Number(nb[i]), path);
			if (d) return `${path}: ${a} vs ${b}`;
		}
		return null;
	}
	if (a && b && typeof a === 'object' && typeof b === 'object') {
		const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
		for (const k of keys) {
			const d = close(
				(a as Record<string, unknown>)[k],
				(b as Record<string, unknown>)[k],
				`${path}.${k}`
			);
			if (d) return d;
		}
		return null;
	}
	return a === b ? null : `${path}: ${String(a)} vs ${String(b)}`;
}

const generated = generate();

for (const file of ['package/models.json', 'package/examples.json']) {
	test(`package baseline ${file} is current (bun run baseline)`, () => {
		const committed = JSON.parse(
			readFileSync(join(import.meta.dir, 'fixtures/baseline', file), 'utf8')
		);
		expect(close(committed, JSON.parse(generated[file]), file)).toBeNull();
	});
}

test('review.md regenerates', () => {
	expect(generated['review.md']).toStartWith('# Culori → package baseline review');
	expect(readFileSync(join(import.meta.dir, 'fixtures/baseline/review.md'), 'utf8')).toStartWith(
		'# Culori → package baseline review'
	);
});
