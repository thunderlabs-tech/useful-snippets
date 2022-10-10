export default function isObjectInstance(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
