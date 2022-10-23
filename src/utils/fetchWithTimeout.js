import BaseError from './baseError';

export class TimeoutError extends BaseError {
  constructor(msg) {
    super('TimeoutError', msg);
  }
}

function makeTimeout(timeoutMs) {
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

export function fetchWithTimeout(url, options, timeoutMs) {
  const {promise: timeoutPromise, timerId} = makeTimeout(timeoutMs);
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
