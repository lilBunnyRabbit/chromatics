import { CMYK, HSL, RGB255 } from "@/models";

export interface ColorBase {
  toString(): string;
  clone(): this;
}

export interface ColorConversions {
  toRGB(): RGB255;
  toCMYK(): CMYK;
  toHSL(): HSL;
}

export interface Color {}
