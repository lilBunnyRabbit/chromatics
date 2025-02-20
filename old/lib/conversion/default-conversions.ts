import { CMY, CMYK, HSI, HSL, HSV, HWB, RGB, RGB255, XYZ, YCbCr255 } from "../../core/models";
import { ConversionSpec__OLD } from "./conversion.type";

// TODO: define all, move somewhere?
export type DefaultConversions__OLD = [
  // rgb/rgb
  ConversionSpec__OLD<RGB, RGB255>,
  ConversionSpec__OLD<RGB, CMY>,
  ConversionSpec__OLD<RGB, CMYK>,
  ConversionSpec__OLD<RGB, HSI>,
  ConversionSpec__OLD<RGB, HSL>,
  ConversionSpec__OLD<RGB, HSV>,
  ConversionSpec__OLD<RGB, HWB>,
  ConversionSpec__OLD<RGB, XYZ>,
  // rgb/rgb255
  ConversionSpec__OLD<RGB255, RGB>,
  ConversionSpec__OLD<RGB255, YCbCr255>
];
