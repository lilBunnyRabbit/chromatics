import { test, expect, describe } from 'bun:test';
import { evaluate } from '../src/lib/dsl/evaluator';
import { isPreview, PREVIEW_MEMBERS } from '../src/lib/dsl/preview';
import { examples } from '../src/routes/examples';

const val = (src: string, name: string) => evaluate(src).variables.get(name)?.value;

describe('preview primitives', () => {
	test('preview.gradient tags a descriptor with defaults', () => {
		const v = val('a=OKLCH(0.6,0.1,200)\nb=OKLCH(0.5,0.1,20)\ng=preview.gradient(a,b)', 'g');
		expect(isPreview(v)).toBe(true);
		expect((v as Record<string, unknown>).__preview).toBe('gradient');
		expect((v as Record<string, unknown>).space).toBe('oklab');
		expect((v as Record<string, unknown>).stops).toBe(7);
	});

	test('preview.pair carries fg + bg colors', () => {
		const v = val('a=OKLCH(0.95,0.02,200)\nb=OKLCH(0.2,0.02,200)\np=preview.pair(a,b)', 'p');
		expect(isPreview(v)).toBe(true);
		const d = v as Record<string, unknown>;
		expect(d.__preview).toBe('pair');
		expect(d.fg).toBeDefined();
		expect(d.bg).toBeDefined();
	});

	test('every preview member produces a tagged descriptor', () => {
		const src =
			`a=OKLCH(0.6,0.12,260)\nb=a.oklch.rotateHue(120).oklch.gamutMap()\n` +
			`m_gradient=preview.gradient(a,b)\nm_ramp=preview.ramp(a)\nm_harmony=preview.harmony(a,"triadic")\nm_mix=preview.mix(a,b)\n` +
			`m_pair=preview.pair(a,b)\nm_cvd=preview.cvd(a)\nm_onBackgrounds=preview.onBackgrounds(a,[a,b])\n` +
			`m_space=preview.space(a)\nm_channels=preview.channels(a)\nm_gamut=preview.gamut(a)\nm_print=preview.print(a)\nm_name=preview.name(a)\nm_temperature=preview.temperature(a)\n` +
			`m_palette=preview.palette(a,b)\nm_grid=preview.grid(a,b)\nm_chart=preview.chart(a,b)\nm_ui=preview.ui(a,b,a)\nm_brandMark=preview.brandMark(a)`;
		const r = evaluate(src);
		expect(r.errors).toEqual([]);
		for (const member of PREVIEW_MEMBERS) {
			const v = r.variables.get(`m_${member}`)?.value;
			expect(isPreview(v)).toBe(true);
			expect((v as Record<string, unknown>).__preview).toBe(member);
		}
	});

	test('the Previews example evaluates with no errors', () => {
		const ex = examples.find((e) => e.name === 'Previews');
		expect(ex).toBeTruthy();
		const r = evaluate(ex!.source);
		expect(r.errors).toEqual([]);
	});
});
