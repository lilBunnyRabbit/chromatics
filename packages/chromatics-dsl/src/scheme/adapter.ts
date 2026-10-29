import type { EvalResult, Variable } from "../evaluator.js";
import { isColor } from "../values.js";
import type { Scheme, SchemeEntry } from "./types.js";

/**
 * Splits an evaluation into its color variables (with the source of each right-hand side) and the rest.
 * `source` is the program `result` came from.
 */
export function schemeFromEvalResult(result: EvalResult, source: string): Scheme {
  const entries: SchemeEntry[] = [];
  const nonColorVars: Variable[] = [];
  let index = 0;

  for (const name of result.order) {
    const v = result.variables.get(name);
    if (!v) continue;
    if (isColor(v.value)) {
      const description = source.slice(v.span.start, v.span.end).trim();
      entries.push({
        name: v.name,
        color: v.value,
        deps: v.deps,
        line: v.line,
        ...(description ? { description } : {}),
        index: index++,
      });
    } else {
      nonColorVars.push(v);
    }
  }

  return { entries, byName: new Map(entries.map((e) => [e.name, e])), errors: result.errors, nonColorVars };
}
