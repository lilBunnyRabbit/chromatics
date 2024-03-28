import type { CMYK, HSI, HSL, HSV, HWB, RGB255 } from "@/models";

type ColorKeys = "rgb" | "cmyk" | "hsi" | "hsl" | "hsv" | "hwb";

type ColorDef = {
  name: string;
  width: number | string;
  conversions: Partial<Record<ColorKeys, string | { value: string | number; color: string }>>;
};

function convertCMYK(cmyk: CMYK): ColorDef {
  const rgb = cmyk.toRGB().toRGB255().toString();

  return {
    name: "CMYK",
    width: "256px",
    conversions: {
      rgb,
      cmyk: { value: cmyk.toString(), color: rgb },
      hsi: "",
    },
  };
}

function convertHSI(hsi: HSI): ColorDef {
  const rgb = hsi.toRGB().toRGB255().toString();

  return {
    name: "HSI",
    width: "205px",
    conversions: {
      rgb,
      cmyk: "",
      hsi: { value: hsi.toString(), color: rgb },
    },
  };
}

function convertHSL(hsl: HSL): ColorDef {
  const hsv = hsl.toHSV();

  return {
    name: "HSL",
    width: "205px",
    conversions: {
      rgb: hsl.toRGB().toRGB255().toString(),
      hsl: hsl.toString(),
      hsv: { value: hsv.toString(), color: hsv.toRGB().toString() },
    },
  };
}

function converHSV(hsv: HSV): ColorDef {
  const rgb = hsv.toRGB().toRGB255().toString();

  return {
    name: "HSV",
    width: "205px",
    conversions: {
      rgb,
      hsv: { value: hsv.toString(), color: hsv.toRGB().toString() },
      hsl: hsv.toHSL().toString(),
      hwb: hsv.toHWB().toString(),
    },
  };
}

function convertHWB(hwb: HWB): ColorDef {
  const hsv = hwb.toHSV();

  return {
    name: "HWB",
    width: "205px",
    conversions: {
      hwb: hwb.toString(),
      hsv: { value: hsv.toString(), color: hsv.toRGB().toString() },
    },
  };
}

export function convertFromRGB(rgb: RGB255): Record<ColorKeys, ColorDef> {
  const cmyk = rgb.toCMYK();
  const hsi = rgb.toHSI();
  const hsl = rgb.toHSL();
  const hsv = rgb.toHSV();
  const hwb = rgb.toHWB();

  return {
    rgb: {
      name: "RGB",
      width: "139px",
      conversions: {
        rgb: rgb.toString(),
        cmyk: { value: cmyk.toString(), color: cmyk.toRGB().toString() },
        hsi: { value: hsi.toString(), color: hsi.toRGB().toString() },
        hsl: hsl.toString(),
        hsv: { value: hsv.toString(), color: hsv.toRGB().toString() },
        hwb: hwb.toString(),
      },
    },
    cmyk: convertCMYK(cmyk),
    hsi: convertHSI(hsi),
    hsl: convertHSL(hsl),
    hsv: converHSV(hsv),
    hwb: convertHWB(hwb),
  };
}
