/**
 * The `scale.*` generators and the `token()` builtin — the DSL surface for
 * non-color design tokens. Because the evaluator is expression-only (no loops),
 * each generator loops INTERNALLY and returns a finished TokenGroup, exactly the
 * `preview.ts` pattern. The scale math lives in `../scheme/tokens.ts`.
 */
import { textScale, spaceScale, radiusScale, shadowScale } from '../scheme/tokens.js';
import { num, str, color } from '../models/util.js';
import type { DSLValue, DSLFunction, PlainObject } from '../models/index.js';

const optNum = (v: DSLValue | undefined, d: number) => (v === undefined ? d : num(v));

export const scale = {
	text: (...a: DSLValue[]) => ({
		__token: 'text',
		__unit: '',
		map: textScale(optNum(a[0], 16), optNum(a[1], 1.25))
	}),
	space: (...a: DSLValue[]) => ({ __token: 'space', __unit: '', map: spaceScale(optNum(a[0], 4)) }),
	radius: (...a: DSLValue[]) => ({
		__token: 'radius',
		__unit: '',
		map: radiusScale(optNum(a[0], 8))
	}),
	shadow: (...a: DSLValue[]) => ({
		__token: 'shadow',
		__unit: '',
		map: shadowScale(a[0] === undefined ? '#000' : color(a[0]).hex)
	})
} as unknown as Record<string, DSLFunction>;

/** `token(family, { step: value, … }, unit?)` — an arbitrary token group. */
export const tokenFn: DSLFunction = (...a) => {
	const family = str(a[0]);
	const src = a[1];
	const unit = a[2] === undefined ? '' : str(a[2]);
	const map: Record<string, string | number> = {};
	if (src && typeof src === 'object' && !Array.isArray(src)) {
		for (const [k, v] of Object.entries(src as PlainObject)) {
			map[k] = typeof v === 'number' ? v : String(v);
		}
	}
	return { __token: family, __unit: unit, map } as unknown as DSLValue;
};

export const SCALE_SIGNATURES: Record<string, { sig: string; doc: string }> = {
	text: { sig: '(base?, ratio?)', doc: 'Modular type scale in px — xs…4xl' },
	space: { sig: '(base?)', doc: 'Linear spacing scale in px' },
	radius: { sig: '(base?)', doc: 'Radius scale from a single base' },
	shadow: { sig: '(tint?)', doc: 'Elevation scale, optionally color-tinted' }
};

export const TOKEN_DOC =
	'token(family, map, unit?) — define an arbitrary token group (e.g. font, border)';
