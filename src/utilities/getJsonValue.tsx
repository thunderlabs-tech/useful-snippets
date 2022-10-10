import { get } from "lodash";

export type JsonValue =
  | string
  | number
  | null
  | boolean
  | JsonValue[]
  | { [key: string]: JsonValue | undefined };

type JsonObject = {
  [key: string]: JsonValue;
};

export default function getJsonValue(
  source: unknown,
  path: string,
): JsonValue | undefined {
  return get(source, path);
}

export function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function assertJsonObject(value: unknown): asserts value is JsonObject {
  if (!isJsonObject(value)) {
    throw new Error(`Expected JSON object but received: ${value}`);
  }
}
