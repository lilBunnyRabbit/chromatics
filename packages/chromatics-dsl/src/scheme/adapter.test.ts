import { test, expect, describe } from "vitest";
import { Srgb, Srgb8, type Color } from "@lilbunnyrabbit/chromatics";
import { evaluate } from "../evaluator.js";
import { schemeFromEvalResult } from "./adapter.js";

const hexOf = (c: Color) => c.to(Srgb).gamutMap().to(Srgb8).toHex();

const SRC = `bg = Oklch(0.2, 0.02, 250)
fg = bg.to(Oklch).lighten(0.6)
brand = parse("#6c5ce7")
success = Hsl(140, 0.6, 0.4)
spacing = 8`;

function scheme(src: string) {
  return schemeFromEvalResult(evaluate(src), src);
}

describe("schemeFromEvalResult", () => {
  const s = scheme(SRC);

  test("partitions colors from non-color vars", () => {
    expect(s.entries.map((e) => e.name)).toEqual(["bg", "fg", "brand", "success"]);
    expect(s.nonColorVars.map((v) => v.name)).toEqual(["spacing"]);
  });

  test("byName lookup + flat index space", () => {
    const brand = s.byName.get("brand");
    expect(brand && hexOf(brand.color)).toBe("#6c5ce7");
    expect(s.entries.map((e) => e.index)).toEqual([0, 1, 2, 3]);
  });

  test("the authoring model is the colour class — constructor names it, derived tracks its own", () => {
    expect(s.byName.get("bg")?.color.model).toBe("oklch");
    expect(s.byName.get("brand")?.color.model).toBe("srgb8");
    expect(s.byName.get("success")?.color.model).toBe("hsl");
    expect(s.byName.get("fg")?.color.model).toBe("oklch");
  });

  test("description = source slice of the RHS", () => {
    expect(s.byName.get("bg")?.description).toBe("Oklch(0.2, 0.02, 250)");
    expect(s.byName.get("fg")?.description).toBe("bg.to(Oklch).lighten(0.6)");
  });

  test("preserves the dependency graph", () => {
    expect(s.byName.get("fg")?.deps).toEqual(["bg"]);
  });

  test("carries evaluator errors through", () => {
    const bad = scheme("a = Oklch(0.5, 0.1, 200)\nb = nope.x");
    expect(bad.errors.length).toBe(1);
    expect(bad.errors[0]!.line).toBe(2);
    expect(bad.entries.map((e) => e.name)).toEqual(["a"]);
  });
});
