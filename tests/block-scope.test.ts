import { test, expect, describe } from 'bun:test';
import {
	enclosingBlock,
	blockMembers,
	BLOCK_MEMBER_NAMES,
	BLOCK_LABELS,
	ROLE_KEYS
} from '../src/lib/dsl/block-scope';
import { chromaCompletions } from '../src/lib/dsl/complete';
import type { CompletionContext, Completion } from '@codemirror/autocomplete';

// `enclosingBlock(textBeforeCursor)` is what makes the editor block-aware: it
// reports which `label { … }` block (if any) wraps the cursor, surviving object
// braces in arguments, strings and comments.

describe('enclosingBlock', () => {
	test('top-level text is in no block', () => {
		expect(enclosingBlock('brand = hex("#6c5ce7")\n')).toBeNull();
	});

	test('reports the block once it is open', () => {
		expect(enclosingBlock('preview {\n  ')).toBe('preview');
		expect(enclosingBlock('component {\n  ')).toBe('component');
		expect(enclosingBlock('tokens {\n  ')).toBe('tokens');
		expect(enclosingBlock('roles {\n  ')).toBe('roles');
	});

	test('a closed block is exited again', () => {
		expect(enclosingBlock('preview {\n  ramp = ramp(a)\n}\n')).toBeNull();
	});

	test('object-literal braces in arguments do not close the block', () => {
		const text = `component {
  button = button({ variants: [{ name: "primary", bg: "primary" }] })
  card = card({ bg: "surface", `;
		expect(enclosingBlock(text)).toBe('component');
	});

	test('braces and keywords inside strings are ignored', () => {
		expect(enclosingBlock('x = "a } preview {"\n')).toBeNull();
		expect(enclosingBlock('tokens {\n  font = token("f", { x: "} preview {" })\n  ')).toBe(
			'tokens'
		);
	});

	test('a block keyword in a comment does not open a block', () => {
		expect(enclosingBlock('// preview {\nbrand = hex("#fff")\n')).toBeNull();
	});

	test('only a keyword immediately followed by `{` opens a block', () => {
		// `preview.ramp(a)` is a flat call, not a block header
		expect(enclosingBlock('x = preview.ramp(a)\n')).toBeNull();
		// `roles = theme({…})` is a flat assignment, not a `roles {` block
		expect(enclosingBlock('roles = theme({ bg: "bg" })\n')).toBeNull();
	});
});

describe('block member metadata', () => {
	test('builder blocks expose their namespace members; roles does not', () => {
		expect(BLOCK_MEMBER_NAMES.get('preview')?.has('ramp')).toBe(true);
		expect(BLOCK_MEMBER_NAMES.get('component')?.has('button')).toBe(true);
		expect(BLOCK_MEMBER_NAMES.get('tokens')?.has('text')).toBe(true);
		expect(BLOCK_MEMBER_NAMES.has('roles')).toBe(false);
		expect(blockMembers('roles')).toBeNull();
	});

	test('every builder block label is also a recognised block label', () => {
		for (const label of BLOCK_MEMBER_NAMES.keys()) expect(BLOCK_LABELS.has(label)).toBe(true);
		expect(BLOCK_LABELS.has('roles')).toBe(true);
	});

	test('role keys are the canonical camelCase theme roles', () => {
		expect(ROLE_KEYS).toContain('primaryFg');
		expect(ROLE_KEYS).toContain('bg');
		expect(ROLE_KEYS.every((k) => !k.includes('_') && !k.includes('-'))).toBe(true);
	});
});

// A minimal stand-in for CodeMirror's CompletionContext — enough surface for
// chromaCompletions (matchBefore, pos, explicit, state.sliceDoc).
function fakeCtx(doc: string, pos: number): CompletionContext {
	return {
		pos,
		explicit: true,
		state: { sliceDoc: (a: number, b: number) => doc.slice(a, b) },
		matchBefore(re: RegExp) {
			const before = doc.slice(0, pos);
			const line = before.slice(before.lastIndexOf('\n') + 1);
			const src = re.source.endsWith('$') ? re.source : re.source + '$';
			const m = new RegExp(src).exec(line);
			if (!m) return null;
			return { from: pos - m[0].length, to: pos, text: m[0] };
		}
	} as unknown as CompletionContext;
}

function labels(doc: string, pos: number): string[] {
	const complete = chromaCompletions(() => ['brand', 'surface']);
	const res = complete(fakeCtx(doc, pos));
	return (res?.options ?? []).map((o: Completion) => o.label);
}

describe('block-aware autocomplete', () => {
	test('inside a preview block, members surface first and are boosted', () => {
		const doc = 'preview {\n  ra';
		const complete = chromaCompletions(() => ['brand']);
		const res = complete(fakeCtx(doc, doc.length));
		const ramp = res!.options.find((o: Completion) => o.label === 'ramp');
		expect(ramp).toBeTruthy();
		expect(ramp!.boost).toBe(50);
		// vars are still offered (they appear as arguments)
		expect(res!.options.some((o: Completion) => o.label === 'brand')).toBe(true);
	});

	test('inside a tokens block, scale generators are offered', () => {
		const doc = 'tokens {\n  te';
		expect(labels(doc, doc.length)).toContain('text');
	});

	test('roles block: left side offers role keys, not constructors', () => {
		const doc = 'roles {\n  prim';
		const opts = labels(doc, doc.length);
		expect(opts).toContain('primary');
		expect(opts).toContain('primaryFg');
		expect(opts).not.toContain('OKLCH');
	});

	test('roles block: right side (after `=`) offers named colors', () => {
		const doc = 'roles {\n  bg = sur';
		const opts = labels(doc, doc.length);
		expect(opts).toContain('surface');
		expect(opts).not.toContain('primaryFg');
	});

	test('at top level, constructors and builtins are offered (no block members)', () => {
		const doc = 'x = OK';
		const opts = labels(doc, doc.length);
		expect(opts).toContain('OKLCH');
		expect(opts).not.toContain('ramp');
	});
});
