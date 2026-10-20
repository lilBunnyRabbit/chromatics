import { Rational, apply, diagonal, invert, multiply, type Matrix3, type Vector3 } from "./rational.js";

interface Chromaticity {
  readonly x: string;
  readonly y: string;
}

const r = Rational.decimal;

// CSS Color 4 "Sample code for color conversions": `const D50` / `const D65`, 4-figure CIE x,y.
export const WHITES = {
  D50: { x: "0.3457", y: "0.3585" },
  D65: { x: "0.3127", y: "0.3290" },
  // Academy S-2008-001 §4.1.3 (ACES white; TB-2018-001: not CIE D60)
  ACES: { x: "0.32168", y: "0.33767" },
} as const satisfies Record<string, Chromaticity>;

export interface RgbSpace {
  readonly name: string;
  readonly red: Chromaticity;
  readonly green: Chromaticity;
  readonly blue: Chromaticity;
  readonly white: keyof typeof WHITES;
}

export const RGB_SPACES = [
  {
    // CSS Color 4, `srgb` characteristics table
    name: "SRGB",
    red: { x: "0.64", y: "0.33" },
    green: { x: "0.30", y: "0.60" },
    blue: { x: "0.15", y: "0.06" },
    white: "D65",
  },
  {
    // CSS Color 4, `display-p3` characteristics table
    name: "DISPLAY_P3",
    red: { x: "0.680", y: "0.320" },
    green: { x: "0.265", y: "0.690" },
    blue: { x: "0.150", y: "0.060" },
    white: "D65",
  },
  {
    // CSS Color 4 #predefined-a98-rgb characteristics table
    name: "A98_RGB",
    red: { x: "0.6400", y: "0.3300" },
    green: { x: "0.2100", y: "0.7100" },
    blue: { x: "0.1500", y: "0.0600" },
    white: "D65",
  },
  {
    // CSS Color 4 #predefined-prophoto-rgb characteristics table
    name: "PROPHOTO_RGB",
    red: { x: "0.734699", y: "0.265301" },
    green: { x: "0.159597", y: "0.840403" },
    blue: { x: "0.036598", y: "0.000105" },
    white: "D50",
  },
  {
    // CSS Color 4 #predefined-rec2020 characteristics table
    name: "REC2020",
    red: { x: "0.708", y: "0.292" },
    green: { x: "0.170", y: "0.797" },
    blue: { x: "0.131", y: "0.046" },
    white: "D65",
  },
  {
    // Academy S-2008-001 §4.1.2, AP0 (SMPTE ST 2065-1)
    name: "AP0",
    red: { x: "0.73470", y: "0.26530" },
    green: { x: "0.00000", y: "1.00000" },
    blue: { x: "0.00010", y: "-0.07700" },
    white: "ACES",
  },
  {
    // Academy S-2014-004 §4.3.1, AP1
    name: "AP1",
    red: { x: "0.713", y: "0.293" },
    green: { x: "0.165", y: "0.830" },
    blue: { x: "0.128", y: "0.044" },
    white: "ACES",
  },
  {
    // SMPTE 170M-2004 §4.1 (Note 1: "the SMPTE C set") and §4.2 (D65)
    name: "SMPTE_C",
    red: { x: "0.630", y: "0.340" },
    green: { x: "0.310", y: "0.595" },
    blue: { x: "0.155", y: "0.070" },
    white: "D65",
  },
] as const satisfies readonly RgbSpace[];

export function whiteXyz(white: Chromaticity): Vector3 {
  const x = r(white.x);
  const y = r(white.y);
  return [x.div(y), Rational.of(1), Rational.of(1).sub(x).sub(y).div(y)];
}

export function rgbToXyz(space: RgbSpace): Matrix3 {
  const column = (c: Chromaticity) => whiteXyz(c);
  const [R, G, B] = [column(space.red), column(space.green), column(space.blue)];
  const primaries: Matrix3 = [
    [R[0], G[0], B[0]],
    [R[1], G[1], B[1]],
    [R[2], G[2], B[2]],
  ];
  const scale = apply(invert(primaries), whiteXyz(WHITES[space.white]));
  return multiply(primaries, diagonal(scale));
}

// Primary source unchecked; derive.test.ts verifies the result against CSS Color 4's D65_to_D50 / D50_to_D65.
export const BRADFORD: Matrix3 = [
  [r("0.8951"), r("0.2664"), r("-0.1614")],
  [r("-0.7502"), r("1.7135"), r("0.0367")],
  [r("0.0389"), r("-0.0685"), r("1.0296")],
];

export function bradford(from: keyof typeof WHITES, to: keyof typeof WHITES): Matrix3 {
  const source = apply(BRADFORD, whiteXyz(WHITES[from]));
  const target = apply(BRADFORD, whiteXyz(WHITES[to]));
  const gain: Vector3 = [target[0].div(source[0]), target[1].div(source[1]), target[2].div(source[2])];
  return multiply(invert(BRADFORD), multiply(diagonal(gain), BRADFORD));
}

function over4096(rows: readonly (readonly [number, number, number])[]): Matrix3 {
  return rows.map((row) => row.map((v) => Rational.of(v, 4096))) as unknown as Matrix3;
}

function decimals(rows: readonly (readonly [string, string, string])[]): Matrix3 {
  return rows.map((row) => row.map(r)) as unknown as Matrix3;
}

// ITU-R BT.2100-3 Table 7: linear BT.2020 RGB → LMS, and L′M′S′ → ICtCp for PQ and for HLG.
export const BT2100_RGB_TO_LMS = over4096([
  [1688, 2146, 262],
  [683, 2951, 462],
  [99, 309, 3688],
]);
export const BT2100_PQ_LMS_TO_ICTCP = over4096([
  [2048, 2048, 0],
  [6610, -13613, 7003],
  [17933, -17390, -543],
]);
export const BT2100_HLG_LMS_TO_ICTCP = over4096([
  [2048, 2048, 0],
  [3625, -7465, 3840],
  [9500, -9212, -288],
]);

// Safdar et al. 2017, Opt. Express 25(13), eqs. 9 and 11 (as in CSS Color HDR 1 §11.4 and colour-science).
export const JZAZBZ_XYZ_TO_LMS = decimals([
  ["0.41478972", "0.579999", "0.0146480"],
  ["-0.2015100", "1.120649", "0.0531008"],
  ["-0.0166008", "0.264800", "0.6684799"],
]);
export const JZAZBZ_LMS_TO_IZAZBZ = decimals([
  ["0.5", "0.5", "0"],
  ["3.524000", "-4.066708", "0.542708"],
  ["0.199076", "1.096799", "-1.295875"],
]);

// CAT16 (Li et al. 2017), CAT02 (CIE 159:2004) and Hunt-Pointer-Estevez, as reproduced in colour-science
// `colour/adaptation/datasets/cat.py` and `colour/appearance/hunt.py` @ 248121e3 (and MCU's cam16.ts).
export const CAT16 = decimals([
  ["0.401288", "0.650173", "-0.051461"],
  ["-0.250268", "1.204414", "0.045854"],
  ["-0.002079", "0.048952", "0.953127"],
]);
export const CAT02 = decimals([
  ["0.7328", "0.4296", "-0.1624"],
  ["-0.7036", "1.6975", "0.0061"],
  ["0.0030", "0.0136", "0.9834"],
]);
export const HPE = decimals([
  ["0.38971", "0.68898", "-0.07868"],
  ["-0.22981", "1.18340", "0.04641"],
  ["0", "0", "1"],
]);

// Ebner & Fairchild 1998, "Development and Testing of a Color Space (IPT) with Improved Hue Uniformity",
// IS&T CIC6, Eq. 1: XYZ (D65) → LMS, and L′M′S′ → IPT.
export const IPT_XYZ_TO_LMS = decimals([
  ["0.4002", "0.7075", "-0.0807"],
  ["-0.2280", "1.1500", "0.0612"],
  ["0", "0", "0.9184"],
]);
export const IPT_LMS_TO_IPT = decimals([
  ["0.4000", "0.4000", "0.2000"],
  ["4.4550", "-4.8510", "0.3960"],
  ["0.8056", "0.3572", "-1.1628"],
]);

// libjxl `lib/jxl/cms/opsin_params.h` @ f23e813b (BSD-3): the XYB opsin absorbance matrix on linear sRGB, each
// row's middle (or last) entry written as 1 minus the others.
const one = Rational.of(1);
export const XYB_OPSIN: Matrix3 = [
  [r("0.30"), one.sub(r("0.078")).sub(r("0.30")), r("0.078")],
  [r("0.23"), one.sub(r("0.078")).sub(r("0.23")), r("0.078")],
  [r("0.24342268924547819"), r("0.20476744424496821"), one.sub(r("0.24342268924547819")).sub(r("0.20476744424496821"))],
];

interface Luma {
  readonly kr: string;
  readonly kb: string;
}

// Luma weights: BT.601-7 §2.5.1, BT.709-6 item 3.2, BT.2020-2 Table 4.
const LUMA_601: Luma = { kr: "0.299", kb: "0.114" };
const LUMA_709: Luma = { kr: "0.2126", kb: "0.0722" };
const LUMA_2020: Luma = { kr: "0.2627", kb: "0.0593" };

// Rows Y, s1·(B − Y) + s2·(R − Y), s3·(B − Y) + s4·(R − Y) over encoded R′G′B′.
function lumaDifference(luma: Luma, second: [Rational, Rational], third: [Rational, Rational]): Matrix3 {
  const kr = r(luma.kr);
  const kb = r(luma.kb);
  const one = Rational.of(1);
  const kg = one.sub(kr).sub(kb);
  const zero = Rational.of(0);
  const by = [zero.sub(kr), zero.sub(kg), one.sub(kb)];
  const ry = [one.sub(kr), zero.sub(kg), zero.sub(kb)];
  const mix = ([b, rr]: [Rational, Rational]) => [0, 1, 2].map((i) => b.mul(by[i]!).add(rr.mul(ry[i]!)));
  return [[kr, kg, kb], mix(second), mix(third)] as unknown as Matrix3;
}

// H.273 eq. 45–47 (BT.601 §2.5.2): Cb = 0.5·(B − Y)/(1 − Kb), Cr = 0.5·(R − Y)/(1 − Kr).
function ycbcr(luma: Luma): Matrix3 {
  const zero = Rational.of(0);
  const half = Rational.of(1, 2);
  const cb = half.div(Rational.of(1).sub(r(luma.kb)));
  const cr = half.div(Rational.of(1).sub(r(luma.kr)));
  return lumaDifference(luma, [cb, zero], [zero, cr]);
}

export function videoMatrices(): Record<string, Matrix3> {
  const zero = Rational.of(0);
  const q = (n: number) => Rational.of(n, 4);
  const forward: Record<string, Matrix3> = {
    YCBCR_601: ycbcr(LUMA_601),
    YCBCR_709: ycbcr(LUMA_709),
    YCBCR_2020: ycbcr(LUMA_2020),
    // SMPTE 170M-2004 Annex A eq. 4–5: the reduced b − y, r − y.
    YUV: lumaDifference(LUMA_601, [r("0.492111"), zero], [zero, r("0.877283")]),
    // SMPTE 170M-2004 Annex A eq. 6–7: I and Q, 33° from b − y, r − y.
    YIQ: lumaDifference(LUMA_601, [r("-0.26802288"), r("0.73575162")], [r("0.41271905"), r("0.47780269")]),
    // ITU-R BT.470-6 Table 2 item 2.5 (SECAM): D′B = 1.505·(B − Y), D′R = −1.902·(R − Y).
    YDBDR: lumaDifference(LUMA_601, [r("1.505"), zero], [zero, r("-1.902")]),
    // ITU-T H.273 (V4) eq. 51–53, channel order Y, Cg, Co.
    YCGCO: [
      [q(1), q(2), q(1)],
      [q(-1), q(2), q(-1)],
      [q(2), zero, q(-2)],
    ],
  };
  const out: Record<string, Matrix3> = {};
  for (const [name, m] of Object.entries(forward)) {
    out[`RGB_TO_${name}`] = m;
    out[`${name}_TO_RGB`] = invert(m);
  }
  return out;
}

export function exactMatrices(): Record<string, Matrix3> {
  const out: Record<string, Matrix3> = {};
  for (const space of RGB_SPACES) {
    const forward = rgbToXyz(space);
    out[`LINEAR_${space.name}_TO_XYZ_${space.white}`] = forward;
    out[`XYZ_${space.white}_TO_LINEAR_${space.name}`] = invert(forward);
  }
  out["XYZ_D65_TO_XYZ_D50"] = bradford("D65", "D50");
  // ACES CTL `ACESlib.ODT_Common.ctl` D60_2_D65_CAT and OCIO `ACES.cpp` adapt the ACES white with Bradford.
  for (const name of ["AP0", "AP1"] as const) {
    const space = RGB_SPACES.find((s) => s.name === name)!;
    const forward = multiply(bradford("ACES", "D65"), rgbToXyz(space));
    out[`LINEAR_${name}_TO_XYZ_D65`] = forward;
    out[`XYZ_D65_TO_LINEAR_${name}`] = invert(forward);
  }
  const ap0 = RGB_SPACES.find((s) => s.name === "AP0")!;
  const ap1 = RGB_SPACES.find((s) => s.name === "AP1")!;
  out["AP0_TO_AP1"] = multiply(invert(rgbToXyz(ap1)), rgbToXyz(ap0));
  out["AP1_TO_AP0"] = multiply(invert(rgbToXyz(ap0)), rgbToXyz(ap1));
  out["XYZ_D50_TO_XYZ_D65"] = bradford("D50", "D65");
  const lms = multiply(BT2100_RGB_TO_LMS, invert(rgbToXyz(RGB_SPACES[4])));
  out["XYZ_D65_TO_LMS_ICTCP"] = lms;
  out["LMS_ICTCP_TO_XYZ_D65"] = invert(lms);
  out["PQ_LMS_TO_ICTCP"] = BT2100_PQ_LMS_TO_ICTCP;
  out["ICTCP_TO_PQ_LMS"] = invert(BT2100_PQ_LMS_TO_ICTCP);
  out["HLG_LMS_TO_ICTCP"] = BT2100_HLG_LMS_TO_ICTCP;
  out["ICTCP_TO_HLG_LMS"] = invert(BT2100_HLG_LMS_TO_ICTCP);
  out["JZAZBZ_XYZ_TO_LMS"] = JZAZBZ_XYZ_TO_LMS;
  out["JZAZBZ_LMS_TO_XYZ"] = invert(JZAZBZ_XYZ_TO_LMS);
  out["JZAZBZ_LMS_TO_IZAZBZ"] = JZAZBZ_LMS_TO_IZAZBZ;
  out["JZAZBZ_IZAZBZ_TO_LMS"] = invert(JZAZBZ_LMS_TO_IZAZBZ);
  out["CAT16"] = CAT16;
  out["CAT16_INVERSE"] = invert(CAT16);
  out["CAT02"] = CAT02;
  out["CAT02_INVERSE"] = invert(CAT02);
  out["IPT_XYZ_TO_LMS"] = IPT_XYZ_TO_LMS;
  out["IPT_LMS_TO_XYZ"] = invert(IPT_XYZ_TO_LMS);
  out["IPT_LMS_TO_IPT"] = IPT_LMS_TO_IPT;
  out["IPT_IPT_TO_LMS"] = invert(IPT_LMS_TO_IPT);
  out["XYB_OPSIN"] = XYB_OPSIN;
  out["XYB_OPSIN_INVERSE"] = invert(XYB_OPSIN);
  out["XYZ_TO_HPE"] = HPE;
  out["HPE_TO_XYZ"] = invert(HPE);
  out["CAT02_TO_HPE"] = multiply(HPE, invert(CAT02));
  out["HPE_TO_CAT02"] = invert(multiply(HPE, invert(CAT02)));
  Object.assign(out, videoMatrices());
  return out;
}

export function exactWhites(): Record<string, Vector3> {
  return { D50_WHITE: whiteXyz(WHITES.D50), D65_WHITE: whiteXyz(WHITES.D65) };
}

export function toNumbers(m: Matrix3): number[][] {
  return m.map((row) => row.map((cell) => cell.toNumber()));
}

export function render(): string {
  const lines = [
    "// Generated by scripts/matrices/derive.ts from exact rational arithmetic. Do not edit; run `bun run matrices`.",
    "",
  ];
  for (const [name, m] of Object.entries(exactMatrices())) {
    const rows = toNumbers(m).map((row) => `\t[${row.join(", ")}]`);
    lines.push(`export const ${name} = [\n${rows.join(",\n")}\n] as const;`, "");
  }
  for (const [name, v] of Object.entries(exactWhites())) {
    lines.push(`export const ${name} = [${v.map((c) => c.toNumber()).join(", ")}] as const;`, "");
  }
  return lines.join("\n");
}

if (import.meta.main) {
  const target = new URL("../../src/core/matrices.ts", import.meta.url);
  await Bun.write(target, render());
  console.log(`wrote ${target.pathname}`);
}
