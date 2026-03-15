import { type ColorModelConstructor, type ColorModel, type ColorModelInstance } from "./utils/types";

export class ConversionRegistry {
  private registry: Map<symbol, Map<symbol, (model: any) => any>> = new Map();

  public register<T extends ColorModelConstructor, U extends ColorModelConstructor>({
    from,
    to,
    conversion,
  }: {
    from: T;
    to: U;
    conversion: (model: InstanceType<T>) => InstanceType<U>;
  }) {
    if (!this.registry.has(from.ref)) {
      this.registry.set(from.ref, new Map());
    }
    this.registry.get(from.ref)?.set(to.ref, conversion);
  }

  // TODO: better errors
  public get<T extends ColorModelConstructor, U extends ColorModelConstructor>(
    from: ColorModel | ColorModelConstructor,
    to: ColorModel | ColorModelConstructor
  ): (model: ColorModelInstance<T>) => ColorModelInstance<U> {
    const fromRef = this.getRef(from);
    if (!fromRef) {
      throw new Error(`Invalid target model: from does not have a ref property`);
    }

    const fromRegistry = this.registry.get(fromRef);
    if (!fromRegistry) {
      throw new Error(`No conversions found for "${fromRef.toString()}"`);
    }

    const toRef = this.getRef(to);
    if (!toRef) {
      throw new Error(`Invalid source model: to does not have a ref property`);
    }

    const conversion = fromRegistry.get(toRef);
    if (!fromRegistry) {
      throw new Error(`No conversions found for from "${fromRef.toString()}" to "${toRef.toString()}"`);
    }

    return conversion as (model: ColorModelInstance<T>) => ColorModelInstance<U>;
  }

  public getRef(model: ColorModel | ColorModelConstructor): symbol | null {
    if (typeof model === "function") {
      return model.ref;
    }

    if (typeof model === "object" && "ref" in model.constructor && typeof model.constructor.ref === "symbol") {
      return model.constructor.ref;
    }

    return null;
  }
}

export default new ConversionRegistry();
