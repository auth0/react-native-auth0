import { AuthError } from '../models';

/**
 * Thrown when a request exceeds the configured timeout.
 *
 * Carries a normalized {@link TimeoutError.type} so it can be handled alongside
 * the other error classes in the SDK's taxonomy. The wire-level {@link
 * AuthError.code} remains `'timeout'`, which is what the transport emits.
 */
export class TimeoutError extends AuthError {
  /**
   * A normalized error type that is consistent across platforms.
   * Always `'TIMEOUT_ERROR'`.
   */
  public readonly type = 'TIMEOUT_ERROR' as const;

  constructor(message: string) {
    super('TimeoutError', message, { code: 'timeout' });
  }
}

export function fetchWithTimeout(
  url: RequestInfo,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const signal = controller.signal;
  options.signal = signal;

  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, options)
    .catch((err) => {
      if (err.name === 'AbortError') {
        throw new TimeoutError(`Request timed out after ${timeoutMs}ms`);
      }
      throw err;
    })
    .finally(() => {
      clearTimeout(timeout);
    });
}
