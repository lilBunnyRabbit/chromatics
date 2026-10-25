import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { Cmy } from "../cmy/cmy.js";
import { Srgb } from "../srgb/srgb.js";
import { Cmyk } from "./cmyk.js";

describeModel(Cmyk, models, {
  strings: [
    ["device-cmyk(0 0.81 0.81 0.3)", [0, 0.81, 0.81, 0.3], 1],
    ["device-cmyk(0 81% 81% 30%)", [0, 0.81, 0.81, 0.3], 1],
    ["device-cmyk(0, 0.81, 0.81, 0.3)", [0, 0.81, 0.81, 0.3], 1],
    ["device-cmyk(0 0.7 0.2 0 / 0.5)", [0, 0.7, 0.2, 0], 0.5],
  ],
  // CSS Color 5 §6: the comma form takes four numbers and no alpha.
  invalid: [
    "device-cmyk(0, 81%, 81%, 30%)",
    "device-cmyk(0, 0.8, 0.8, 0.3, 0.5)",
    "device-cmyk(0 0.8 0.8)",
    "cmyk(0 0 0 0)",
  ],
});

describe("Cmyk references", () => {
  // colour-science `colour/models/rgb/tests/test_cmyk.py` @248121e3 `CMY_to_CMYK` / `CMYK_to_CMY`, atol 1e-7.
  it.each([
    [
      [0.54379481, 0.96918929, 0.95908048],
      [0, 0.93246304, 0.91030457, 0.54379481],
    ],
    [
      [0.15, 1, 1],
      [0, 1, 1, 0.15],
    ],
    [
      [0.15, 0, 0],
      [0.15, 0, 0, 0],
    ],
  ] as const)("cmy %j ↔ cmyk %j", (cmy, cmyk) => {
    new Cmy(cmy[0], cmy[1], cmy[2])
      .to(Cmyk)
      .coords.forEach((v, i) => expect(Math.abs(v - cmyk[i]!)).toBeLessThanOrEqual(1e-7));
    new Cmyk(cmyk[0], cmyk[1], cmyk[2], cmyk[3])
      .to(Cmy)
      .coords.forEach((v, i) => expect(Math.abs(v - cmy[i]!)).toBeLessThanOrEqual(1e-7));
  });

  // CSS Color 5 ED 2026-10-08 §6 example: device-cmyk(0 81% 81% 30%) "would render as" rgb(178 34 34), whole
  // bytes, so within half a byte.
  it("device-cmyk(0 81% 81% 30%) ≈ rgb(178 34 34)", () => {
    const rgb = Cmyk.parse("device-cmyk(0 81% 81% 30%)").to(Srgb);
    rgb.coords.forEach((v, i) => expect(Math.abs(v * 255 - [178, 34, 34][i]!)).toBeLessThanOrEqual(0.5));
  });

  // §6.1 "or 0 if black is 1".
  it("black has no inks", () => {
    expect([...new Srgb(0, 0, 0).to(Cmyk).coords]).toEqual([0, 0, 0, 1]);
  });

  // §11.5 example: device-cmyk(0 81% 81% 30%) serializes as "device-cmyk(0 0.81 0.81 0.3)".
  it("toCss writes numbers, never percentages (§11.5)", () => {
    expect(Cmyk.parse("device-cmyk(0 81% 81% 30%)").toCss()).toBe("device-cmyk(0 0.81 0.81 0.3)");
  });
});

describe("Cmyk extras", () => {
  it("stores out-of-range channels instead of clamping them (ADR-003)", () => {
    const c = Cmyk.parse("device-cmyk(1.5 0 0 0)");
    expect(c.c).toBe(1.5);
    expect(c.to(Srgb).r).toBeCloseTo(-0.5, 15);
  });
});

// No independent source exists for proportional ink limiting (grill 81c): these check the definition.
describe("totalInk / limitInk", () => {
  it("totalInk is c + m + y + k as a fraction", () => {
    expect(new Cmyk(0.6, 0.5, 0.4, 0.9).totalInk()).toBeCloseTo(2.4, 15);
  });

  it("limitInk scales every ink by max / total, mutates and chains", () => {
    const c = new Cmyk(0.8, 0.8, 0.8, 0.8);
    expect(c.limitInk(2.4)).toBe(c);
    c.coords.forEach((v) => expect(v).toBeCloseTo(0.6, 15));
    expect(c.totalInk()).toBeCloseTo(2.4, 15);
  });

  it("leaves a color at or under the limit unchanged", () => {
    expect(new Cmyk(0.6, 0.6, 0.6, 0.6).limitInk(2.4).coords).toEqual([0.6, 0.6, 0.6, 0.6]);
    expect(new Cmyk(0, 0, 0, 0).limitInk(0).coords).toEqual([0, 0, 0, 0]);
  });

  it.each([-0.1, NaN, Infinity])("throws a RangeError for max %d", (max) => {
    expect(() => new Cmyk(1, 1, 1, 1).limitInk(max)).toThrow(RangeError);
  });
});
