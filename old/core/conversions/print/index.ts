import registerCmy from "./cmy.converter";
import registerCmyk from "./cmyk.converter";

export default function () {
  registerCmy();
  registerCmyk();
}
