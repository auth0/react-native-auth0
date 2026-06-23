import type { Auth0Options } from '../../types';

// Options that define client identity; changing any forces a fresh client and native re-init. Others (e.g. `headers`) reuse the existing client.
const SIGNIFICANT_KEYS = [
  'domain',
  'clientId',
  'localAuthenticationOptions',
  'timeout',
  'useDPoP',
] as const satisfies ReadonlyArray<keyof Auth0Options>;

// Stable, order-independent identity string for a config: keys the factory cache, the provider memo, and the native re-init decision. Object values are sorted so key order doesn't matter.
export function getConfigSignature(options: Auth0Options): string {
  const significant: Record<string, unknown> = {};
  for (const key of SIGNIFICANT_KEYS) {
    if (options[key] !== undefined) {
      significant[key] = options[key];
    }
  }
  return JSON.stringify(sortValue(significant));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value !== null && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortValue((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}
