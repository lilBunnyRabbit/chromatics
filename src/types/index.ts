import { CMYK, HSL, RGB } from "@/models";

export interface ColorBase {
  toString(): string;
  clone(): this;
}

export interface ColorConversions {
  toRGB(): RGB;
  toCMYK(): CMYK;
  toHSL(): HSL;
}

export interface Color {}
