import { RGB } from "../../rgb";
import { HueHelper } from "../helpers/hue.helper";
import { HSI } from "./hsi.model";

export class HSIConversion {
  constructor(private hsi: HSI) {}

  public RGB(): RGB {
    const hue = this.hsi.h / 60;

    const z = 1 - Math.abs((hue % 2) - 1);
    const chroma = (3 * this.hsi.i * this.hsi.s) / (1 + z);
    const interChroma = chroma * z;
    const offset = this.hsi.i * (1 - this.hsi.s);

    return HueHelper.chromaToRGB(hue, chroma, interChroma, offset, this.hsi.a);
  }
}

/**
  public toRGB(): RGB {
    const hue = this.h / 60;

    const z = 1 - Math.abs((hue % 2) - 1);
    const chroma = (3 * this.i * this.s) / (1 + z);
    const interChroma = chroma * z;
    const offset = this.i * (1 - this.s);

    return HueModel.chromaToRGB(hue, chroma, interChroma, offset);
  } */
