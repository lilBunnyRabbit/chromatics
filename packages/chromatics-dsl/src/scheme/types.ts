import type { Color } from "@lilbunnyrabbit/chromatics";
import type { Variable, EvalError } from "../evaluator.js";

/** One color variable of a program. */
export interface SchemeEntry {
  name: string;
  /** Frozen (ADR-016 78e): clone before changing it. */
  color: Color;
  deps: string[];
  line: number;
  /** Source slice of the right-hand side (trimmed). */
  description?: string;
  /** Position among the color variables, in definition order. */
  index: number;
}

/** A program's colors, with everything else it defines kept beside them. */
export interface Scheme {
  /** Color variables in definition order. */
  entries: SchemeEntry[];
  byName: Map<string, SchemeEntry>;
  errors: EvalError[];
  /** Every variable that isn't a color: numbers, previews, tokens, components, role mappings. */
  nonColorVars: Variable[];
}
