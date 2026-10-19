import { describe, expect, it } from "vitest";
import { parse } from "../../all.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import fixtures from "./wcag.fixtures.json" with { type: "json" };
import { Srgb } from "./srgb.js";

const srgb = (text: string) => parse(text).to(Srgb);

describe("WCAG 2.2 contrast", () => {
  // WAI Understanding / Techniques examples; ratios are published to one decimal (or as "3:1").
  it.each(fixtures.examples.map((e) => [e.fg, e.bg, e.published_ratio, e.url, "knownDiscrepancy" in e] as const))(
    "%s on %s is %s (%s)",
    (fg, bg, published, _, discrepancy) => {
      if (discrepancy) {
        expect(srgb(fg).contrast(srgb(bg))).toBeGreaterThanOrEqual(3);
        return;
      }
      const value = published.split(":")[0]!;
      const decimals = value.includes(".") ? value.split(".")[1]!.length : 0;
      expect(Math.abs(srgb(fg).contrast(srgb(bg)) - Number(value))).toBeLessThanOrEqual(0.5 * 10 ** -decimals);
    }
  );

  it("ranges from 1 to 21 (#dfn-contrast-ratio Note 1) and is symmetric", () => {
    const white = new Srgb(1, 1, 1);
    const black = new Srgb(0, 0, 0);
    expect(white.contrast(black)).toBe(21);
    expect(white.contrast(white)).toBe(1);
    const a = srgb("#767676");
    expect(a.contrast(white)).toBe(white.contrast(a));
  });

  it("uses WCAG's literal coefficients, not the exact matrix row (grill 43)", () => {
    // #006ffb on white: 4.4999 by WCAG's 0.2126 / 0.7152 / 0.0722, 4.5001 by the exact sRGB row.
    expect(srgb("#006ffb").contrast(new Srgb(1, 1, 1))).toBeLessThan(4.5);
  });
});

describe("luminance", () => {
  it("is Y of the exact conversion, and white is exactly 1", () => {
    expect(new Srgb(1, 1, 1).luminance()).toBe(1);
    expect(new Srgb(0, 0, 0).luminance()).toBe(0);
    for (const c of [srgb("#767676"), srgb("#ff8000"), srgb("rebeccapurple"), new Srgb(1.2, -0.1, 0.5)]) {
      expect(c.luminance()).toBe(c.to(Xyz65).y);
    }
  });
});
