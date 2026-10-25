import { expect } from "vitest";
import type { Color } from "../core/color.js";
import type { ColorModel } from "../core/model.js";
import { Srgb8 } from "../models/srgb8/srgb8.js";
import snapshot from "../models/luv65/hsluv-snapshot.fixtures.json" with { type: "json" };

export type SnapshotColumn = "luv" | "lch" | "hsluv" | "hpluv";

/**
 * Checks `model` against one column of the HSLuv snapshot (ADR-011, secondary). Values are compared in
 * the snapshot's own units through `toSnapshot`; a hue error is weighted by `chroma` (arc length).
 */
export function checkSnapshot(
  model: ColorModel,
  column: SnapshotColumn,
  toSnapshot: (c: Color) => readonly number[],
  hue?: { readonly index: number; readonly chroma: (expected: readonly number[]) => number }
): void {
  for (const c of snapshot.cases) {
    const expected = c[column];
    const actual = toSnapshot(Srgb8.parse(c.hex).to(model));
    actual.forEach((x, i) => {
      let d = Math.abs(x - expected[i]!);
      if (hue?.index === i) {
        d %= 360;
        d = Math.min(d, 360 - d) * (Math.PI / 180) * hue.chroma(expected);
      }
      expect(d, `${c.hex} ${column}[${i}]: ${x} vs ${expected[i]} [${snapshot.source}]`).toBeLessThanOrEqual(
        snapshot.tolerance
      );
    });
  }
}
