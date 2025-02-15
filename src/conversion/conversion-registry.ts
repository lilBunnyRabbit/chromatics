import { Constructor, ConversionFunction, ConversionFunctionFor } from "./conversion.type";

// Registry for conversion functions.
export class ConversionRegistry {
  private static registry = new Map<Function, Map<Function, ConversionFunction<any, any, any>>>();

  static register<From, To>(from: Constructor<From>, to: Constructor<To>, converter: ConversionFunction<From, To>) {
    let targetMap = this.registry.get(from);
    if (!targetMap) {
      targetMap = new Map();
      this.registry.set(from, targetMap);
    }
    targetMap.set(to, converter);
  }

  static getConversion<From, To>(from: Constructor<From>, to: Constructor<To>) {
    return this.registry.get(from)?.get(to) as ConversionFunctionFor<From, To> | undefined;
  }

  static getRegistry() {
    return this.registry;
  }

  static converter<From>(from: Constructor<From>) {
    const fromMap = this.registry.get(from);

    return <To>(to: Constructor<To>) => {
      return fromMap?.get(to) as ConversionFunctionFor<From, To> | undefined;
    };
  }
}

// export class Converter {
//   convert<Target>(target: { new (...args: any[]): Target }, inputs: any[], ...args: any[]): Target[] {
//     return inputs.map((input) => {
//       const fn = ConversionRegistry.getConversion(input.constructor, target);
//       if (!fn) throw new Error(`No conversion from ${input.constructor.name} to ${target.name}`);
//       return fn(input, ...args);
//     });
//   }
// }
