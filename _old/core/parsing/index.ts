// import registerHue from "./hue";
// import registerPerceptual from "./perceptual";
// import registerPrint from "./print";
import { ParserRegistry__OLD } from "../../lib";
import registerRgb from "./rgb";
// import registerVideo from "./video";

// TODO: Dynamic imports?
export default function (instance: ParserRegistry__OLD) {
  // registerHue();
  // registerPerceptual();
  // registerPrint();
  registerRgb(instance);
  // registerVideo();
}
