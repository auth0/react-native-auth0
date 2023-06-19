import BaseError from './baseError';
export declare class TimeoutError extends BaseError {
  constructor(msg: string);
}
/**
 * @private
 */
export declare function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response>;
