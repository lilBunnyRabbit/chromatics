import { type ColorModel, type ColorModelConstructor } from "../utils/types";
import registry from "../conversion-registry";

export abstract class ColorModelBase implements ColorModel {
  abstract clone(): this;

  // TODO: types
  static from<T extends ColorModel>(model: T): InstanceType<any> {
    const ctor = this as unknown as ColorModelConstructor<T>;
    return registry.get(ctor, model.constructor as ColorModelConstructor<T>)(model);
  }

  public to(model: ColorModelConstructor) {
    return registry.get(this, model)(this);
  }
}