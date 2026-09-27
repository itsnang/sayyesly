// Server Actions return `{ error?: string }` instead of throwing (see CLAUDE.md).
// TanStack Query expects a failed mutation or query to throw, so this is the one
// adapter between the two: every hook calls its action through `runAction`.

const NETWORK_MESSAGE = "Couldn't reach the server. Check your connection and try again.";
const UNKNOWN_MESSAGE = "Something went wrong. Please try again.";

/** A failed action. `network` is true when the call itself threw (it never came back). */
export class ActionError extends Error {
  constructor(
    message: string,
    readonly network = false,
  ) {
    super(message);
    this.name = "ActionError";
  }
}

/** Calls an action and throws an ActionError for its `{ error }`, or when the call itself fails. */
export async function runAction<R extends { error?: string | undefined }>(call: () => Promise<R>): Promise<R> {
  let result: R;
  try {
    result = await call();
  } catch {
    throw new ActionError(NETWORK_MESSAGE, true);
  }
  if (result.error) throw new ActionError(result.error);
  return result;
}

/** The message to show for a failed mutation or query; null when there's no error. */
export function errorMessage(error: unknown): string | null {
  if (!error) return null;
  return error instanceof ActionError ? error.message : UNKNOWN_MESSAGE;
}
