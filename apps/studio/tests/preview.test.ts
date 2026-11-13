import { test, expect } from 'bun:test';
import { evaluate } from '@lilbunnyrabbit/chromatics-dsl';
import { examples } from '../src/routes/examples';

test('the Previews example evaluates with no errors', () => {
	const ex = examples.find((e) => e.name === 'Previews');
	expect(ex).toBeTruthy();
	const r = evaluate(ex!.source);
	expect(r.errors).toEqual([]);
});
