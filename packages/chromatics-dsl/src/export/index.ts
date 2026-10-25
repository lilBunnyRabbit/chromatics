/** Scheme → string exporters. All pure. */
import { Oklch, Srgb, Srgb8, type Color } from "@lilbunnyrabbit/chromatics";
import type { ModeColors } from "../scheme/derive.js";
import type { Scheme, SchemeEntry } from "../scheme/types.js";
import { MODEL_CLASSES } from "../values.js";
import { kebab } from "../kebab.js";

export { kebab } from "../kebab.js";
export { toSwatchSVG, type SwatchOptions } from "./swatch.js";

function fmtOklch(e: SchemeEntry): string {
  const f = (v: number, d: number) => {
    const s = v.toFixed(d);
    return s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s;
  };
  const { l, c, h } = e.color.to(Oklch);
  return `oklch(${f(l, 5)} ${f(c, 5)} ${f(h, 5)})`;
}

/**
 * How a color is written into an export:
 *  - `as-defined`: each color in the model it was authored in when that's valid CSS, else in `model`;
 *  - `single`: every color in `model`.
 */
export type ColorFormatMode = "as-defined" | "single";

/** `model` is `"hex"` or a model's export name (`"Oklch"`); a name that isn't a CSS model falls back to hex. */
export interface ColorFormat {
  mode: ColorFormatMode;
  model: string;
}

/** As defined, hex for colors CSS can't write. */
export const DEFAULT_COLOR_FORMAT: ColorFormat = { mode: "as-defined", model: "hex" };

const MODEL_BY_NAME = new Map(MODEL_CLASSES);

// CSS Color 4 predefined-RGB and XYZ spaces accepted inside color(); anything else won't render.
const CSS_PREDEFINED = new Set([
  "srgb",
  "srgb-linear",
  "display-p3",
  "a98-rgb",
  "prophoto-rgb",
  "rec2020",
  "xyz",
  "xyz-d50",
  "xyz-d65",
]);
const CSS_FUNCS = /^(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch)\(/i;

/** Whether a serialized color string actually renders as CSS. */
export function isCssColor(css: string): boolean {
  if (!css) return false;
  if (css[0] === "#") return true;
  if (CSS_FUNCS.test(css)) return true;
  const m = /^color\(\s*([a-z0-9-]+)/i.exec(css);
  return m?.[1] ? CSS_PREDEFINED.has(m[1].toLowerCase()) : false;
}

function cssOf(color: Color): string | null {
  const css = (color as Color & { toCss?: () => string }).toCss?.();
  return css && isCssColor(css) ? css : null;
}

const hex = (color: Color) => color.to(Srgb).gamutMap().to(Srgb8).toHex();

function formatIn(color: Color, model: string): string | null {
  if (model === "hex") return hex(color);
  const m = MODEL_BY_NAME.get(model);
  return m ? cssOf(color.to(m)) : null;
}

/** One color as CSS per `fmt`; always valid CSS (hex, gamut-mapped, when nothing else is). */
export function serializeColor(color: Color, fmt: ColorFormat = DEFAULT_COLOR_FORMAT): string {
  if (fmt.mode === "single") return formatIn(color, fmt.model) ?? hex(color);
  return cssOf(color) ?? formatIn(color, fmt.model) ?? hex(color);
}

const rootBlock = (lines: string[]) => (lines.length ? `:root {\n${lines.join("\n")}\n}` : ":root {\n}");

/**
 * `:root { --role: <color>; }` for one mode's roles: exactly the roles that have a color, in the order given,
 * named in kebab case (`background_dark` → `--background-dark`).
 *
 * @example
 * ```ts
 * toCssVars(deriveScheme(source, { roles, pairs: [] }).modes.dark, { mode: 'single', model: 'Oklch' });
 * ```
 */
export function toCssVars(mode: ModeColors, fmt: ColorFormat = DEFAULT_COLOR_FORMAT): string {
  return rootBlock(
    Object.entries(mode).flatMap(([role, color]) =>
      color ? [`  --${kebab(role)}: ${serializeColor(color, fmt)};`] : []
    )
  );
}

/** `:root { --name: <color>; }` for every color variable of the program, intermediates included. */
export function toPaletteVars(scheme: Scheme, fmt: ColorFormat = DEFAULT_COLOR_FORMAT): string {
  return rootBlock(scheme.entries.map((e) => `  --${kebab(e.name)}: ${serializeColor(e.color, fmt)};`));
}

/** W3C Design Tokens (DTCG) JSON, one `color` token per color variable, with hex, OKLCH and the source. */
export function toTokens(scheme: Scheme, fmt: ColorFormat = DEFAULT_COLOR_FORMAT): string {
  const obj: Record<string, unknown> = {};
  for (const e of scheme.entries) {
    obj[e.name] = {
      $type: "color",
      $value: serializeColor(e.color, fmt),
      $extensions: {
        "com.chromatics": {
          hex: hex(e.color),
          oklch: fmtOklch(e),
          model: e.color.model,
          ...(e.description ? { source: e.description } : {}),
        },
      },
    };
  }
  return JSON.stringify(obj, null, 2);
}

/** A Tailwind v4 `@theme` block plus a legacy `tailwind.config.js` colors object. */
export function toTailwind(scheme: Scheme, fmt: ColorFormat = DEFAULT_COLOR_FORMAT): string {
  const theme = scheme.entries.map((e) => `  --color-${kebab(e.name)}: ${serializeColor(e.color, fmt)};`).join("\n");
  const colors = scheme.entries.map((e) => `        '${kebab(e.name)}': '${serializeColor(e.color, fmt)}',`).join("\n");
  return `@theme {\n${theme}\n}\n\n/* legacy tailwind.config.js */\nexport default {\n  theme: {\n    extend: {\n      colors: {\n${colors}\n      }\n    }\n  }\n};`;
}

/** An aligned Markdown table: name | value | oklch | comment (the source). */
export function toMarkdown(scheme: Scheme, fmt: ColorFormat = DEFAULT_COLOR_FORMAT): string {
  if (!scheme.entries.length) return "";
  const rows = scheme.entries.map((e) => ({
    name: e.name,
    value: serializeColor(e.color, fmt),
    oklch: fmtOklch(e),
    comment: e.description ?? "",
  }));
  const w = {
    name: Math.max(4, ...rows.map((r) => r.name.length)),
    value: Math.max(5, ...rows.map((r) => r.value.length)),
    oklch: Math.max(5, ...rows.map((r) => r.oklch.length)),
    comment: Math.max(7, ...rows.map((r) => r.comment.length)),
  };
  const pad = (s: string, n: number) => s + " ".repeat(n - s.length);
  const sep = `| ${"-".repeat(w.name)} | ${"-".repeat(w.value)} | ${"-".repeat(w.oklch)} | ${"-".repeat(w.comment)} |`;
  const header = `| ${pad("name", w.name)} | ${pad("value", w.value)} | ${pad("oklch", w.oklch)} | ${pad("comment", w.comment)} |`;
  const body = rows.map(
    (r) =>
      `| ${pad(r.name, w.name)} | ${pad(r.value, w.value)} | ${pad(r.oklch, w.oklch)} | ${pad(r.comment, w.comment)} |`
  );
  return [header, sep, ...body].join("\n");
}
