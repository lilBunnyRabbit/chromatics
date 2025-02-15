import { RGB255, YCbCr255 } from "../../../models";
import { Matrix } from "../../../utils";
import { ConversionRegistry } from "../../conversion-registry";

const matRGB255 = new Matrix([1, 0, 1.402525], [1, -0.34373, -0.714401], [1, 1.769905, 0.000013]);

ConversionRegistry.register(YCbCr255, RGB255, (ycbcr) => {
  const rgb = matRGB255.dot([ycbcr.y, ycbcr.cb - 128, ycbcr.cr - 128]);
  return new RGB255(rgb[0], rgb[1], rgb[2]);
});
