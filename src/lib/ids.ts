import { randomBytes } from "node:crypto";

/** Short, sortable, prefixed id — e.g. usr_9f2a..., prp_1c8b... */
export function makeId(prefix: string) {
  return `${prefix}_${randomBytes(9).toString("hex")}`;
}
