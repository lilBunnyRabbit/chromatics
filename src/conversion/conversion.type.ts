import { DefaultConversions } from "./default-conversions";

// Generic constructor type.
export type Constructor<T> = new (...args: any[]) => T;

// Conversion function type with extra arguments defaulting to an empty tuple.
export type ConversionFunction<From, To, Args extends any[] = any[]> = (model: From, ...args: Args) => To;

// A specification for a conversion mapping from one model to another.
// The Args default to [] (i.e. no extra parameters) if not specified.
export interface ConversionSpec<From, To, Args extends unknown[] = []> {
  from: Constructor<From>;
  to: Constructor<To>;
  converter: ConversionFunction<From, To, Args>;
}

// Extracts the matching conversion specification from the DefaultConversions tuple.
// If no matching spec is found, we fall back to a conversion function that requires no extra args.
export type MatchingConversionSpec<From, To> =
  | Extract<DefaultConversions[number], ConversionSpec<From, To, any>>
  | { converter: ConversionFunction<From, To> };

// Extracts the conversion function type from the matching conversion spec.
export type ConversionFunctionFor<From, To> = MatchingConversionSpec<From, To> extends { converter: infer C }
  ? C
  : ConversionFunction<From, To>;
