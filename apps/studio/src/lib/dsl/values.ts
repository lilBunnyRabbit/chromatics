import * as pkg from '@lilbunnyrabbit/chromatics';
import { Color, type ColorModel } from '@lilbunnyrabbit/chromatics';
import { models } from '@lilbunnyrabbit/chromatics/all';

export type PlainObject = { [key: string]: DSLValue };
export type DSLValue =
	| number
	| string
	| boolean
	| Color
	| ColorModel
	| DSLFunction
	| DSLValue[]
	| PlainObject
	| null
	| undefined;
export type DSLFunction = (...args: DSLValue[]) => DSLValue;

const MODELS = new Set<unknown>(models);

// Export names, not `class.name`: a minified build renames classes.
const NAMES = new Map<unknown, string>(
	Object.entries(pkg)
		.filter(([, v]) => MODELS.has(v))
		.map(([k, v]) => [v, k])
);

/** Every model class by its export name (`Oklch`), in the package's `models` order. */
export const MODEL_CLASSES: readonly [string, ColorModel][] = models.map((m) => [modelName(m), m]);

export function modelName(m: ColorModel): string {
	const name = NAMES.get(m);
	if (!name) throw new Error(`model ${m.id} is not exported by the package`);
	return name;
}

export function isColor(v: unknown): v is Color {
	return v instanceof Color;
}

export function isModel(v: unknown): v is ColorModel {
	return MODELS.has(v);
}

export function num(v: DSLValue): number {
	if (typeof v === 'number') return v;
	throw new Error(`Expected number, got ${typeName(v)}`);
}

export function str(v: DSLValue): string {
	if (typeof v === 'string') return v;
	throw new Error(`Expected string, got ${typeName(v)}`);
}

export function color(v: DSLValue): Color {
	if (isColor(v)) return v;
	throw new Error(`Expected color, got ${typeName(v)}`);
}

export function model(v: DSLValue): ColorModel {
	if (isModel(v)) return v;
	throw new Error(`Expected a color model such as Oklch, got ${typeName(v)}`);
}

export function obj(v: DSLValue): PlainObject {
	if (v !== null && typeof v === 'object' && !Array.isArray(v) && !isColor(v))
		return v as PlainObject;
	throw new Error(`Expected object, got ${typeName(v)}`);
}

export function optNum(o: PlainObject, key: string): number | undefined {
	const v = o[key];
	return v === undefined ? undefined : num(v);
}

export function typeName(v: unknown): string {
	if (v === null) return 'null';
	if (Array.isArray(v)) return 'array';
	if (isColor(v)) return `${modelName(v.constructor as ColorModel)} color`;
	if (isModel(v)) return `model ${modelName(v)}`;
	return typeof v;
}

// ADR-016 78e: a forgotten clone() on shared state throws at the call site instead of corrupting it.
export function freezeColors(v: DSLValue): void {
	if (isColor(v)) Object.freeze(v);
	else if (Array.isArray(v)) v.forEach(freezeColors);
	else if (v !== null && typeof v === 'object') Object.values(v).forEach(freezeColors);
}
