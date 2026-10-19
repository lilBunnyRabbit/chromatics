import type { Color } from "./core/color.js";
import { invalid } from "./core/css.js";
import type { ColorModel } from "./core/model.js";
import { DisplayP3 } from "./models/display-p3/display-p3.js";
import { Hsl } from "./models/hsl/hsl.js";
import { Hsv } from "./models/hsv/hsv.js";
import { Hwb } from "./models/hwb/hwb.js";
import { Lab } from "./models/lab/lab.js";
import { Lch } from "./models/lch/lch.js";
import { LinearSrgb } from "./models/linear-srgb/linear-srgb.js";
import { Oklab } from "./models/oklab/oklab.js";
import { Oklch } from "./models/oklch/oklch.js";
import { Srgb } from "./models/srgb/srgb.js";
import { Srgb8 } from "./models/srgb8/srgb8.js";
import { Xyz50 } from "./models/xyz50/xyz50.js";
import { Xyz65 } from "./models/xyz65/xyz65.js";

export { path, reachable } from "./core/router.js";

/** Every model the package ships, for listings and graph queries. Importing it bundles all of them. */
export const models: readonly ColorModel[] = [
  Xyz65,
  Xyz50,
  LinearSrgb,
  Srgb,
  Srgb8,
  DisplayP3,
  Oklab,
  Oklch,
  Lab,
  Lch,
  Hsl,
  Hsv,
  Hwb,
];

const FUNCTIONS: Readonly<Record<string, (input: string) => Color>> = {
  rgb: Srgb.parse,
  rgba: Srgb.parse,
  hsl: Hsl.parse,
  hsla: Hsl.parse,
  hwb: Hwb.parse,
  hsv: Hsv.parse,
  lab: Lab.parse,
  lch: Lch.parse,
  oklab: Oklab.parse,
  oklch: Oklch.parse,
};

const SPACES: Readonly<Record<string, (input: string) => Color>> = {
  srgb: Srgb.parse,
  "srgb-linear": LinearSrgb.parse,
  "display-p3": DisplayP3.parse,
  xyz: Xyz65.parse,
  "xyz-d65": Xyz65.parse,
  "xyz-d50": Xyz50.parse,
};

/**
 * Parses any syntax the package knows into its own model: hex and named colors give `Srgb8`, `rgb()`
 * gives `Srgb`, `oklch()` gives `Oklch`, `color(display-p3 …)` gives `DisplayP3`, and so on. Narrow
 * the result with `is()`.
 *
 * Bundles every parser; when you know the syntax, `Oklch.parse` alone is smaller.
 *
 * @throws {SyntaxError} on anything unrecognised.
 * @example
 * ```ts
 * const c = parse("oklch(70% 0.15 30)");
 * if (c.is(Oklch)) c.h += 180;
 * parse("#ff8000").to(Lab);
 * ```
 */
export function parse(input: string): Color {
  const text = input.trim().toLowerCase();
  const name = /^([a-z-]+)\(/.exec(text)?.[1];
  if (name === undefined) return Srgb8.parse(input);
  if (name === "color") {
    const space = /^color\(\s*([a-z0-9-]+)/.exec(text)?.[1] ?? "";
    const parser = Object.hasOwn(SPACES, space) ? SPACES[space] : undefined;
    if (!parser) throw invalid(input, `unknown color space "${space}"`);
    return parser(input);
  }
  const parser = Object.hasOwn(FUNCTIONS, name) ? FUNCTIONS[name] : undefined;
  if (!parser) throw invalid(input, `unknown function ${name}()`);
  return parser(input);
}
