/**
 * Partial nullable object.
 * @template T - Object type.
 * @template OmitKeys - Keys to omit.
 */
export type NullablePartial<T, OmitKeys extends keyof T = never> = {
  [K in keyof T]?: K extends OmitKeys ? T[K] : T[K] | undefined | null;
};

/**
 * All child objects are also partials.
 * @template T - Object type.
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * DeepPartial of selected keys.
 * @template T - Object type.
 * @template K - Keys to pick.
 */
export type PickEntityKeys<T, K extends keyof T> = {
  [P in K]: NonNullable<T[P]> extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * All child objects are also NonNullable.
 * @template T - Object type.
 */
export type DeepNonNullable<T> = T extends object
  ? {
      [P in keyof T]-?: DeepNonNullable<T[P]>;
    }
  : NonNullable<T>;

/**
 * Selected keys are required.
 * @template T - Object type.
 * @template K - Keys to make required.
 */
export type RequiredProperty<T, K extends keyof T> = T & {
  [P in K]-?: Exclude<T[P], undefined | null>;
};

/**
 * Selected keys are partial.
 * @template T - Object type.
 * @template K - Keys to pick.
 */
export type PickPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Merge two props objects.
 * @template First - First object type.
 * @template Second - Second object type.
 */
export type PropsUnion<First extends object, Second extends object> = Omit<First, keyof Second> & Second;

/**
 * Array type that allows null and undefined values.
 * @template TElement - Element type.
 */
export type NullableArray<TElement> = Array<TElement | null | undefined>;

/**
 * Adds all the elements of an array into a string, separated by the specified separator string.
 * @template TArray - The array type to join.
 * @template TSeparator - The separator type.
 */
export type Join<TArray extends unknown[], TSeparator extends string | number> = TArray extends [
  infer TElement extends string | number,
  ...infer TRest
]
  ? TRest["length"] extends 0
    ? `${TElement}`
    : `${TElement}${TSeparator}${Join<TRest, TSeparator>}`
  : never;


// Type Guards

/**
 * Checks if a value is undefined.
 * @export
 * @param {unknown} value - The value to check.
 * @return True if the value is `undefined`, false otherwise.
 */
export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

/**
 * Checks if a value is null.
 * @export
 * @param {unknown} value - The value to check.
 * @return True if the value is `null`, false otherwise.
 */
export function isNull(value: unknown): value is null {
  return value === null;
}

/**
 * Checks if a value is a number.
 * @export
 * @param {unknown} value - The value to check.
 * @return True if the value is a `number`, false otherwise.
 */
export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

/**
 * Checks if a value is a string.
 * @export
 * @param {unknown} value - The value to check.
 * @return True if the value is a `string`, false otherwise.
 */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

/**
 * Checks if a value is an object.
 * @export
 * @param {unknown} value - The value to check.
 * @return True if the value is an `object`, false otherwise.
 */
export function isObject(value: unknown): value is object {
  return typeof value === "object" && !Array.isArray(value) && value !== null;
}

/**
 * Checks if a value is a function.
 * @export
 * @template TArgs - Type of the function arguments.
 * @template TReturn - Return type of the function.
 * @param {unknown} value - The value to check.
 * @return True if the value is a `Function`, false otherwise.
 */
export function isFunction<TArgs extends any[] = any[], TReturn = any>(
  value: unknown
): value is (...args: TArgs) => TReturn {
  return typeof value === "function";
}

/**
 * Checks if a value is an empty string.
 * @export
 * @param {unknown} value - The value to check.
 * @return True if the value is an empty `string`, false otherwise.
 */
export function isEmptyString(value: unknown): value is "" {
  return isString(value) && value.length === 0;
}

/**
 * Checks if a value is an array.
 * @export
 * @template TType - Type of the array elements.
 * @param {unknown} value - The value to check.
 * @return True if the value is an `Array`, false otherwise.
 */
export function isArray<TType>(value: unknown): value is TType[] {
  return Array.isArray(value);
}

/**
 * Checks if a value is an array of a specific type.
 * @export
 * @template TType - Type of the array elements.
 * @param {unknown} value - The value to check.
 * @param {(element: unknown) => element is TType} isType - Type guard function for the array elements.
 * @return True if the value is an `Array` of the specified type, false otherwise.
 */
export function isArrayOfType<TType>(value: unknown, isType: (element: unknown) => element is TType): value is TType[] {
  return isArray<unknown>(value) && value.every((element) => isType(element));
}

/**
 * Checks if a value is a CustomEvent instance.
 * @export
 * @param {unknown} value - The value to check.
 * @return True if the value is a `CustomEvent` instance, false otherwise.
 */
export function isCustomEvent(value: unknown): value is CustomEvent {
  return value instanceof CustomEvent;
}

/**
 * Checks if a value is an Error instance.
 * @export
 * @param {unknown} value - The value to check.
 * @return True if the value is an `Error` instance, false otherwise.
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}
