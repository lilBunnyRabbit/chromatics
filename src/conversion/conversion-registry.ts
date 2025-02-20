import registerConverters from "../models/model.converter";
import { Constructor, ConversionFunction, ConversionFunctionFor } from "./conversion.type";

// TODO: this is mostly all AI

// Registry for conversion functions.
export class ConversionRegistry {
  readonly registry = new Map<Function, Map<Function, ConversionFunction<any, any, any>>>();

  constructor() {
    registerConverters(this);
  }

  public register<From, To>(from: Constructor<From>, to: Constructor<To>, converter: ConversionFunction<From, To>) {
    let targetMap = this.registry.get(from);
    if (!targetMap) {
      targetMap = new Map();
      this.registry.set(from, targetMap);
    }
    targetMap.set(to, converter);
  }

  public getConversion<From, To>(from: Constructor<From>, to: Constructor<To>) {
    return this.registry.get(from)?.get(to) as ConversionFunctionFor<From, To> | undefined;
  }

  public getRegistry() {
    return this.registry;
  }

  public converter<From>(from: Constructor<From>) {
    const fromMap = this.registry.get(from);

    return <To>(to: Constructor<To>) => {
      return fromMap?.get(to) as ConversionFunctionFor<From, To> | undefined;
    };
  }
}

export const conversionRegistry = new ConversionRegistry();
