import { Constructor } from "../types";
import { ParserRegistry, ParserSpec } from "./parser-registry";

export class ParserHelper {
  static registrator<To>(target: Constructor<To>, callback: (register: (spec: ParserSpec<To>) => void) => void) {
    let isInit = false;
    return (instance: ParserRegistry) => {
      if (isInit) return;
      isInit = true;
      callback((spec: ParserSpec<To>) => {
        instance.register(target, spec);
      });
    };
  }

  static registerAll(...records: Record<string, ReturnType<typeof this.registrator>>[]) {
    return (instance: ParserRegistry) => {
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
