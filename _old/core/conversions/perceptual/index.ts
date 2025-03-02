import registerLab from "./lab.converter";
import registerXyz from "./xyz.converter";

export default function () {
  registerLab();
  registerXyz();
}
