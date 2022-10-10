export default async function retryUntil<T>(
  fn: () => Promise<T>,
  retries = 3,
  wait = 500,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise((resolve) => {
      setTimeout(resolve, wait);
    });
    return retryUntil(fn, retries - 1, wait);
  }
}
