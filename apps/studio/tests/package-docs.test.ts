import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { generate, serialize } from '../scripts/package-docs';

test('package-docs.json matches the package sources (bun run package-docs)', () => {
	const committed = readFileSync(join(import.meta.dir, '../src/lib/dsl/package-docs.json'), 'utf8');
	expect(committed).toBe(serialize(generate()));
	// A full TypeScript program over the package: several seconds on a CI runner.
}, 60_000);
