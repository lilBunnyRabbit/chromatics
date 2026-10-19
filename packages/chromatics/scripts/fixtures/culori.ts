// Cross-check grid (ADR-008, grill 21): culori's output for every direct edge over a deterministic
// grid. Culori is an implementation, not a reference: this catches formula slips between the sparse
// published vectors, at a tolerance measured here and stored with the cases.
import { converter, type Color as CuloriColor } from "culori";
import { models } from "../../src/all.js";
import type { ColorModel } from "../../src/core/model.js";

const MODES: Readonly<Record<string, string>> = {
  "xyz-d65": "xyz65",
  "xyz-d50": "xyz50",
  "srgb-linear": "lrgb",
  srgb: "rgb",
  "display-p3": "p3",
  "a98-rgb": "a98",
  "prophoto-rgb": "prophoto",
  // No rec2020: culori 4.0.2 decodes it with the inverse BT.2020 OETF (α 1.0993, β 0.0181), the CSS
  // draft's earlier definition. CSS Color 4 now uses the BT.1886 gamma 2.4, which WPT tests.
  oklab: "oklab",
  oklch: "oklch",
  lab: "lab",
  lch: "lch",
  hsl: "hsl",
  hsv: "hsv",
  hwb: "hwb",
};

const FOLDERS: Readonly<Record<string, string>> = {
  "xyz-d65": "xyz65",
  "xyz-d50": "xyz50",
  "srgb-linear": "linear-srgb",
  "display-p3-linear": "linear-display-p3",
};

export interface CrossCase {
  readonly to: string;
  readonly input: readonly number[];
  readonly expected: readonly number[];
}

function toCulori(model: ColorModel, coords: readonly number[]): CuloriColor {
  const mode = MODES[model.id]!;
  const names = Object.keys(model.channels);
  const out: Record<string, unknown> = { mode };
  names.forEach((n, i) => (out[n] = coords[i]));
  return out as unknown as CuloriColor;
}

function fromCulori(model: ColorModel, color: CuloriColor): number[] {
  const record = color as unknown as Record<string, number | undefined>;
  // Culori leaves a grey's hue undefined; this package stores 0 (ADR-003).
  return Object.keys(model.channels).map((n) => record[n] ?? 0);
}

function grid(model: ColorModel): number[][] {
  const axes = Object.values(model.channels).map((ch) =>
    [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1].map((t) => ch.range[0] + (ch.range[1] - ch.range[0]) * t)
  );
  const out: number[][] = [];
  for (const a of axes[0]!) for (const b of axes[1]!) for (const c of axes[2]!) out.push([a, b, c]);
  return out;
}

export function crossCheck(model: ColorModel): CrossCase[] {
  const cases: CrossCase[] = [];
  const neighbours = [
    ...model.edges.map((e) => e.target),
    ...models.filter((m) => m.edges.some((e) => e.target === model)),
  ].filter((m) => MODES[m.id] !== undefined);
  if (MODES[model.id] === undefined) return cases;
  for (const target of neighbours) {
    const to = converter(MODES[target.id] as never);
    for (const input of grid(model)) {
      cases.push({ to: target.id, input, expected: fromCulori(target, to(toCulori(model, input))) });
    }
  }
  return cases;
}

if (import.meta.main) {
  const { version } = (await import("culori/package.json", { with: { type: "json" } })).default as {
    version: string;
  };
  for (const model of models) {
    const cases = crossCheck(model);
    if (cases.length === 0) continue;
    const folder = FOLDERS[model.id] ?? model.id;
    const file = new URL(`../../src/models/${folder}/${folder}.fixtures.json`, import.meta.url);
    const existing = (await Bun.file(file).exists()) ? await Bun.file(file).json() : { conversions: [], parse: [] };
    existing.crossCheck = {
      source: `culori ${version}`,
      generated: new Date().toISOString().slice(0, 10),
      // Measured 2026-10-19: every edge agrees within 1.2e-13, except Bradford D65 ↔ D50 at 9.7e-8, where
      // culori ships its own matrix; ours equals CSS Color 4's within 4e-16 (scripts/matrices).
      tolerance: 1e-12,
      toleranceFor: { "xyz-d65>xyz-d50": 1e-6, "xyz-d50>xyz-d65": 1e-6 },
      cases,
    };
    await Bun.write(file, JSON.stringify(existing, null, 1) + "\n");
    console.log(`${folder}: ${cases.length} cross-check cases`);
  }
}
