import { AuthError } from '../models';

export class TimeoutError extends AuthError {
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
