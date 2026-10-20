import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { Srgb } from "../srgb/srgb.js";
import { BARS, LUMINANCE_TOLERANCE } from "../../testing/smpte-170m-bars.js";
import { Yuv } from "./yuv.js";

describeModel(Yuv, models, {
  strings: [["yuv(0.5 -0.1 0.2)", [0.5, -0.1, 0.2], 1]],
});

describe("Yuv references", () => {
  it.each(BARS)("%s bar matches SMPTE 170M Table A.1", (_, rgb, luminance, chroma, phase) => {
    const c = new Srgb(rgb[0], rgb[1], rgb[2]).to(Yuv);
    expect(Math.abs(92.5 * c.y + 7.5 - luminance)).toBeLessThan(LUMINANCE_TOLERANCE);
    expect(Math.abs(185 * Math.hypot(c.u, c.v) - chroma)).toBeLessThan(1.5e-4);
    const angle = ((Math.atan2(c.v, c.u) * 180) / Math.PI + 360) % 360;
    expect(Math.abs(angle - phase)).toBeLessThan(1e-4);
  });
});
