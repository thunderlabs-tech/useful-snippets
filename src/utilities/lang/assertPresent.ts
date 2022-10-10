interface AssertPresent {
  /**
   * Throws an error if the provided value is null or undefined.
   *
   * This check informs the compiler that code following this call will always be present. This is useful for cases
   * where the value is guaranteed to be present due to a relationship that isn't expressable in TypeScript.
   *
   * An error here is considered a developer error and will crash the app.
   */
  <T>(
    value: T | undefined | null,
    details: { because: string },
  ): asserts value is T;

  /**
   * Throws an error if the provided value is null or undefined, and returns the value if it isn't.
   */
  andReturn: <T>(
    value: T | undefined | null,
    details: { because: string },
  ) => T;
  after: <T>(
    promisedValue: Promise<T | undefined | null>,
    details: { because: string },
  ) => Promise<T>;
}

const assertPresent: AssertPresent = (value, { because }) => {
  if (!value)
    throw new Error(
      `Expected value because ${because} but it was ${JSON.stringify(value)}`,
    );
};

assertPresent.andReturn = <T>(
  value: T | undefined | null,
  details: { because: string },
): T => {
  assertPresent(value, details);
  return value;
};

assertPresent.after = async <T>(
  promisedValue: Promise<T | undefined | null>,
  details: { because: string },
): Promise<T> => {
  const value = await promisedValue;
  return assertPresent.andReturn(value, details);
};

export default assertPresent;
