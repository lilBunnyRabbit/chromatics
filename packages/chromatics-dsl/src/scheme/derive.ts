import type { Color } from "@lilbunnyrabbit/chromatics";
import { evaluate, type EvalError, type EvalResult } from "../evaluator.js";
import { rolePositions } from "../namespaces/theme.js";
import { schemeFromEvalResult } from "./adapter.js";
import { audit, type AuditPair, type AuditRow } from "./audit.js";
import { declaredRoles, isThemeConfig } from "./theme-config.js";
import type { Scheme, SchemeEntry } from "./types.js";

/** The two modes a program can bind: `roles {}` / `light {}` / `theme()` and `dark {}` / `theme.dark()`. */
export type Mode = "light" | "dark";

/** The host's vocabulary: which roles exist, which pairs to audit, how to guess unbound roles. */
export interface DeriveOptions<R extends string = string> {
  /** Every role the host knows. A mapping key outside this list is an error. */
  roles: readonly R[];
  /** Foreground / background role pairs to measure in each mode. */
  pairs: readonly AuditPair<R>[];
  /**
   * Guesses a color variable name for each role the program leaves unbound in light mode. Without it, a role
   * binds to the color variable of the same name, if there is one.
   */
  auto?: (entries: readonly SchemeEntry[]) => Readonly<Partial<Record<R, string>>>;
}

/** Each role's color, for one mode. A role with no color is absent. Frozen. */
export type ModeColors<R extends string = string> = Readonly<Partial<Record<R, Color>>>;

/** `evaluate`'s result with the roles resolved per mode and audited. */
export interface DerivedScheme<R extends string = string> extends EvalResult {
  modes: Readonly<Record<Mode, ModeColors<R>>>;
  audit: Readonly<Record<Mode, AuditRow<R>[]>>;
}

function unknownRoles(result: EvalResult, roles: ReadonlySet<string>): EvalError[] {
  const errors: EvalError[] = [];
  const list = [...roles].join(", ");
  for (const name of result.order) {
    const v = result.variables.get(name);
    if (!v || !isThemeConfig(v.value)) continue;
    const positions = rolePositions(v.value);
    for (const key of Object.keys(v.value.roles)) {
      if (roles.has(key)) continue;
      const at = positions?.get(key);
      errors.push({
        message: `Unknown role '${key}'. Declared roles: ${list || "none"}.`,
        line: at?.line ?? v.line,
        span: at?.span ?? v.span,
      });
    }
  }
  return errors.sort((a, b) => a.line - b.line);
}

function bind<R extends string>(names: Partial<Record<R, string>>, scheme: Scheme): ModeColors<R> {
  const out: Partial<Record<R, Color>> = {};
  for (const [role, name] of Object.entries(names) as [R, string][]) {
    const entry = scheme.byName.get(name);
    if (entry) out[role] = entry.color;
  }
  return Object.freeze(out);
}

/**
 * Evaluates a program and resolves the host's roles in light and dark mode.
 *
 * Light: a role takes the color its `roles {}` / `light {}` / `theme()` line names; else `auto`'s guess;
 * without `auto`, the color variable named like the role; else it stays unbound. Dark: the light binding,
 * re-pointed by `dark {}` / `theme.dark()`. A line naming a color that doesn't exist is ignored. A mapping
 * key that isn't a declared role is an error (in `errors`, with its line); `evaluate` alone can't know the
 * roles, so it doesn't report them. Never throws.
 *
 * @example
 * ```ts
 * const theme = deriveScheme(source, { roles: ["background", "foreground"], pairs: [{ label: "Text", fg: "foreground", bg: "background" }] });
 * theme.modes.dark.background; // a frozen Color
 * ```
 */
export function deriveScheme<R extends string>(source: string, options: DeriveOptions<R>): DerivedScheme<R> {
  const result = evaluate(source);
  const scheme = schemeFromEvalResult(result, source);
  const roles = new Set<string>(options.roles);

  const declaredLight = declaredRoles(scheme, roles, "light");
  const declaredDark = declaredRoles(scheme, roles, "dark");
  const guessed = options.auto?.(scheme.entries);

  const light: Partial<Record<R, string>> = {};
  for (const role of options.roles) {
    const candidates = [declaredLight[role], guessed ? guessed[role] : role];
    const name = candidates.find((n) => n !== undefined && scheme.byName.has(n));
    if (name !== undefined) light[role] = name;
  }
  const dark: Partial<Record<R, string>> = { ...light };
  for (const role of options.roles) {
    const name = declaredDark[role];
    if (name !== undefined && scheme.byName.has(name)) dark[role] = name;
  }

  const modes = Object.freeze({ light: bind(light, scheme), dark: bind(dark, scheme) });
  return {
    variables: result.variables,
    order: result.order,
    errors: [...result.errors, ...unknownRoles(result, roles)],
    modes,
    audit: Object.freeze({ light: audit(modes.light, options.pairs), dark: audit(modes.dark, options.pairs) }),
  };
}
