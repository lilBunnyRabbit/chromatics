import { describe, expect, it } from "vitest";
import { parse } from "../../all.js";
import { DisplayP3 } from "../../models/display-p3/display-p3.js";
import { Hsl } from "../../models/hsl/hsl.js";
import { Hwb } from "../../models/hwb/hwb.js";
import { Lab } from "../../models/lab/lab.js";
import { Lch } from "../../models/lch/lch.js";
import { LinearSrgb } from "../../models/linear-srgb/linear-srgb.js";
import { Oklab } from "../../models/oklab/oklab.js";
import { Oklch } from "../../models/oklch/oklch.js";
import { Srgb } from "../../models/srgb/srgb.js";
import type { Color } from "../color.js";
import type { HueInterpolation } from "../interpolate.js";
import type { ColorModel } from "../model.js";
import fixtures from "./mix.fixtures.json" with { type: "json" };

const SPACES: Record<string, ColorModel> = {
  srgb: Srgb,
  "srgb-linear": LinearSrgb,
  "display-p3": DisplayP3,
  oklab: Oklab,
  oklch: Oklch,
  lab: Lab,
  lch: Lch,
  hsl: Hsl,
  hwb: Hwb,
};

function splitTopLevel(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")") depth--;
    else if (text[i] === "," && depth === 0) {
      parts.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(text.slice(start).trim());
  return parts;
}

function colorAndPercent(arg: string): [Color, number | undefined] {
  const m = /^(?:([\d.]+)%\s+)?(.*?)(?:\s+([\d.]+)%)?$/.exec(arg)!;
  const p = m[1] ?? m[3];
  return [parse(m[2]!), p === undefined ? undefined : Number(p)];
}

type Mixable = Color & { mix(other: Color, t: number, options?: { hue?: HueInterpolation }): Color };

// CSS Color 5 #color-mix: percentages normalize to a sum of 100; a sum below 100 also scales alpha.
function colorMix(input: string): Color {
  const m = /^color-mix\(\s*(.*)\)$/s.exec(input.trim())!;
  const [first, ...rest] = splitTopLevel(m[1]!);
  let method = "in oklab";
  let args = [first!, ...rest];
  if (first!.startsWith("in ")) {
    method = first!;
    args = rest;
  }
  const [, space = "", hue] = /^in\s+([a-z0-9-]+)(?:\s+(shorter|longer|increasing|decreasing)\s+hue)?$/.exec(method)!;
  const model = SPACES[space]!;
  const [a, pa] = colorAndPercent(args[0]!);
  const [b, pb] = colorAndPercent(args[1]!);
  const p1 = pa ?? (pb === undefined ? 50 : 100 - pb);
  const p2 = pb ?? 100 - p1;
  const sum = p1 + p2;
  const options = hue ? { hue: hue as HueInterpolation } : {};
  // A sum of 0 mixes 50/50 and multiplies alpha by 0.
  const out = (a.to(model) as Mixable).mix(b.to(model), sum === 0 ? 0.5 : p2 / sum, options);
  if (sum < 100) out.alpha = out.alpha * (sum / 100);
  return out;
}

function expectClose(actual: Color, expected: Color, epsilon: number, label: string, noneHue: boolean): void {
  const target = expected.constructor as ColorModel;
  const ours = actual.to(target);
  Object.values(target.channels).forEach((ch, i) => {
    let d = Math.abs(ours.coords[i]! - expected.coords[i]!);
    if (ch.hue) {
      if (noneHue || (expected as { isAchromatic?(): boolean }).isAchromatic?.()) return;
      d = Math.min(d % 360, 360 - (d % 360));
    }
    expect(d, `${label} channel ${i}: ${ours.toString()} vs ${expected.toString()}`).toBeLessThanOrEqual(
      epsilon + 1e-12
    );
  });
  expect(Math.abs(ours.alpha - expected.alpha), `${label} alpha`).toBeLessThanOrEqual(epsilon + 1e-12);
}

describe("color-mix(), web-platform-tests (fuzzy, epsilon 0.01 in the written units)", () => {
  // ADR-003: a grey's hue is always treated as missing. CSS keeps the explicit hue of a grey that is
  // already in the mixing space (`color-mix(in lch, lch(100% 0 0), blue)` mixes from hue 0), so those
  // cases differ on purpose. N-color color-mix() (CSS Color 5) is beyond this two-color reader.
  const inSpaceGrey = (c: (typeof fixtures.wpt)[number]) => {
    const m = /^color-mix\(\s*in\s+([a-z0-9-]+)/.exec(c.input);
    return (
      (m?.[1] === "lch" && /lch\(100% 0 0\)/.test(c.input)) ||
      (m?.[1] === "oklch" && /oklch\(100% 0 0\)/.test(c.input)) ||
      (m?.[1] === "hwb" && /hwb\(0 50\.0 50\.0\)/.test(c.input))
    );
  };
  const cases = fixtures.wpt.filter(
    (c) => !inSpaceGrey(c) && splitTopLevel(c.input.slice(10, -1)).filter((p) => !p.startsWith("in ")).length === 2
  );
  it.each(cases.map((c) => [`${c.file.split("/").at(-1)}:${c.line}`, c] as const))("%s", (_, c) => {
    const epsilon = typeof c.epsilon === "number" ? c.epsilon : 0.01;
    expectClose(colorMix(c.input), parse(c.expected), epsilon, c.input, /none/.test(c.expected));
  });
});

interface SpecExample {
  readonly id: string;
  readonly space: string;
  readonly hue?: string;
  readonly a: string;
  readonly b: string;
  readonly t: number | null;
  readonly expected: string | null;
}

describe("interpolation, CSS Color 4 examples", () => {
  // Inputs given as "x = y" are conversions; use the published converted form (after "=").
  const side = (text: string) => text.split("=").at(-1)!.trim();
  const examples = (fixtures.spec as readonly SpecExample[]).filter(
    (e): e is SpecExample & { expected: string; t: number } => typeof e.expected === "string" && typeof e.t === "number"
  );
  it.each(examples.map((e) => [e.id, e] as const))("%s", (_, e) => {
    const model = SPACES[e.space]!;
    const a = parse(side(e.a)).to(model) as Mixable;
    const out = a.mix(parse(side(e.b)).to(model), e.t, e.hue ? { hue: e.hue as HueInterpolation } : {});
    const expected = parse(e.expected.replace(") / 0.5)", " / 0.5)"));
    const half = (text: string) =>
      0.5 * 10 ** -Math.min(...[...text.matchAll(/\d+\.(\d+)/g)].map((m) => m[1]!.length), 6);
    // The inputs and the result are both rounded: half a unit of each one's coarsest published digit.
    expectClose(out, expected, half(side(e.a)) + half(e.expected), e.id, false);
  });
});
