import { z } from "zod";

/** A database id (uuid) arriving from a URL or a client call. */
export const idSchema = z.uuid();

/** True when `value` is a well-formed database id. */
export function isId(value: unknown): value is string {
  return idSchema.safeParse(value).success;
}
