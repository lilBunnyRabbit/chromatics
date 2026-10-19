import type { Channel, Channels } from "./model.js";

/** Options for `toCss()`. */
export interface CssOptions {
  /**
   * Significant digits relative to each channel's reference range. Default 5: Oklch `l` gets 5
   * decimals, hue 2, Lab `L` 3 (precedent: colorjs.io's default precision).
   */
  readonly precision?: number;
}

export type Component =
  | { readonly kind: "number"; readonly value: number }
  | { readonly kind: "percent"; readonly value: number }
  | { readonly kind: "angle"; readonly value: number }
  | { readonly kind: "none" };

export interface CssFunction {
  readonly name: string;
  readonly args: readonly Component[];
  readonly alpha: Component | undefined;
  readonly legacy: boolean;
}

// CSS Syntax 3, "consume a number": digits with an optional fraction that needs a digit after
// the point, then an optional exponent.
const NUMBER = /^([+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?)(%|deg|grad|rad|turn)?$/i;
const FUNCTION = /^([a-z][a-z0-9-]*)\(\s*(.*?)\s*\)$/is;

export function invalid(input: string, why?: string): SyntaxError {
  return new SyntaxError(`Invalid color "${input}"${why ? `: ${why}` : ""}`);
}

/**
 * Moves the decimal point of a numeric string by `by` places without arithmetic, so
 * `Number(shift(String(x), 2))` is exactly `x * 100` as a decimal, and shifting back recovers `x`
 * bit for bit (`x * 100 / 100 !== x` for ~15% of doubles).
 */
export function shiftDecimal(text: string, by: number): string {
  const match = /^([+-]?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i.exec(text);
  if (!match) throw new TypeError(`not a decimal: ${text}`);
  const [, sign = "", int = "", frac = "", exp = "0"] = match;
  let digits = int + frac;
  let point = int.length + Number(exp) + by;
  const lead = digits.length - digits.replace(/^0+/, "").length;
  digits = digits.slice(lead);
  point -= lead;
  digits = digits.replace(/0+$/, "");
  if (digits === "") return "0";
  const neg = sign === "-" ? "-" : "";
  if (point > 21 || point < -6) {
    const rest = digits.slice(1);
    return `${neg}${digits[0]}${rest ? `.${rest}` : ""}e${point - 1}`;
  }
  if (point <= 0) return `${neg}0.${"0".repeat(-point)}${digits}`;
  if (point >= digits.length) return `${neg}${digits}${"0".repeat(point - digits.length)}`;
  return `${neg}${digits.slice(0, point)}.${digits.slice(point)}`;
}

function component(text: string, input: string): Component {
  if (text.toLowerCase() === "none") return { kind: "none" };
  const match = NUMBER.exec(text);
  if (!match) throw invalid(input, `unexpected "${text}"`);
  const [, number = "", unit = ""] = match;
  switch (unit.toLowerCase()) {
    case "":
      return { kind: "number", value: Number(number) };
    case "%":
      return { kind: "percent", value: Number(shiftDecimal(number, -2)) };
    case "deg":
      return { kind: "angle", value: Number(number) };
    // CSS Values 4, <angle> units: 400grad, 2π rad and 1turn are each a full circle.
    case "grad":
      return { kind: "angle", value: (Number(number) * 360) / 400 };
    case "rad":
      return { kind: "angle", value: (Number(number) * 180) / Math.PI };
    default:
      return { kind: "angle", value: Number(number) * 360 };
  }
}

/**
 * Splits `name(a b c / alpha)` or the legacy `name(a, b, c, alpha)` into components. `name` comes back
 * lowercased; `color()`'s leading space ident is left for the caller.
 */
export function parseFunction(input: string, leading = 0): CssFunction & { idents: string[] } {
  // CSS Syntax 3: comments may sit between any two tokens.
  const match = FUNCTION.exec(input.replace(/\/\*[\s\S]*?\*\//g, " ").trim());
  if (!match) throw invalid(input);
  const [, rawName = "", body = ""] = match;
  const name = rawName.toLowerCase();
  const legacy = body.includes(",");
  let parts: string[];
  let alphaText: string | undefined;
  if (legacy) {
    if (body.includes("/")) throw invalid(input, 'mixes "," and "/"');
    parts = body.split(",").map((p) => p.trim());
    if (parts.some((p) => p === "" || /\s/.test(p))) throw invalid(input);
    if (parts.length === 4) alphaText = parts.pop();
  } else {
    const slash = body.split("/");
    if (slash.length > 2) throw invalid(input, 'more than one "/"');
    const [main = "", alpha] = slash;
    parts = main.trim().split(/\s+/).filter(Boolean);
    if (alpha !== undefined) {
      alphaText = alpha.trim();
      if (alphaText === "" || /\s/.test(alphaText)) throw invalid(input, "bad alpha");
    }
  }
  const idents = parts.slice(0, leading);
  const args = parts.slice(leading).map((p) => component(p, input));
  const alpha = alphaText === undefined ? undefined : component(alphaText, input);
  return { name, args, alpha, legacy, idents };
}

/**
 * Reads one channel component in the model's units. `none` is 0 (ADR-006). A percentage scales by the
 * channel's `percent`; a hue takes a number (degrees) or an angle.
 */
export function readChannel(c: Component, channel: Channel, input: string): number {
  switch (c.kind) {
    case "none":
      return 0;
    case "number":
      return c.value;
    case "percent":
      if (channel.percent === undefined) throw invalid(input, "percentage not allowed here");
      return channel.percent === 1 ? c.value : c.value * channel.percent;
    case "angle":
      if (!channel.hue) throw invalid(input, "angle not allowed here");
      return c.value;
  }
}

/** CSS Color 4 `#alpha-syntax` `<alpha-value>`: number or percentage, clamped to [0, 1] at parse time; omitted is 1. */
export function readAlpha(c: Component | undefined, input: string): number {
  if (c === undefined) return 1;
  if (c.kind === "angle") throw invalid(input, "angle not allowed for alpha");
  const v = c.kind === "none" ? 0 : c.value;
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Shortest round-trip text for `x` (`String` never loses a double). */
export function exact(x: number): string {
  return Object.is(x, -0) ? "0" : String(x);
}

/** A 0–1 fraction as an exact percentage, decimal-shifted so it parses back bit for bit. */
export function exactPercent(x: number): string {
  return `${shiftDecimal(exact(x), 2)}%`;
}

export function decimalsFor(channel: Channel, precision: number): number {
  const magnitude = Math.max(Math.abs(channel.range[0]), Math.abs(channel.range[1]));
  return Math.max(0, precision - Math.ceil(Math.log10(magnitude)));
}

/** `x` rounded to `decimals` places, trailing zeros dropped, never `-0`. */
export function rounded(x: number, decimals: number): string {
  const text = x.toFixed(decimals);
  const trimmed = text.includes(".") ? text.replace(/\.?0+$/, "") : text;
  return trimmed === "-0" ? "0" : trimmed;
}

export function roundedPercent(x: number, decimals: number): string {
  return `${rounded(x * 100, Math.max(0, decimals - 2))}%`;
}

export function css(name: string, parts: readonly string[], alpha: string | undefined): string {
  return `${name}(${parts.join(" ")}${alpha === undefined ? "" : ` / ${alpha}`})`;
}

export interface ParsedColor {
  readonly coords: number[];
  readonly alpha: number;
  readonly fn: CssFunction;
}

/**
 * Reads `name(c1 c2 c3 [/ alpha])` for one of `names` against the model's channel metadata. Legacy
 * comma syntax is rejected unless `legacy`; parse-time clamps are the caller's (they differ per model).
 */
export function readFunction(input: string, names: readonly string[], channels: Channels, legacy = false): ParsedColor {
  const fn = parseFunction(input);
  if (!names.includes(fn.name)) throw invalid(input, `expected ${names.join(" or ")}()`);
  return read(input, fn, channels, legacy);
}

/** Reads `color(<space> c1 c2 c3 [/ alpha])` for one of the space idents in `spaces`. */
export function readColorFunction(input: string, spaces: readonly string[], channels: Channels): ParsedColor {
  const fn = parseFunction(input, 1);
  const space = fn.idents[0]?.toLowerCase();
  if (fn.name !== "color" || space === undefined || !spaces.includes(space)) {
    throw invalid(input, `expected color(${spaces.join(" | ")} …)`);
  }
  return read(input, fn, channels, false);
}

function read(input: string, fn: CssFunction, channels: Channels, legacy: boolean): ParsedColor {
  const list = Object.values(channels);
  if (fn.legacy && !legacy) throw invalid(input, "comma syntax not allowed");
  if (fn.args.length !== list.length) throw invalid(input, `expected ${list.length} channels`);
  if (fn.legacy && [...fn.args, fn.alpha].some((c) => c?.kind === "none")) {
    throw invalid(input, '"none" not allowed in comma syntax');
  }
  const coords = fn.args.map((c, i) => readChannel(c, list[i]!, input));
  return { coords, alpha: readAlpha(fn.alpha, input), fn };
}

/** How `serialize` writes numbers: `'exact'` for `toString()`, or `toCss()`'s options. */
export type NumberStyle = "exact" | CssOptions;

/**
 * Writes `name(c1 c2 c3 [/ alpha])`; `space` gives `color(space …)`. Channels listed in `percent` are
 * written as percentages of 1 (`hsl` s / l). Alpha is omitted when exactly 1, as CSS serializes it.
 */
export function serialize(
  name: string,
  channels: Channels,
  coords: readonly number[],
  alpha: number,
  style: NumberStyle,
  percent: readonly string[] = [],
  space?: string
): string {
  const names = Object.keys(channels);
  const precision = style === "exact" ? 0 : (style.precision ?? 5);
  const parts = coords.map((v, i) => {
    const asPercent = percent.includes(names[i]!);
    if (style === "exact") return asPercent ? exactPercent(v) : exact(v);
    const decimals = decimalsFor(channels[names[i]!]!, precision);
    return asPercent ? roundedPercent(v, decimals) : rounded(v, decimals);
  });
  if (space !== undefined) parts.unshift(space);
  const a = alpha === 1 ? undefined : style === "exact" ? exact(alpha) : rounded(alpha, Math.max(0, precision));
  return css(name, parts, a);
}

/**
 * Reads `hsl()` / `hwb()`-style functions: a hue, then two channels that CSS writes as percentages or
 * as plain numbers on a 0–100 scale (`hsl(30 100 50)`), stored as 0–1 fractions. `legacy` allows the
 * comma form, which CSS restricts to percentages.
 */
export function readHueFunction(
  input: string,
  names: readonly string[],
  channels: Channels,
  legacy = false
): ParsedColor {
  const fn = parseFunction(input);
  if (!names.includes(fn.name)) throw invalid(input, `expected ${names.join(" or ")}()`);
  if (fn.legacy) {
    if (!legacy) throw invalid(input, "comma syntax not allowed");
    if (fn.args.length !== 3 || [...fn.args, fn.alpha].some((c) => c?.kind === "none")) {
      throw invalid(input);
    }
    if (fn.args[1]!.kind !== "percent" || fn.args[2]!.kind !== "percent") {
      throw invalid(input, "comma syntax needs percentages");
    }
  }
  if (fn.args.length !== 3) throw invalid(input, "expected 3 channels");
  const list = Object.values(channels);
  const coords = fn.args.map((c, i) => {
    if (i > 0 && c.kind === "number") return Number(shiftDecimal(String(c.value), -2));
    return readChannel(c, list[i]!, input);
  });
  return { coords, alpha: readAlpha(fn.alpha, input), fn };
}
