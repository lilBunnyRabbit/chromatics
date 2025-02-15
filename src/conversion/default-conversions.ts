import { CMY, CMYK, HSI, HSL, HSV, HWB, RGB, RGB255, XYZ, YCbCr255 } from "../models";
import { ConversionSpec } from "./conversion.type";

// TODO: define all
export type DefaultConversions = [
  // rgb/rgb
  ConversionSpec<RGB, RGB255>,
  ConversionSpec<RGB, CMY>,
  ConversionSpec<RGB, CMYK>,
  ConversionSpec<RGB, HSI>,
  ConversionSpec<RGB, HSL>,
  ConversionSpec<RGB, HSV>,
  ConversionSpec<RGB, HWB>,
  ConversionSpec<RGB, XYZ>,
  // rgb/rgb255
  ConversionSpec<RGB255, RGB>,
  ConversionSpec<RGB255, YCbCr255>
];
