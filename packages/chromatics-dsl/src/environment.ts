import { Oklch, Srgb } from "@lilbunnyrabbit/chromatics";
import { parse } from "@lilbunnyrabbit/chromatics/all";
import { simulateCvd } from "@lilbunnyrabbit/chromatics/cvd";
import { wcagTargetRatio } from "./contrast-target.js";
import { MODEL_CLASSES, color, num, str, type DSLValue } from "./values.js";
import { preview } from "./preview.js";
import { tokens } from "./namespaces/tokens.js";
import { component } from "./namespaces/components.js";
import { themeFn } from "./namespaces/theme.js";

/**
 * A fresh copy of the builtins every program sees (ADR-018: the same in every host). Keys are the names a
 * program uses; `preview`, `tokens`, `component` and `theme` are namespace objects whose keys are their members.
 */
export function createEnvironment(): Map<string, DSLValue> {
  const env = new Map<string, DSLValue>();

  for (const [name, model] of MODEL_CLASSES) env.set(name, model);
  env.set("parse", (s: DSLValue) => parse(str(s)));

  // Unlike the colour methods, the reference needs no shared model: bg is only measured against.
  env.set("ensureContrast", (fg: DSLValue, bg: DSLValue, target?: DSLValue) => {
    const t = target === undefined ? "AA" : target;
    const ratio = wcagTargetRatio(typeof t === "number" ? t : str(t));
    return color(fg).to(Srgb).ensureContrast(color(bg).to(Srgb), ratio).to(Oklch);
  });

  // The package's one free function the DSL exposes (owner, 2026-10-25): same signature, mutates its Srgb.
  env.set("simulateCvd", (c: DSLValue, deficiency: DSLValue, severity?: DSLValue) => {
    const target = color(c);
    if (!target.is(Srgb)) throw new Error('simulateCvd takes an Srgb color: simulateCvd(c.to(Srgb), "deutan")');
    const kind = str(deficiency);
    if (kind !== "protan" && kind !== "deutan" && kind !== "tritan") {
      throw new Error(`simulateCvd: deficiency must be "protan", "deutan" or "tritan", got "${kind}"`);
    }
    return simulateCvd(target, kind, severity === undefined ? 1 : num(severity));
  });

  env.set("preview", preview as unknown as DSLValue);
  env.set("tokens", tokens as unknown as DSLValue);
  env.set("component", component as unknown as DSLValue);
  env.set("theme", themeFn);

  env.set("abs", (n: DSLValue) => Math.abs(num(n)));
  env.set("min", (...args: DSLValue[]) => Math.min(...args.map(num)));
  env.set("max", (...args: DSLValue[]) => Math.max(...args.map(num)));
  env.set("round", (n: DSLValue) => Math.round(num(n)));
  env.set("floor", (n: DSLValue) => Math.floor(num(n)));
  env.set("ceil", (n: DSLValue) => Math.ceil(num(n)));
  env.set("clamp", (v: DSLValue, lo: DSLValue, hi: DSLValue) => Math.max(num(lo), Math.min(num(hi), num(v))));

  return env;
}
