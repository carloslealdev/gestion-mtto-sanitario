/**
 * Extracts a human-readable message from an unknown thrown value.
 *
 * Redux Toolkit's `.unwrap()` rejects with a plain `{ name, message, stack }`
 * object, so `error instanceof Error` is often false even when a real message
 * exists. This helper checks both shapes before falling back.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === "object" && error !== null) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message.trim().length > 0) {
      return message
    }
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error
  }

  return fallback
}
