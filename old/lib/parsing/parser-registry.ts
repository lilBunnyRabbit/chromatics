import { isNullable } from "@lilbunnyrabbit/utils";
import registerParsers from "../../core/parsing";

// TODO: this is mostly all AI

// Generic constructor type.
type Constructor__OLD<T> = new (...args: any[]) => T;

// Parser function type.
// It accepts a string (and optionally extra arguments) and returns an instance of T or undefined.
export type ParserFunction__OLD<To, Args extends unknown[] = []> = (
  input: string,
  ...args: Args
) => To | undefined | null;

// Parser spec for a model.
// - `priority` (optional): Higher values mean the parser will be tried first.
// - `canParse` (optional): A shallow check to quickly decide if this parser might succeed.
// - `parser`: The actual parser function.
export interface ParserSpec__OLD<To, Args extends unknown[] = []> {
  priority?: number;
  // Maybe it should return probability? 0 - cant, 1 - can, 0-1 chance that can
  // e.g. rgb - 30%,  rgb(\d \d \d) - 80%
  canParse?: (input: string) => boolean;
  parser: ParserFunction__OLD<To, Args>;
}

// A registry mapping each model to an array of parser specs.
export class ParserRegistry__OLD {
  private registry = new Map<Function, ParserSpec__OLD<any, any>[]>();

  constructor() {
    registerParsers(this);
  }

  // Register a parser spec for a target model.
  public register<To, Args extends unknown[] = []>(target: Constructor__OLD<To>, spec: ParserSpec__OLD<To, Args>) {
    let specs = this.registry.get(target);
    if (!specs) {
      specs = [];
      this.registry.set(target, specs);
    }
    specs.push(spec);
    // Sort by descending priority (default priority is 0).
    specs.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }

  // Retrieve all parser specs for a given target model.
  public getParsersFor<To>(target: Constructor__OLD<To>): ParserSpec__OLD<To, any>[] {
    return this.registry.get(target) || [];
  }

  // Try to parse the input string for a specific target model.
  // Returns the first successful result or undefined.
  public parseFor<To>(target: Constructor__OLD<To>, input: string): To | undefined {
    const specs = this.getParsersFor(target);
    for (const spec of specs) {
      if (spec.canParse && !spec.canParse(input)) continue;
      try {
        const result = spec.parser(input);
        if (!isNullable(result)) return result;
      } catch (error) {
        // It's better to handle errors within the parser.
        // Optionally, log the error or ignore it to try another parser.
      }
    }
    return undefined;
  }

  // Try all registered parsers across models, returning an array of matches.
  public parseAll(input: string): { target: string; result: any }[] {
    const results: { target: string; result: any }[] = [];
    for (const [target, specs] of this.registry.entries()) {
      for (const spec of specs) {
        if (spec.canParse && !spec.canParse(input)) continue;
        try {
          const result = spec.parser(input);
          if (result !== undefined) {
            results.push({ target: (target as Constructor__OLD<any>).name, result });
          }
        } catch (error) {
          // Optionally, handle or log the error.
        }
      }
    }
    return results;
  }
}

export const parserRegistry__OLD = new ParserRegistry__OLD();
