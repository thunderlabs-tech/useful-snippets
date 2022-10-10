/**
 * Used when you don't care about the result of an asynchronous operation to silence the linter warning a "floating promise" will otherwise generate. I.e. the opposite of saying `await something` is `dontAwait(something)`.
 *
 * Example:
 *
 *     function saveDocument(): Promise<void> { ... }
 *     saveDocument(); // Causes a linter error - requires await
 *     dontAwait(saveDocument()); // No error
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function dontAwait(_promise: Promise<unknown>): void {
  // Do nothing
}
