import { describe, expect, it } from "vitest";
import { finite, wrapHue } from "../core/channel.js";
import { Color } from "../core/color.js";
import { readFunction, serialize } from "../core/css.js";
import { edge } from "../core/edge.js";
import type { ColorModel, Edge } from "../core/model.js";
import { Srgb } from "../models/srgb/srgb.js";
import { checkBoundaries, checkDegenerate, checkEdges, checkShape, checkStrings, checkTotality } from "./harness.js";

interface Faults {
  readonly id?: string;
  readonly skipValidation?: boolean;
  readonly noWrap?: boolean;
  readonly swappedCoords?: boolean;
  readonly lossyString?: boolean;
  readonly badInverse?: boolean;
  readonly overflow?: boolean;
}

// A minimal sRGB-backed model (`h` is a hue, `a` / `b` plain), with switches that each break one row.
function model(faults: Faults = {}): ColorModel {
  const id = faults.id ?? "test-good";
  class Probe extends Color {
    static readonly id = id;
    static readonly channels = {
      h: { range: [0, 360], hue: true },
      a: { range: [0, 1] },
      b: { range: [0, 1] },
    } as const;
    static readonly edges: readonly Edge[] = [
      edge(
        Srgb,
        (c: Probe) => new Srgb(c.h / 360, faults.overflow ? c.a * 1e308 * 10 : c.a, c.b, c.alpha),
        (c) => new Probe(c.r * 360, faults.badInverse ? c.g * 1.001 : c.g, c.b, c.alpha)
      ),
    ];
    static readonly terminal = false;
    private _h: number;
    private _a: number;
    private _b: number;
    constructor(h: number, a: number, b: number, alpha = 1) {
      super(alpha);
      this._h = faults.noWrap ? h : wrapHue(h, id);
      this._a = faults.skipValidation ? a : finite(a, id, "a");
      this._b = finite(b, id, "b");
    }
    get model(): string {
      return id;
    }
    get h(): number {
      return this._h;
    }
    set h(v: number) {
      this._h = faults.noWrap ? v : wrapHue(v, id);
    }
    get a(): number {
      return this._a;
    }
    set a(v: number) {
      this._a = faults.skipValidation ? v : finite(v, id, "a");
    }
    get b(): number {
      return this._b;
    }
    set b(v: number) {
      this._b = finite(v, id, "b");
    }
    get coords(): readonly number[] {
      return faults.swappedCoords ? [this._h, this._b, this._a] : [this._h, this._a, this._b];
    }
    static parse(input: string): Probe {
      const { coords, alpha } = readFunction(input, [id], Probe.channels);
      return new Probe(coords[0]!, coords[1]!, coords[2]!, alpha);
    }
    override toString(): string {
      const coords = faults.lossyString ? this.coords.map((v) => Math.round(v * 1e6) / 1e6) : this.coords;
      return serialize(id, Probe.channels, coords, this.alpha, "exact");
    }
  }
  return Probe;
}

describe("harness rejects broken models (grill 20)", () => {
  const all = [Srgb];

  it("a correct model passes every row", () => {
    const good = model();
    checkShape(good);
    checkBoundaries(good);
    checkDegenerate(good);
    checkEdges(good, all);
    checkStrings(good, {});
    checkTotality(good, all);
  });

  it("shape: coords in the wrong channel order", () => {
    expect(() => checkShape(model({ swappedCoords: true }))).toThrow();
  });

  it("boundaries: a hue that doesn't wrap", () => {
    expect(() => checkBoundaries(model({ noWrap: true }))).toThrow();
  });

  it("degenerate: a setter that accepts NaN", () => {
    expect(() => checkDegenerate(model({ skipValidation: true }))).toThrow();
  });

  it("edges: a backward conversion that isn't the inverse", () => {
    expect(() => checkEdges(model({ badInverse: true }), all)).toThrow();
  });

  it("strings: a toString that loses digits", () => {
    expect(() => checkStrings(model({ lossyString: true }), {})).toThrow();
  });

  it("strings: a fixed case that parses to the wrong value", () => {
    expect(() =>
      checkStrings(model({ id: "test-strings" }), { strings: [["test-strings(10 0.5 0.5)", [11, 0.5, 0.5], 1]] })
    ).toThrow();
  });

  it("totality: a conversion that overflows on realistic input", () => {
    expect(() => checkTotality(model({ overflow: true }), all)).toThrow();
  });
});
