/**
 * Casts the input parameter to the `TargetType` with type checks, as opposed to `blindCast()` where the
 * compiler will not prevent converting between incompatible types.
 *
 * Example:
 * export type fancyObject = {
 *   key: string;
 *   keyTwo: {
 *     subKey: string;
 *     subKeyTwo: number;
 *   };
 * };
 *
 * const typedObject = castAs<fancyObject>({
 *   key: "Chookede",
 *   keyTwo: {
 *     subKey: "Choookeeeee",
 *     subKeyTwo: 2,
 *   },
 * });
 *
 */

export default function castAs<Type>(value: Type): Type {
  return value;
}
