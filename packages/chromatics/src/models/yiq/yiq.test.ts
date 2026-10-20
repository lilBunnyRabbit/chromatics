import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { RGB_TO_YIQ } from "../../core/matrices.js";
import { describeModel } from "../../testing/harness.js";
import { BARS, LUMINANCE_TOLERANCE } from "../../testing/smpte-170m-bars.js";
import { Srgb } from "../srgb/srgb.js";
import { Yiq } from "./yiq.js";

describeModel(Yiq, models, {
  strings: [["yiq(0.5 -0.1 0.2)", [0.5, -0.1, 0.2], 1]],
});

describe("Yiq references", () => {
  // SMPTE 170M-2004 Annex A eq. 8–9: I and Q in terms of G, B, R, printed to 6 decimals.
  it("matches 170M's RGB form", () => {
    const expected = [
      [0.595901, -0.274557, -0.321344],
      [0.211537, -0.522736, 0.3112],
    ];
    expected.forEach((row, i) =>
      row.forEach((e, j) => expect(Math.abs(RGB_TO_YIQ[i + 1]![j]! - e)).toBeLessThan(1e-6))
    );
  });

  // I and Q rotate the reduced b − y, r − y (Annex A.4), so the bars' chroma level (Table A.1) is 185·|(i, q)|.
  it.each(BARS)("%s bar chroma level matches SMPTE 170M Table A.1", (_, rgb, luminance, chroma) => {
    const c = new Srgb(rgb[0], rgb[1], rgb[2]).to(Yiq);
    expect(Math.abs(92.5 * c.y + 7.5 - luminance)).toBeLessThan(LUMINANCE_TOLERANCE);
    expect(Math.abs(185 * Math.hypot(c.i, c.q) - chroma)).toBeLessThan(1.5e-4);
  });
});
