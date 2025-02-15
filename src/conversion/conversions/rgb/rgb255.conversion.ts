import { RGB, RGB255, YCbCr255 } from "../../../models";
import { Matrix } from "../../../utils";
import { ConversionRegistry } from "../../conversion-registry";

ConversionRegistry.register(RGB255, RGB, (rgb) => {
  return new RGB(rgb.r / 255, rgb.g / 255, rgb.b / 255);
});

const matYCbCr = new Matrix([0.299, 0.587, 0.114], [-0.168935, -0.331665, 0.50059], [0.499813, -0.418531, -0.081282]);

ConversionRegistry.register(RGB255, YCbCr255, (rgb) => {
  const yCbCr = matYCbCr.dot([rgb.r, rgb.g, rgb.b]).sum([0, 128, 128]);
  return new YCbCr255(yCbCr[0], yCbCr[1], yCbCr[2]);
});
