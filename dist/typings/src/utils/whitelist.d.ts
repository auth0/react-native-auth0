import BaseError from './baseError';
export default class ParameterError extends BaseError {
  expected: unknown[];
  actual: string;
  missing: unknown[];
  constructor(expected: unknown[], actual: string, missing: unknown[]);
}
export declare function apply(
  rules: any,
  values: any
): {
  [key: string]: string;
};
