import type { Color } from "./core/color.js";
import { invalid } from "./core/css.js";
import type { ColorModel } from "./core/model.js";
import { A98Rgb } from "./models/a98-rgb/a98-rgb.js";
import { Cam16Lcd } from "./models/cam16-lcd/cam16-lcd.js";
import { Cam16Scd } from "./models/cam16-scd/cam16-scd.js";
import { Cam16Ucs } from "./models/cam16-ucs/cam16-ucs.js";
import { Cam16 } from "./models/cam16/cam16.js";
import { Ciecam02 } from "./models/ciecam02/ciecam02.js";
import { Din99 } from "./models/din99/din99.js";
import { Din99Lch } from "./models/din99-lch/din99-lch.js";
import { Din99o } from "./models/din99o/din99o.js";
import { Din99oLch } from "./models/din99o-lch/din99o-lch.js";
import { HunterLab } from "./models/hunter-lab/hunter-lab.js";
import { Ipt } from "./models/ipt/ipt.js";
import { Xyb } from "./models/xyb/xyb.js";
import { DisplayP3 } from "./models/display-p3/display-p3.js";
import { Hct } from "./models/hct/hct.js";
import { LinearDisplayP3 } from "./models/linear-display-p3/linear-display-p3.js";
import { ProphotoRgb } from "./models/prophoto-rgb/prophoto-rgb.js";
import { Rec2020 } from "./models/rec2020/rec2020.js";
import { Ycbcr601 } from "./models/ycbcr-601/ycbcr-601.js";
import { Ycbcr709 } from "./models/ycbcr-709/ycbcr-709.js";
import { Ycbcr2020 } from "./models/ycbcr-2020/ycbcr-2020.js";
import { Yiq } from "./models/yiq/yiq.js";
import { Yuv } from "./models/yuv/yuv.js";
import { Ydbdr } from "./models/ydbdr/ydbdr.js";
import { Ycgco } from "./models/ycgco/ycgco.js";
import { Aces2065 } from "./models/aces2065-1/aces2065-1.js";
import { Acescg } from "./models/acescg/acescg.js";
import { Acescc } from "./models/acescc/acescc.js";
import { Acescct } from "./models/acescct/acescct.js";
import { SmpteC } from "./models/smpte-c/smpte-c.js";
import { Rec2100Pq } from "./models/rec2100-pq/rec2100-pq.js";
import { Rec2100Hlg } from "./models/rec2100-hlg/rec2100-hlg.js";
import { Hpluv } from "./models/hpluv/hpluv.js";
import { Hsl } from "./models/hsl/hsl.js";
import { Hsluv } from "./models/hsluv/hsluv.js";
import { Hsv } from "./models/hsv/hsv.js";
import { Cmy } from "./models/cmy/cmy.js";
import { Cmyk } from "./models/cmyk/cmyk.js";
import { Ryb } from "./models/ryb/ryb.js";
import { Hsi } from "./models/hsi/hsi.js";
import { Hsp } from "./models/hsp/hsp.js";
import { Tsl } from "./models/tsl/tsl.js";
import { Cubehelix } from "./models/cubehelix/cubehelix.js";
import { Hwb } from "./models/hwb/hwb.js";
import { IctcpHlg } from "./models/ictcp-hlg/ictcp-hlg.js";
import { Ictcp } from "./models/ictcp/ictcp.js";
import { Jzazbz } from "./models/jzazbz/jzazbz.js";
import { Jzczhz } from "./models/jzczhz/jzczhz.js";
import { Lab } from "./models/lab/lab.js";
import { Lab65 } from "./models/lab65/lab65.js";
import { Lch } from "./models/lch/lch.js";
import { Lch65 } from "./models/lch65/lch65.js";
import { Lchuv50 } from "./models/lchuv50/lchuv50.js";
import { Lchuv65 } from "./models/lchuv65/lchuv65.js";
import { Luv50 } from "./models/luv50/luv50.js";
import { Luv65 } from "./models/luv65/luv65.js";
import { LinearSrgb } from "./models/linear-srgb/linear-srgb.js";
import { Oklab } from "./models/oklab/oklab.js";
import { Okhsl } from "./models/okhsl/okhsl.js";
import { Okhsv } from "./models/okhsv/okhsv.js";
import { Oklch } from "./models/oklch/oklch.js";
import { Srgb } from "./models/srgb/srgb.js";
import { Srgb8 } from "./models/srgb8/srgb8.js";
import { Lms } from "./models/lms/lms.js";
import { Uvw64 } from "./models/uvw64/uvw64.js";
import { Uvy60 } from "./models/uvy60/uvy60.js";
import { Uvy76 } from "./models/uvy76/uvy76.js";
import { Xyy } from "./models/xyy/xyy.js";
import { Xyz50 } from "./models/xyz50/xyz50.js";
import { Xyz65 } from "./models/xyz65/xyz65.js";

export { path, reachable } from "./core/router.js";

/** Every model the package ships, for listings and graph queries. Importing it bundles all of them. */
export const models: readonly ColorModel[] = [
  Xyz65,
  Xyz50,
  LinearSrgb,
  Srgb,
  Srgb8,
  DisplayP3,
  LinearDisplayP3,
  A98Rgb,
  ProphotoRgb,
  Rec2020,
  Rec2100Pq,
  Rec2100Hlg,
  SmpteC,
  Aces2065,
  Acescg,
  Acescc,
  Acescct,
  Ycbcr601,
  Ycbcr709,
  Ycbcr2020,
  Yiq,
  Yuv,
  Ydbdr,
  Ycgco,
  Oklab,
  Oklch,
  Okhsl,
  Okhsv,
  Lab,
  Lch,
  Lab65,
  Lch65,
  Luv65,
  Luv50,
  Lchuv65,
  Lchuv50,
  Hsluv,
  Hpluv,
  Hsl,
  Hsv,
  Hwb,
  Hsi,
  Hsp,
  Cubehelix,
  Tsl,
  Cmy,
  Cmyk,
  Ryb,
  Jzazbz,
  Jzczhz,
  Ictcp,
  IctcpHlg,
  Cam16,
  Cam16Ucs,
  Cam16Lcd,
  Cam16Scd,
  Ciecam02,
  Hct,
  Xyy,
  Uvy76,
  Uvy60,
  Uvw64,
  Lms,
  Ipt,
  HunterLab,
  Din99,
  Din99Lch,
  Din99o,
  Din99oLch,
  Xyb,
];

const FUNCTIONS: Readonly<Record<string, (input: string) => Color>> = {
  rgb: Srgb.parse,
  rgba: Srgb.parse,
  hsl: Hsl.parse,
  hsla: Hsl.parse,
  hwb: Hwb.parse,
  hsv: Hsv.parse,
  hsi: Hsi.parse,
  hsp: Hsp.parse,
  cubehelix: Cubehelix.parse,
  tsl: Tsl.parse,
  lab: Lab.parse,
  lch: Lch.parse,
  oklab: Oklab.parse,
  oklch: Oklch.parse,
  "lab-d65": Lab65.parse,
  "lch-d65": Lch65.parse,
  "luv-d65": Luv65.parse,
  "luv-d50": Luv50.parse,
  "lchuv-d65": Lchuv65.parse,
  "lchuv-d50": Lchuv50.parse,
  hsluv: Hsluv.parse,
  hpluv: Hpluv.parse,
  okhsl: Okhsl.parse,
  okhsv: Okhsv.parse,
  jzazbz: Jzazbz.parse,
  jzczhz: Jzczhz.parse,
  ictcp: Ictcp.parse,
  "ictcp-hlg": IctcpHlg.parse,
  cam16: Cam16.parse,
  "cam16-ucs": Cam16Ucs.parse,
  "cam16-lcd": Cam16Lcd.parse,
  "cam16-scd": Cam16Scd.parse,
  ciecam02: Ciecam02.parse,
  hct: Hct.parse,
  xyy: Xyy.parse,
  "uvy-1976": Uvy76.parse,
  "uvy-1960": Uvy60.parse,
  "uvw-1964": Uvw64.parse,
  lms: Lms.parse,
  din99: Din99.parse,
  "din99-lch": Din99Lch.parse,
  din99o: Din99o.parse,
  "din99o-lch": Din99oLch.parse,
  "hunter-lab": HunterLab.parse,
  ipt: Ipt.parse,
  xyb: Xyb.parse,
  "aces2065-1": Aces2065.parse,
  acescg: Acescg.parse,
  acescc: Acescc.parse,
  acescct: Acescct.parse,
  "smpte-c": SmpteC.parse,
  "ycbcr-601": Ycbcr601.parse,
  "ycbcr-709": Ycbcr709.parse,
  "ycbcr-2020": Ycbcr2020.parse,
  yiq: Yiq.parse,
  yuv: Yuv.parse,
  ydbdr: Ydbdr.parse,
  ycgco: Ycgco.parse,
  cmy: Cmy.parse,
  "device-cmyk": Cmyk.parse,
  ryb: Ryb.parse,
};

const SPACES: Readonly<Record<string, (input: string) => Color>> = {
  srgb: Srgb.parse,
  "srgb-linear": LinearSrgb.parse,
  "display-p3": DisplayP3.parse,
  "display-p3-linear": LinearDisplayP3.parse,
  "a98-rgb": A98Rgb.parse,
  "prophoto-rgb": ProphotoRgb.parse,
  rec2020: Rec2020.parse,
  "rec2100-pq": Rec2100Pq.parse,
  "rec2100-hlg": Rec2100Hlg.parse,
  xyz: Xyz65.parse,
  "xyz-d65": Xyz65.parse,
  "xyz-d50": Xyz50.parse,
};

/**
 * Parses any syntax the package knows into its own model: hex and named colors give `Srgb8`, `rgb()`
 * gives `Srgb`, `oklch()` gives `Oklch`, `color(display-p3 …)` gives `DisplayP3`, and so on. Narrow
 * the result with `is()`.
 *
 * Bundles every parser; when you know the syntax, `Oklch.parse` alone is smaller.
 *
 * @throws {SyntaxError} on anything unrecognised.
 * @example
 * ```ts
 * const c = parse("oklch(70% 0.15 30)");
 * if (c.is(Oklch)) c.h += 180;
 * parse("#ff8000").to(Lab);
 * ```
 */
export function parse(input: string): Color {
  const text = input.trim().toLowerCase();
  const name = /^([a-z][a-z0-9-]*)\(/.exec(text)?.[1];
  if (name === undefined) return Srgb8.parse(input);
  if (name === "color") {
    const space = /^color\(\s*([a-z0-9-]+)/.exec(text)?.[1] ?? "";
    const parser = Object.hasOwn(SPACES, space) ? SPACES[space] : undefined;
    if (!parser) throw invalid(input, `unknown color space "${space}"`);
    return parser(input);
  }
  const parser = Object.hasOwn(FUNCTIONS, name) ? FUNCTIONS[name] : undefined;
  if (!parser) throw invalid(input, `unknown function ${name}()`);
  return parser(input);
}
