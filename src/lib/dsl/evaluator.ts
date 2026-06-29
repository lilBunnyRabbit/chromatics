import * as acorn from 'acorn';
import type { Node } from 'estree';
import { isColorValue, ModelView } from '../models/index.js';
import { num } from '../models/util.js';
import { createEnvironment } from './environment.js';
import type { DSLValue, DSLFunction, PlainObject } from '../models/index.js';

// --- Types ---

export type { DSLValue, DSLFunction, PlainObject };

export interface Variable {
	name: string;
	value: DSLValue;
	deps: string[];
	line: number;
	node: Node;
}

export interface EvalError {
	message: string;
	line: number;
}

export interface EvalResult {
	variables: Map<string, Variable>;
	errors: EvalError[];
	order: string[]; // variable names in definition order
}

// --- Evaluator ---

class Scope {
	variables = new Map<string, Variable>();
	order: string[] = [];
	private env: Map<string, DSLValue>;
	currentDeps: Set<string> = new Set();

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
		// Then built-in environment
		const envVal = this.env.get(name);
		if (envVal !== undefined) return envVal;

		throw new Error(`Undefined variable: ${name}`);
	}

	set(name: string, value: DSLValue, deps: string[], line: number, node: Node): void {
		this.variables.set(name, { name, value, deps, line, node });
		if (!this.order.includes(name)) {
			this.order.push(name);
		}
	}
}

function evalNode(node: Node, scope: Scope): DSLValue {
	switch (node.type) {
		case 'Literal': {
			const n = node as Node & { value: number | string | boolean };
			return n.value;
		}

		case 'Identifier': {
			const n = node as Node & { name: string };
			return scope.get(n.name);
		}

		case 'UnaryExpression': {
			const n = node as Node & { operator: string; argument: Node };
			const arg = evalNode(n.argument, scope);
			switch (n.operator) {
				case '-':
					return -num(arg);
				case '+':
					return +num(arg);
				case '!':
					return !arg;
				default:
					throw new Error(`Unsupported operator: ${n.operator}`);
			}
		}

		case 'BinaryExpression': {
			const n = node as Node & { operator: string; left: Node; right: Node };
			const left = evalNode(n.left, scope);
			const right = evalNode(n.right, scope);
			switch (n.operator) {
				case '+':
					return num(left) + num(right);
				case '-':
					return num(left) - num(right);
				case '*':
					return num(left) * num(right);
				case '/':
					return num(left) / num(right);
				case '%':
					return num(left) % num(right);
				case '**':
					return num(left) ** num(right);
				case '<':
					return num(left) < num(right);
				case '>':
					return num(left) > num(right);
				case '<=':
					return num(left) <= num(right);
				case '>=':
					return num(left) >= num(right);
				case '==':
				case '===':
					return left === right;
				case '!=':
				case '!==':
					return left !== right;
				default:
					throw new Error(`Unsupported operator: ${n.operator}`);
			}
		}

		case 'LogicalExpression': {
			const n = node as Node & { operator: string; left: Node; right: Node };
			const left = evalNode(n.left, scope);
			switch (n.operator) {
				case '&&':
					return left ? evalNode(n.right, scope) : left;
				case '||':
					return left ? left : evalNode(n.right, scope);
				default:
					throw new Error(`Unsupported operator: ${n.operator}`);
			}
		}

		case 'ConditionalExpression': {
			const n = node as Node & { test: Node; consequent: Node; alternate: Node };
			return evalNode(n.test, scope) ? evalNode(n.consequent, scope) : evalNode(n.alternate, scope);
		}

		case 'MemberExpression': {
			const n = node as Node & {
				object: Node;
				property: Node & { name: string };
				computed: boolean;
			};
			const obj = evalNode(n.object, scope);
			const prop = n.computed
				? evalNode(n.property, scope)
				: (n.property as Node & { name: string }).name;

			// Array indexing: scale[0], scale[-1], scale.length
			if (Array.isArray(obj)) {
				if (prop === 'length') return obj.length;
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

			if (isColorValue(obj) && typeof prop === 'string') {
				const m = obj.member(prop);
				if (m === undefined) {
					throw new Error(`Color has no property: ${prop}`);
				}
				return m;
			}

			if (obj instanceof ModelView && typeof prop === 'string') {
				const m = obj.member(prop);
				if (m === undefined) {
					throw new Error(`'${obj.def.label}' view has no member: ${prop}`);
				}
				return m;
			}

			// Static members on env constructors: OKLCH.from(color), HSL.from(color) …
			if (typeof obj === 'function' && typeof prop === 'string') {
				const m = (obj as unknown as Record<string, DSLValue | undefined>)[prop];
				if (m === undefined) {
					throw new Error(`'${prop}' is not available on this constructor`);
				}
				return m;
			}

			// Plain object property access: opts.kL
			if (obj !== null && typeof obj === 'object' && typeof prop === 'string') {
				const rec = obj as PlainObject;
				if (!Object.prototype.hasOwnProperty.call(rec, prop)) {
					throw new Error(`Object has no property: ${prop}`);
				}
				return rec[prop];
			}

			throw new Error(`Cannot access property '${String(prop)}' on ${typeof obj}`);
		}

		case 'CallExpression': {
			const n = node as Node & { callee: Node; arguments: Node[] };
			const fn = evalNode(n.callee, scope);
			if (typeof fn !== 'function') {
				throw new Error(`Not a function`);
			}
			const args = n.arguments.map((a) => evalNode(a, scope));
			return (fn as DSLFunction)(...args);
		}

		case 'AssignmentExpression': {
			const n = node as Node & { left: Node & { name: string }; right: Node; operator: string };
			if (n.operator !== '=') {
				throw new Error(`Only = assignment is supported, got ${n.operator}`);
			}
			if (n.left.type !== 'Identifier') {
				throw new Error('Can only assign to variables');
			}

			scope.currentDeps = new Set();
			const value = evalNode(n.right, scope);
			const deps = Array.from(scope.currentDeps);
			const line = (node as unknown as { loc?: { start: { line: number } } }).loc?.start.line ?? 0;
			scope.set(n.left.name, value, deps, line, node);
			return value;
		}

		case 'ExpressionStatement': {
			const n = node as Node & { expression: Node };
			return evalNode(n.expression, scope);
		}

		case 'ArrayExpression': {
			const n = node as Node & { elements: (Node | null)[] };
			const arr: DSLValue[] = [];
			for (const el of n.elements) {
				if (el === null) {
					throw new Error('Sparse array elements are not supported');
				}
				if (el.type === 'SpreadElement') {
					throw new Error('Spread elements are not supported');
				}
				arr.push(evalNode(el, scope));
			}
			return arr;
		}

		case 'ObjectExpression': {
			const n = node as Node & { properties: Node[] };
			const obj: PlainObject = {};
			for (const p of n.properties) {
				const prop = p as Node & {
					key: Node & { name?: string; value?: unknown };
					value: Node;
					kind?: string;
					computed?: boolean;
				};
				if (prop.type !== 'Property') {
					throw new Error('Object spread is not supported');
				}
				if (prop.kind && prop.kind !== 'init') {
					throw new Error('Getters and setters are not supported');
				}
				let key: string;
				if (prop.computed) {
					key = String(evalNode(prop.key, scope));
				} else if (prop.key.type === 'Identifier') {
					key = prop.key.name as string;
				} else if (prop.key.type === 'Literal') {
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

export function evaluate(source: string): EvalResult {
	const scope = new Scope();
	const errors: EvalError[] = [];

	// Parse the full source
	let program: acorn.Program;
	try {
		program = acorn.parse(source, {
			ecmaVersion: 2020,
			sourceType: 'module',
			locations: true
		});
	} catch (e: unknown) {
		const err = e as { message: string; loc?: { line: number } };
		errors.push({
			message: err.message.replace(/\(\d+:\d+\)$/, '').trim(),
			line: err.loc?.line ?? 1
		});
		return { variables: scope.variables, errors, order: scope.order };
	}

	// Evaluate each statement
	for (const stmt of program.body) {
		try {
			evalNode(stmt as unknown as Node, scope);
		} catch (e: unknown) {
			const err = e as Error;
			const loc = (stmt as unknown as { loc?: { start: { line: number } } }).loc;
			errors.push({
				message: err.message,
				line: loc?.start.line ?? 1
			});
		}
	}

	return { variables: scope.variables, errors, order: scope.order };
}
