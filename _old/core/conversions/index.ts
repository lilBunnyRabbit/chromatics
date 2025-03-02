import registerHue from "./hue";
import registerPerceptual from "./perceptual";
import registerPrint from "./print";
import registerRgb from "./rgb";
import registerVideo from "./video";

// TODO: Dynamic imports?
export default function () {
  registerHue();
  registerPerceptual();
  registerPrint();
  registerRgb();
  registerVideo();
}
