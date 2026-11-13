import * as acorn from "acorn";
import { createEnvironment } from "./environment.js";
import { rolesConfig, type RoleLine } from "./namespaces/theme.js";
import {
  freezeColors,
  isColor,
  isModel,
  modelName,
  num,
  typeName,
  type DSLValue,
  type DSLFunction,
  type PlainObject,
} from "./values.js";

export type { DSLValue, DSLFunction, PlainObject };

type Node = acorn.Node;

/** Source offsets into the program text, `start` inclusive, `end` exclusive (UTF-16 code units). */
export interface Span {
  start: number;
  end: number;
}

/** One top-level name a program defines. */
export interface Variable {
  name: string;
  /** Colors in it are frozen (ADR-016 78e): clone before changing one. */
  value: DSLValue;
  /** The variables its right-hand side read, in first-read order. */
  deps: string[];
  /** 1-based line of the assignment. */
  line: number;
  /** The right-hand side's source; a `roles {}` / `light {}` / `dark {}` variable spans its block. */
  span: Span;
}

/** A parse or evaluation error. The statement after it still runs. */
export interface EvalError {
  message: string;
  /** 1-based line. */
  line: number;
  /** The failing statement (or the parse error's position) in the source, when known. */
  span?: Span;
}

/** What `evaluate` returns. */
export interface EvalResult {
  variables: Map<string, Variable>;
  errors: EvalError[];
  /** Variable names in definition order. */
  order: string[];
}

class Scope {
  variables = new Map<string, Variable>();
  order: string[] = [];
  private env: Map<string, DSLValue>;
  currentDeps: Set<string> = new Set();
  /** Inside a `preview { … }` / `component { … }` block, the namespace whose
   *  members resolve as bare identifiers (so `ramp(c)` means `preview.ramp(c)`). */
  overlay: Record<string, DSLValue> | null = null;

  constructor() {
    this.env = createEnvironment();
  }

  get(name: string): DSLValue {
    // Check user variables first
    const userVar = this.variables.get(name);
    if (userVar !== undefined) {
      this.currentDeps.add(name);
      return userVar.value;
    }
    // Bare namespace members inside a block (not tracked as deps)
    if (this.overlay && Object.prototype.hasOwnProperty.call(this.overlay, name)) {
      return this.overlay[name];
    }
    // Then built-in environment
    const envVal = this.env.get(name);
    if (envVal !== undefined) return envVal;

    throw new Error(`Undefined variable: ${name}`);
  }

  /** A builtin namespace object (`preview`, `component`), if it is one. */
  namespace(label: string): Record<string, DSLValue> | undefined {
    const v = this.env.get(label);
    if (v && typeof v === "object" && !Array.isArray(v)) {
      return v as Record<string, DSLValue>;
    }
    return undefined;
  }

  set(name: string, value: DSLValue, deps: string[], line: number, span: Span): void {
    this.variables.set(name, { name, value, deps, line, span });
    if (!this.order.includes(name)) {
      this.order.push(name);
    }
  }
}

const COMPOUND: Record<string, (a: number, b: number) => number> = {
  "+=": (a, b) => a + b,
  "-=": (a, b) => a - b,
  "*=": (a, b) => a * b,
  "/=": (a, b) => a / b,
};

// TS `protected` / `private` are erased at runtime, so the package's internals are hidden by name.
const HIDDEN = new Set(["constructor", "prototype", "__proto__", "assign", "write", "alphaOf", "edges", "terminal"]);

function colorMember(obj: object, prop: DSLValue): DSLValue {
  const owner = isModel(obj) ? `${modelName(obj)}` : typeName(obj);
  if (typeof prop !== "string" || prop.startsWith("_") || HIDDEN.has(prop) || !(prop in obj)) {
    throw new Error(`${owner} has no property: ${String(prop)}`);
  }
  const v = (obj as Record<string, unknown>)[prop];
  return typeof v === "function" ? (v as DSLFunction).bind(obj) : (v as DSLValue);
}

function evalNode(node: Node, scope: Scope): DSLValue {
  switch (node.type) {
    case "Literal": {
      const n = node as Node & { value: number | string | boolean };
      return n.value;
    }

    case "Identifier": {
      const n = node as Node & { name: string };
      return scope.get(n.name);
    }

    case "UnaryExpression": {
      const n = node as Node & { operator: string; argument: Node };
      const arg = evalNode(n.argument, scope);
      switch (n.operator) {
        case "-":
          return -num(arg);
        case "+":
          return +num(arg);
        case "!":
          return !arg;
        default:
          throw new Error(`Unsupported operator: ${n.operator}`);
      }
    }

    case "BinaryExpression": {
      const n = node as Node & { operator: string; left: Node; right: Node };
      const left = evalNode(n.left, scope);
      const right = evalNode(n.right, scope);
      switch (n.operator) {
        case "+":
          return num(left) + num(right);
        case "-":
          return num(left) - num(right);
        case "*":
          return num(left) * num(right);
        case "/":
          return num(left) / num(right);
        case "%":
          return num(left) % num(right);
        case "**":
          return num(left) ** num(right);
        case "<":
          return num(left) < num(right);
        case ">":
          return num(left) > num(right);
        case "<=":
          return num(left) <= num(right);
        case ">=":
          return num(left) >= num(right);
        case "==":
        case "===":
          return left === right;
        case "!=":
        case "!==":
          return left !== right;
        default:
          throw new Error(`Unsupported operator: ${n.operator}`);
      }
    }

    case "LogicalExpression": {
      const n = node as Node & { operator: string; left: Node; right: Node };
      const left = evalNode(n.left, scope);
      switch (n.operator) {
        case "&&":
          return left ? evalNode(n.right, scope) : left;
        case "||":
          return left ? left : evalNode(n.right, scope);
        default:
          throw new Error(`Unsupported operator: ${n.operator}`);
      }
    }

    case "ConditionalExpression": {
      const n = node as Node & { test: Node; consequent: Node; alternate: Node };
      return evalNode(n.test, scope) ? evalNode(n.consequent, scope) : evalNode(n.alternate, scope);
    }

    case "MemberExpression": {
      const n = node as Node & {
        object: Node;
        property: Node & { name: string };
        computed: boolean;
      };
      const obj = evalNode(n.object, scope);
      const prop = n.computed ? evalNode(n.property, scope) : (n.property as Node & { name: string }).name;

      // Array indexing: scale[0], scale[-1], scale.length
      if (Array.isArray(obj)) {
        if (prop === "length") return obj.length;
        const idx = num(prop as DSLValue);
        if (!Number.isInteger(idx)) {
          throw new Error(`Array index must be an integer, got ${idx}`);
        }
        const el = obj[idx < 0 ? obj.length + idx : idx];
        if (el === undefined) {
          throw new Error(`Array index out of bounds: ${idx}`);
        }
        return el;
      }

      if (isColor(obj) || isModel(obj)) return colorMember(obj, prop);

      // Builtin functions that double as namespaces: theme.dark({…}), theme.light({…}).
      if (typeof obj === "function" && typeof prop === "string" && Object.prototype.hasOwnProperty.call(obj, prop)) {
        return (obj as unknown as Record<string, DSLValue>)[prop];
      }

      // Plain object property access: opts.kL
      if (obj !== null && typeof obj === "object" && typeof prop === "string") {
        const rec = obj as PlainObject;
        if (!Object.prototype.hasOwnProperty.call(rec, prop)) {
          throw new Error(`Object has no property: ${prop}`);
        }
        return rec[prop];
      }

      throw new Error(`Cannot access property '${String(prop)}' on ${typeof obj}`);
    }

    case "CallExpression":
    case "NewExpression": {
      const n = node as Node & { callee: Node; arguments: Node[] };
      const fn = evalNode(n.callee, scope);
      const args = n.arguments.map((a) => evalNode(a, scope));
      // ADR-016 78h: a model class is callable without `new`, the DSL's one convenience.
      if (isModel(fn)) return new fn(...args.map(num));
      if (node.type === "NewExpression") throw new Error("`new` takes a color model, such as Oklch");
      if (typeof fn !== "function") throw new Error(`Not a function`);
      return (fn as DSLFunction)(...args);
    }

    case "AssignmentExpression": {
      const n = node as Node & { left: Node; right: Node; operator: string };
      const op = COMPOUND[n.operator];
      if (n.operator !== "=" && !op) throw new Error(`Unsupported assignment: ${n.operator}`);

      if (n.left.type === "MemberExpression") {
        const m = n.left as Node & {
          object: Node;
          property: Node & { name: string };
          computed: boolean;
        };
        const target = evalNode(m.object, scope);
        if (!isColor(target) || m.computed) throw new Error("Only color channels can be assigned, e.g. c.l = 0.5");
        const key = m.property.name;
        const current = colorMember(target, key);
        if (typeof current !== "number") throw new Error(`${typeName(target)} has no channel ${key}`);
        const right = num(evalNode(n.right, scope));
        const value = op ? op(current, right) : right;
        (target as unknown as Record<string, number>)[key] = value;
        return value;
      }
      if (n.left.type !== "Identifier") throw new Error("Can only assign to variables");
      const name = (n.left as Node & { name: string }).name;

      scope.currentDeps = new Set();
      const right = evalNode(n.right, scope);
      const value = op ? op(num(scope.get(name)), num(right)) : right;
      const deps = Array.from(scope.currentDeps);
      const line = (node as unknown as { loc?: { start: { line: number } } }).loc?.start.line ?? 0;
      scope.set(name, value, deps, line, spanOf(n.right));
      return value;
    }

    case "ExpressionStatement": {
      const n = node as Node & { expression: Node };
      return evalNode(n.expression, scope);
    }

    case "ArrayExpression": {
      const n = node as Node & { elements: (Node | null)[] };
      const arr: DSLValue[] = [];
      for (const el of n.elements) {
        if (el === null) {
          throw new Error("Sparse array elements are not supported");
        }
        if (el.type === "SpreadElement") {
          throw new Error("Spread elements are not supported");
        }
        arr.push(evalNode(el, scope));
      }
      return arr;
    }

    case "ObjectExpression": {
      const n = node as Node & { properties: Node[] };
      const obj: PlainObject = {};
      for (const p of n.properties) {
        const prop = p as Node & {
          key: Node & { name?: string; value?: unknown };
          value: Node;
          kind?: string;
          computed?: boolean;
        };
        if (prop.type !== "Property") {
          throw new Error("Object spread is not supported");
        }
        if (prop.kind && prop.kind !== "init") {
          throw new Error("Getters and setters are not supported");
        }
        let key: string;
        if (prop.computed) {
          key = String(evalNode(prop.key, scope));
        } else if (prop.key.type === "Identifier") {
          key = prop.key.name as string;
        } else if (prop.key.type === "Literal") {
          key = String((prop.key as Node & { value: unknown }).value);
        } else {
          throw new Error(`Unsupported object key: ${prop.key.type}`);
        }
        obj[key] = evalNode(prop.value, scope);
      }
      return obj;
    }

    default:
      throw new Error(`Unsupported syntax: ${node.type}`);
  }
}

/**
 * Block sugar: `preview { … }` and `component { … }` aren't valid JS, but the
 * labeled-statement form `preview: { … }` is. We turn the single whitespace
 * between the keyword and `{` into a colon — a length-preserving edit, so every
 * acorn character offset (the adapter slices the *original* source with them)
 * and every line number stays exactly as the user typed it. Only a keyword that
 * begins a statement (line start, indentation only) is rewritten, so
 * `preview.ramp(…)` and strings are never touched.
 */
const BLOCK_SUGAR = /(^|\n)([ \t]*)(preview|component|tokens|roles|light|dark)[ \t]([ \t]*\{)/g;
function desugarBlocks(source: string): string {
  return source.replace(BLOCK_SUGAR, (_m, nl, indent, kw, rest) => `${nl}${indent}${kw}:${rest}`);
}

const lineOf = (node: unknown): number => (node as { loc?: { start: { line: number } } }).loc?.start.line ?? 1;

const spanOf = (node: Node): Span => ({ start: node.start, end: node.end });

const errorAt = (message: string, node: Node): EvalError => ({
  message,
  line: lineOf(node),
  span: spanOf(node),
});

type LabeledNode = Node & {
  type: string;
  label?: { name: string };
  body?: Node & { type: string; body?: Node[] };
};

interface AssignNode {
  type: string;
  operator?: string;
  left?: { type: string; name?: string };
  right?: { type: string; name?: string; value?: unknown };
}

interface RoleMapResult {
  lines: RoleLine[];
  nested: { mode: "light" | "dark"; lines: RoleLine[] }[];
}

/**
 * Parse a `role = colorName` mapping-block body. With `allowNested`, also pulls
 * out nested `light { … }` / `dark { … }` sub-blocks (one level deep) so a single
 * `roles { … }` can hold both modes.
 */
function parseRoleMap(body: Node[] | undefined, errors: EvalError[], allowNested: boolean): RoleMapResult {
  const lines: RoleLine[] = [];
  const nested: { mode: "light" | "dark"; lines: RoleLine[] }[] = [];
  for (const inner of body ?? []) {
    const lab = inner as LabeledNode;
    if (lab.type === "LabeledStatement") {
      const m = lab.label?.name;
      if (allowNested && (m === "light" || m === "dark") && lab.body?.type === "BlockStatement") {
        nested.push({ mode: m, lines: parseRoleMap(lab.body.body, errors, false).lines });
      } else {
        errors.push(
          errorAt(`'${m}' is not valid here — use 'light { … }' or 'dark { … }' inside 'roles { … }'.`, inner)
        );
      }
      continue;
    }
    try {
      const e = (inner as { type: string; expression?: AssignNode }).expression ?? (inner as unknown as AssignNode);
      if (
        (inner as { type: string }).type !== "ExpressionStatement" ||
        e?.type !== "AssignmentExpression" ||
        e.operator !== "=" ||
        e.left?.type !== "Identifier"
      ) {
        throw new Error("each line maps a role, e.g. `primary = primary`");
      }
      const role = e.left.name as string;
      const r = e.right;
      let target: string;
      if (r?.type === "Identifier") target = r.name as string;
      else if (r?.type === "Literal" && typeof r.value === "string") target = r.value;
      else throw new Error(`role '${role}' must map to a color name`);
      const left = e.left as unknown as Node;
      const right = r as unknown as Node;
      lines.push([role, target, { line: lineOf(left), span: spanOf(left), target: spanOf(right) }]);
    } catch (err: unknown) {
      errors.push(errorAt((err as Error).message, inner));
    }
  }
  return { lines, nested };
}

/**
 * Runs a program and returns every variable it defines plus every error. Never throws: a parse error ends
 * the run with one error, a failing statement records its error and the next statement runs. Colors in the
 * result are frozen.
 *
 * The environment is fixed (ADR-018): the color package's model classes by export name, `parse`,
 * `ensureContrast`, `simulateCvd`, `abs min max round floor ceil clamp`, and the `preview`, `tokens`,
 * `component` and `theme` namespaces, plus the `preview {}` / `tokens {}` / `component {}` builder blocks and
 * the `roles {}` / `light {}` / `dark {}` mapping blocks.
 *
 * @example
 * ```ts
 * const { variables, errors } = evaluate("brand = Oklch(0.62, 0.19, 30)\naccent = brand.to(Oklch).rotateHue(180)");
 * ```
 */
export function evaluate(source: string): EvalResult {
  const scope = new Scope();
  const errors: EvalError[] = [];
  // Accumulate light/dark role re-bindings across all roles/light/dark blocks
  // into one `light` / `dark` theme var each (flushed after the loop), so legacy
  // `roles { … }` (no nesting) stays byte-for-byte unchanged.
  const darkMap: RoleLine[] = [];
  const lightMap: RoleLine[] = [];
  let darkSpan: Span = { start: 0, end: 0 };
  let lightSpan: Span = { start: 0, end: 0 };
  let darkLine = 1;
  let lightLine = 1;

  // Parse the full source
  let program: acorn.Program;
  try {
    program = acorn.parse(desugarBlocks(source), {
      ecmaVersion: 2020,
      sourceType: "module",
      locations: true,
    });
  } catch (e: unknown) {
    const err = e as { message: string; loc?: { line: number }; pos?: number };
    errors.push({
      message: err.message.replace(/\(\d+:\d+\)$/, "").trim(),
      line: err.loc?.line ?? 1,
      ...(typeof err.pos === "number" ? { span: { start: err.pos, end: err.pos } } : {}),
    });
    return { variables: scope.variables, errors, order: scope.order };
  }

  // Evaluate each statement
  for (const stmt of program.body) {
    const s = stmt as unknown as LabeledNode;

    // A `preview { … }` / `component { … }` block: evaluate its assignments
    // with the namespace overlaid, but record each as a top-level variable so
    // the scheme sees them exactly as the flat `name = preview.x(…)` form.
    if (s.type === "LabeledStatement") {
      const label = s.label?.name;
      const MAPPING = label === "roles" || label === "light" || label === "dark";
      if (label !== "preview" && label !== "component" && label !== "tokens" && !MAPPING) {
        errors.push(
          errorAt(
            `Unknown block '${label}'. Use 'tokens { … }', 'component { … }', 'preview { … }', 'roles { … }', 'light { … }' or 'dark { … }'.`,
            s
          )
        );
        continue;
      }
      if (s.body?.type !== "BlockStatement") {
        errors.push(errorAt(`'${label}' must be followed by a { … } block`, s));
        continue;
      }

      // Mapping blocks: roles { role = colorName } binds a theme role to a color
      // *by name* (RHS captured, not evaluated). `roles {}` is the light/base
      // mapping (and may hold nested `light {}`/`dark {}`); top-level `light {}`/
      // `dark {}` are the per-mode re-bindings. All re-resolve through the same
      // audit/export — dark is pure role re-binding, not a second pipeline.
      if (MAPPING) {
        const { lines, nested } = parseRoleMap(s.body.body, errors, label === "roles");
        if (label === "roles") {
          scope.set("roles", rolesConfig(lines), [], lineOf(s), spanOf(s));
          for (const n of nested) {
            const bucket = n.mode === "dark" ? darkMap : lightMap;
            bucket.push(...n.lines);
            if (n.mode === "dark") {
              darkSpan = spanOf(s);
              darkLine = lineOf(s);
            } else {
              lightSpan = spanOf(s);
              lightLine = lineOf(s);
            }
          }
        } else if (label === "dark") {
          darkMap.push(...lines);
          darkSpan = spanOf(s);
          darkLine = lineOf(s);
        } else {
          lightMap.push(...lines);
          lightSpan = spanOf(s);
          lightLine = lineOf(s);
        }
        continue;
      }

      // Builder blocks (preview / component / tokens): bare member calls.
      const ns = scope.namespace(label);
      if (!ns) {
        errors.push(errorAt(`'${label}' is not a namespace`, s));
        continue;
      }
      const prev = scope.overlay;
      scope.overlay = ns;
      for (const inner of s.body.body ?? []) {
        try {
          evalNode(inner, scope);
        } catch (e: unknown) {
          errors.push(errorAt((e as Error).message, inner));
        }
      }
      scope.overlay = prev;
      continue;
    }

    try {
      evalNode(stmt as unknown as Node, scope);
    } catch (e: unknown) {
      errors.push(errorAt((e as Error).message, stmt));
    }
  }

  // Flush the merged per-mode role maps into one `light` / `dark` theme var each.
  if (lightMap.length) {
    scope.set("light", rolesConfig(lightMap, "light"), [], lightLine, lightSpan);
  }
  if (darkMap.length) {
    scope.set("dark", rolesConfig(darkMap, "dark"), [], darkLine, darkSpan);
  }

  for (const v of scope.variables.values()) freezeColors(v.value);
  return { variables: scope.variables, errors, order: scope.order };
}
