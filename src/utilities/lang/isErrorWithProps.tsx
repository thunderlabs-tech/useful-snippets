export default function isErrorWithProps<Props extends string>(
  value: unknown,
  props: Props[],
): value is Error & { [key in Props]: unknown } {
  if (!(value instanceof Error)) return false;
  for (const prop of props) {
    if (!(prop in value)) return false;
  }
  return true;
}
