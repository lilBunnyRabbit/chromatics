/**
 * Engine entry point. Importing this registers all models and exposes the
 * canonical value type, the view machinery, the registry, and the DSL
 * constructor functions (built from each model's `ctor`).
 */
import './defs'; // side-effect: register all models

import { getModel, parse } from './registry';
import { ColorValue, type DSLValue } from './value';
import { num, str } from './util';

export { ColorValue, isColorValue } from './value';
export type { DSLValue, DSLFunction, PlainObject } from './value';
export { ModelView } from './view';
export { getModel, getModelByMode, allModels, CHANNELS } from './registry';
export type { ModelDef, MethodDef, ChannelDef, ParamDef, Family, ModelStatus } from './types';

/** Build a constructor function from a model's registered `ctor`. */
function ctor(id: string) {
	const def = getModel(id);
	if (!def?.ctor) throw new Error(`No constructor registered for "${id}"`);
	const build = def.ctor.build;
	return (...args: DSLValue[]) => ColorValue.from(build(args.map(num)));
}

export const OKLCH = ctor('oklch');
export const OKLAB = ctor('oklab');
export const HSL = ctor('hsl');
export const HSV = ctor('hsv');
export const HWB = ctor('hwb');
export const LAB = ctor('lab');
export const LCH = ctor('lch');
export const RGB = ctor('srgb');
export const P3 = ctor('p3');

export function hex(s: DSLValue): ColorValue {
	const parsed = parse(str(s));
	if (!parsed) throw new Error(`Invalid hex color: ${str(s)}`);
	return ColorValue.from(parsed);
}
