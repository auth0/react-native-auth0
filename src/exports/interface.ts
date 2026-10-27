// Type-only re-export of the entire frozen public surface, so every
// non-runtime contract (client interfaces, models, options, parameters,
// error code unions, ...) shows up here without needing to be listed by
// name — and can never drift from `src/index.ts`, since there is nothing
// else to re-export from.
export type * from '../index';
