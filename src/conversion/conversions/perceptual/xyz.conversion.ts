import { Lab, RGB, XYZ } from "../../../models";
import { ConversionRegistry } from "../../conversion-registry";

ConversionRegistry.register(XYZ, RGB, (xyz) => {
  const [x, y, z] = [xyz.x / 100, xyz.y / 100, xyz.z / 100];

  const rgb = [
    x * 3.2406 + y * -1.5372 + z * -0.4986,
    x * -0.9689 + y * 1.8758 + z * 0.0415,
    x * 0.0557 + y * -0.204 + z * 1.057,
  ].map((value) => {
    if (value > 0.0031308) {
      return 1.055 * value ** (1 / 2.4) - 0.055;
    }

    return 12.92 * value;
  }) as [r: number, g: number, b: number];

  return new RGB(...rgb);
});

ConversionRegistry.register(XYZ, Lab, (xyz, illuminant: keyof typeof XYZ.Illuminants = "D65") => {
  const references = XYZ.getReferences(illuminant);

  const [x, y, z] = [xyz.x / references[0], xyz.y / references[1], xyz.z / references[2]].map((value) => {
    if (value > 0.008856) {
      return value ** (1 / 3);
    }

    return 7.787 * value + 16 / 116;
  });

  const l = 116 * y - 16;
  const a = 500 * (x - y);
  const b = 200 * (y - z);

  return new Lab(l, a, b, illuminant);
});
