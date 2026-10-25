import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { exact, exactPercent, parseFunction, readAlpha, rounded, serialize, shiftDecimal } from "./css.js";

describe("shiftDecimal", () => {
  it.each([
    ["0.5", 2, "50"],
    ["0.123456789", 2, "12.3456789"],
    ["12.5", -2, "0.125"],
    ["5e-324", 2, "5e-322"],
    ["1e-7", 2, "0.00001"],
    ["-0.25", 2, "-25"],
    ["0", 2, "0"],
    ["100", -2, "1"],
  ])("%s shifted by %d is %s", (text, by, expected) => {
    expect(shiftDecimal(text, by)).toBe(expected);
  });

  it("String(x) shifted by 2 and back is x, bit for bit (x * 100 / 100 isn't, for ~15% of doubles)", () => {
    fc.assert(
      fc.property(fc.double({ noNaN: true, noDefaultInfinity: true }), (x) => {
        expect(Number(shiftDecimal(shiftDecimal(exact(x), 2), -2))).toBe(Object.is(x, -0) ? 0 : x);
      })
    );
  });
});

describe("angles (CSS Values 4 <angle>: 360deg = 400grad = 2π rad = 1turn)", () => {
  it.each([
    ["30", 30],
    ["30deg", 30],
    ["400grad", 360],
    ["100grad", 90],
    ["0.5turn", 180],
    ["1turn", 360],
  ])("%s is %s degrees", (text, degrees) => {
    const [c] = parseFunction(`hsl(${text} 0% 0%)`).args;
    expect(c!.kind === "number" || c!.kind === "angle" ? c!.value : NaN).toBeCloseTo(degrees, 12);
  });

  it("rad converts through π", () => {
    const [c] = parseFunction(`hsl(3.141592653589793rad 0% 0%)`).args;
    expect(c!.kind === "angle" ? c!.value : NaN).toBeCloseTo(180, 12);
  });
});

describe("syntax", () => {
  it("is case-insensitive and ignores comments", () => {
    const f = parseFunction("RGB( /* a */ 1, 2 ,3 )");
    expect(f.name).toBe("rgb");
    expect(f.legacy).toBe(true);
    expect(f.args.map((c) => (c.kind === "number" ? c.value : NaN))).toEqual([1, 2, 3]);
  });

  it.each([
    "rgb(1 2 3",
    "rgb(1, 2 3)",
    "rgb(1 2 3 / 4 / 5)",
    "rgb(1, 2, 3 / 4)",
    "rgb(1. 2 3)",
    "rgb(1 2 3 /)",
    "(1 2 3)",
  ])("rejects %s", (input) => {
    expect(() => parseFunction(input)).toThrow(SyntaxError);
  });
});

describe("alpha", () => {
  it.each([
    [undefined, 1],
    [{ kind: "number", value: 0.5 } as const, 0.5],
    [{ kind: "percent", value: 0.5 } as const, 0.5],
    [{ kind: "none" } as const, 0],
    [{ kind: "number", value: 2 } as const, 1],
    [{ kind: "number", value: -1 } as const, 0],
  ])("%j reads as %s (clamped to [0, 1] at parse time)", (c, expected) => {
    expect(readAlpha(c, "x")).toBe(expected);
  });
});

describe("serialize", () => {
  const channels = { l: { range: [0, 1] }, c: { range: [0, 0.4] }, h: { range: [0, 360], hue: true } } as const;

  it("omits alpha exactly 1, as CSS serializes it", () => {
    expect(serialize("oklch", channels, [0.5, 0.1, 30], 1, "exact")).toBe("oklch(0.5 0.1 30)");
    expect(serialize("oklch", channels, [0.5, 0.1, 30], 0.5, "exact")).toBe("oklch(0.5 0.1 30 / 0.5)");
  });

  it("rounds per channel range and never writes -0", () => {
    expect(serialize("oklch", channels, [0.123456789, 0.123456789, 123.456789], 1, {})).toBe(
      "oklch(0.12346 0.12346 123.46)"
    );
    expect(rounded(-0.000001, 3)).toBe("0");
    expect(exactPercent(0.5)).toBe("50%");
  });
});
