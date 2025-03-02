import { ConversionRegistry__OLD } from "../../../lib";
import { Lab, XYZ } from "../../models";

export default ConversionRegistry__OLD.registrator(Lab, (register) => {
  register(XYZ, (lab) => {
    const references = XYZ.getReferences(lab.illuminant);

    const y = (lab.l + 16) / 116;
    const x = lab.a / 500 + y;
    const z = y - lab.b / 200;

    const calibrate = (value: number) => {
      const value3 = value ** 3;
      if (value3 > 0.008856) {
        return value3;
      }

      return (value - 16 / 116) / 7.787;
    };

    return new XYZ(calibrate(x) * references[0], calibrate(y) * references[1], calibrate(z) * references[2]);
  });
});
