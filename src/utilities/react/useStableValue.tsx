import { useRef } from "react";

/**
 * Returns the passed-in value if it's different than the previous time this was
 * called, or if it's the first time.
 *
 * This is useful when you have a value which is logically equivalent but whose
 * identity changes, like an array of string values.
 *
 * Example:
 *
 * ```
 * function MyComponent() {
 *   // This is a new array on every render, even though its values never change
 *   const fields = ['name', 'age'];
 *   // This array will never change
 *   const stableFields = useStableValue(['name', 'age'], _.isEqual);
 * }
 * ```
 */
export default function useStableValue<Value>(
  newValue: Value,
  isEqual: (value1: Value, value2: Value) => boolean,
): Value {
  const ref = useRef<Value>(newValue);
  const currentValue = ref.current;

  if (isEqual(currentValue, newValue)) return currentValue;

  ref.current = newValue;
  return newValue;
}
