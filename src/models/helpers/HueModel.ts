import { NormalizedRGB } from "../NormalizedRGB";

export class HueModel {
  static chromaToRGB(hue: number, chroma: number, interChroma: number, offset: number): NormalizedRGB {
    const hueInt = Math.floor(hue);

    // Then we can, again, find a point (R1, G1, B1) along the bottom three faces of the RGB cube,
    // with the same hue and chroma as our color (using the intermediate value X
    // for the second largest component of this color):
    const hueToRgb = (): [r: number, g: number, b: number] => {
      switch (hueInt) {
        case 6:
        case 0:
          return [chroma, interChroma, 0];

        case 1:
          return [interChroma, chroma, 0];

        case 2:
          return [0, chroma, interChroma];

        case 3:
          return [0, interChroma, chroma];

        case 4:
          return [interChroma, 0, chroma];

        default:
          return [chroma, 0, interChroma];
      }
    };

    // Finally, we can find R, G, and B by adding the same amount to each component, to match lightness:
    return new NormalizedRGB(...(hueToRgb().map((v) => v + offset) as [r: number, g: number, b: number]));
  }
}
