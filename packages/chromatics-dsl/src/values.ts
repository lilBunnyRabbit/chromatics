import * as pkg from "@lilbunnyrabbit/chromatics";
import { Color, type ColorModel } from "@lilbunnyrabbit/chromatics";
import { models } from "@lilbunnyrabbit/chromatics/all";

/** A plain object built by a program (`{ l: 0.5 }`), or a descriptor a builtin returns. */
export interface PlainObject {
  [key: string]: DSLValue;
}

/** Any value a program can hold. Colors are the package's instances; models are its classes. */
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

/** A builtin, or a bound color method. */
export type DSLFunction = (...args: DSLValue[]) => DSLValue;

const MODELS = new Set<unknown>(models);

// Export names, not `class.name`: a minified build renames classes.
const NAMES = new Map<unknown, string>(
  Object.entries(pkg)
    .filter(([, v]) => MODELS.has(v))
    .map(([k, v]) => [v, k])
);

/**
 * The name a program uses for a model: its export name in `@lilbunnyrabbit/chromatics` (`Oklch`, not
 * `class.name`, which a minifier renames). A model the root barrel doesn't export falls back to its `id`, so a
 * newer color package never breaks the language (ADR-018).
 */
export function modelName(m: ColorModel): string {
  return NAMES.get(m) ?? m.id;
}

/** Every model class by its program name, in the color package's `models` order. Read from the package at load. */
export const MODEL_CLASSES: readonly (readonly [string, ColorModel])[] = models.map((m) => [modelName(m), m] as const);

/** `true` for a color instance of the (peer) color package. */
export function isColor(v: unknown): v is Color {
  return v instanceof Color;
}

/** `true` for one of the color package's model classes. */
export function isModel(v: unknown): v is ColorModel {
  return MODELS.has(v);
}

/** @throws {Error} unless `v` is a number. */
export function num(v: DSLValue): number {
  if (typeof v === "number") return v;
  throw new Error(`Expected number, got ${typeName(v)}`);
}

/** @throws {Error} unless `v` is a string. */
export function str(v: DSLValue): string {
  if (typeof v === "string") return v;
  throw new Error(`Expected string, got ${typeName(v)}`);
}

/** @throws {Error} unless `v` is a color. */
export function color(v: DSLValue): Color {
  if (isColor(v)) return v;
  throw new Error(`Expected color, got ${typeName(v)}`);
}

/** @throws {Error} unless `v` is a model class. */
export function model(v: DSLValue): ColorModel {
  if (isModel(v)) return v;
  throw new Error(`Expected a color model such as Oklch, got ${typeName(v)}`);
}

/** @throws {Error} unless `v` is a plain object. */
export function obj(v: DSLValue): PlainObject {
  if (v !== null && typeof v === "object" && !Array.isArray(v) && !isColor(v)) return v as PlainObject;
  throw new Error(`Expected object, got ${typeName(v)}`);
}

/** How an error message names a value's type: `Oklch color`, `model Lab`, `array`, `number`. */
export function typeName(v: unknown): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  if (isColor(v)) return `${modelName(v.constructor as ColorModel)} color`;
  if (isModel(v)) return `model ${modelName(v)}`;
  return typeof v;
}

// ADR-016 78e: a forgotten clone() on shared state throws at the call site instead of corrupting it.
/** Freezes every color reachable from `v` (arrays and plain objects are walked, not frozen). */
export function freezeColors(v: DSLValue): void {
  if (isColor(v)) Object.freeze(v);
  else if (Array.isArray(v)) v.forEach(freezeColors);
  else if (v !== null && typeof v === "object") Object.values(v).forEach(freezeColors);
}
