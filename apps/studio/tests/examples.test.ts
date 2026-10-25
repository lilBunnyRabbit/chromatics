import { test, expect } from 'bun:test';
import { evaluate } from '../src/lib/dsl/evaluator';
import { examples } from '../src/routes/examples';

for (const ex of examples) {
	test(`example "${ex.name}" evaluates with zero errors`, () => {
		const r = evaluate(ex.source);
		expect(r.errors).toEqual([]);
		expect(r.order.length).toBeGreaterThan(0);
	});
}
