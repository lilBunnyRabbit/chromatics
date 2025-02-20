import { Constructor__OLD } from "../conversion";
import { ParserRegistry__OLD, ParserSpec__OLD } from "./parser-registry";

// Optional: A registrator helper similar to your conversion registry.
export function parserRegistrator__OLD<To>(
  target: Constructor__OLD<To>,
  callback: (register: (spec: ParserSpec__OLD<To>) => void) => void
) {
  let isInit = false;
  return (instance: ParserRegistry__OLD) => {
    if (isInit) return;
    isInit = true;
    callback((spec: ParserSpec__OLD<To>) => {
      instance.register(target, spec);
    });
  };
}
