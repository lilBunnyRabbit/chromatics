/**
 * The `theme(...)` builtin and the `roles {}` / `light {}` / `dark {}` blocks: both bind role names to color
 * variable names. The language knows no role names (ADR-018): a descriptor keeps every key as written, and
 * `deriveScheme` checks them against the host's declared roles.
 */
import type { DSLValue, DSLFunction, PlainObject } from "../values.js";

/** Where a role key was written, for the unknown-role error. */
export interface RolePosition {
  line: number;
  /** The role key. */
  span: { start: number; end: number };
  /** The color name it maps to. */
  target: { start: number; end: number };
}

/** `[role, colorName, where]`: one line of a mapping block, or one key of `theme({…})`. */
export type RoleLine = readonly [role: string, target: unknown, position?: RolePosition];

/** A role mapping as a program value: what `theme({…})` and the mapping blocks evaluate to. */
export interface ThemeConfig {
  __theme: true;
  /** Undefined = light (the base mapping). */
  mode?: "light" | "dark";
  /** Role → color variable name, keys as written. A key written twice keeps the last value. */
  roles: Record<string, string>;
}

/** `true` for a `theme({…})` / `roles {}` descriptor. */
export function isThemeConfig(v: unknown): v is ThemeConfig {
  return typeof v === "object" && v !== null && (v as Record<string, unknown>).__theme === true;
}

const POSITIONS = new WeakMap<object, Map<string, RolePosition>>();

/** Where each key of a mapping block was written; `undefined` for `theme({…})`, whose keys carry no position. */
export function rolePositions(config: ThemeConfig): ReadonlyMap<string, RolePosition> | undefined {
  return POSITIONS.get(config);
}

/**
 * Builds a theme config from `role → colorName` pairs. Non-string targets are dropped (a role maps to a
 * name, not a color). `mode` tags the descriptor: undefined / `light` is the base mapping, `dark` the dark
 * re-binding.
 */
export function rolesConfig(entries: Iterable<RoleLine>, mode?: "light" | "dark"): DSLValue {
  const roles: Record<string, string> = {};
  const positions = new Map<string, RolePosition>();
  for (const [k, v, position] of entries) {
    if (typeof v !== "string") continue;
    // Re-insert so iteration order is write order, as if each line were applied in turn.
    delete roles[k];
    roles[k] = v;
    if (position) positions.set(k, position);
  }
  const config: ThemeConfig = { __theme: true, ...(mode ? { mode } : {}), roles };
  if (positions.size) POSITIONS.set(config, positions);
  return config as unknown as DSLValue;
}

const themeWith =
  (mode?: "light" | "dark") =>
  (...a: DSLValue[]): DSLValue => {
    const src = a[0];
    const cfg = src && typeof src === "object" && !Array.isArray(src) ? (src as PlainObject) : {};
    return rolesConfig(
      Object.entries(cfg).map(([k, v]) => [k, v] as const),
      mode
    );
  };

/** `theme({ role: "name", … })`, with `theme.light({…})` and `theme.dark({…})` as members. */
export const themeFn: DSLFunction = themeWith();
// Static members resolved by the evaluator's function-member path (like OKLCH.from):
// theme.light({…}) is the base mapping; theme.dark({…}) re-points roles for dark.
(themeFn as unknown as Record<string, DSLValue>).light = themeWith("light") as unknown as DSLValue;
(themeFn as unknown as Record<string, DSLValue>).dark = themeWith("dark") as unknown as DSLValue;
