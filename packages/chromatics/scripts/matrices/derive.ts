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

export function exactMatrices(): Record<string, Matrix3> {
  const out: Record<string, Matrix3> = {};
  for (const space of RGB_SPACES) {
    const forward = rgbToXyz(space);
    out[`LINEAR_${space.name}_TO_XYZ_${space.white}`] = forward;
    out[`XYZ_${space.white}_TO_LINEAR_${space.name}`] = invert(forward);
  }
  out["XYZ_D65_TO_XYZ_D50"] = bradford("D65", "D50");
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
