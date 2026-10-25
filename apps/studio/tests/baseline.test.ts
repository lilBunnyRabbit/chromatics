import { test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { generate } from '../scripts/baseline';

for (const [file, text] of Object.entries(generate())) {
	test(`package baseline ${file} is current (bun run baseline)`, () => {
		expect(readFileSync(join(import.meta.dir, 'fixtures/baseline', file), 'utf8')).toBe(text);
	});
}
