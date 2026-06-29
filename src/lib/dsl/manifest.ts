/**
 * The token manifest — ONE source derived from the model registry, consumed
 * four ways: the evaluator environment (constructors/builtins), the CodeMirror
 * highlighter (token sets), autocomplete (context-aware members), and the docs.
 * This is what kills the "three-places drift".
 */
import { allModels, CHANNELS } from '../models/index.js';
import type { ModelDef, MethodDef, ParamDef, ChannelDef, ModelStatus } from '../models/index.js';
import { PREVIEW_SIGNATURES } from './preview.js';
import { SCALE_SIGNATURES, TOKEN_DOC } from './tokens.js';
import { COMPONENT_SIGNATURES } from './components.js';
import { THEME_DOC } from './theme.js';

export interface ConstructorInfo {
	name: string;
	params: ParamDef[];
	doc: string;
	model: string;
}

export interface MemberInfo {
	name: string;
	kind: 'method' | 'accessor' | 'channel' | 'view';
	detail: string; // signature or return type
	doc: string;
	model: string;
	backed: boolean;
	status: ModelStatus;
}

export interface TokenManifest {
	constructors: ConstructorInfo[];
	builtins: string[];
	// highlighter token sets
	constructorNames: Set<string>;
	builtinNames: Set<string>;
	methodNames: Set<string>; // callable members across all views + root
	propertyNames: Set<string>; // channel keys + localKeys + view names + accessors
	// completion
	valueMembers: MemberInfo[]; // members on a bare value
	viewMembers: Map<string, MemberInfo[]>; // model id -> its members
	members: Map<string, MemberInfo>; // flat name -> info (for hover lookup)
	models: ModelDef[];
}

/** One-line docs for the free builtin functions (used by hover + autocomplete). */
export const BUILTIN_DOCS: Record<string, string> = {
	mix: 'mix(a, b, ratio?) → color — perceptual blend in OKLCH',
	contrast: 'contrast(a, b) → number — WCAG contrast ratio (1–21)',
	deltaE: 'deltaE(a, b) → number — CIEDE2000 perceptual difference',
	clamp: 'clamp(value, min, max) → number',
	abs: 'abs(n) → number',
	min: 'min(…nums) → number',
	max: 'max(…nums) → number',
	round: 'round(n) → number',
	floor: 'floor(n) → number',
	ceil: 'ceil(n) → number',
	preview: 'preview.* — values that render as cards in the Inspector',
	scale: 'scale.* — non-color token generators (text, space, radius, shadow)',
	token: TOKEN_DOC,
	component: 'component.* — component specs that render in the Styleguide tab',
	theme: THEME_DOC
};

const BUILTINS = [
	'mix',
	'contrast',
	'deltaE',
	'clamp',
	'abs',
	'min',
	'max',
	'round',
	'floor',
	'ceil',
	'preview',
	'scale',
	'token',
	'component',
	'theme'
];

function sig(params: ParamDef[]): string {
	return '(' + params.map((p) => p.name + (p.optional ? '?' : '')).join(', ') + ')';
}

function memberInfo(def: MethodDef, m: ModelDef): MemberInfo {
	return {
		name: def.name,
		kind: def.kind,
		detail: def.kind === 'method' ? `${sig(def.params)} → ${def.returns}` : def.returns,
		doc: def.doc,
		model: m.id,
		backed: m.backed,
		status: m.status
	};
}

export function buildManifest(
	models: ModelDef[],
	channels: Map<string, ChannelDef & { modelId: string; mode: string }>
): TokenManifest {
	const constructors: ConstructorInfo[] = [];
	const methodNames = new Set<string>();
	const propertyNames = new Set<string>();
	const valueMembers: MemberInfo[] = [];
	const viewMembers = new Map<string, MemberInfo[]>();
	const root = models.find((m) => m.id === 'root');

	for (const m of models) {
		if (m.ctor) {
			constructors.push({
				name: m.ctor.name,
				params: m.ctor.params,
				doc: `Construct a color in ${m.label}`,
				model: m.id
			});
		}
		if (m.id === 'root') continue;

		// the view name is itself a member of a bare value
		propertyNames.add(m.id);
		valueMembers.push({
			name: m.id,
			kind: 'view',
			detail: `${m.label} view`,
			doc: `Think/act in ${m.label}`,
			model: m.id,
			backed: m.backed,
			status: m.status
		});

		const members: MemberInfo[] = [];
		for (const ch of m.channels) {
			propertyNames.add(ch.localKey);
			members.push({
				name: ch.localKey,
				kind: 'channel',
				detail: 'number',
				doc: ch.label,
				model: m.id,
				backed: m.backed,
				status: m.status
			});
		}
		for (const def of m.methods.values()) {
			members.push(memberInfo(def, m));
			if (def.kind === 'method') methodNames.add(def.name);
			else propertyNames.add(def.name);
		}
		viewMembers.set(m.id, members);
	}

	// preview.* namespace members — autocomplete after `preview.`
	const previewMembers: MemberInfo[] = Object.entries(PREVIEW_SIGNATURES).map(([name, s]) => {
		methodNames.add(name);
		return {
			name,
			kind: 'method' as const,
			detail: `${s.sig} → preview`,
			doc: s.doc,
			model: 'preview',
			backed: true,
			status: 'stable' as const
		};
	});
	viewMembers.set('preview', previewMembers);

	// design-system namespaces — autocomplete after `scale.` and `component.`
	const registerNamespace = (id: string, sigs: Record<string, { sig: string; doc: string }>) => {
		const members: MemberInfo[] = Object.entries(sigs).map(([name, s]) => {
			methodNames.add(name);
			return {
				name,
				kind: 'method' as const,
				detail: `${s.sig} → ${id}`,
				doc: s.doc,
				model: id,
				backed: true,
				status: 'stable' as const
			};
		});
		viewMembers.set(id, members);
	};
	registerNamespace('scale', SCALE_SIGNATURES);
	registerNamespace('component', COMPONENT_SIGNATURES);

	// flat channel accessors on a bare value (ok_l, hwb_w, lab_a, lr…)
	for (const [key, ch] of channels) {
		propertyNames.add(key);
		valueMembers.push({
			name: key,
			kind: 'channel',
			detail: 'number',
			doc: `${ch.label} (${ch.modelId})`,
			model: ch.modelId,
			backed: true,
			status: 'stable'
		});
	}

	// root flat-shortcuts on a bare value (lighten, rotate, hex accessor…)
	if (root) {
		for (const def of root.methods.values()) {
			valueMembers.push(memberInfo(def, root));
			if (def.kind === 'method') methodNames.add(def.name);
			else propertyNames.add(def.name);
		}
	}

	// hex is a free constructor, not a model ctor
	constructors.push({
		name: 'hex',
		params: [{ name: 'css', kind: 'string' }],
		doc: 'Parse a CSS / hex color string',
		model: 'srgb'
	});

	// flat name -> info, for hover lookup (value members first, then view methods)
	const members = new Map<string, MemberInfo>();
	for (const vm of valueMembers) if (!members.has(vm.name)) members.set(vm.name, vm);
	for (const list of viewMembers.values()) {
		for (const m of list) {
			if ((m.kind === 'method' || m.kind === 'accessor') && !members.has(m.name)) {
				members.set(m.name, m);
			}
		}
	}

	return {
		constructors,
		builtins: BUILTINS,
		constructorNames: new Set(constructors.map((c) => c.name).filter((n) => n !== 'hex')),
		builtinNames: new Set([...BUILTINS, 'hex']),
		methodNames,
		propertyNames,
		valueMembers,
		viewMembers,
		members,
		models
	};
}

export const manifest = buildManifest(allModels(), CHANNELS);
