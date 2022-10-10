/**
 * Used to assert that a discriminated union's possible values have been
 * exhaustively checked by preceding logic, e.g. in an `if` or `switch`
 * statement. This protects against the case when additional values are added
 * to the union which aren't tested for, since the definition of the union and
 * the code which uses it may be far apart.
 *
 * For example, consider this function which takes a union type as input and
 * returns a number depending on which value was passed in:
 *
 * ```
 *   function numberOfLegs(animal: "dog" | "bird") : number {
 *     //                                            ^^^^^^
 *     // Function lacks ending return statement and return type does not include 'undefined'.ts(2366)
 *     if (animal === "dog") return 4;
 *     if (animal === "bird") return 2;
 *   }
 * ```
 *
 * In the case the either "dog" or "bird" is given, we know what to do and we
 * we return the correct value, but the compiler will demand that every code
 * path has an explicit `return` statement that returns a number. So what do
 * we do in the third (impossible to reach) branch at the end of the function?
 *
 * We could do this:
 *
 * ```
 *   function numberOfLegs(animal: "dog" | "bird") : number {
 *     if (animal === "dog") return 4;
 *     return 2;
 *   }
 * ```
 *
 * This is correct, but what happens when you add a new animal type?
 *
 * ```
 *   function numberOfLegs(animal: "dog" | "bird" | "spider") : number {
 *     if (animal === "dog") return 4;
 *     return 2;
 *   }
 * ```
 *
 * This will compile without errors, but now `numberOfLegs("spider")` will
 * return 4 instead of 8.
 *
 * A better option would be to throw an error:
 *
 * ```
 *   function numberOfLegs(animal: "dog" | "bird" | "spider") : number {
 *     if (animal === "dog") return 4;
 *     if (animal === "bird") return 2;
 *     throw new Error(`Unknown value ${animal}`);
 *   }
 * ```
 *
 * Now calling `numberOfLegs("spider")` will throw an error instead of returning
 * an incorrect value, alerting us to the incomplete code in `numberOfLegs()`,
 * but of course we'd rather the compiler warned us about the problem instead of
 * waiting for errors in production.
 *
 * This is where `assertExhausted()` comes in.
 *
 * ```
 *   function numberOfLegs(animal: "dog" | "bird" | "spider"): number {
 *     if (animal === "dog") return 4;
 *     if (animal === "bird") return 2;
 *     throw assertExhausted(animal);
 *     //                    ^^^^^^
 *     // Argument of type 'string' is not assignable to parameter of type 'never'.ts(2345)
 *   }
 * ```
 *
 * The compiler will warn you when `animal` still has unhandled values, and if
 * execution reaches this point despite our checks, it will throw an error to
 * alert us of the incomplete code.
 */
export default function assertExhausted(value: never): Error {
  throw new Error(`Expected value ${value} to be handled but it wasn't`);
}
