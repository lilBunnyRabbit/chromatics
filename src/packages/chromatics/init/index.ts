import { Srgb } from "../models/srgb.model";
import { Srgb8 } from "../models/srgb8.model";
import registry from "../conversion-registry";

registry.register({
  from: Srgb,
  to: Srgb8,
  conversion(srgb) {
    return new Srgb8(srgb.r * 255, srgb.g * 255, srgb.b * 255, srgb.a * 255);
  },
});

registry.register({
  from: Srgb8,
  to: Srgb,
  conversion(srgb8) {
    return new Srgb(srgb8.r / 255, srgb8.g / 255, srgb8.b / 255, srgb8.a / 255);
  },
});
