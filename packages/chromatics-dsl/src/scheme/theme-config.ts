import { isThemeConfig, type ThemeConfig } from "../namespaces/theme.js";
import type { Scheme } from "./types.js";

export { isThemeConfig, type ThemeConfig };

/**
 * The role → color name lines a program wrote for one mode, keeping only declared roles. Later lines win;
 * a descriptor with no `mode` counts as light. Targets aren't checked against the scheme.
 */
export function declaredRoles<R extends string>(
  scheme: Scheme,
  roles: ReadonlySet<string>,
  mode: "light" | "dark" = "light"
): Partial<Record<R, string>> {
  const out: Partial<Record<R, string>> = {};
  for (const v of scheme.nonColorVars) {
    if (!isThemeConfig(v.value) || (v.value.mode ?? "light") !== mode) continue;
    for (const [role, name] of Object.entries(v.value.roles)) if (roles.has(role)) out[role as R] = name;
  }
  return out;
}
