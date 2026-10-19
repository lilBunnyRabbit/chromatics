import { expect } from "vitest";
import type { ColorModel } from "../core/model.js";
import fixtures from "../models/okhsl/colorjs.fixtures.json" with { type: "json" };
import { Srgb } from "../models/srgb/srgb.js";

/** Checks `model` against color.js's own conversion tests (secondary, ADR-011) at their asserted epsilon. */
export function checkColorjs(model: ColorModel, key: "okhsl" | "okhsv"): void {
  for (const c of fixtures[key]) {
    const actual = new Srgb(...(c.srgb as [number, number, number])).to(model).coords;
    c.expected.forEach((e, i) => {
      if (e === null) return;
      let d = Math.abs(actual[i]! - e);
      if (i === 0) d = Math.min(d % 360, 360 - (d % 360));
      expect(d, `${c.name} [${fixtures.source} line ${c.at}]`).toBeLessThanOrEqual(fixtures.epsilon);
    });
  }
}
