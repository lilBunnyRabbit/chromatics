import { DefaultConversions__OLD } from "./default-conversions";

// Generic constructor type.
export type Constructor__OLD<T> = new (...args: any[]) => T;

// Conversion function type with extra arguments defaulting to an empty tuple.
export type ConversionFunction__OLD<From, To, Args extends any[] = any[]> = (model: From, ...args: Args) => To;

// A specification for a conversion mapping from one model to another.
// The Args default to [] (i.e. no extra parameters) if not specified.
export interface ConversionSpec__OLD<From, To, Args extends unknown[] = []> {
  from: Constructor__OLD<From>;
  to: Constructor__OLD<To>;
  converter: ConversionFunction__OLD<From, To, Args>;
}

// Extracts the matching conversion specification from the DefaultConversions tuple.
// If no matching spec is found, we fall back to a conversion function that requires no extra args.
export type MatchingConversionSpec__OLD<From, To> =
  | Extract<DefaultConversions__OLD[number], ConversionSpec__OLD<From, To, any>>
  | { converter: ConversionFunction__OLD<From, To> };

// Extracts the conversion function type from the matching conversion spec.
export type ConversionFunctionFor__OLD<From, To> = MatchingConversionSpec__OLD<From, To> extends { converter: infer C }
  ? C
  : ConversionFunction__OLD<From, To>;
