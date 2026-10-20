import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { parse } from "../all.js";
import { Color } from "../core/color.js";
import { parseFunction, type Component } from "../core/css.js";
import type { Channel, ColorModel } from "../core/model.js";
import { Hsv } from "../models/hsv/hsv.js";
import { Srgb } from "../models/srgb/srgb.js";
import { Srgb8 } from "../models/srgb8/srgb8.js";
import { comparisons, extended } from "./specs.js";
import { decimalsFor } from "../core/css.js";

// ADR-008: round trips pass at |a − b| ≤ 1e-13 + 1e-12·|b| per channel.
export const ABSOLUTE = 1e-13;
export const RELATIVE = 1e-12;

export function close(a: number, b: number, scale = 1): boolean {
  return Math.abs(a - b) <= (ABSOLUTE + RELATIVE * Math.abs(b)) * scale;
}

export interface ModelSpec {
  readonly fixtures?: Fixtures;
  /** Strings that must parse to exactly these coords and alpha. */
  readonly strings?: readonly (readonly [input: string, coords: readonly number[], alpha: number])[];
  /** Strings that must throw a SyntaxError. */
  readonly invalid?: readonly string[];
  /** `[input, toCss()]` pairs, each from a cited serialization example. */
  readonly formats?: readonly (readonly [input: string, css: string])[];
  /**
   * How far past the reference ranges totality's "never throws" sweep goes (default 1e6×). PQ and HLG
   * models decode only what light can encode: PQ approaches (c2 / c3)^m2 ≈ 1.99 as light goes to
   * infinity, so their values a little past the range have no light, and a RangeError is the answer.
   */
  readonly realistic?: number;
}

export interface FixtureCase {
  readonly id: string;
  readonly kind: string;
  readonly input: string;
  readonly expected: string | null;
  readonly precision: number | readonly number[] | null;
  readonly epsilon?: number;
  readonly exact?: boolean;
  readonly src: string;
  readonly at: string;
  /** Secondary table rows (Wikipedia HSV): channels as printed, `"n/a"` for an undefined hue. */
  readonly inputChannels?: Readonly<Record<string, string>> | null;
  readonly expectedChannels?: Readonly<Record<string, string>> | null;
}

export interface CrossCheck {
  readonly source: string;
  readonly tolerance: number;
  readonly toleranceFor?: Readonly<Record<string, number>>;
  readonly cases: readonly {
    readonly to: string;
    readonly input: readonly number[];
    readonly expected: readonly number[];
  }[];
}

export interface Fixtures {
  readonly conversions: readonly FixtureCase[];
  readonly parse: readonly FixtureCase[];
  /** Culori's output over a grid: a cross-check between the sparse references, never a reference itself. */
  readonly crossCheck?: CrossCheck;
}

function channelList(model: ColorModel): [string, Channel][] {
  return Object.entries(model.channels);
}

function construct(model: ColorModel, coords: readonly number[], alpha?: number): Color {
  return alpha === undefined ? new model(...coords) : new model(...coords, alpha);
}

export function uniformDomain(model: ColorModel, stretch = 1): fc.Arbitrary<Color> {
  const channels = channelList(model).map(([, ch]) => {
    const [min, max] = ch.range;
    const pad = ((max - min) * (stretch - 1)) / 2;
    return fc.double({ min: min - pad, max: max + pad, noNaN: true, noDefaultInfinity: true });
  });
  const alphaMax = model.terminal ? 255 : 1;
  return fc
    .tuple(fc.tuple(...channels), fc.double({ min: 0, max: alphaMax, noNaN: true }))
    .map(([coords, alpha]) => construct(model, coords, alpha));
}

export function domainOf(model: ColorModel): fc.Arbitrary<Color> {
  return uniformDomain(model);
}

/** Five points per channel (ends, quarters, middle) and three alphas: the deterministic layer. */
export function grid(model: ColorModel): Color[] {
  const axes = channelList(model).map(([, ch]) => {
    const [min, max] = ch.range;
    return [0, 0.25, 0.5, 0.75, 1].map((t) => min + (max - min) * t);
  });
  const alphaMax = model.terminal ? 255 : 1;
  const out: Color[] = [];
  const walk = (i: number, acc: number[]) => {
    if (i === axes.length) {
      for (const a of [0, 0.5, 1]) out.push(construct(model, acc, a * alphaMax));
      return;
    }
    for (const v of axes[i]!) walk(i + 1, [...acc, v]);
  };
  walk(0, []);
  return out;
}

/** Throws with a readable diff when `actual` isn't the same color as `expected` in `model`. */
export function assertSame(model: ColorModel, actual: Color, expected: Color, scale = 1): void {
  const spec = comparisons.get(model);
  const canon = spec?.canonical ?? ((c: readonly number[]) => c);
  const a = canon(actual.coords);
  const b = canon(expected.coords);
  const channels = channelList(model);
  const weight = spec?.hueWeight?.(b) ?? 0;
  // Grill 30: relative to the largest channel, since coupled channels (Lab a at L = 200) carry the
  // error of their biggest neighbour.
  const largest = Math.max(...channels.map(([, ch], i) => (ch.hue || Number.isNaN(b[i]) ? 0 : Math.abs(b[i]!))));
  const bound = (ABSOLUTE + RELATIVE * largest) * scale;
  const bad: string[] = [];
  channels.forEach(([name, ch], i) => {
    const x = a[i]!;
    const y = b[i]!;
    if (Number.isNaN(x) || Number.isNaN(y)) return;
    if (ch.hue) {
      let d = Math.abs(x - y) % 360;
      if (d > 180) d = 360 - d;
      const arc = ((d * Math.PI) / 180) * weight;
      if (!(arc <= bound)) bad.push(`${name}: ${x} vs ${y} (weight ${weight})`);
    } else if (!(Math.abs(x - y) <= bound)) bad.push(`${name}: ${x} vs ${y}`);
  });
  if (!close(actual.alpha, expected.alpha, scale)) bad.push(`alpha: ${actual.alpha} vs ${expected.alpha}`);
  if (bad.length > 0) {
    throw new Error(`${model.id} differs from ${expected.toString()}: ${bad.join(", ")}`);
  }
}

// --- rows -------------------------------------------------------------------------------------------

export function checkShape(model: ColorModel): void {
  const channels = channelList(model);
  const values = channels.map(([, ch], i) => ch.range[0] + (ch.range[1] - ch.range[0]) * (0.3 + 0.17 * i));
  const c = construct(model, values);
  expect(c.model).toBe(model.id);
  expect(c.constructor).toBe(model);
  expect([...c.coords]).toEqual(values.map((v, i) => readBack(model, channels[i]![1], v)));
  expect(c.alpha).toBe(model.terminal ? 255 : 1);
  channels.forEach(([name], i) => expect((c as unknown as Record<string, number>)[name]).toBe(c.coords[i]));
  expect(Object.keys(c.toJSON())).toEqual(["model", ...channels.map(([n]) => n), "alpha"]);
  const of = (model as unknown as { of(v: object): Color }).of({
    ...Object.fromEntries(channels.map(([n], i) => [n, values[i]])),
    alpha: 0.5,
  });
  expect([...of.coords]).toEqual([...construct(model, values, 0.5).coords]);
  const copy = c.clone();
  expect(copy).not.toBe(c);
  expect(copy.equals(c)).toBe(true);
  const same = c.to(model);
  expect(same).not.toBe(c);
  expect(same.equals(c)).toBe(true);
}

function readBack(model: ColorModel, ch: Channel, v: number): number {
  if (model.terminal) return Math.min(255, Math.max(0, Math.round(v))) || 0;
  if (ch.hue) {
    const h = v % 360;
    const w = h < 0 ? h + 360 : h;
    return w === 360 || w === 0 ? 0 : w;
  }
  return v;
}

export function checkBoundaries(model: ColorModel): void {
  const channels = channelList(model);
  const outside = (ch: Channel) => {
    const span = ch.range[1] - ch.range[0];
    return [ch.range[0] - span * 1e-9, ch.range[1] + span * 1e-9, ch.range[0] - span, ch.range[1] + span];
  };
  const corners: number[][] = [[]];
  for (const [, ch] of channels) {
    const next: number[][] = [];
    for (const prefix of corners) for (const v of ch.range) next.push([...prefix, v]);
    corners.splice(0, corners.length, ...next);
  }
  for (const coords of corners) {
    const c = construct(model, coords);
    expect([...c.coords]).toEqual(coords.map((v, i) => readBack(model, channels[i]![1], v)));
  }
  channels.forEach(([name, ch], i) => {
    const base = channels.map(([, x]) => x.range[0]);
    for (const v of [...ch.range, ...outside(ch), -0]) {
      const coords = base.map((b, j) => (j === i ? v : b));
      const c = construct(model, coords);
      const expected = readBack(model, ch, v);
      expect(c.coords[i]).toBe(expected);
      const target = construct(model, base) as unknown as Record<string, number>;
      target[name] = v;
      expect(target[name]).toBe(expected);
    }
  });
  const alphas = model.terminal ? [0, 255, -1, 256, 127.5] : [0, 1, -0.5, 1.5];
  for (const a of alphas) {
    const c = construct(
      model,
      channels.map(([, ch]) => ch.range[0]),
      a
    );
    expect(c.alpha).toBe(model.terminal ? Math.min(255, Math.max(0, Math.round(a))) : a);
  }
}

export function checkDegenerate(model: ColorModel): void {
  const channels = channelList(model);
  const base = channels.map(([, ch]) => ch.range[0]);
  for (const bad of [Number.NaN, Infinity, -Infinity]) {
    for (let i = 0; i <= channels.length; i++) {
      const coords = [...base, 1].map((v, j) => (j === i ? bad : v));
      expect(() => construct(model, coords.slice(0, -1), coords.at(-1))).toThrow(TypeError);
    }
    for (const name of [...channels.map(([n]) => n), "alpha"]) {
      const c = construct(model, base) as unknown as Record<string, number>;
      const before = c[name];
      expect(() => (c[name] = bad)).toThrow(TypeError);
      expect(c[name]).toBe(before);
    }
  }
}

function edgesOf(model: ColorModel, all: readonly ColorModel[]): [ColorModel, "declared" | "reverse"][] {
  const out: [ColorModel, "declared" | "reverse"][] = model.edges.map((e) => [e.target, "declared"]);
  for (const other of all) if (other.edges.some((e) => e.target === model)) out.push([other, "reverse"]);
  return out;
}

export function checkRoundTrip(from: ColorModel, via: ColorModel, color: Color): void {
  const back = color.to(via).to(from);
  if (from.terminal) {
    expect(back.equals(color)).toBe(true);
  } else if (via.terminal && via === Srgb8 && from === Srgb) {
    // 8-bit quantization: each channel and alpha moves by at most half a step.
    const step = (v: number, w: number) =>
      expect(Math.abs(w - Math.min(1, Math.max(0, v)))).toBeLessThanOrEqual(0.5 / 255 + 1e-15);
    color.coords.forEach((v, i) => step(v, back.coords[i]!));
    step(color.alpha, back.alpha);
  } else {
    try {
      assertSame(from, back, color);
    } catch (forward) {
      // Grill 31: where the source model is ill-conditioned (Oklab near LMS = 0, subnormal Hsl
      // lightness) or a near-grey's hue was zeroed (grill 29), the round trip is checked by its
      // residual in the neighbour space instead: `back` must map onto the same neighbour color.
      try {
        assertSame(via, back.to(via), color.to(via));
      } catch {
        throw forward;
      }
    }
  }
}

export function checkEdges(model: ColorModel, all: readonly ColorModel[]): void {
  for (const [neighbour] of edgesOf(model, all)) {
    if (neighbour.terminal && neighbour !== Srgb8) continue;
    for (const c of grid(model)) checkRoundTrip(model, neighbour, c);
    fc.assert(fc.property(domainOf(model), (c) => checkRoundTrip(model, neighbour, c)));
    if (extended(model.id, neighbour.id)) {
      fc.assert(fc.property(uniformDomain(model, 3), (c) => checkRoundTrip(model, neighbour, c)));
    }
  }
}

/**
 * Grill 32: conversions are total. Over every finite double, each conversion from `model` returns a
 * finite color or throws a RangeError (the true result is beyond the number range). Within a million
 * times the reference ranges, with no subnormal magnitudes, nothing throws at all.
 */
export function checkTotality(model: ColorModel, all: readonly ColorModel[], scale = 1e6): void {
  const channels = channelList(model);
  const realistic = channels.map(([, ch]) => {
    const limit = scale * Math.max(Math.abs(ch.range[0]), Math.abs(ch.range[1]));
    return fc
      .double({ min: -limit, max: limit, noNaN: true, noDefaultInfinity: true })
      .map((v) => (Math.abs(v) < 1e-300 ? 0 : v));
  });
  const anyFinite = channels.map(() => fc.double({ noNaN: true, noDefaultInfinity: true }));
  const targets = all.filter((m) => m !== model);
  const settings = { numRuns: 300 };
  fc.assert(
    fc.property(fc.tuple(...realistic), (coords) => {
      const c = construct(model, coords);
      for (const t of targets) c.to(t);
    }),
    settings
  );
  fc.assert(
    fc.property(fc.tuple(...anyFinite), (coords) => {
      const c = construct(model, coords);
      for (const t of targets) {
        try {
          const out = c.to(t);
          expect(out.coords.every(Number.isFinite)).toBe(true);
        } catch (error) {
          expect(error, `${model.id} → ${t.id} for ${c.toString()}`).toBeInstanceOf(RangeError);
        }
      }
    }),
    settings
  );
}

// --- references ---------------------------------------------------------------------------------------

/**
 * Tolerance for each numeric token of a published string, converted into the parsed model's units:
 * a percentage token's precision is in percent of the channel's `percent`, a legacy `rgb()` number in
 * 0–255. WPT's fuzzy helpers assert `epsilon` in the written units; its exact-string helpers mean the
 * browser printed these digits, so the half-digit applies.
 */
export function tolerances(c: FixtureCase, expected: Color): number[] {
  const text = c.expected!;
  const isColorFn = /^\s*color\(/i.test(text);
  const fn = /^\s*#|^\s*[a-z]+\s*$/i.test(text) ? undefined : parseFunction(text, isColorFn ? 1 : 0);
  const model = expected.constructor as ColorModel;
  const channels = channelList(model).map(([, ch]) => ch);
  const tokens: (Component | undefined)[] = fn ? [...fn.args, fn.alpha] : [];
  const precision = (i: number) => {
    const published = Array.isArray(c.precision)
      ? (c.precision[i] ?? c.precision.at(-1)!)
      : ((c.precision as number) ?? 0);
    return Math.max(c.epsilon ?? 0, published);
  };
  const rgbFn = fn && (fn.name === "rgb" || fn.name === "rgba");
  const hslFn = fn && ["hsl", "hsla", "hwb"].includes(fn.name);
  return [...channels, undefined].map((ch, i) => {
    const p = precision(i);
    const token = tokens[i];
    if (model === Srgb8) return p;
    if (ch === undefined) return token?.kind === "percent" ? p / 100 : p;
    if (token?.kind === "percent") return (p / 100) * (rgbFn ? 1 : (ch.percent ?? 1));
    if (rgbFn) return p / 255;
    if (hslFn && i > 0) return p / 100;
    return p;
  });
}

function checkTableCase(c: FixtureCase): void {
  const i = c.inputChannels!;
  const e = c.expectedChannels!;
  const actual = new Srgb(Number(i.R), Number(i.G), Number(i.B)).to(Hsv);
  const tol = c.precision as readonly number[];
  const pairs: [string, number, number, number][] = [
    ["s", actual.s, Number(e.s), tol[1]!],
    ["v", actual.v, Number(e.v), tol[2]!],
  ];
  if (e.h !== "n/a") {
    let d = Math.abs(actual.h - Number(e.h!.replace("°", ""))) % 360;
    if (d > 180) d = 360 - d;
    pairs.push(["h", d, 0, tol[0]!]);
  } else expect(actual.isAchromatic()).toBe(true);
  for (const [name, x, y, t] of pairs) {
    expect(Math.abs(x - y), `${c.id} ${name} [${c.src} ${c.at}]`).toBeLessThanOrEqual(t + 1e-12);
  }
}

const NUMBER_TOKEN = /(?<=[\s(,/])([+-]?(?:\d+(?:\.(\d+))?|\.(\d+))(?:e[+-]?\d+)?)(%|deg|grad|rad|turn)?/gi;

function circular(d: number): number {
  const m = Math.abs(d) % 360;
  return m > 180 ? 360 - m : m;
}

/**
 * A published input is itself rounded: its true value lies within half its last digit. Every corner of
 * that box is converted, and the spread of results joins the output tolerance. WPT inputs are test
 * definitions, not rounded values, so they carry none.
 */
function inputSpread(c: FixtureCase, target: ColorModel): number[] {
  const space = target === Srgb8 ? Srgb : target;
  const center = parse(c.input).to(space);
  const hue = channelList(space).map(([, ch]) => ch.hue === true);
  const out = [...center.coords.map(() => 0), 0];
  if (c.src === "wpt") return out;
  const base = parse(c.input);
  const corners: Color[] = [];
  if (base.is(Srgb8)) {
    const s = base.to(Srgb);
    for (let m = 0; m < 8; m++) {
      const d = [0, 1, 2].map((i) => (m & (1 << i) ? 0.5 : -0.5) / 255);
      corners.push(new Srgb(s.r + d[0]!, s.g + d[1]!, s.b + d[2]!, s.alpha));
    }
  } else {
    const head = c.input.indexOf("(");
    const body = c.input.slice(head);
    const tokens = [...body.matchAll(NUMBER_TOKEN)].slice(0, 4);
    for (let m = 0; m < 1 << tokens.length; m++) {
      let text = body;
      for (let i = tokens.length - 1; i >= 0; i--) {
        const t = tokens[i]!;
        const decimals = (t[2] ?? t[3] ?? "").length;
        const v = Number(t[1]) + (m & (1 << i) ? 0.5 : -0.5) * 10 ** -decimals;
        text = text.slice(0, t.index) + String(v) + (t[4] ?? "") + text.slice(t.index! + t[0].length);
      }
      corners.push(parse(c.input.slice(0, head) + text));
    }
  }
  for (const k of corners) {
    const v = k.to(space);
    v.coords.forEach((x, i) => {
      const d = hue[i] ? circular(x - center.coords[i]!) : Math.abs(x - center.coords[i]!);
      out[i] = Math.max(out[i]!, d);
    });
    out[out.length - 1] = Math.max(out.at(-1)!, Math.abs(v.alpha - center.alpha));
  }
  return out;
}

export function checkConversionCase(c: FixtureCase): void {
  if (c.inputChannels) return checkTableCase(c);
  const input = parse(c.input);
  const expected = parse(c.expected!);
  const target = expected.constructor as ColorModel;
  const actual = target === Srgb8 ? input.to(Srgb) : input.to(target);
  const reference = target === Srgb8 ? expected.to(Srgb) : expected;
  const spread = inputSpread(c, target);
  const tol = tolerances(c, expected).map((t, i) => (target === Srgb8 ? t / 255 : t) + spread[i]!);
  const channels = channelList(actual.constructor as ColorModel);
  const bad: string[] = [];
  channels.forEach(([name, ch], i) => {
    const x = actual.coords[i]!;
    const y = reference.coords[i]!;
    let d = Math.abs(x - y);
    if (ch.hue) {
      d %= 360;
      if (d > 180) d = 360 - d;
      if (/none/i.test(c.expected!) || (reference as { isAchromatic?(): boolean }).isAchromatic?.()) return;
    }
    if (!(d <= tol[i]! + 1e-12)) bad.push(`${name} ${x} vs ${y} (±${tol[i]})`);
  });
  if (!(Math.abs(actual.alpha - reference.alpha) <= tol[channels.length]! + 1e-12)) {
    bad.push(`alpha ${actual.alpha} vs ${reference.alpha}`);
  }
  if (bad.length) throw new Error(`${c.id} ${c.input} → ${c.expected} [${c.src} ${c.at}]: ${bad.join("; ")}`);
}

export function checkParseCase(c: FixtureCase): void {
  if (c.expected === null) {
    expect(() => parse(c.input), `${c.id} ${c.input} [${c.at}]`).toThrow(SyntaxError);
    return;
  }
  checkConversionCase(c);
}

// --- strings ------------------------------------------------------------------------------------------

export function checkStrings(model: ColorModel, spec: ModelSpec): void {
  const parseModel = (model as unknown as { parse(s: string): Color }).parse;
  for (const [input, coords, alpha] of spec.strings ?? []) {
    const c = parseModel(input);
    expect([...c.coords], input).toEqual(coords);
    expect(c.alpha, input).toBe(alpha);
  }
  for (const input of spec.invalid ?? []) expect(() => parseModel(input), input).toThrow(SyntaxError);
  for (const [input, css] of spec.formats ?? []) {
    expect((parseModel(input) as unknown as { toCss(): string }).toCss(), input).toBe(css);
  }
  const tryParse = (model as unknown as { tryParse(s: string): { isPresent(): boolean } }).tryParse;
  expect(tryParse.call(model, "not a color").isPresent()).toBe(false);
  fc.assert(
    fc.property(domainOf(model), (c) => {
      const back = parseModel(c.toString());
      expect(back.equals(c), c.toString()).toBe(true);
      const css = (c as { toCss?(o?: object): string }).toCss;
      if (css) checkCss(model, c, parseModel(css.call(c)));
    })
  );
}

/** `toCss()` rounds each channel to `decimalsFor(channel, 5)` places: half a unit of that place is the bound. */
function checkCss(model: ColorModel, original: Color, rounded: Color): void {
  const canon = comparisons.get(model)?.canonical ?? ((c: readonly number[]) => c);
  const a = canon(rounded.coords);
  const b = canon(original.coords);
  channelList(model).forEach(([name, ch], i) => {
    const bound = 0.5 * 10 ** -decimalsFor(ch, 5) + 1e-15;
    if (Number.isNaN(a[i]) || Number.isNaN(b[i])) return;
    let d = Math.abs(a[i]! - b[i]!);
    if (ch.hue) {
      d %= 360;
      if (d > 180) d = 360 - d;
    }
    expect(d, `${name}: ${original.toString()} → ${rounded.toString()}`).toBeLessThanOrEqual(bound);
  });
  expect(Math.abs(rounded.alpha - original.alpha)).toBeLessThanOrEqual(0.5e-5 + 1e-15);
}

export function checkCrossCheck(model: ColorModel, all: readonly ColorModel[], cross: CrossCheck): void {
  const byId = new Map(all.map((m) => [m.id, m]));
  for (const c of cross.cases) {
    const target = byId.get(c.to)!;
    const ours = construct(model, c.input).to(target);
    const tol = cross.toleranceFor?.[`${model.id}>${c.to}`] ?? cross.tolerance;
    const weight = comparisons.get(target)?.hueWeight?.(ours.coords);
    channelList(target).forEach(([name, ch], i) => {
      let d = Math.abs(ours.coords[i]! - c.expected[i]!);
      if (ch.hue) {
        if ((ours as { isAchromatic?(): boolean }).isAchromatic?.()) return;
        d = Math.min(d % 360, 360 - (d % 360)) * ((Math.PI / 180) * (weight ?? 1));
      }
      if (!(d <= tol)) {
        throw new Error(
          `${model.id}(${c.input.join(" ")}) → ${c.to}.${name}: ${ours.coords[i]} vs ${cross.source} ${c.expected[i]} (±${tol})`
        );
      }
    });
  }
}

// --- entry point --------------------------------------------------------------------------------------

/** Runs every row of the per-model test matrix (CLAUDE.md, ADR-008) for `model`. */
export function describeModel(model: ColorModel, all: readonly ColorModel[], spec: ModelSpec = {}): void {
  describe(`${model.id}: test matrix`, () => {
    it("shape: id, channel order, of, toJSON, clone, to(self)", () => checkShape(model));
    it("boundaries: every corner, every channel end and just outside", () => checkBoundaries(model));
    it("degenerate: NaN / ±Infinity throw and leave the color unchanged", () => checkDegenerate(model));
    it("edges: round trips with every direct neighbour, both ways (grid + fast-check)", () => checkEdges(model, all));
    it("totality: finite result or RangeError for any finite input; never throws on realistic input", () =>
      checkTotality(model, all, spec.realistic));
    it("strings: parse ↔ toString exact, toCss within rounding, fixed cases", () => checkStrings(model, spec));
    const fixtures = spec.fixtures;
    const cross = fixtures?.crossCheck;
    if (cross) {
      it(`cross-check: ${cross.cases.length} grid conversions against ${cross.source}`, () =>
        checkCrossCheck(model, all, cross));
    }
    if (fixtures && fixtures.conversions.length > 0) {
      it.each(fixtures.conversions.map((c) => [c.id, c] as const))("reference %s", (_, c) => checkConversionCase(c));
    }
    if (fixtures && fixtures.parse.length > 0) {
      it.each(fixtures.parse.map((c) => [c.id, c] as const))("parse %s", (_, c) => checkParseCase(c));
    }
  });
}
