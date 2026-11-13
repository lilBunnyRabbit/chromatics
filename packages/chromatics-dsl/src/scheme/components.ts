/**
 * Component specs — the third layer of the design system (colors → tokens → components). A spec is a tagged
 * plain object authored via `component.*`; like tokens and previews it rides `scheme.nonColorVars`. Every
 * color/size field is a Ref string the host resolves late (a role, a color name, a token or a CSS literal).
 */
import type { Scheme } from "./types.js";

/** A late-resolved reference: `"primary"`, `"brand"`, `"space.4"`, `"16px"`, with an optional `/30` or `/muted` alpha. */
export type Ref = string;

/** One button look: background, label and optional border refs. */
export interface ButtonVariant {
  name: string;
  bg: Ref;
  fg: Ref;
  border?: Ref;
}
/** One button size: padding, text and optional radius / weight token refs. */
export interface ButtonSize {
  name: string;
  padY: Ref;
  padX: Ref;
  text: Ref;
  radius?: Ref;
  weight?: Ref;
}
/** `component.button({ variants, sizes, states })`. Sizes default to one `md`, states to `default`. */
export interface ButtonSpec {
  __component: "button";
  variants: ButtonVariant[];
  sizes: ButtonSize[];
  states: string[];
}

/** `component.card({…})`. Background defaults to `surface`, text to `surface-fg`, radius `radius.lg`, padding `space.6`. */
export interface CardSpec {
  __component: "card";
  bg: Ref;
  fg: Ref;
  border?: Ref;
  radius: Ref;
  pad: Ref;
  shadow?: Ref;
  title?: string;
}

/** One row of a type specimen. */
export interface TypeStep {
  text: Ref;
  weight?: Ref;
  leading?: Ref;
  sample?: string;
}
/** `component.type([{ text, weight, sample }])`. */
export interface TypeSpec {
  __component: "type";
  steps: TypeStep[];
}

/** Any component spec, tagged by `__component`. */
export type ComponentSpec = ButtonSpec | CardSpec | TypeSpec;
/** A component spec and the variable that holds it. */
export interface NamedComponent {
  name: string;
  spec: ComponentSpec;
}

const KINDS = new Set(["button", "card", "type"]);

/** `true` for a `component.*` spec. */
export function isComponent(v: unknown): v is ComponentSpec {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    KINDS.has((v as Record<string, unknown>).__component as string)
  );
}

/** Every component spec a program defines, in definition order. */
export function componentsFromScheme(scheme: Scheme): NamedComponent[] {
  return scheme.nonColorVars
    .filter((v) => isComponent(v.value))
    .map((v) => ({ name: v.name, spec: v.value as unknown as ComponentSpec }));
}
