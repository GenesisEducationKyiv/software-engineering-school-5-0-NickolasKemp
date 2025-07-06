export function getErrorStack(error: unknown): string {
  return error instanceof Error ? error.stack || String(error) : String(error);
}
