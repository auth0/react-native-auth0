import BaseError from './baseError';

export class TimeoutError extends BaseError {
  constructor(msg: string) {
    super('TimeoutError', msg);
  }
}

function makeTimeout(timeoutMs: number) {
  let timerId = null;

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

export function fetchWithTimeout(url: string, options: any, timeoutMs: number) {
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
    });
}
