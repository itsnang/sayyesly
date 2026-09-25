import { customAlphabet, nanoid } from "nanoid";

/** Public share-link slug: /invite/<slug> */
export function newInviteSlug(): string {
  return nanoid(10);
}

// No 0/O or 1/I/L, so the code survives being read aloud or retyped in Telegram.
const linkCodeAlphabet = customAlphabet("ABCDEFGHJKMNPQRSTUVWXYZ23456789", 8);

/** Secret code for `/link <code>` in a group chat. */
export function newLinkCode(): string {
  return linkCodeAlphabet();
}
