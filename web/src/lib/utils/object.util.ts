/**
 * Returns object with summed values from `first` and `second`.
 *
 * `output[key] = first[key] + second[key]`
 * @export
 * @template T - Key type.
 * @param {Record<T, number>} first - First object.
 * @param {Record<T, number>} second - Second object.
 * @return Object with the same keys but with summed values.
 */
export function objectsSum<T extends string | number>(first: Record<T, number>, second: Record<T, number>) {
  const output: Partial<Record<T, number>> = {};
  for (const key in first) {
    if (Object.prototype.hasOwnProperty.call(first, key) && Object.prototype.hasOwnProperty.call(second, key)) {
      output[key] = first[key] + second[key];
    }
  }

  return output as Record<T, number>;
}

/**
 * Returns the input object if the condition is true, otherwise returns undefined.
 * @export
 * @template T - Type of the object
 * @param {(boolean | undefined)} condition - Condition to evaluate.
 * @param {T} object - Object to return if the condition is true.
 * @return Input object if the condition is true, otherwise undefined.
 */
export function optObj<T>(condition: boolean | undefined, object: T): T | undefined {
  if (condition) return object;
  return;
}

/**
 * Property type for grouping.
 */
type GroupByProperty = string | number | symbol;

/**
 * Groups an array of objects by a specified property.
 * @export
 * @template TProperty - Type of the property.
 * @template TData - Type of the array elements.
 * @param {TProperty} property - Property to group by.
 * @param {TData[]} data - Array of objects.
 * @return Object where the keys represent the unique property values, and the values are arrays of objects with that property value.
 */
export function groupBy<TProperty extends GroupByProperty, TData extends Record<TProperty, GroupByProperty>>(
  property: TProperty,
  data: TData[]
): Record<GroupByProperty, TData[]> {
  return data.reduce<Record<GroupByProperty, TData[]>>((groups, element) => {
    groups[element[property]] = groups[element[property]] ?? [];
    groups[element[property]].push(element);
    return groups;
  }, {});
}

/**
 Returns an array of string or number keys from an object with correctly asserted Types
 @template T - The type of the input object.
 @param {T} obj - The input object.
 @returns {(keyof T extends infer U ? (U extends string ? U : U extends number ? ${U} : never) : never)[]} - An array of keys from the input object.
 @example
 const obj = { a: 1, b: 2, c: 3 };
 const keys = objectKeys(obj); // ['a', 'b', 'c']
 */

export const objectKeys = Object.keys as <T>(
  obj: T
) => (keyof T extends infer U ? (U extends string ? U : U extends number ? `${U}` : never) : never)[];

/**

 Represents an array of key-value pairs from an object.
 @template T - The type of the object.
 @typedef {Array<[keyof T, T[keyof T]]>} Entries<T>
 */

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

/**

 Retrieves an array of key-value pairs from an object.
 @template T - The type of the object.
 @param {T} obj - The object to extract key-value pairs from.
 @returns {Entries<T>} - An array of key-value pairs from the object.
 */
export const objectEntries = <T extends object>(obj: T): Entries<T> => Object.entries(obj) as Entries<T>;
