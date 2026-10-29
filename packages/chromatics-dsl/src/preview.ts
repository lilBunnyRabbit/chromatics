/**
 * Preview primitives — the `preview.*` namespace. These don't return colors: they return descriptors,
 * `{ __preview: <type>, ...refs }` with the refs as the actual colors, that a host renders (the studio
 * draws a gradient bar, a contrast specimen, a 3D plot…).
 */
import { Oklab, Oklch, type ColorModel } from "@lilbunnyrabbit/chromatics";
import { color, num, str, obj, model, type DSLValue, type DSLFunction, type PlainObject } from "./values.js";

/** A rendered-preview descriptor (a plain object marked with `__preview`). */
export type PreviewValue = PlainObject & { __preview: string };

/** `true` for a `preview.*` descriptor. */
export function isPreview(v: unknown): v is PreviewValue {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    typeof (v as Record<string, unknown>).__preview === "string"
  );
}

/** Wrap a positional-args builder as a DSLFunction. */
function def(build: (a: DSLValue[]) => PlainObject): DSLFunction {
  return (...a: DSLValue[]) => build(a);
}
const colorsOf = (a: DSLValue[]) => a.map((x) => color(x));
const optStr = (v: DSLValue | undefined, d: string) => (v === undefined ? d : str(v));
const optModel = (v: DSLValue | undefined, d: ColorModel) => (v === undefined ? d : model(v));
const optInt = (v: DSLValue | undefined, d: number) => (v === undefined ? d : Math.round(num(v)));
/** A plain options object if `v` is one, else null (strings/numbers/colors → null). */
const asOpts = (v: DSLValue | undefined): PlainObject | null => {
  if (v === undefined) return null;
  try {
    return obj(v);
  } catch {
    return null;
  }
};

/** The `preview` namespace: each member returns a descriptor a host renders. */
export const preview: Record<string, DSLFunction> = {
  // — Relationships —
  // gradient(from, to, space?, stops?) OR gradient(from, to, { space, hue, stops })
  gradient: def(([from, to, space, stops]) => {
    const o = asOpts(space);
    return {
      __preview: "gradient",
      from: color(from),
      to: color(to),
      space: o ? optModel(o.space, Oklab) : optModel(space, Oklab),
      hue: o ? optStr(o.hue, "shorter") : "shorter",
      stops: o ? optInt(o.stops, 7) : optInt(stops, 7),
    };
  }),
  ramp: def(([base, mode]) => ({
    __preview: "ramp",
    base: color(base),
    model: optModel(mode, Oklch),
  })),
  harmony: def(([base, scheme, hueModel]) => ({
    __preview: "harmony",
    base: color(base),
    scheme: optStr(scheme, "complementary"),
    model: optModel(hueModel, Oklch),
  })),
  mix: def(([from, to, steps]) => ({
    __preview: "mix",
    from: color(from),
    to: color(to),
    steps: optInt(steps, 5),
  })),

  // — Accessibility —
  pair: def(([fg, bg]) => ({ __preview: "pair", fg: color(fg), bg: color(bg) })),
  cvd: def(([c]) => ({ __preview: "cvd", color: color(c) })),
  onBackgrounds: def(([c, bgs]) => ({
    __preview: "onBackgrounds",
    color: color(c),
    backgrounds: Array.isArray(bgs) ? bgs.map((x) => color(x)) : [],
  })),

  // — Single-color analysis —
  space: def(([c, m]) => ({
    __preview: "space",
    color: color(c),
    model: optModel(m, Oklch),
  })),
  channels: def(([c, m]) => ({
    __preview: "channels",
    color: color(c),
    model: optModel(m, Oklch),
  })),
  gamut: def(([c]) => ({ __preview: "gamut", color: color(c) })),
  print: def(([c]) => ({ __preview: "print", color: color(c) })),
  name: def(([c]) => ({ __preview: "name", color: color(c) })),
  temperature: def(([c]) => ({ __preview: "temperature", color: color(c) })),

  // — Scheme & mockups —
  palette: def((a) => ({ __preview: "palette", colors: colorsOf(a) })),
  grid: def((a) => ({ __preview: "grid", colors: colorsOf(a) })),
  chart: def((a) => ({ __preview: "chart", colors: colorsOf(a) })),
  ui: def(([bg, fg, primary]) => ({
    __preview: "ui",
    bg: color(bg),
    fg: color(fg),
    primary: primary === undefined ? color(fg) : color(primary),
  })),
  brandMark: def(([c]) => ({ __preview: "brandMark", color: color(c) })),
};
