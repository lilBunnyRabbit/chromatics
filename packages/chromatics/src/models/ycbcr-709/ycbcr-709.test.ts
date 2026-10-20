import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { Srgb } from "../srgb/srgb.js";
import { Ycbcr709 } from "./ycbcr-709.js";

describeModel(Ycbcr709, models, {
  strings: [["ycbcr-709(0.5 -0.1 0.2)", [0.5, -0.1, 0.2], 1]],
});

describe("Ycbcr709 references", () => {
  // colour-science `colour/models/rgb/tests/test_ycbcr.py:252-254` @ 248121e3: BT.709 (its default), 8-bit
  // legal range as floats. BT.709-6 item 3.4 maps the float form there as Y = (219·Y′ + 16)/255 and
  // C = (224·C + 128)/255, inverted here.
  it("matches colour-science's legal-range vector", () => {
    const c = new Srgb(0.75, 0.75, 0).to(Ycbcr709);
    const legal = [0.66035745, 0.17254902, 0.53216593];
    expect(c.y).toBeCloseTo((legal[0]! * 255 - 16) / 219, 8);
    expect(c.cb).toBeCloseTo((legal[1]! * 255 - 128) / 224, 8);
    expect(c.cr).toBeCloseTo((legal[2]! * 255 - 128) / 224, 8);
  });

  // BT.709-6 items 3.2–3.3: E′Y = 0.2126 E′R + 0.7152 E′G + 0.0722 E′B; E′CB = (E′B − E′Y)/1.8556,
  // E′CR = (E′R − E′Y)/1.5748.
  it("blue and red reach ±0.5", () => {
    expect(new Srgb(0, 0, 1).to(Ycbcr709).cb).toBeCloseTo(0.5, 14);
    expect(new Srgb(1, 0, 0).to(Ycbcr709).cr).toBeCloseTo(0.5, 14);
    expect(new Srgb(0, 1, 0).to(Ycbcr709).y).toBeCloseTo(0.7152, 14);
  });
});
