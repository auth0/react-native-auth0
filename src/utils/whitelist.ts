import BaseError from './baseError';

export default class ParameterError extends BaseError {
  public expected: unknown[];
  public actual: string;
  public missing: unknown[];

  constructor(expected: unknown[], actual: string, missing: unknown[]) {
    super(
      'Missing required parameters',
      `Missing required parameters: ${JSON.stringify(missing, null, 2)}`,
    );
    this.expected = expected;
    this.actual = actual;
    this.missing = missing;
  }
}

export function apply(rules: any, values: any) {
  const {whitelist = true, parameters, aliases = {}} = rules;
  let mapped: {[key: string]: string} = {};
  let requiredKeys = Object.keys(parameters)
    .filter(key => parameters[key].required)
    .map(key => parameters[key].toName || key);
  for (let key of Object.keys(values)) {
    let value = values[key];
    let parameterKey: string = aliases[key] || key;
    let parameter = parameters[parameterKey];
    if (parameter && value) {
      mapped[parameter.toName || parameterKey] = value;
    } else if (value && !whitelist) {
      mapped[key] = value;
    }
  }
  let missing = requiredKeys.filter(key => !mapped[key]);
  if (missing.length > 0) {
    throw new ParameterError(requiredKeys, values, missing);
  }
  return mapped;
}
