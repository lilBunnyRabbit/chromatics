import { test, expect } from 'bun:test';
import { evaluate } from '@lilbunnyrabbit/chromatics-dsl';
import { examples } from '../src/routes/examples';
import { deriveScheme } from '../src/lib/scheme/derive';
import { emptyRoles, DEFAULT_OPACITIES } from '../src/lib/scheme/roles';

for (const ex of examples) {
	test(`example "${ex.name}" evaluates with zero errors`, () => {
		const r = evaluate(ex.source);
		expect(r.errors).toEqual([]);
		expect(r.order.length).toBeGreaterThan(0);
	});
}

// ADR-018 82u: unknown role keys and role lines naming a missing colour are errors only deriveScheme sees.
for (const ex of examples) {
	test(`example "${ex.name}" derives with zero role errors`, () => {
		const r = deriveScheme(ex.source, { roles: emptyRoles(), opacities: DEFAULT_OPACITIES });
		expect(r.result.errors).toEqual([]);
	});
}
