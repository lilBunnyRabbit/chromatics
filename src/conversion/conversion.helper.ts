import { Constructor } from "../types";
import { conversionRegistry, ConversionRegistry } from "./conversion-registry";
import { ConversionFunction } from "./conversion.type";

export class ConversionHelper {
  static registrator<From>(
    from: Constructor<From>,
    callback: (register: <To>(to: Constructor<To>, converter: ConversionFunction<From, To>) => void) => void
  ) {
    return (instance: ConversionRegistry) => {
      let targetMap = instance.registry.get(from);
      if (!targetMap) {
        targetMap = new Map();
        instance.registry.set(from, targetMap);
      }

      callback((to, converter) => {
        targetMap.set(to, converter);
      });
    };
  }

  static registerAll(...records: Record<string, ReturnType<typeof this.registrator>>[]) {
    return (instance: ConversionRegistry) => {
      for (const record of records) {
        for (const key in record) {
          if (Object.prototype.hasOwnProperty.call(record, key)) {
            record[key](instance);
          }
        }
      }
    };
  }
}
