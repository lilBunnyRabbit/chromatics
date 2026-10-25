/**
 * ADR-017: upgrades a script written for the pre-package DSL (`OKLCH(…)`, `hex()`, `c.ok_l`,
 * `c.oklch.lighten()`, `mix()`) to the package API, keeping what it computed. The old values were
 * immutable, so every mutating call starts from `clone()` or a conversion. Calls with no package
 * equivalent are left as written with a `// migrate:` note, so they error on that line.
 */
import * as acorn from 'acorn';
import {
	LEGACY_CHANNEL_CHANGES,
	LEGACY_CHANNELS,
	LEGACY_CONSTRUCTORS,
	LEGACY_FLAT_KEYS,
	LEGACY_INCOMPATIBLE,
	LEGACY_MODEL_IDS,
	LEGACY_UNBACKED
} from '../color/legacy.js';
import { MODEL_CLASSES } from './values.js';

const CLASS_NAMES = new Set(MODEL_CLASSES.map(([name]) => name));
const HAS_ROTATE = new Set(
	MODEL_CLASSES.filter(([, m]) => 'rotateHue' in m.prototype).map(([name]) => name)
);
const PACKAGE_MEMBERS = new Set<string>();
for (const [, model] of MODEL_CLASSES) {
	for (let p = model.prototype; p && p !== Object.prototype; p = Object.getPrototypeOf(p)) {
		for (const k of Object.getOwnPropertyNames(p)) PACKAGE_MEMBERS.add(k);
	}
	for (const k of Object.keys(model.channels)) PACKAGE_MEMBERS.add(k);
	for (let c: object | null = model; c && c !== Function.prototype; c = Object.getPrototypeOf(c)) {
		for (const k of Object.getOwnPropertyNames(c)) PACKAGE_MEMBERS.add(k);
	}
}

export interface MigrationNote {
	line: number;
	message: string;
}

export interface Migration {
	source: string;
	/** Nothing to upgrade: the source already reads as the new DSL. */
	unchanged: boolean;
	changes: MigrationNote[];
	/** Calls kept as written because the package has no equivalent; each errors when evaluated. */
	leftovers: MigrationNote[];
}

interface Node {
	type: string;
	start: number;
	end: number;
	loc?: { start: { line: number } };
	[key: string]: unknown;
}

/** What an expression is, as far as the old program could tell. */
interface Info {
	/** The old model id of a colour value, or of a view (`c.oklch`). */
	old?: string;
	/** The package class name the new expression evaluates to, when known. */
	cls?: string;
	view?: boolean;
	/** A new instance nothing else refers to: safe to mutate without `clone()`. */
	fresh?: boolean;
	array?: boolean;
	scalar?: boolean;
}

interface Out {
	text: string;
	info: Info;
}

const HUE_WHEEL_MODELS = new Set(['hsl', 'hsv', 'hwb', 'hsi']);
// The old RGB family's accessors (luminance, contrastWCAG, simulateCVD …) lived on these models.
const RGB_FAMILY = new Set([
	'srgb',
	'p3',
	'a98',
	'prophoto',
	'rec2020',
	'aces',
	'acescg',
	'acescc',
	'acescct',
	'scrgb',
	'smptec'
]);
const CVD_KINDS: Record<string, string> = {
	protanopia: 'protan',
	protanomaly: 'protan',
	deuteranopia: 'deutan',
	deuteranomaly: 'deutan',
	tritanopia: 'tritan',
	tritanomaly: 'tritan'
};
const OLD_HCT_TONES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];

// Old `preview.*` and `scale.*` that took a model id string.
const PREVIEW_MODEL_ARG: Record<string, number> = { ramp: 1, harmony: 2, space: 1, channels: 1 };
const BLOCK_SUGAR = /(^|\n)([ \t]*)(preview|component|tokens|roles|light|dark)[ \t]([ \t]*\{)/g;

const clsOf = (old: string | undefined) => (old ? LEGACY_MODEL_IDS[old] : undefined);

function literalNumber(node: Node): number | undefined {
	if (node.type === 'Literal' && typeof node.value === 'number') return node.value;
	if (node.type === 'UnaryExpression' && node.operator === '-') {
		const v = literalNumber(node.argument as Node);
		return v === undefined ? undefined : -v;
	}
	return undefined;
}

const round = (n: number) => Number(n.toPrecision(12));

/** `(arg) / 100`, folded when the argument is a number literal. */
function hundredth(node: Node | undefined, text: string | undefined): string {
	const v = node ? literalNumber(node) : undefined;
	return v !== undefined ? String(round(v / 100)) : `(${text}) / 100`;
}

class Migrator {
	private readonly vars = new Map<string, Info>();
	readonly changes: MigrationNote[] = [];
	readonly leftovers: MigrationNote[] = [];
	private line = 1;
	private block: string | null = null;

	constructor(private readonly src: string) {}

	private change(message: string) {
		if (!this.changes.some((c) => c.line === this.line && c.message === message)) {
			this.changes.push({ line: this.line, message });
		}
	}

	private leftover(message: string) {
		if (!this.leftovers.some((c) => c.line === this.line && c.message === message)) {
			this.leftovers.push({ line: this.line, message });
		}
	}

	private slice(n: Node) {
		return this.src.slice(n.start, n.end);
	}

	/** The original text of `n` with its direct children's ranges replaced by their printed text. */
	private splice(n: Node, children: { node: Node; text: string }[]): string {
		let out = '';
		let at = n.start;
		for (const c of [...children].sort((a, b) => a.node.start - b.node.start)) {
			out += this.src.slice(at, c.node.start) + c.text;
			at = c.node.end;
		}
		return out + this.src.slice(at, n.end);
	}

	/** `recv` as an instance of `cls` that may be mutated: a copy when it could be shared. */
	private own(recv: Out, cls: string): string {
		if (recv.info.cls === cls) return recv.info.fresh ? recv.text : `${recv.text}.clone()`;
		return `${recv.text}.to(${cls})`;
	}

	private as(recv: Out, cls: string): string {
		return recv.info.cls === cls ? recv.text : `${recv.text}.to(${cls})`;
	}

	statement(n: Node): string | null {
		this.line = n.loc?.start.line ?? 1;
		if (n.type === 'ExpressionStatement') {
			const e = n.expression as Node;
			if (e.type === 'AssignmentExpression' && (e.left as Node).type === 'Identifier') {
				const right = this.expr(e.right as Node);
				this.vars.set((e.left as Node).name as string, { ...right.info, fresh: false });
				return this.splice(n, [{ node: e.right as Node, text: right.text }]);
			}
			return this.splice(n, [{ node: e, text: this.expr(e).text }]);
		}
		if (n.type === 'LabeledStatement') {
			const label = (n.label as Node).name as string;
			const body = n.body as Node;
			if (body.type !== 'BlockStatement' || ['roles', 'light', 'dark'].includes(label)) return null;
			const prev = this.block;
			this.block = label;
			const parts = (body.body as Node[]).map((s) => ({
				node: s,
				text: this.statement(s) ?? this.slice(s)
			}));
			this.block = prev;
			return this.splice(n, parts);
		}
		return null;
	}

	expr(n: Node): Out {
		switch (n.type) {
			case 'Literal':
				return { text: this.slice(n), info: { scalar: typeof n.value === 'number' } };
			case 'Identifier': {
				const name = n.name as string;
				if (CLASS_NAMES.has(name) && !this.vars.has(name))
					return { text: name, info: { cls: name, view: true } };
				if (LEGACY_MODEL_IDS[name.toLowerCase()] && LEGACY_CONSTRUCTORS[name]) {
					const cls = clsOf(LEGACY_CONSTRUCTORS[name])!;
					this.change(`${name} → ${cls}`);
					return { text: cls, info: {} };
				}
				return { text: name, info: this.vars.get(name) ?? {} };
			}
			case 'CallExpression':
				return this.call(n);
			case 'MemberExpression':
				return this.member(n);
			case 'ConditionalExpression': {
				const t = this.expr(n.test as Node);
				const a = this.expr(n.consequent as Node);
				const b = this.expr(n.alternate as Node);
				const same = a.info.old === b.info.old && a.info.cls === b.info.cls;
				return {
					text: this.splice(n, [
						{ node: n.test as Node, text: t.text },
						{ node: n.consequent as Node, text: a.text },
						{ node: n.alternate as Node, text: b.text }
					]),
					info: same ? { old: a.info.old, cls: a.info.cls, scalar: a.info.scalar } : {}
				};
			}
			case 'BinaryExpression':
			case 'LogicalExpression': {
				const l = this.expr(n.left as Node);
				const r = this.expr(n.right as Node);
				return {
					text: this.splice(n, [
						{ node: n.left as Node, text: l.text },
						{ node: n.right as Node, text: r.text }
					]),
					info: { scalar: true }
				};
			}
			case 'UnaryExpression': {
				const a = this.expr(n.argument as Node);
				return {
					text: this.splice(n, [{ node: n.argument as Node, text: a.text }]),
					info: { scalar: true }
				};
			}
			case 'ArrayExpression': {
				const els = (n.elements as Node[]).map((e) => ({ node: e, text: this.expr(e).text }));
				return { text: this.splice(n, els), info: { array: true } };
			}
			case 'ObjectExpression': {
				const parts = (n.properties as Node[]).map((p) => {
					const v = p.value as Node;
					return { node: v, text: this.expr(v).text };
				});
				return { text: this.splice(n, parts), info: {} };
			}
			default:
				return { text: this.slice(n), info: {} };
		}
	}

	private args(n: Node): Out[] {
		return (n.arguments as Node[]).map((a) => this.expr(a));
	}

	private call(n: Node): Out {
		const callee = n.callee as Node;
		if (callee.type === 'Identifier') {
			const name = callee.name as string;
			const old = LEGACY_CONSTRUCTORS[name];
			if (old) return this.construct(n, name, old);
			const args = this.args(n);
			if (CLASS_NAMES.has(name)) {
				return { text: this.spliceArgs(n, name, args), info: { cls: name, fresh: true } };
			}
			const a = (i: number) => args[i]?.text;
			switch (name) {
				case 'hex':
					this.change('hex() → parse()');
					return { text: `parse(${a(0)})`, info: { old: 'srgb', cls: 'Srgb8', fresh: true } };
				case 'parse':
					return { text: this.spliceArgs(n, name, args), info: { fresh: true } };
				case 'mix': {
					this.change('mix(a, b) → a.mix(b)');
					const cls = clsOf(args[0].info.old) ?? args[0].info.cls;
					if (!cls) {
						this.leftover(
							'mix(): the first color has no known model; convert both with .to(Model)'
						);
						return { text: this.slice(n), info: {} };
					}
					return {
						text: `${this.own(args[0], cls)}.mix(${this.as(args[1], cls)}, ${a(2) ?? '0.5'})`,
						info: { old: args[0].info.old, cls, fresh: true }
					};
				}
				case 'contrast':
					this.change('contrast(a, b) → a.to(Srgb).contrast(b.to(Srgb))');
					return {
						text: `${this.as(args[0], 'Srgb')}.contrast(${this.as(args[1], 'Srgb')})`,
						info: { scalar: true }
					};
				case 'deltaE':
					this.change('deltaE(a, b) → ΔE2000 in Lab65 (what culori measured)');
					return {
						text: `${this.as(args[0], 'Lab65')}.deltaE2000(${this.as(args[1], 'Lab65')})`,
						info: { scalar: true }
					};
				case 'token':
					if (this.block !== 'tokens') {
						this.change('token() → tokens.token()');
						return { text: `tokens.token(${args.map((x) => x.text).join(', ')})`, info: {} };
					}
					break;
				case 'ensureContrast':
					return {
						text: this.splice(
							n,
							args.map((x, i) => ({ node: (n.arguments as Node[])[i], text: x.text }))
						),
						info: {}
					};
			}
			if (this.block === 'preview' && PREVIEW_MODEL_ARG[name] !== undefined)
				return this.preview(n, name, args);
			if (this.block === 'preview' && name === 'gradient') return this.preview(n, name, args);
			return { text: this.spliceArgs(n, callee.name as string, args), info: {} };
		}

		if (callee.type === 'MemberExpression' && !(callee.computed as boolean)) {
			const object = callee.object as Node;
			const method = (callee.property as Node).name as string;
			if (object.type === 'Identifier') {
				const ns = object.name as string;
				if (ns === 'scale') {
					this.change('scale.* → tokens.*');
					return {
						text: `tokens.${method}(${this.args(n)
							.map((x) => x.text)
							.join(', ')})`,
						info: {}
					};
				}
				if (
					ns === 'preview' &&
					(PREVIEW_MODEL_ARG[method] !== undefined || method === 'gradient')
				) {
					return this.preview(n, method, this.args(n), 'preview.');
				}
				if (['preview', 'tokens', 'component', 'theme'].includes(ns) && !this.vars.has(ns)) {
					return { text: this.spliceArgs(n, this.slice(callee), this.args(n)), info: {} };
				}
				const ctorOld = LEGACY_CONSTRUCTORS[ns];
				if (ctorOld && method === 'from') {
					const cls = clsOf(ctorOld);
					const args = this.args(n);
					if (!cls) return this.unmapped(n, `${ns}.from(): ${ctorOld} has no package model`);
					this.change(`${ns}.from(c) → c.to(${cls})`);
					return { text: `${args[0].text}.to(${cls})`, info: { old: ctorOld, cls, fresh: true } };
				}
			}
			const recv = this.expr(object);
			return this.method(n, recv, method, this.args(n));
		}
		return { text: this.spliceArgs(n, this.slice(callee), this.args(n)), info: {} };
	}

	private spliceArgs(n: Node, callee: string, args: Out[]): string {
		const nodes = n.arguments as Node[];
		return this.splice(n, [
			{ node: n.callee as Node, text: callee },
			...args.map((a, i) => ({ node: nodes[i], text: a.text }))
		]);
	}

	private unmapped(n: Node, message: string): Out {
		this.leftover(message);
		return { text: this.slice(n), info: {} };
	}

	private construct(n: Node, name: string, old: string): Out {
		const cls = clsOf(old);
		if (!cls) return this.unmapped(n, `${name}(): ${old} has no package model`);
		if (LEGACY_INCOMPATIBLE[old]) {
			this.leftover(`${name}(): ${LEGACY_INCOMPATIBLE[old]}`);
			return { text: this.slice(n), info: {} };
		}
		const nodes = n.arguments as Node[];
		const args = this.args(n);
		const channels = LEGACY_CHANNELS[old] ?? [];
		const changes = LEGACY_CHANNEL_CHANGES[old] ?? {};
		const byNew = new Map<string, string>();
		channels.forEach((ch, i) => {
			const c = changes[ch];
			const node = nodes[i];
			if (!node) return;
			let text = args[i].text;
			if (c && (c.scale !== undefined || c.offset !== undefined)) {
				const v = literalNumber(node);
				const s = c.scale ?? 1;
				const o = c.offset ?? 0;
				text =
					v !== undefined
						? String(round(v * s + o))
						: `${s !== 1 ? `(${text}) * ${s}` : text}${o ? ` ${o < 0 ? '-' : '+'} ${Math.abs(o)}` : ''}`;
				this.change(`${name}(): ${ch} rescaled to the package's units`);
			}
			byNew.set(c?.name ?? ch, text);
		});
		const order =
			old === 'ycocgr' ? ['y', 'cg', 'co'] : channels.map((ch) => changes[ch]?.name ?? ch);
		const values = order.map((ch) => byNew.get(ch) ?? '0');
		const extra = args.slice(channels.length).map((x) => x.text);
		if (cls !== name) this.change(`${name}() → ${cls}()`);
		return { text: `${cls}(${[...values, ...extra].join(', ')})`, info: { old, cls, fresh: true } };
	}

	private preview(n: Node, name: string, args: Out[], prefix = ''): Out {
		const nodes = n.arguments as Node[];
		const texts = args.map((a) => a.text);
		const modelArg = (i: number) => {
			const node = nodes[i];
			if (!node || node.type !== 'Literal' || typeof node.value !== 'string') return;
			const cls =
				LEGACY_MODEL_IDS[node.value] ?? LEGACY_MODEL_IDS[node.value === 'linear' ? 'lin' : ''];
			if (cls) {
				texts[i] = cls;
				this.change(`${prefix}${name}(): "${node.value}" → ${cls}`);
			}
		};
		if (name === 'gradient') {
			const opts = nodes[2];
			if (opts?.type === 'ObjectExpression') {
				for (const p of opts.properties as Node[]) {
					const key = (p.key as Node).name ?? (p.key as Node).value;
					const v = p.value as Node;
					if (key === 'space' && v.type === 'Literal' && typeof v.value === 'string') {
						const cls = LEGACY_MODEL_IDS[v.value === 'linear' ? 'lin' : v.value];
						if (cls) {
							texts[2] = this.splice(opts, [{ node: v, text: cls }]);
							this.change(`${prefix}gradient(): space "${v.value}" → ${cls}`);
						}
					}
				}
			} else modelArg(2);
		} else modelArg(PREVIEW_MODEL_ARG[name]);
		return {
			text: this.splice(n, [
				{ node: n.callee as Node, text: this.slice(n.callee as Node) },
				...texts.map((t, i) => ({ node: nodes[i], text: t }))
			]),
			info: {}
		};
	}

	private member(n: Node): Out {
		const object = n.object as Node;
		const recv = this.expr(object);
		if (n.computed as boolean) {
			const p = this.expr(n.property as Node);
			return {
				text: this.splice(n, [
					{ node: object, text: recv.text },
					{ node: n.property as Node, text: p.text }
				]),
				info: recv.info.array ? { old: recv.info.old, cls: recv.info.cls } : {}
			};
		}
		const prop = (n.property as Node).name as string;
		if (
			object.type === 'Identifier' &&
			['preview', 'tokens', 'component', 'theme'].includes(object.name as string)
		) {
			return { text: this.slice(n), info: {} };
		}
		if (prop === 'length' && recv.info.array)
			return { text: `${recv.text}.length`, info: { scalar: true } };

		const root = this.rootAccessor(recv, prop);
		if (root) return root;

		// A view (`c.oklch`): a conversion that keeps the old model's semantics for what follows.
		if (LEGACY_MODEL_IDS[prop] || LEGACY_UNBACKED.has(prop)) {
			const cls = LEGACY_MODEL_IDS[prop];
			if (!cls) return this.unmapped(n, `.${prop}: the package has no ${prop} model`);
			if (LEGACY_INCOMPATIBLE[prop]) this.leftover(`.${prop}: ${LEGACY_INCOMPATIBLE[prop]}`);
			this.change(`.${prop} view → .to(${cls})`);
			return { text: `${recv.text}.to(${cls})`, info: { old: prop, cls, view: true, fresh: true } };
		}

		// A receiver known only by its new class is new-DSL code; an unknown one is left alone too,
		// except for the flat keys that only the old DSL had (`ok_l`, `hsl_s`).
		const newCode = recv.info.old === undefined;
		const channel =
			newCode && (recv.info.cls || !prop.includes('_'))
				? undefined
				: this.channelOf(recv.info.old, prop);
		if (channel) return this.readChannel(recv, prop, channel[0], channel[1]);
		return { text: `${recv.text}.${prop}`, info: {} };
	}

	/** Old member dispatch: the colour's own model's channels first, then the flat index. */
	private channelOf(old: string | undefined, prop: string): [string, string] | undefined {
		if (old && (LEGACY_CHANNELS[old] ?? []).includes(prop)) return [old, prop];
		return LEGACY_FLAT_KEYS[prop];
	}

	private readChannel(recv: Out, prop: string, old: string, channel: string): Out {
		const cls = clsOf(old);
		if (!cls) return { text: `${recv.text}.${prop}`, info: {} };
		if (LEGACY_INCOMPATIBLE[old]) this.leftover(`.${prop}: ${LEGACY_INCOMPATIBLE[old]}`);
		const c = LEGACY_CHANNEL_CHANGES[old]?.[channel];
		let text = `${this.as(recv, cls)}.${c?.name ?? channel}`;
		if (c?.scale !== undefined || c?.offset !== undefined) {
			const s = c.scale ?? 1;
			const o = c.offset ?? 0;
			text = `(${o ? `${text} - ${o}` : text}${s !== 1 ? ` / ${s}` : ''})`.replace(/- -/, '+ ');
		}
		if (text !== `${recv.text}.${prop}`) this.change(`.${prop} → ${cls}.${c?.name ?? channel}`);
		return { text, info: { scalar: true } };
	}

	private rootAccessor(recv: Out, prop: string): Out | null {
		switch (prop) {
			case 'hex':
				this.change('.hex → .to(Srgb).gamutMap().to(Srgb8).toHex()');
				return { text: `${recv.text}.to(Srgb).gamutMap().to(Srgb8).toHex()`, info: {} };
			case 'inGamut':
			case 'isInGamut':
				this.change(`.${prop} → .to(Srgb).inGamut()`);
				return { text: `${recv.text}.to(Srgb).inGamut()`, info: { scalar: true } };
			case 'inP3':
				this.change('.inP3 → .to(DisplayP3).inGamut()');
				return { text: `${recv.text}.to(DisplayP3).inGamut()`, info: { scalar: true } };
			case 'gamutMapped':
				this.change('.gamutMapped → .to(Srgb).gamutMap().to(Oklch)');
				return {
					text: `${recv.text}.to(Srgb).gamutMap().to(Oklch)`,
					info: { old: 'oklch', cls: 'Oklch', fresh: true }
				};
			case 'luminance':
				if (!recv.info.old || !RGB_FAMILY.has(recv.info.old)) return null;
				this.change('.luminance → .to(Srgb).luminance()');
				return { text: `${this.as(recv, 'Srgb')}.luminance()`, info: { scalar: true } };
			case 'totalInk':
				if (recv.info.old !== 'cmyk') return null;
				this.change('.totalInk → totalInk() × 100 (the package uses fractions)');
				return { text: `(${this.as(recv, 'Cmyk')}.totalInk() * 100)`, info: { scalar: true } };
			case 'cct':
				if (recv.info.old !== 'ucs60') return null;
				this.change('.cct → .to(Xyy).cct()');
				return { text: `${recv.text}.to(Xyy).cct()`, info: { scalar: true } };
			case 'isWarm':
				if (recv.info.old !== 'ucs60') return null;
				this.change('.isWarm → .to(Xyy).cct() < 5000');
				return { text: `(${recv.text}.to(Xyy).cct() < 5000)`, info: { scalar: true } };
		}
		return null;
	}

	private method(n: Node, recv: Out, name: string, args: Out[]): Out {
		const old = recv.info.old;
		const nodes = n.arguments as Node[];
		const a = (i: number) => args[i]?.text;
		const color = (cls: string, text: string, oldModel = old): Out => ({
			text,
			info: { old: oldModel, cls, fresh: true }
		});
		const scalar = (text: string): Out => ({ text, info: { scalar: true } });
		const hueWheel =
			old && HUE_WHEEL_MODELS.has(old) ? 'Hsl' : old === 'oklch' ? 'Oklch' : clsOf(old);
		const hueOld = old && HUE_WHEEL_MODELS.has(old) ? 'hsl' : old;

		if (name === 'to' && args[0]?.info.cls && !args[0].info.old) {
			return {
				text: this.spliceArgs(n, `${recv.text}.to`, args),
				info: { cls: args[0].info.cls, fresh: true }
			};
		}
		if (name === 'to') {
			const node = (n.arguments as Node[])[0];
			const id = node?.type === 'Literal' ? (node.value as string) : undefined;
			const cls = id ? LEGACY_MODEL_IDS[id] : args[0]?.info.view ? args[0].info.cls : undefined;
			if (!cls) return this.unmapped(n, `.to(${a(0)}): no package model`);
			this.change(`.to(${a(0)}) → .to(${cls})`);
			return color(cls, `${recv.text}.to(${cls})`, id ?? args[0]?.info.old);
		}
		if (!old) {
			if (!PACKAGE_MEMBERS.has(name)) return this.unmapped(n, `.${name}(): no package equivalent`);
			const keeps = [
				'clone',
				'lighten',
				'darken',
				'saturate',
				'desaturate',
				'rotateHue',
				'complement',
				'set',
				'shift',
				'mix',
				'gamutMap',
				'clamp',
				'tint',
				'shade',
				'tone',
				'filter',
				'over',
				'limitInk'
			];
			return {
				text: this.spliceArgs(n, `${recv.text}.${name}`, args),
				info: keeps.includes(name) && recv.info.cls ? { cls: recv.info.cls, fresh: true } : {}
			};
		}

		switch (name) {
			case 'lighten':
			case 'darken':
				if (old !== 'oklch') break;
				return color('Oklch', `${this.own(recv, 'Oklch')}.${name}(${a(0)})`);
			case 'saturate':
			case 'desaturate':
				if (old === 'oklch') {
					this.change(`.${name}(x) → .shift({ c: ±x }) (raw chroma, as before)`);
					return color(
						'Oklch',
						`${this.own(recv, 'Oklch')}.shift({ c: ${name === 'saturate' ? '' : '-'}${a(0)} })`
					);
				}
				if (old === 'hsluv' && name === 'saturate') {
					this.change('.saturate(x) → .shift({ s: x / 100 })');
					return color(
						'Hsluv',
						`${this.own(recv, 'Hsluv')}.shift({ s: ${hundredth(nodes[0], a(0))} })`
					);
				}
				break;
			case 'rotate':
				if (old !== 'oklch') break;
				this.change('.rotate() → .rotateHue()');
				return color('Oklch', `${this.own(recv, 'Oklch')}.rotateHue(${a(0)})`);
			case 'rotateHue':
				if (!hueWheel) break;
				return color(
					hueWheel,
					HAS_ROTATE.has(hueWheel)
						? `${this.own(recv, hueWheel)}.rotateHue(${a(0)})`
						: `${this.own(recv, hueWheel)}.shift({ h: ${a(0)} })`,
					hueOld
				);
			case 'complement':
			case 'complementary':
				if (!hueWheel) break;
				if (name === 'complementary') this.change('.complementary() → .complement()');
				return color(
					hueWheel,
					HAS_ROTATE.has(hueWheel)
						? `${this.own(recv, hueWheel)}.complement()`
						: `${this.own(recv, hueWheel)}.shift({ h: 180 })`,
					hueOld
				);
			case 'triadic':
			case 'analogous':
				if (!hueWheel) break;
				return {
					text: `${this.as(recv, hueWheel)}.${name}(${args.map((x) => x.text).join(', ')})`,
					info: { array: true, old: hueOld, cls: hueWheel }
				};
			case 'shift':
				if (old !== 'oklch') break;
				return color('Oklch', `${this.own(recv, 'Oklch')}.shift(${a(0)})`);
			case 'derive':
				if (old !== 'oklch') break;
				this.change('.derive() → .set()');
				return color('Oklch', `${this.own(recv, 'Oklch')}.set(${a(0)})`);
			case 'atLightness':
			case 'atChroma': {
				if (old !== 'oklch') break;
				const key = name === 'atLightness' ? 'l' : 'c';
				this.change(`.${name}(x) → .set({ ${key}: x })`);
				return color('Oklch', `${this.own(recv, 'Oklch')}.set({ ${key}: ${a(0)} })`);
			}
			case 'gamutMap': {
				if (old !== 'oklch') break;
				const node = (n.arguments as Node[])[0];
				const dest = node?.type === 'Literal' && node.value === 'p3' ? 'DisplayP3' : 'Srgb';
				this.change(`.gamutMap() → .to(${dest}).gamutMap().to(Oklch)`);
				return color('Oklch', `${recv.text}.to(${dest}).gamutMap().to(Oklch)`);
			}
			case 'maxChroma': {
				if (old !== 'oklch') break;
				const node = (n.arguments as Node[])[0];
				if (node && !(node.type === 'Literal' && node.value === 'rgb')) {
					return this.unmapped(
						n,
						'.maxChroma(space): only the sRGB ceiling has a package expression'
					);
				}
				// Okhsl s = 1 is the sRGB edge at the same lightness and hue; the probe chroma keeps the hue.
				this.change('.maxChroma() → the sRGB ceiling via Okhsl s = 1');
				return scalar(`${recv.text}.to(Oklch).set({ c: 0.5 }).to(Okhsl).set({ s: 1 }).to(Oklch).c`);
			}
			case 'mix': {
				const cls = clsOf(old);
				if (!cls || !['oklch', 'oklab', 'ryb'].includes(old)) break;
				return color(cls, `${this.own(recv, cls)}.mix(${this.as(args[0], cls)}, ${a(1) ?? '0.5'})`);
			}
			case 'blend':
				if (old !== 'lin') break;
				this.change('.blend() → .mix() in LinearSrgb');
				return color(
					'LinearSrgb',
					`${this.own(recv, 'LinearSrgb')}.mix(${this.as(args[0], 'LinearSrgb')}, ${a(1) ?? '0.5'})`
				);
			case 'blendUniform':
				if (old !== 'ucs') break;
				this.change('.blendUniform() → .mix() in Uvy76');
				return color(
					'Uvy76',
					`${this.own(recv, 'Uvy76')}.mix(${this.as(args[0], 'Uvy76')}, ${a(1) ?? '0.5'})`
				);
			case 'tint':
			case 'shade':
			case 'tone':
				if (old !== 'hsl') break;
				return color('Hsl', `${this.own(recv, 'Hsl')}.${name}(${a(0)})`);
			case 'addWhite':
			case 'addBlack': {
				if (old !== 'hwb') break;
				const key = name === 'addWhite' ? 'w' : 'b';
				this.change(`.${name}(x) → .shift({ ${key}: x })`);
				return color('Hwb', `${this.own(recv, 'Hwb')}.shift({ ${key}: ${a(0)} })`);
			}
			case 'pureHue':
				if (old !== 'hwb') break;
				this.change('.pureHue() → .set({ w: 0, b: 0 })');
				return color('Hwb', `${this.own(recv, 'Hwb')}.set({ w: 0, b: 0 })`);
			case 'atTone':
			case 'withChroma': {
				if (old !== 'hct') break;
				const key = name === 'atTone' ? 't' : 'c';
				this.change(`.${name}(x) → .set({ ${key}: x })`);
				return color('Hct', `${this.own(recv, 'Hct')}.set({ ${key}: ${a(0)} })`);
			}
			case 'tonalPalette':
				if (old !== 'hct') break;
				this.change('.tonalPalette() → .tones([…])');
				return {
					text: `${this.as(recv, 'Hct')}.tones(${a(0) ?? `[${OLD_HCT_TONES.join(', ')}]`})`,
					info: { array: true, old: 'hct', cls: 'Hct' }
				};
			case 'materialRoles':
				if (old !== 'hct') break;
				this.change('.materialRoles() → .tones([40, 90, 10, 100])');
				return {
					text: `${this.as(recv, 'Hct')}.tones([40, 90, 10, 100])`,
					info: { array: true, old: 'hct', cls: 'Hct' }
				};
			case 'withLightness':
				if (old !== 'hsluv') break;
				this.change('.withLightness(x) → .set({ l: x / 100 })');
				return color(
					'Hsluv',
					`${this.own(recv, 'Hsluv')}.set({ l: ${hundredth(nodes[0], a(0))} })`
				);
			case 'setKey':
				if (old !== 'cmyk') break;
				return color('Cmyk', `${this.own(recv, 'Cmyk')}.set({ k: ${a(0)} })`);
			case 'limitInk':
				if (old !== 'cmyk') break;
				this.change('.limitInk(percent) → .limitInk(fraction)');
				return color('Cmyk', `${this.own(recv, 'Cmyk')}.limitInk(${hundredth(nodes[0], a(0))})`);
			case 'setLuminance':
				if (old !== 'xyy') break;
				return color('Xyy', `${this.own(recv, 'Xyy')}.set({ Y: ${a(0)} })`);
			case 'contrastWCAG':
				this.change('.contrastWCAG() → .to(Srgb).contrast()');
				return scalar(`${this.as(recv, 'Srgb')}.contrast(${this.as(args[0], 'Srgb')})`);
			case 'meetsAA':
			case 'meetsAAA': {
				const large = a(1);
				const [normal, big] = name === 'meetsAA' ? [4.5, 3] : [7, 4.5];
				const min = large === undefined ? String(normal) : `(${large} ? ${big} : ${normal})`;
				this.change(`.${name}() → contrast ≥ ${normal}`);
				return scalar(`(${this.as(recv, 'Srgb')}.contrast(${this.as(args[0], 'Srgb')}) >= ${min})`);
			}
			case 'luminance':
				return scalar(`${this.as(recv, 'Srgb')}.luminance()`);
			case 'simulateCVD': {
				const node = (n.arguments as Node[])[0];
				const kind =
					node?.type === 'Literal' && typeof node.value === 'string'
						? CVD_KINDS[node.value.toLowerCase()]
						: undefined;
				if (!kind)
					return this.unmapped(
						n,
						'.simulateCVD(): the deficiency must be a literal such as "deuteranopia"'
					);
				this.change(`.simulateCVD("${String(node.value)}") → simulateCvd(…, "${kind}")`);
				const severity = a(1) === undefined ? '' : `, ${a(1)}`;
				return color(
					'Srgb',
					`simulateCvd(${this.own(recv, 'Srgb')}, "${kind}"${severity})`,
					'srgb'
				);
			}
			case 'grayscale':
				this.change('.grayscale() → .to(Srgb).filter("grayscale", 1)');
				return color('Srgb', `${recv.text}.to(Srgb).filter("grayscale", 1)`, 'srgb');
			case 'deltaE76':
			case 'deltaE2000':
			case 'deltaE94':
			case 'deltaECMC': {
				const m = name === 'deltaECMC' ? 'deltaECmc' : name;
				const opts = name === 'deltaECMC' ? ', { l: 1, c: 1 }' : '';
				this.change(`.${name}() → ${m} in Lab65 (what culori measured)`);
				return scalar(`${this.as(recv, 'Lab65')}.${m}(${this.as(args[0], 'Lab65')}${opts})`);
			}
			case 'isPerceptiblyDifferent':
				return scalar(
					`(${this.as(recv, 'Lab65')}.deltaE2000(${this.as(args[0], 'Lab65')}) > ${a(1) ?? '2.3'})`
				);
			case 'deltaEok':
				return scalar(`${this.as(recv, 'Oklab')}.deltaEOk(${this.as(args[0], 'Oklab')})`);
			case 'deltaEz':
				return scalar(`${this.as(recv, 'Jzczhz')}.deltaEz(${this.as(args[0], 'Jzczhz')})`);
			case 'deltaEuv':
				return scalar(`${this.as(recv, 'Luv50')}.deltaEuv(${this.as(args[0], 'Luv50')})`);
			case 'deltaE':
				if (old !== 'cam16ucs') break;
				return scalar(`${this.as(recv, 'Cam16Ucs')}.deltaE(${this.as(args[0], 'Cam16Ucs')})`);
			case 'deltaE99':
				return scalar(`${this.as(recv, 'Din99o')}.deltaE(${this.as(args[0], 'Din99o')})`);
		}
		return this.unmapped(n, `.${name}() on ${old}: no package equivalent`);
	}
}

/** True when `source` uses names only the old DSL had. */
export function isLegacySource(source: string): boolean {
	const m = migrate(source);
	return !m.unchanged;
}

export function migrate(source: string): Migration {
	const desugared = source.replace(
		BLOCK_SUGAR,
		(_m, nl, indent, kw, rest) => `${nl}${indent}${kw}:${rest}`
	);
	let program: acorn.Program;
	try {
		program = acorn.parse(desugared, { ecmaVersion: 2020, sourceType: 'module', locations: true });
	} catch {
		return { source, unchanged: true, changes: [], leftovers: [] };
	}
	// Desugaring is length-preserving, so the parse's offsets index the original text too.
	const m = new Migrator(source);
	const edits: { start: number; end: number; text: string }[] = [];
	for (const stmt of program.body as unknown as Node[]) {
		const text = m.statement(stmt);
		if (text !== null && text !== source.slice(stmt.start, stmt.end)) {
			edits.push({ start: stmt.start, end: stmt.end, text });
		}
	}
	let out = source;
	for (const e of edits.reverse()) out = out.slice(0, e.start) + e.text + out.slice(e.end);
	const lines = out.split('\n');
	const before = source.split('\n');
	// A rewrite inside a flagged call is discarded with it; don't report it.
	const changes = m.changes.filter((c) => lines[c.line - 1] !== before[c.line - 1]);
	for (const l of m.leftovers) {
		const note = `// migrate: ${l.message}`;
		if (!lines[l.line - 1].includes(note)) lines[l.line - 1] = `${lines[l.line - 1]} ${note}`;
	}
	const result = lines.join('\n');
	return {
		source: result,
		unchanged: result === source,
		changes,
		leftovers: m.leftovers
	};
}
