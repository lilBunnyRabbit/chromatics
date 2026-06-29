import { test, expect, describe } from 'bun:test';
import { diffCascade, type CascadeEntry } from '../src/lib/util/cascade';

// The cascade-highlight diff must survive an invalid intermediate edit: when a
// value is briefly invalid the scheme empties and reports errors, and the
// baseline must be RETAINED so a real change still flashes once valid again.
// These scenarios mirror the adversarial verification panel.

const E = (...pairs: [string, string][]): CascadeEntry[] =>
	pairs.map(([name, hex]) => ({ name, hex }));

describe('diffCascade', () => {
	test('first render primes silently — never flashes on load', () => {
		const base = new Map<string, string>();
		const hits = diffCascade(base, E(['a', '#111'], ['b', '#222']), {
			hasErrors: false,
			primed: false
		});
		expect(hits.size).toBe(0);
		expect(base.get('a')).toBe('#111');
		expect(base.get('b')).toBe('#222');
	});

	test('flags exactly the colors whose hex changed', () => {
		const base = new Map([
			['a', '#111'],
			['b', '#222']
		]);
		const hits = diffCascade(base, E(['a', '#999'], ['b', '#222']), {
			hasErrors: false,
			primed: true
		});
		expect([...hits]).toEqual(['a']);
	});

	test('the bug: cascade survives an invalid intermediate edit', () => {
		const base = new Map<string, string>();
		// prime with a valid scheme
		diffCascade(base, E(['brand', '#6c5ce7'], ['primary', '#6c5ce7']), {
			hasErrors: false,
			primed: false
		});
		// invalid edit → entries empty, errors present → baseline must be retained
		const mid = diffCascade(base, E(), { hasErrors: true, primed: true });
		expect(mid.size).toBe(0);
		expect(base.get('brand')).toBe('#6c5ce7'); // ← retained, not wiped
		// recover with a changed value → both flash (compared to retained baseline)
		const back = diffCascade(base, E(['brand', '#6c5ce8'], ['primary', '#6c5ce8']), {
			hasErrors: false,
			primed: true
		});
		expect([...back].sort()).toEqual(['brand', 'primary']);
	});

	test('survives several consecutive invalid states', () => {
		const base = new Map<string, string>();
		diffCascade(base, E(['brand', '#aaa'], ['accent', '#bbb']), { hasErrors: false, primed: false });
		for (let i = 0; i < 3; i++) {
			diffCascade(base, E(), { hasErrors: true, primed: true });
		}
		const back = diffCascade(base, E(['brand', '#ccc'], ['accent', '#ddd']), {
			hasErrors: false,
			primed: true
		});
		expect([...back].sort()).toEqual(['accent', 'brand']);
	});

	test('no flash when the recovered value is unchanged (noop edit)', () => {
		const base = new Map([['brand', '#6c5ce7']]);
		diffCascade(base, E(), { hasErrors: true, primed: true });
		const back = diffCascade(base, E(['brand', '#6c5ce7']), { hasErrors: false, primed: true });
		expect(back.size).toBe(0);
	});

	test('partial error: an independent color flashes mid-error, not again on recovery', () => {
		const base = new Map<string, string>();
		diffCascade(base, E(['brand', '#f00'], ['accent', '#0f0'], ['success', '#00f']), {
			hasErrors: false,
			primed: false
		});
		// brand errors → only success remains, unchanged
		diffCascade(base, E(['success', '#00f']), { hasErrors: true, primed: true });
		// success edited during the error → flashes now
		const mid = diffCascade(base, E(['success', '#00a']), { hasErrors: true, primed: true });
		expect([...mid]).toEqual(['success']);
		// brand recovers (changed); success unchanged since → only brand/accent flash
		const back = diffCascade(base, E(['brand', '#fa0'], ['accent', '#af0'], ['success', '#00a']), {
			hasErrors: false,
			primed: true
		});
		expect([...back].sort()).toEqual(['accent', 'brand']);
	});

	test('clean state prunes removed variables; re-adding is silent (not a change)', () => {
		const base = new Map<string, string>();
		diffCascade(base, E(['a', '#111'], ['b', '#222']), { hasErrors: false, primed: false });
		// remove b (clean edit) → pruned from baseline
		diffCascade(base, E(['a', '#111']), { hasErrors: false, primed: true });
		expect(base.has('b')).toBe(false);
		// re-add b with its old value → treated as new (prev undefined) → no flash
		const re = diffCascade(base, E(['a', '#111'], ['b', '#222']), {
			hasErrors: false,
			primed: true
		});
		expect(re.size).toBe(0);
	});

	test('error state retains vanished variables (so they can flash on recovery)', () => {
		const base = new Map([
			['a', '#111'],
			['b', '#222']
		]);
		diffCascade(base, E(['a', '#111']), { hasErrors: true, primed: true });
		expect(base.get('b')).toBe('#222'); // retained during error
	});
});
