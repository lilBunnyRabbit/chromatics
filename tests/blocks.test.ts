import { test, expect, describe } from 'bun:test';
import { evaluate } from '../src/lib/dsl/evaluator';

// `preview { … }` / `component { … }` blocks are pure scoping sugar: inside the
// block the namespace members are called bare, and each assignment becomes a
// top-level variable — identical to the flat `name = preview.x(…)` form.

describe('preview / component blocks', () => {
	test('a preview block yields the same descriptors as the flat form', () => {
		const flat = evaluate(`a = OKLCH(0.6,0.12,260)
b = a.rotate(120).gamutMap()
ramp = preview.ramp(a)
grad = preview.gradient(a, b)
pair = preview.pair(a, b)`);
		const block = evaluate(`a = OKLCH(0.6,0.12,260)
b = a.rotate(120).gamutMap()
preview {
  ramp = ramp(a)
  grad = gradient(a, b)
  pair = pair(a, b)
}`);
		expect(block.errors).toEqual([]);
		expect(flat.errors).toEqual([]);
		for (const name of ['ramp', 'grad', 'pair']) {
			expect((block.variables.get(name)!.value as Record<string, unknown>).__preview).toBe(
				(flat.variables.get(name)!.value as Record<string, unknown>).__preview
			);
		}
	});

	test('block outputs are top-level variables in source order, with deps', () => {
		const r = evaluate(`a = OKLCH(0.6,0.12,260)
b = OKLCH(0.5,0.1,20)
preview {
  ramp = ramp(a)
  pair = pair(a, b)
}`);
		expect(r.order).toEqual(['a', 'b', 'ramp', 'pair']);
		expect(r.variables.get('pair')!.deps.sort()).toEqual(['a', 'b']);
		// the bare member name ("pair") is not tracked as a dependency
		expect(r.variables.get('pair')!.deps).not.toContain('pair');
	});

	test('component block produces tagged component specs', () => {
		const r = evaluate(`primary = OKLCH(0.62, 0.17, 260)
component {
  buttons = button({ variants: [{ name: "primary", bg: "primary", fg: "fg" }] })
  surface_card = card({ bg: "surface", fg: "fg" })
}`);
		expect(r.errors).toEqual([]);
		expect((r.variables.get('buttons')!.value as Record<string, unknown>).__component).toBe(
			'button'
		);
		expect((r.variables.get('surface_card')!.value as Record<string, unknown>).__component).toBe(
			'card'
		);
	});

	test('line numbers survive desugaring (offsets are preserved)', () => {
		const r = evaluate(`a = OKLCH(0.6,0.12,260)

preview {
  ramp = ramp(a)
}`);
		expect(r.variables.get('ramp')!.line).toBe(4);
	});

	test('an error on one block line does not kill the others', () => {
		const r = evaluate(`a = OKLCH(0.6,0.12,260)
preview {
  good = ramp(a)
  oops = ramp(undefinedColor)
  also = pair(a, a)
}`);
		expect(r.order).toEqual(['a', 'good', 'also']);
		expect(r.errors).toHaveLength(1);
		expect(r.errors[0].line).toBe(4);
	});

	test('a tokens block joins the scale generators and token()', () => {
		const r = evaluate(`brand = hex("#6c5ce7")
tokens {
  text   = text(16, 1.25)
  space  = space(4)
  radius = radius(10)
  shadow = shadow(brand)
  font   = token("font", { sans: "Inter" })
}`);
		expect(r.errors).toEqual([]);
		expect(r.order).toEqual(['brand', 'text', 'space', 'radius', 'shadow', 'font']);
		expect((r.variables.get('text')!.value as Record<string, unknown>).__token).toBe('text');
		expect((r.variables.get('space')!.value as Record<string, unknown>).__token).toBe('space');
		expect((r.variables.get('font')!.value as Record<string, unknown>).__token).toBe('font');
	});

	test('tokens block matches the flat scale.*/token() form', () => {
		const block = evaluate(`b = hex("#6c5ce7")
tokens {
  text = text(16, 1.25)
  font = token("font", { sans: "Inter" })
}`);
		const flat = evaluate(`b = hex("#6c5ce7")
text = scale.text(16, 1.25)
font = token("font", { sans: "Inter" })`);
		expect(block.errors).toEqual([]);
		expect(flat.errors).toEqual([]);
		expect(block.variables.get('text')!.value).toEqual(flat.variables.get('text')!.value);
		expect(block.variables.get('font')!.value).toEqual(flat.variables.get('font')!.value);
	});

	test('scale.* and tokens.* are equivalent (alias kept)', () => {
		const r = evaluate(`a = scale.radius(10)
b = tokens.radius(10)`);
		expect(r.errors).toEqual([]);
		expect(r.variables.get('a')!.value).toEqual(r.variables.get('b')!.value);
	});

	test('a roles block maps roles to color names like theme({…})', () => {
		const block = evaluate(`bg = OKLCH(0.18, 0.02, 260)
fg = OKLCH(0.96, 0.01, 260)
primary = OKLCH(0.62, 0.17, 260)
roles {
  bg        = bg
  fg        = fg
  primary   = primary
  primaryFg = fg
}`);
		const flat = evaluate(`bg = OKLCH(0.18, 0.02, 260)
fg = OKLCH(0.96, 0.01, 260)
primary = OKLCH(0.62, 0.17, 260)
roles = theme({ bg: "bg", fg: "fg", primary: "primary", primaryFg: "fg" })`);
		expect(block.errors).toEqual([]);
		expect(flat.errors).toEqual([]);
		// the RHS is captured as a NAME (string), not evaluated to a color value
		expect(block.variables.get('roles')!.value).toEqual(flat.variables.get('roles')!.value);
		expect((block.variables.get('roles')!.value as { roles: Record<string, string> }).roles).toEqual(
			{ bg: 'bg', fg: 'fg', primary: 'primary', primaryFg: 'fg' }
		);
	});

	test('role keys normalise (snake/camel) and unknown keys drop', () => {
		const r = evaluate(`a = OKLCH(0.6,0.12,260)
roles {
  primary_fg = a
  nonsense   = a
}`);
		const roles = (r.variables.get('roles')!.value as { roles: Record<string, string> }).roles;
		expect(roles.primaryFg).toBe('a');
		expect(roles.nonsense).toBeUndefined();
	});

	test('an explicit unknown block label is reported clearly', () => {
		const r = evaluate(`whoops: {\n  x = 1\n}`);
		expect(r.errors[0].message).toContain("Unknown block 'whoops'");
	});

	test('flat preview.* / component.* calls still work alongside blocks', () => {
		const r = evaluate(`a = OKLCH(0.6,0.12,260)
flat = preview.ramp(a)
preview {
  blocked = ramp(a)
}`);
		expect(r.errors).toEqual([]);
		expect((r.variables.get('flat')!.value as Record<string, unknown>).__preview).toBe('ramp');
		expect((r.variables.get('blocked')!.value as Record<string, unknown>).__preview).toBe('ramp');
	});
});
