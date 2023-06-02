import BaseError from './baseError';

export class TimeoutError extends BaseError {
  constructor(msg: string) {
    super('TimeoutError', msg);
  }
}

function makeTimeout(timeoutMs: number) {
  let timerId: NodeJS.Timeout | null = null;

  const promise = new Promise((_, reject) => {
    timerId = setTimeout(() => {
      reject(new TimeoutError('Timeout'));
    }, timeoutMs);
  });

  return {
    timerId: timerId,
    promise: promise,
  };
}

export function fetchWithTimeout(
  url: string,
  options: RequestOptions,
  timeoutMs: number,
): Promise<Response> {
  const {
    promise: timeoutPromise,
    timerId,
  }: {promise: Promise<unknown>; timerId: any} = makeTimeout(timeoutMs);
  const abortController = new AbortController();

  return Promise.race([
    fetch(url, {
      ...options,
      signal: abortController.signal,
    }),
    timeoutPromise,
  ])
    .catch(error => {
      if (error instanceof TimeoutError) {
        abortController.abort();
      }

      throw error;
    })
    .then(response => {
      clearTimeout(timerId);
      return response;
    }) as Promise<Response>;
}

export type RequestOptions = {
  method: 'GET' | 'POST' | 'PATCH';
  body?: any;
  headers: {
    Accept: string;
    'Content-Type': string;
    'Auth0-Client': string;
    Authorization?: string;
  };
};
