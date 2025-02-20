import { Constructor__OLD, ConversionFunction__OLD, ConversionFunctionFor__OLD } from "./conversion.type";

// TODO: this is mostly all AI

// Registry for conversion functions.
export class ConversionRegistry__OLD {
  private static registry = new Map<Function, Map<Function, ConversionFunction__OLD<any, any, any>>>();

  static register<From, To>(from: Constructor__OLD<From>, to: Constructor__OLD<To>, converter: ConversionFunction__OLD<From, To>) {
    let targetMap = this.registry.get(from);
    if (!targetMap) {
      targetMap = new Map();
      this.registry.set(from, targetMap);
    }
    targetMap.set(to, converter);
  }

  static getConversion<From, To>(from: Constructor__OLD<From>, to: Constructor__OLD<To>) {
    return this.registry.get(from)?.get(to) as ConversionFunctionFor__OLD<From, To> | undefined;
  }

  static getRegistry() {
    return this.registry;
  }

  static converter<From>(from: Constructor__OLD<From>) {
    const fromMap = this.registry.get(from);

    return <To>(to: Constructor__OLD<To>) => {
      return fromMap?.get(to) as ConversionFunctionFor__OLD<From, To> | undefined;
    };
  }

  static registrator<From>(
    from: Constructor__OLD<From>,
    callback: (register: <To>(to: Constructor__OLD<To>, converter: ConversionFunction__OLD<From, To>) => void) => void
  ) {
    let isInit = false;
    return () => {
      if (isInit) return;
      isInit = true;

      let targetMap = this.registry.get(from);
      if (!targetMap) {
        targetMap = new Map();
        this.registry.set(from, targetMap);
      }

      callback((to, converter) => {
        targetMap.set(to, converter);
      });
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
